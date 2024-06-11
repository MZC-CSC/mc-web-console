package models

import (
	"log"

	"github.com/labstack/echo/v4"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var (
	Db *gorm.DB
)

func init() {
	var err error
	Db, err = gorm.Open(sqlite.Open("test.db"), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Println(err.Error())
		panic("fail to connect DB")
	}

	Db.AutoMigrate(&Product{})
}

func DbMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		tx := Db.WithContext(c.Request().Context())
		c.Set("tx", tx)
		return next(c)
	}
}
