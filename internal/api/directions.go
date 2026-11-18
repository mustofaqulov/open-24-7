package api

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"math"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
)

type point struct {
	Lat *float64 `json:"lat"`
	Lng *float64 `json:"lng"`
}

type directionsRequest struct {
	Origin point  `json:"origin"`
	Mode   string `json:"mode"`
}

func (s *Server) directions(w http.ResponseWriter, r *http.Request) {
	if !s.sameOrigin(r) {
		fail(w, http.StatusForbidden, "Invalid origin")
		return
	}
	if os.Getenv("GOOGLE_ROUTES_ENABLED") != "true" ||
		os.Getenv("GOOGLE_MAPS_TERMS_APPROVED") != "true" ||
		os.Getenv("NEXT_PUBLIC_GOOGLE_MAPS_APPROVED") != "true" ||
		os.Getenv("GOOGLE_ROUTES_SERVER_KEY") == "" {
		fail(w, http.StatusServiceUnavailable, "Routes are not configured")
		return
	}
	var input directionsRequest
	if err := decode(w, r, &input); err != nil {
		fail(w, http.StatusBadRequest, "Invalid JSON")
		return
	}
	if input.Mode == "" {
		input.Mode = "DRIVE"
	}
	if input.Origin.Lat == nil || input.Origin.Lng == nil ||
		!floatBetween(*input.Origin.Lat, -90, 90) ||
		!floatBetween(*input.Origin.Lng, -180, 180) ||
		(input.Mode != "DRIVE" && input.Mode != "WALK") {
		fail(w, http.StatusBadRequest, "Invalid route parameters")
		return
	}
	id := r.PathValue("id")
	if !idOrSlug(id) {
		fail(w, http.StatusBadRequest, "Invalid place ID")
		return
	}
	ctx, cancel := s.context(r)
	defer cancel()
	allowed, err := s.allow(ctx, r, "go-routes", 15, 15)
	if err != nil {
		s.unavailable(w, err)
		return
	}
	if !allowed {
		fail(w, http.StatusTooManyRequests, "Route request limit reached")
		return
	}
	var latitude, longitude float64
	err = s.db.QueryRow(ctx, `SELECT latitude, longitude FROM businesses WHERE id::text=$1 AND verification='VERIFIED'`, id).Scan(&latitude, &longitude)
	if errors.Is(err, pgx.ErrNoRows) {
		fail(w, http.StatusNotFound, "Place not found")
		return
	}
	if err != nil {
		s.unavailable(w, err)
		return
	}
	payload := map[string]any{
		"origin": map[string]any{"location": map[string]any{"latLng": map[string]any{
			"latitude": *input.Origin.Lat, "longitude": *input.Origin.Lng,
		}}},
		"destination": map[string]any{"location": map[string]any{"latLng": map[string]any{
			"latitude": latitude, "longitude": longitude,
		}}},
		"travelMode": input.Mode, "computeAlternativeRoutes": false, "units": "METRIC",
	}
	data, err := json.Marshal(payload)
	if err != nil {
		s.unavailable(w, err)
		return
	}
	request, err := http.NewRequestWithContext(ctx, http.MethodPost,
		"https://routes.googleapis.com/directions/v2:computeRoutes", bytes.NewReader(data))
	if err != nil {
		s.unavailable(w, err)
		return
	}
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("X-Goog-Api-Key", os.Getenv("GOOGLE_ROUTES_SERVER_KEY"))
	request.Header.Set("X-Goog-FieldMask", "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline")
	client := &http.Client{Timeout: 6 * time.Second}
	response, err := client.Do(request)
	if err != nil {
		fail(w, http.StatusServiceUnavailable, "Route service unavailable")
		return
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		fail(w, http.StatusServiceUnavailable, "Route service unavailable")
		return
	}
	var result struct {
		Routes []struct {
			DistanceMeters float64 `json:"distanceMeters"`
			Duration       string  `json:"duration"`
			Polyline       struct {
				Encoded string `json:"encodedPolyline"`
			} `json:"polyline"`
		} `json:"routes"`
	}
	if err := json.NewDecoder(io.LimitReader(response.Body, 256*1024)).Decode(&result); err != nil {
		fail(w, http.StatusServiceUnavailable, "Route response unavailable")
		return
	}
	if len(result.Routes) == 0 || result.Routes[0].Polyline.Encoded == "" {
		fail(w, http.StatusNotFound, "No route available")
		return
	}
	selected := result.Routes[0]
	if !strings.HasSuffix(selected.Duration, "s") {
		fail(w, http.StatusServiceUnavailable, "Route response unavailable")
		return
	}
	seconds, err := strconv.ParseFloat(strings.TrimSuffix(selected.Duration, "s"), 64)
	if err != nil || math.IsNaN(seconds) || math.IsInf(seconds, 0) || seconds < 0 ||
		math.IsNaN(selected.DistanceMeters) || math.IsInf(selected.DistanceMeters, 0) || selected.DistanceMeters < 0 {
		fail(w, http.StatusServiceUnavailable, "Route response unavailable")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"route": map[string]any{
		"distanceMeters": selected.DistanceMeters, "durationSeconds": seconds,
		"encodedPolyline": selected.Polyline.Encoded, "provider": "google", "mode": input.Mode,
	}})
}
