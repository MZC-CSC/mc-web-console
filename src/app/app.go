package app

import (
	"fmt"
	"mc-web-console/src/middleware/mcimw"
	"mc-web-console/src/models"
	"net/http"
	"sync"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

var (
	app     *echo.Echo
	appOnce sync.Once
)

func App() *echo.Echo {
	appOnce.Do(func() {
		app = echo.New()
		fmt.Println("app here!")

		app.Use(models.DbMiddleware)

		app.GET("/db", func(c echo.Context) error {
			tx := c.Get("tx").(*gorm.DB)
			tx.Create(&models.Product{Code: "D42", Price: 100})
			fmt.Println("done")
			return c.String(http.StatusOK, "Hello, World!")
		})

		app.GET("/db/read", func(c echo.Context) error {
			tx := c.Get("tx").(*gorm.DB)
			var product models.Product
			tx.First(&product, "code = ?", "D42")
			fmt.Println(product)
			return c.String(http.StatusOK, "Hello, World!")
		})

		app.GET("/alive", func(c echo.Context) error {
			return c.String(http.StatusOK, "alive")
		})

		mcimw.AuthMethod = mcimw.EnvKeycloak
		mcimw.GrantedRoleList = []string{}

		app.Any("/**", echo.WrapHandler(http.HandlerFunc(mcimw.BeginAuthHandler)))
		app.GET("/alive/protected", mcimw.EchoMcimw(func(c echo.Context) error {
			return c.String(http.StatusOK, "alive")
		}))

	})
	return app
}
