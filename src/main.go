package main

import (
	"fmt"
	"mc-web-console/src/app"
	"os"

	"github.com/joho/godotenv"
)

var (
	address string
)

func init() {
	err := godotenv.Load("setup.env")
	if err != nil {
		fmt.Println("Error loading .env file")
	}
	ADDR := os.Getenv("ADDR")
	PORT := os.Getenv("PORT")
	address = ADDR + ":" + PORT
}

func main() {
	app := app.App()
	if err := app.Start(address); err != nil {
		app.Logger.Fatal(err)
	}
}
