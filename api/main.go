package main

import (
	"mc-web-console/actions"
	v "mc-web-console/variables"
)

func main() {
	app := actions.App()
	app.Logger.Fatal(app.Start(v.ADDR + ":" + v.PORT))
}
