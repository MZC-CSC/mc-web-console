module dbmigration

go 1.23.0

require (
	github.com/go-gormigrate/gormigrate/v2 v2.1.3
	github.com/m-cmp/mc-web-console v0.0.0
	gorm.io/driver/postgres v1.5.11
	gorm.io/gorm v1.25.12
)

require (
	github.com/jackc/pgpassfile v1.0.0 // indirect
	github.com/jackc/pgservicefile v0.0.0-20240606120523-5a60cdf6a761 // indirect
	github.com/jackc/pgx/v5 v5.7.1 // indirect
	github.com/jackc/puddle/v2 v2.2.2 // indirect
	github.com/jinzhu/inflection v1.0.0 // indirect
	github.com/jinzhu/now v1.1.5 // indirect
	github.com/joho/godotenv v1.5.1 // indirect
	golang.org/x/crypto v0.29.0 // indirect
	golang.org/x/sync v0.9.0 // indirect
	golang.org/x/text v0.20.0 // indirect
)

replace github.com/m-cmp/mc-web-console => ../

replace github.com/m-cmp/mc-web-console/variables => ../variables

replace github.com/m-cmp/mc-web-console/models => ../models
