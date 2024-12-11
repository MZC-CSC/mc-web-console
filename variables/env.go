package variables

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

var (
	ADDR                  = ""
	PORT                  = ""
	DATABASE_URL          = ""
	MODE                  = ""
	SECUREKEY             = ""
	IAMUSE                = false
	IFRAME_TARGET_IS_HOST = false
)

func init() {
	err := godotenv.Load()
	if err != nil {
		log.Print("Error loading .env file")
	}
	ADDR = os.Getenv(ENV_PREFIX + "ADDR")
	PORT = os.Getenv(ENV_PREFIX + "PORT")
	DATABASE_URL = os.Getenv(ENV_PREFIX + "DATABASE_URL")
	MODE = os.Getenv(ENV_PREFIX + "MODE")
	SECUREKEY = os.Getenv(ENV_PREFIX + "SECUREKEY")
	IAMUSE, _ = strconv.ParseBool(os.Getenv(ENV_PREFIX + "IAMUSE"))
	IFRAME_TARGET_IS_HOST, _ = strconv.ParseBool(os.Getenv(ENV_PREFIX + "IFRAME_TARGET_IS_HOST"))
}
