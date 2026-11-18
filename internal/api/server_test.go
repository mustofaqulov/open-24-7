package api

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestOriginCheck(t *testing.T) {
	s := &Server{appURL: "http://localhost:3000"}
	request := httptest.NewRequest(http.MethodPost, "http://localhost:8080/api/v1/places/search", nil)
	request.Header.Set("Origin", "http://localhost:3000")
	if !s.sameOrigin(request) {
		t.Fatal("configured site origin should be accepted")
	}
	request.Header.Set("Origin", "https://other.example")
	if s.sameOrigin(request) {
		t.Fatal("cross-site origin should be rejected")
	}
}

func TestSearchJSONRejectsUnknownFields(t *testing.T) {
	request := httptest.NewRequest(http.MethodPost, "/api/v1/places/search",
		strings.NewReader(`{"lat":38.8,"lng":65.7,"unexpected":true}`))
	var input searchRequest
	if err := decode(httptest.NewRecorder(), request, &input); err == nil {
		t.Fatal("unexpected JSON field should be rejected")
	}
}
