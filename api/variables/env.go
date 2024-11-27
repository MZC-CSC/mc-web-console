package variables

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

var (
	PORT = ""
	ADDR = ""
)

func init() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	PORT = os.Getenv("PORT")
	ADDR = os.Getenv("ADDR")
}
