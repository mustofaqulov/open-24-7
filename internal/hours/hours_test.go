package hours

import (
	"testing"
	"time"
)

func weekly(open, close int, openDay time.Weekday) []WeeklyInterval {
	rows := make([]WeeklyInterval, 7)
	for day := time.Sunday; day <= time.Saturday; day++ {
		rows[day] = WeeklyInterval{Weekday: day, OpenMinute: open, CloseMinute: close, Closed: day != openDay}
	}
	return rows
}

func verifiedSchedule() Schedule {
	verified := time.Date(2026, 10, 12, 0, 0, 0, 0, time.UTC)
	return Schedule{
		Timezone:   "Asia/Tashkent",
		Source:     "OWNER",
		VerifiedAt: &verified,
		Weekly:     weekly(540, 1080, time.Monday),
	}
}

func TestBusinessTimezoneAndIncompleteHours(t *testing.T) {
	s := verifiedSchedule()
	if got := s.StatusAt(time.Date(2026, 10, 12, 4, 30, 0, 0, time.UTC)); got != Open {
		t.Fatalf("Monday 09:30 Tashkent: got %s", got)
	}
	if got := s.StatusAt(time.Date(2026, 10, 12, 2, 0, 0, 0, time.UTC)); got != Closed {
		t.Fatalf("Monday 07:00 Tashkent: got %s", got)
	}
	s.Weekly = s.Weekly[:6]
	if got := s.StatusAt(time.Date(2026, 10, 12, 4, 30, 0, 0, time.UTC)); got != Unknown {
		t.Fatalf("incomplete week: got %s", got)
	}
}

func TestOvernightAndDatedClosure(t *testing.T) {
	s := verifiedSchedule()
	s.Weekly[time.Monday] = WeeklyInterval{Weekday: time.Monday, OpenMinute: 1320, CloseMinute: 120}
	if got := s.StatusAt(time.Date(2026, 10, 12, 20, 30, 0, 0, time.UTC)); got != Open {
		t.Fatalf("overnight carry: got %s", got)
	}
	s.Exceptions = []DateInterval{{LocalDate: "2026-10-13", Closed: true}}
	if got := s.StatusAt(time.Date(2026, 10, 12, 20, 30, 0, 0, time.UTC)); got != Closed {
		t.Fatalf("dated closure: got %s", got)
	}
}

func TestAlwaysOpenAndException(t *testing.T) {
	s := verifiedSchedule()
	for day := range s.Weekly {
		s.Weekly[day] = WeeklyInterval{Weekday: time.Weekday(day), OpenMinute: 0, CloseMinute: 1440}
	}
	at := time.Date(2026, 10, 12, 4, 30, 0, 0, time.UTC)
	if !s.IsAlwaysOpen(at) {
		t.Fatal("verified complete week should be 24/7")
	}
	s.Exceptions = []DateInterval{{LocalDate: "2026-10-13", OpenMinute: 600, CloseMinute: 720}}
	if s.IsAlwaysOpen(at) {
		t.Fatal("upcoming exception must suppress 24/7 label")
	}
}

func TestDaylightSaving(t *testing.T) {
	s := verifiedSchedule()
	s.Timezone = "Europe/London"
	verified := time.Date(2026, 3, 1, 0, 0, 0, 0, time.UTC)
	s.VerifiedAt = &verified
	s.Weekly = weekly(90, 180, time.Sunday)
	before := time.Date(2026, 3, 29, 0, 45, 0, 0, time.UTC)
	after := time.Date(2026, 3, 29, 1, 45, 0, 0, time.UTC)
	if got := s.StatusAt(before); got != Closed {
		t.Fatalf("before DST jump: got %s", got)
	}
	if got := s.StatusAt(after); got != Open {
		t.Fatalf("after DST jump: got %s", got)
	}
}
