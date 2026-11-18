package api

import (
	"encoding/json"
	"errors"
	"math"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5"
	"open24/internal/hours"
)

type searchRequest struct {
	Lat        *float64 `json:"lat"`
	Lng        *float64 `json:"lng"`
	Q          string  `json:"q"`
	Category   string  `json:"category"`
	Radius     *float64 `json:"radius"`
	Page       *int     `json:"page"`
	Limit      *int     `json:"limit"`
	OpenNow    string  `json:"openNow"`
	AlwaysOpen string  `json:"alwaysOpen"`
}

type source struct {
	Provider   string `json:"provider"`
	ExternalID string `json:"externalId"`
}

type placeRecord struct {
	ID                string
	Slug              string
	Name              string
	Description       string
	Address           string
	City              string
	Latitude          float64
	Longitude         float64
	Timezone          string
	Phone             string
	Website           string
	Category          category
	HoursSource       string
	HoursVerifiedAt   *time.Time
	TemporarilyClosed bool
	Hours             []hours.WeeklyInterval
	Exceptions        []hours.DateInterval
	Sources           []source
	DistanceMeters    float64
}

const placeColumns = `b.id::text, b.slug, b.name, COALESCE(b.description,''),
	b.address, b.city, b.latitude, b.longitude, b.timezone,
	COALESCE(b.phone,''), COALESCE(b.website,''),
	c.id::text, c.key, c.name_uz, c.name_en, c.name_ru,
	COALESCE(c.parent_id::text,''),
	COALESCE((SELECT json_agg(json_build_object('locale',t.locale,'name',t.name))
		FROM category_translations t WHERE t.category_id=c.id),'[]'::json)::text,
	b.hours_source::text,
	COALESCE(EXTRACT(EPOCH FROM b.hours_verified_at)::bigint,0), b.temporarily_closed,
	COALESCE((SELECT json_agg(json_build_object('weekday',h.weekday,'openMinute',h.open_minute,
		'closeMinute',h.close_minute,'isClosed',h.is_closed)) FROM business_hours h
		WHERE h.business_id=b.id),'[]'::json)::text,
	COALESCE((SELECT json_agg(json_build_object('localDate',e.local_date,'openMinute',e.open_minute,
		'closeMinute',e.close_minute,'isClosed',e.is_closed)) FROM business_hour_exceptions e
		WHERE e.business_id=b.id),'[]'::json)::text,
	COALESCE((SELECT json_agg(json_build_object('provider',s.provider,'externalId',s.external_id))
		FROM business_sources s WHERE s.business_id=b.id),'[]'::json)::text`

const searchSQL = `SELECT ` + placeColumns + `,
	ST_Distance(ST_SetSRID(ST_MakePoint(b.longitude,b.latitude),4326)::geography,
		ST_SetSRID(ST_MakePoint($1,$2),4326)::geography) AS distance_m
	FROM businesses b JOIN categories c ON c.id=b.category_id
	WHERE b.verification='VERIFIED'
	AND ST_DWithin(ST_SetSRID(ST_MakePoint(b.longitude,b.latitude),4326)::geography,
		ST_SetSRID(ST_MakePoint($1,$2),4326)::geography,$3)
	AND ($4='' OR c.key=$4)
	AND ($5='' OR b.name ILIKE '%'||$5||'%' OR b.address ILIKE '%'||$5||'%'
		OR b.city ILIKE '%'||$5||'%' OR c.name_uz ILIKE '%'||$5||'%'
		OR c.name_en ILIKE '%'||$5||'%' OR c.name_ru ILIKE '%'||$5||'%'
		OR EXISTS (SELECT 1 FROM category_translations ct
			WHERE ct.category_id=c.id AND ct.name ILIKE '%'||$5||'%'))
	ORDER BY distance_m ASC LIMIT 1000`

const detailSQL = `SELECT ` + placeColumns + ` FROM businesses b
	JOIN categories c ON c.id=b.category_id
	WHERE b.verification='VERIFIED' AND (b.id::text=$1 OR b.slug=$1) LIMIT 1`

type scanner interface {
	Scan(dest ...any) error
}

func scanPlace(row scanner, withDistance bool) (placeRecord, error) {
	var p placeRecord
	var epoch int64
	var weeklyJSON, exceptionJSON, sourceJSON, translationJSON, parentID string
	dest := []any{&p.ID, &p.Slug, &p.Name, &p.Description, &p.Address, &p.City,
		&p.Latitude, &p.Longitude, &p.Timezone, &p.Phone, &p.Website,
		&p.Category.ID, &p.Category.Key, &p.Category.NameUz, &p.Category.NameEn, &p.Category.NameRu,
		&parentID, &translationJSON,
		&p.HoursSource, &epoch, &p.TemporarilyClosed, &weeklyJSON, &exceptionJSON, &sourceJSON}
	if withDistance {
		dest = append(dest, &p.DistanceMeters)
	}
	if err := row.Scan(dest...); err != nil {
		return p, err
	}
	p.HoursVerifiedAt = parseEpoch(epoch)
	if parentID != "" {
		p.Category.ParentID = &parentID
	}
	if err := json.Unmarshal([]byte(translationJSON), &p.Category.Translations); err != nil {
		return p, err
	}
	if err := json.Unmarshal([]byte(weeklyJSON), &p.Hours); err != nil {
		return p, err
	}
	if err := json.Unmarshal([]byte(exceptionJSON), &p.Exceptions); err != nil {
		return p, err
	}
	if err := json.Unmarshal([]byte(sourceJSON), &p.Sources); err != nil {
		return p, err
	}
	return p, nil
}

func (p placeRecord) schedule() hours.Schedule {
	return hours.Schedule{
		Timezone: p.Timezone, TemporarilyClosed: p.TemporarilyClosed,
		Source: p.HoursSource, VerifiedAt: p.HoursVerifiedAt,
		Weekly: p.Hours, Exceptions: p.Exceptions,
	}
}

func (p placeRecord) summary(at time.Time) map[string]any {
	schedule := p.schedule()
	sources := make([]string, 0, len(p.Sources))
	for _, item := range p.Sources {
		sources = append(sources, item.Provider)
	}
	return map[string]any{
		"id": p.ID, "slug": p.Slug, "name": p.Name, "address": p.Address,
		"city": p.City, "latitude": p.Latitude, "longitude": p.Longitude,
		"timezone": p.Timezone, "category": p.Category,
		"status": schedule.StatusAt(at), "alwaysOpen": schedule.IsAlwaysOpen(at),
		"todaysHours": schedule.TodaysHours(at), "hoursVerifiedAt": p.HoursVerifiedAt,
		"hoursSource": p.HoursSource, "sources": sources,
		"distanceMeters": math.Round(p.DistanceMeters),
	}
}

func (s *Server) search(w http.ResponseWriter, r *http.Request) {
	if !s.sameOrigin(r) {
		fail(w, http.StatusForbidden, "Invalid origin")
		return
	}
	var input searchRequest
	if err := decode(w, r, &input); err != nil {
		fail(w, http.StatusBadRequest, "Invalid JSON")
		return
	}
	radius, page, limit := 10.0, 1, 12
	if input.Radius != nil {
		radius = *input.Radius
	}
	if input.Page != nil {
		page = *input.Page
	}
	if input.Limit != nil {
		limit = *input.Limit
	}
	var valid bool
	input.Q, valid = cleanText(input.Q, 100)
	if !valid {
		fail(w, http.StatusBadRequest, "Search text is too long")
		return
	}
	input.Category, valid = cleanText(input.Category, 40)
	if !valid || input.Lat == nil || input.Lng == nil || !floatBetween(*input.Lat, -90, 90) || !floatBetween(*input.Lng, -180, 180) ||
		!floatBetween(radius, 0.5, 50) || page < 1 || page > 100 ||
		limit < 1 || limit > 30 ||
		(input.OpenNow != "" && input.OpenNow != "true" && input.OpenNow != "false") ||
		(input.AlwaysOpen != "" && input.AlwaysOpen != "true" && input.AlwaysOpen != "false") {
		fail(w, http.StatusBadRequest, "Invalid search parameters")
		return
	}
	ctx, cancel := s.context(r)
	defer cancel()
	allowed, err := s.allow(ctx, r, "go-search", 60, 1)
	if err != nil {
		s.unavailable(w, err)
		return
	}
	if !allowed {
		fail(w, http.StatusTooManyRequests, "Search limit reached")
		return
	}
	rows, err := s.db.Query(ctx, searchSQL, *input.Lng, *input.Lat, radius*1000, input.Category, input.Q)
	if err != nil {
		s.unavailable(w, err)
		return
	}
	defer rows.Close()
	matching := make([]map[string]any, 0)
	count := 0
	at := time.Now()
	for rows.Next() {
		count++
		place, err := scanPlace(rows, true)
		if err != nil {
			s.unavailable(w, err)
			return
		}
		schedule := place.schedule()
		if input.OpenNow == "true" && schedule.StatusAt(at) != hours.Open {
			continue
		}
		if input.AlwaysOpen == "true" && !schedule.IsAlwaysOpen(at) {
			continue
		}
		matching = append(matching, place.summary(at))
	}
	if err := rows.Err(); err != nil {
		s.unavailable(w, err)
		return
	}
	total := len(matching)
	start := (page - 1) * limit
	items := make([]map[string]any, 0)
	if start < total {
		end := start + limit
		if end > total {
			end = total
		}
		items = matching[start:end]
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"items": items, "total": total, "page": page, "limit": limit,
		"truncated": count == 1000, "distanceType": "straight_line",
	})
}

func (s *Server) place(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if !idOrSlug(id) {
		fail(w, http.StatusBadRequest, "Invalid place ID")
		return
	}
	ctx, cancel := s.context(r)
	defer cancel()
	place, err := scanPlace(s.db.QueryRow(ctx, detailSQL, id), false)
	if errors.Is(err, pgx.ErrNoRows) {
		fail(w, http.StatusNotFound, "Place not found")
		return
	}
	if err != nil {
		s.unavailable(w, err)
		return
	}
	at := time.Now()
	schedule := place.schedule()
	var transition any
	if next := schedule.NextTransition(at); next != nil {
		transition = map[string]any{"status": next.Status, "at": next.At}
	}
	writeJSON(w, http.StatusOK, map[string]any{"place": map[string]any{
		"id": place.ID, "slug": place.Slug, "name": place.Name,
		"description": place.Description, "address": place.Address, "city": place.City,
		"latitude": place.Latitude, "longitude": place.Longitude, "timezone": place.Timezone,
		"phone": place.Phone, "website": place.Website, "category": place.Category,
		"status": schedule.StatusAt(at), "alwaysOpen": schedule.IsAlwaysOpen(at),
		"todaysHours": schedule.TodaysHours(at), "nextTransition": transition,
		"hoursVerifiedAt": place.HoursVerifiedAt, "hoursSource": place.HoursSource,
		"sources": place.Sources, "hours": place.Hours, "exceptions": place.Exceptions,
	}})
}
