package main

import (
	"fmt"

	"github.com/labstack/gommon/log"
	"github.com/m-cmp/mc-web-console/actions"
	v "github.com/m-cmp/mc-web-console/variables"
)

func init() {
	fmt.Println(v.Logo + v.TCR + v.Version + v.TCC)
	fmt.Println(v.Subtitle)
	fmt.Println(v.TCB + v.Repo + v.TCC)
}

func main() {
	app := actions.App()
	app.HideBanner = true
	app.Logger.SetLevel(log.INFO)
	app.Logger.SetHeader("${time_rfc3339} | ${level} | ${short_file}:${line}")
	app.Logger.Fatal(app.Start(v.ADDR + ":" + v.PORT))
}
