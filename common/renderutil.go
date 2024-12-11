package common

import (
	"fmt"

	"github.com/labstack/echo/v4"
)

type SetData struct {
	Key  string
	Data map[string]string
}

type SetDatas []SetData

func SetRenderData(c echo.Context, d SetDatas) error {
	if r, ok := c.Get("Render").(map[string]interface{}); ok {
		for _, i := range d {
			r[i.Key] = i.Data
		}
		c.Set("Render", r)
		return nil
	} else {
		return fmt.Errorf("setRenderData fail : c.Get(Render)")
	}
}
