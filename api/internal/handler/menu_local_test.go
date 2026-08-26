package handler

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"mc_web_console_api/internal/config"
	"mc_web_console_api/internal/model"

	"github.com/labstack/echo/v4"
)

func newTestContext() (echo.Context, *httptest.ResponseRecorder) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/api/mc-iam-manager/GetAllAvailableMenus", nil)
	rec := httptest.NewRecorder()
	return e.NewContext(req, rec), rec
}

func TestHandleLocalAvailableMenus_ReturnsAllMenus(t *testing.T) {
	c, rec := newTestContext()
	cfg := &config.Config{
		Menus: []config.Menu{
			{ID: "settings", ParentID: "home", DisplayName: "Settings"},
			{ID: "users", ParentID: "settings", DisplayName: "Users"},
		},
	}

	if err := handleLocalAvailableMenus(c, cfg); err != nil {
		t.Fatalf("handleLocalAvailableMenus returned error: %v", err)
	}
	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rec.Code)
	}

	var resp model.CommonResponse
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}
	menus, ok := resp.ResponseData.([]interface{})
	if !ok {
		t.Fatalf("expected responseData to be a flat array, got %T", resp.ResponseData)
	}
	if len(menus) != len(cfg.Menus) {
		t.Errorf("expected %d menus (no role filtering), got %d", len(cfg.Menus), len(menus))
	}
}

func TestHandleLocalAvailableMenus_EmptyMenusReturns500(t *testing.T) {
	c, rec := newTestContext()
	cfg := &config.Config{Menus: nil}

	if err := handleLocalAvailableMenus(c, cfg); err != nil {
		t.Fatalf("handleLocalAvailableMenus returned error: %v", err)
	}
	if rec.Code != http.StatusInternalServerError {
		t.Fatalf("expected status 500, got %d", rec.Code)
	}
}
