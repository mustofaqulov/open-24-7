package api

import (
	"encoding/json"
	"net/http"
)

type category struct {
	ID           string        `json:"id"`
	Key          string        `json:"key"`
	NameUz       string        `json:"nameUz"`
	NameEn       string        `json:"nameEn"`
	NameRu       string        `json:"nameRu"`
	ParentID     *string       `json:"parentId"`
	Translations []translation `json:"translations"`
}

type translation struct {
	Locale string `json:"locale"`
	Name   string `json:"name"`
}

func (s *Server) categories(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := s.context(r)
	defer cancel()
	rows, err := s.db.Query(ctx, `SELECT c.id::text, c.key, c.name_uz, c.name_en, c.name_ru,
		COALESCE(c.parent_id::text,''),
		COALESCE((SELECT json_agg(json_build_object('locale', t.locale, 'name', t.name))
			FROM category_translations t WHERE t.category_id = c.id), '[]'::json)::text
		FROM categories c ORDER BY c.name_en ASC`)
	if err != nil {
		s.unavailable(w, err)
		return
	}
	defer rows.Close()
	items := make([]category, 0)
	for rows.Next() {
		var item category
		var parentID string
		var translations string
		if err := rows.Scan(&item.ID, &item.Key, &item.NameUz, &item.NameEn,
			&item.NameRu, &parentID, &translations); err != nil {
			s.unavailable(w, err)
			return
		}
		if parentID != "" {
			item.ParentID = &parentID
		}
		if err := json.Unmarshal([]byte(translations), &item.Translations); err != nil {
			s.unavailable(w, err)
			return
		}
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		s.unavailable(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items})
}
