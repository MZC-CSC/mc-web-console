package actions

import (
	v "mc-web-console/variables"
	"net/http"
	"sync"

	"github.com/labstack/echo/v4"
)

var (
	app     *echo.Echo
	appOnce sync.Once
)

func App() *echo.Echo {
	appOnce.Do(func() {
		app = echo.New()
		app.Static("/", v.FrontPath)

		app.GET("/api/hello", func(c echo.Context) error {
			return c.JSON(http.StatusOK, map[string]string{
				"message": "Hello from Echo!",
			})
		})
	})
	return app
}
