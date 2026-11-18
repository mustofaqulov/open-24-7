package api

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Server struct {
	db       *pgxpool.Pool
	logger   *slog.Logger
	appURL   string
	rateKey  string
}

func New(db *pgxpool.Pool, logger *slog.Logger, appURL, rateKey string) http.Handler {
	s := &Server{db: db, logger: logger, appURL: appURL, rateKey: rateKey}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/v1/health", s.health)
	mux.HandleFunc("GET /api/v1/categories", s.categories)
	mux.HandleFunc("POST /api/v1/places/search", s.search)
	mux.HandleFunc("GET /api/v1/places/{id}", s.place)
	mux.HandleFunc("POST /api/v1/places/{id}/directions", s.directions)
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cache-Control", "no-store")
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		mux.ServeHTTP(w, r)
	})
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func fail(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]any{"error": map[string]string{"message": message}})
}

func (s *Server) unavailable(w http.ResponseWriter, err error) {
	s.logger.Error("request failed", "kind", "database", "type", errorType(err))
	fail(w, http.StatusServiceUnavailable, "Service temporarily unavailable")
}

func errorType(err error) string {
	if err == nil {
		return "unknown"
	}
	return "database_error"
}

func (s *Server) context(r *http.Request) (context.Context, context.CancelFunc) {
	return context.WithTimeout(r.Context(), 6*time.Second)
}

func (s *Server) health(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := s.context(r)
	defer cancel()
	if err := s.db.Ping(ctx); err != nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{"status": "unavailable"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (s *Server) sameOrigin(r *http.Request) bool {
	origin := r.Header.Get("Origin")
	if origin == "" {
		return false
	}
	parsed, err := url.Parse(origin)
	if err != nil || parsed.Host == "" {
		return false
	}
	if s.appURL != "" {
		app, err := url.Parse(s.appURL)
		return err == nil && parsed.Scheme == app.Scheme && parsed.Host == app.Host
	}
	return parsed.Host == r.Host
}

func decode(w http.ResponseWriter, r *http.Request, value any) error {
	decoder := json.NewDecoder(http.MaxBytesReader(w, r.Body, 8192))
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(value); err != nil {
		return err
	}
	var trailing any
	if err := decoder.Decode(&trailing); !errors.Is(err, io.EOF) {
		return errors.New("unexpected trailing JSON")
	}
	return nil
}

func (s *Server) allow(ctx context.Context, r *http.Request, scope string, limit, minutes int) (bool, error) {
	if len(s.rateKey) < 32 {
		return false, errors.New("RATE_LIMIT_SECRET must have at least 32 characters")
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		host = r.RemoteAddr
	}
	mac := hmac.New(sha256.New, []byte(s.rateKey))
	_, _ = mac.Write([]byte(scope + ":" + host))
	key := hex.EncodeToString(mac.Sum(nil))
	bucket := time.Now().UTC().Truncate(time.Duration(minutes) * time.Minute)
	var count int
	err = s.db.QueryRow(ctx, `INSERT INTO rate_limits (key,bucket,count) VALUES ($1,$2,1)
		ON CONFLICT (key,bucket) DO UPDATE SET count=rate_limits.count+1 RETURNING count`, key, bucket).Scan(&count)
	return count <= limit, err
}

func cleanText(value string, max int) (string, bool) {
	value = strings.TrimSpace(value)
	return value, len(value) <= max
}

func floatBetween(value, low, high float64) bool {
	return value >= low && value <= high
}

func parseEpoch(epoch int64) *time.Time {
	if epoch <= 0 {
		return nil
	}
	value := time.Unix(epoch, 0).UTC()
	return &value
}

func idOrSlug(value string) bool {
	return value != "" && len(value) <= 120 && !strings.ContainsAny(value, "/\\\x00")
}

