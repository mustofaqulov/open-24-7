package hours

import (
	"fmt"
	"strings"
	"time"
	_ "time/tzdata"
)

type Status string

const (
	Open              Status = "OPEN"
	Closed            Status = "CLOSED"
	Unknown           Status = "UNKNOWN"
	TemporarilyClosed Status = "TEMPORARILY_CLOSED"
)

type WeeklyInterval struct {
	Weekday     time.Weekday `json:"weekday"`
	OpenMinute  int          `json:"openMinute"`
	CloseMinute int          `json:"closeMinute"`
	Closed      bool         `json:"isClosed"`
}

type DateInterval struct {
	LocalDate   string `json:"localDate"`
	OpenMinute  int    `json:"openMinute"`
	CloseMinute int    `json:"closeMinute"`
	Closed      bool   `json:"isClosed"`
}

type interval struct {
	open   int
	close  int
	closed bool
}

type Schedule struct {
	Timezone          string
	TemporarilyClosed bool
	Source            string
	VerifiedAt        *time.Time
	Weekly            []WeeklyInterval
	Exceptions        []DateInterval
}

// StatusAt returns UNKNOWN when the schedule is incomplete, stale, or unverified.
// The caller must not present UNKNOWN as open.
func (s Schedule) StatusAt(at time.Time) Status {
	if s.TemporarilyClosed {
		return TemporarilyClosed
	}
	if !s.reliable(at) {
		return Unknown
	}
	location, err := time.LoadLocation(s.Timezone)
	if err != nil {
		return Unknown
	}
	local := at.In(location)
	date := local.Format("2006-01-02")
	minute := local.Hour()*60 + local.Minute()
	today, exceptional := s.intervals(date, local.Weekday())
	if exceptional {
		for _, row := range today {
			if row.closed {
				return Closed
			}
		}
	}
	for _, row := range today {
		if row.closed {
			continue
		}
		if row.close > row.open {
			if minute >= row.open && minute < row.close {
				return Open
			}
		} else if minute >= row.open {
			return Open
		}
	}
	yesterday := local.AddDate(0, 0, -1)
	previous, _ := s.intervals(yesterday.Format("2006-01-02"), yesterday.Weekday())
	for _, row := range previous {
		if !row.closed && row.close <= row.open && minute < row.close {
			return Open
		}
	}
	return Closed
}

func (s Schedule) reliable(at time.Time) bool {
	if s.VerifiedAt == nil || len(s.Weekly) == 0 || s.Source == "UNVERIFIED" || s.Source == "OSM" {
		return false
	}
	if at.Sub(*s.VerifiedAt) > 180*24*time.Hour {
		return false
	}
	var days [7]bool
	for _, row := range s.Weekly {
		if row.Weekday < time.Sunday || row.Weekday > time.Saturday || !validInterval(row.OpenMinute, row.CloseMinute) {
			return false
		}
		days[row.Weekday] = true
	}
	for _, present := range days {
		if !present {
			return false
		}
	}
	for _, row := range s.Exceptions {
		if !validInterval(row.OpenMinute, row.CloseMinute) {
			return false
		}
		parsed, err := time.Parse("2006-01-02", row.LocalDate)
		if err != nil || parsed.Format("2006-01-02") != row.LocalDate {
			return false
		}
	}
	return true
}

func validInterval(open, close int) bool {
	return open >= 0 && open <= 1439 && close >= 0 && close <= 1440
}

func (s Schedule) intervals(date string, weekday time.Weekday) ([]interval, bool) {
	var overrides []interval
	for _, row := range s.Exceptions {
		if row.LocalDate == date {
			overrides = append(overrides, interval{row.OpenMinute, row.CloseMinute, row.Closed})
		}
	}
	if len(overrides) > 0 {
		return overrides, true
	}
	var weekly []interval
	for _, row := range s.Weekly {
		if row.Weekday == weekday {
			weekly = append(weekly, interval{row.OpenMinute, row.CloseMinute, row.Closed})
		}
	}
	return weekly, false
}

func (s Schedule) IsAlwaysOpen(at time.Time) bool {
	if s.StatusAt(at) == Unknown || s.TemporarilyClosed {
		return false
	}
	location, err := time.LoadLocation(s.Timezone)
	if err != nil {
		return false
	}
	today := at.In(location).Format("2006-01-02")
	for _, row := range s.Exceptions {
		if row.LocalDate >= today {
			return false
		}
	}
	var full [7]bool
	for _, row := range s.Weekly {
		if !row.Closed && row.OpenMinute == 0 && row.CloseMinute == 1440 {
			full[row.Weekday] = true
		}
	}
	for _, day := range full {
		if !day {
			return false
		}
	}
	return true
}

func clock(minute int) string {
	return fmt.Sprintf("%02d:%02d", (minute/60)%24, minute%60)
}

func (s Schedule) TodaysHours(at time.Time) string {
	if s.StatusAt(at) == Unknown {
		return "Hours unverified"
	}
	if s.IsAlwaysOpen(at) {
		return "Open 24/7"
	}
	location, err := time.LoadLocation(s.Timezone)
	if err != nil {
		return "Hours unverified"
	}
	local := at.In(location)
	date := local.Format("2006-01-02")
	today, exceptional := s.intervals(date, local.Weekday())
	if exceptional {
		for _, row := range today {
			if row.closed {
				return "Closed today"
			}
		}
	}
	yesterday := local.AddDate(0, 0, -1)
	previous, _ := s.intervals(yesterday.Format("2006-01-02"), yesterday.Weekday())
	parts := make([]string, 0, len(previous)+len(today))
	for _, row := range previous {
		if !row.closed && row.close <= row.open && row.close > 0 {
			parts = append(parts, "00:00–"+clock(row.close)+" (from yesterday)")
		}
	}
	for _, row := range today {
		if row.closed {
			continue
		}
		text := clock(row.open) + "–" + clock(row.close)
		if row.close <= row.open {
			text += " +1"
		}
		parts = append(parts, text)
	}
	if len(parts) == 0 {
		return "Closed today"
	}
	return strings.Join(parts, ", ")
}

type Transition struct {
	Status Status
	At     time.Time
}

func (s Schedule) NextTransition(at time.Time) *Transition {
	initial := s.StatusAt(at)
	if initial == Unknown || initial == TemporarilyClosed || s.IsAlwaysOpen(at) {
		return nil
	}
	start := at.Truncate(time.Minute)
	for minute := 1; minute <= 8*24*60; minute++ {
		candidate := start.Add(time.Duration(minute) * time.Minute)
		status := s.StatusAt(candidate)
		if status != initial {
			return &Transition{Status: status, At: candidate}
		}
	}
	return nil
}
