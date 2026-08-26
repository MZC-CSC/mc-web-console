package handler

import (
	"log"

	"mc_web_console_api/internal/config"
	"mc_web_console_api/internal/model"

	"github.com/labstack/echo/v4"
)

// handleLocalAvailableMenus MC_WEB_CONSOLE_USE_IAM=false일 때 GetAllAvailableMenus를
// mc-iam-manager로 프록시하지 않고 로컬 conf/webconsole_menu_resources.yaml 기반의
// "역할 필터링 없는 전체 메뉴" 목록을 반환한다.
//
// 응답 포맷은 mc-iam-manager의 ListUserMenu(src/handler/menu_handler.go)가 반환하는 것과
// 동일하게 래핑 없는 flat 배열을 CommonResponse.responseData에 그대로 담는다 — front
// (menus_api.js/login.js)가 flat 배열을 기대하기 때문이다.
func handleLocalAvailableMenus(c echo.Context, cfg *config.Config) error {
	if len(cfg.Menus) == 0 {
		log.Printf("[handleLocalAvailableMenus] cfg.Menus is empty (yaml load failed at boot or file is empty)")
		resp := model.CommonResponseStatusInternalServerError(
			"local menu definition unavailable (conf/webconsole_menu_resources.yaml)",
		)
		return c.JSON(resp.ToJSON())
	}

	resp := model.CommonResponseStatusOK(cfg.Menus)
	return c.JSON(resp.ToJSON())
}
