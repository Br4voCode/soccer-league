package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/football-api/internal/service"
	"github.com/go-chi/chi/v5"
)

// SchedulePeriod identifies the time window selected by the client for the
// schedule report. The resolved from/to dates always come from the client so
// the JSON report and its PDF export share one identical query.
type SchedulePeriod string

const (
	SchedulePeriodDay    SchedulePeriod = "day"
	SchedulePeriodWeek   SchedulePeriod = "week"
	SchedulePeriodMonth  SchedulePeriod = "month"
	SchedulePeriodYear   SchedulePeriod = "year"
	SchedulePeriodCustom SchedulePeriod = "custom"
)

// ScheduleQuery is the parsed form of the schedule report query string.
type ScheduleQuery struct {
	From      time.Time
	To        time.Time
	Period    SchedulePeriod
	StadiumID *int64
}

func (q ScheduleQuery) IsSingleDay() bool {
	return q.Period == "" || q.Period == SchedulePeriodDay
}

var schedulePeriods = map[SchedulePeriod]bool{
	SchedulePeriodDay:    true,
	SchedulePeriodWeek:   true,
	SchedulePeriodMonth:  true,
	SchedulePeriodYear:   true,
	SchedulePeriodCustom: true,
}

// parseScheduleQuery reads the shared schedule filters. `from` and `to` are
// required; the legacy `date` parameter is accepted as from == to == date.
func parseScheduleQuery(query url.Values) (ScheduleQuery, error) {
	var parsed ScheduleQuery

	if period := query.Get("period"); period != "" {
		if !schedulePeriods[SchedulePeriod(period)] {
			return parsed, fmt.Errorf("invalid period, use day, week, month, year or custom")
		}
		parsed.Period = SchedulePeriod(period)
	}

	fromValue := query.Get("from")
	toValue := query.Get("to")
	if fromValue == "" && toValue == "" {
		if date := query.Get("date"); date != "" {
			fromValue, toValue = date, date
		}
	}
	if fromValue == "" || toValue == "" {
		return parsed, fmt.Errorf("date or from/to is required")
	}

	from, err := time.Parse("2006-01-02", fromValue)
	if err != nil {
		return parsed, fmt.Errorf("invalid from format, use yyyy-mm-dd")
	}
	to, err := time.Parse("2006-01-02", toValue)
	if err != nil {
		return parsed, fmt.Errorf("invalid to format, use yyyy-mm-dd")
	}
	if from.After(to) {
		return parsed, fmt.Errorf("invalid date range: from must not be after to")
	}
	parsed.From, parsed.To = from, to

	parsed.StadiumID, err = parseOptionalInt64(query.Get("stadiumId"))
	if err != nil {
		return parsed, fmt.Errorf("invalid stadiumId")
	}
	if parsed.StadiumID == nil {
		parsed.StadiumID, err = parseOptionalInt64(query.Get("stadium"))
		if err != nil {
			return parsed, fmt.Errorf("invalid stadium")
		}
	}
	return parsed, nil
}

type ReportsHandler struct {
	svc *service.ReportsService
}

func NewReportsHandler(svc *service.ReportsService) *ReportsHandler {
	return &ReportsHandler{svc: svc}
}

func parseOptionalInt64(value string) (*int64, error) {
	if value == "" {
		return nil, nil
	}
	id, err := strconv.ParseInt(value, 10, 64)
	if err != nil {
		return nil, err
	}
	return &id, nil
}

func (h *ReportsHandler) Standings(w http.ResponseWriter, r *http.Request) {
	seasonID, err := strconv.ParseInt(r.URL.Query().Get("seasonId"), 10, 64)
	if err != nil {
		http.Error(w, "invalid seasonId", http.StatusBadRequest)
		return
	}
	rows, err := h.svc.Standings(r.Context(), seasonID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rows)
}

func (h *ReportsHandler) MatchesBetweenTeams(w http.ResponseWriter, r *http.Request) {
	team1ID, err := strconv.ParseInt(r.URL.Query().Get("team1"), 10, 64)
	if err != nil {
		http.Error(w, "invalid team1", http.StatusBadRequest)
		return
	}
	team2ID, err := strconv.ParseInt(r.URL.Query().Get("team2"), 10, 64)
	if err != nil {
		http.Error(w, "invalid team2", http.StatusBadRequest)
		return
	}
	seasonID, err := parseOptionalInt64(r.URL.Query().Get("seasonId"))
	if err != nil {
		http.Error(w, "invalid seasonId", http.StatusBadRequest)
		return
	}
	rows, err := h.svc.MatchesBetweenTeams(r.Context(), team1ID, team2ID, seasonID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rows)
}

func (h *ReportsHandler) MatchesByDate(w http.ResponseWriter, r *http.Request) {
	schedule, err := parseScheduleQuery(r.URL.Query())
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	rows, err := h.svc.MatchesByDate(r.Context(), schedule.From, schedule.To, schedule.StadiumID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rows)
}

func (h *ReportsHandler) CoachesByExperience(w http.ResponseWriter, r *http.Request) {
	rows, err := h.svc.CoachesByExperience(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rows)
}

func (h *ReportsHandler) StadiumsByAttendance(w http.ResponseWriter, r *http.Request) {
	seasonID, err := strconv.ParseInt(r.URL.Query().Get("seasonId"), 10, 64)
	if err != nil {
		http.Error(w, "invalid seasonId", http.StatusBadRequest)
		return
	}
	rows, err := h.svc.StadiumsByAttendance(r.Context(), seasonID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rows)
}

func (h *ReportsHandler) TeamStatus(w http.ResponseWriter, r *http.Request) {
	teamID, err := strconv.ParseInt(chi.URLParam(r, "teamId"), 10, 64)
	if err != nil {
		http.Error(w, "invalid teamId", http.StatusBadRequest)
		return
	}
	seasonID, err := strconv.ParseInt(r.URL.Query().Get("seasonId"), 10, 64)
	if err != nil {
		http.Error(w, "invalid seasonId", http.StatusBadRequest)
		return
	}
	row, err := h.svc.TeamStatus(r.Context(), teamID, seasonID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(row)
}

func (h *ReportsHandler) AllStarTeam(w http.ResponseWriter, r *http.Request) {
	seasonID, err := strconv.ParseInt(r.URL.Query().Get("seasonId"), 10, 64)
	if err != nil {
		http.Error(w, "invalid seasonId", http.StatusBadRequest)
		return
	}
	rows, err := h.svc.AllStarTeam(r.Context(), seasonID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rows)
}
