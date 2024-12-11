package actions

import (
	"net/http"
	"sync"

	"github.com/gorilla/sessions"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	v "github.com/m-cmp/mc-web-console/variables"
)

var (
	app     *echo.Echo
	appOnce sync.Once
)

func App() *echo.Echo {
	appOnce.Do(func() {
		app = echo.New()

		app.Renderer = t
		if v.MODE == v.MODE_DEVELOPMENT {
			app.Use(loggerMiddleware)
		}

		app.Use(middleware.Recover())
		app.Use(session.Middleware(sessions.NewCookieStore([]byte(v.SECUREKEY))))
		// app.Use(TransactionMiddleware(models.DB))
		app.Use(SetRenderMiddleware())
		// app.Use(SetContextMiddleware([]string{
		// 	"/readyz",
		// 	"/public",
		// }...))

		app.Static("/public", "public")

		app.GET("/readyz", readyz)

		pages := app.Group("/webconsole")
		pages.GET("/:path+", PageController)

		apiPath := "/api"

		auth := app.Group(apiPath + "/auth")
		auth.POST("/login", AuthMCIAMLogin)
		auth.POST("/refresh", AuthMCIAMLoginRefresh)
		auth.POST("/validate", AuthMCIAMValidate)
		auth.POST("/logout", AuthMCIAMLogout)
		auth.POST("/userinfo", AuthMCIAMUserinfo)
	})
	return app
}

// func AppWithoutMCIAM() *echo.Echo {
// 	appOnce.Do(func() {
// 		app = echo.New()

// 		app.Renderer = t
// 		if v.MODE == v.MODE_DEVELOPMENT {
// 			app.Use(loggerMiddleware)
// 		}

// 		app.Use(middleware.Recover())
// 		app.Use(session.Middleware(sessions.NewCookieStore([]byte(v.SECUREKEY))))
// 		app.Use(TransactionMiddleware(models.DB))
// 		app.Use(SetRenderMiddleware())
// 		app.Use(SetContextMiddleware([]string{
// 			"/readyz",
// 			"/public",
// 		}...))

// 		app.Static("/public", "public")

// 		app.GET("/readyz", readyz)
// 	})
// 	return app
// }

func readyz(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]interface{}{"status": "OK"})
}
