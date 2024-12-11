package actions

import (
	"fmt"
	"log"
	"net/http"
	"strings"
	"sync"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/m-cmp/mc-iam-manager/iamtokenvalidator"
	"github.com/m-cmp/mc-web-console/common"
	v "github.com/m-cmp/mc-web-console/variables"
	"github.com/spf13/viper"

	"gorm.io/gorm"
)

var (
	routes   map[string]string
	initOnce sync.Once
)

func init() {
	routes = make(map[string]string)
	if v.IAMUSE {
		certEndPoint := getCertsEndpoint()
		err := iamtokenvalidator.GetPubkeyIamManager(certEndPoint)
		if err != nil {
			err = iamtokenvalidator.GetPubkeyIamManagerTlsSkipped(certEndPoint)
			if err != nil {
				panic("Get jwks fail :" + err.Error())
			}
		}
	}
}

var loggerMiddleware = middleware.RequestLoggerWithConfig(middleware.RequestLoggerConfig{
	LogStatus: true, LogURI: true, LogMethod: true, LogRemoteIP: true, LogError: true,
	LogValuesFunc: func(c echo.Context, rv middleware.RequestLoggerValues) error {
		if rv.Error != nil {
			c.Logger().Infof("\n⇨ %v [%v] %v (%v %v) "+v.TCR+"Error: %v\n"+v.TCC, rv.RemoteIP, rv.Method, rv.URI, rv.Status, http.StatusText(rv.Status), rv.Error)
		} else {
			c.Logger().Infof("\n⇨ %v [%v] %v (%v %v)\n", rv.RemoteIP, rv.Method, rv.URI, rv.Status, http.StatusText(rv.Status))
		}
		return nil
	},
})

func TransactionMiddleware(db *gorm.DB) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			tx := db.Begin()
			if tx.Error != nil {
				log.Print(tx.Error)
				return c.Render(http.StatusOK, "blank.unauthorized", c.Get("Render"))
			}
			c.Set("tx", tx)
			err := next(c)
			if err != nil {
				tx.Rollback()
				return c.Render(http.StatusOK, "blank.unauthorized", c.Get("Render"))
			}
			if commitErr := tx.Commit().Error; commitErr != nil {
				log.Print(commitErr)
				return echo.NewHTTPError(http.StatusInternalServerError, "Failed to commit transaction")
			}
			return nil
		}
	}
}

func SetRenderMiddleware(skipPaths ...string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			initOnce.Do(func() {
				for _, route := range app.Routes() {
					routes[strings.TrimPrefix(route.Name, "github.com/m-cmp/mc-web-console/")] = route.Path
				}
			})
			c.Set("Render", make(map[string]interface{}))
			err := common.SetRenderData(c, common.SetDatas{{
				Key:  "Routes",
				Data: routes,
			}})
			if err != nil {
				c.Logger().Error(err.Error())
			}
			return next(c)
		}
	}
}

func getCertsEndpoint() string {
	viper.SetConfigName("api")
	viper.SetConfigType("yaml")
	viper.AddConfigPath("./conf")
	if err := viper.ReadInConfig(); err != nil {
		log.Fatalf("Error reading config file, %s", err)
	}
	baseUrl := viper.Get("services.mc-iam-manager.baseurl").(string)
	certUri := viper.Get("serviceActions.mc-iam-manager.Getcerts.resourcePath").(string)
	fmt.Println("Cert Endpoint is : ", baseUrl+certUri)
	return baseUrl + certUri
}

func TokenValidMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		accessToken := strings.TrimPrefix(c.Request().Header.Get("Authorization"), "Bearer ")
		err := iamtokenvalidator.IsTokenValid(accessToken)
		if err != nil {
			log.Println(err.Error())
			return c.JSON(http.StatusUnauthorized, map[string]interface{}{"error": err.Error()})
		}
		return next(c)
	}
}

func SetContextMiddleware(skipPaths ...string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			for _, path := range skipPaths {
				if c.Path() == path {
					return next(c)
				}
			}
			accessToken := strings.TrimPrefix(c.Request().Header.Get("Authorization"), "Bearer ")
			claims, err := iamtokenvalidator.GetTokenClaimsByIamManagerClaims(accessToken)
			if err != nil {
				c.Logger().Error(err.Error())
				return c.JSON(http.StatusInternalServerError, map[string]interface{}{"error": err.Error()})
			}
			c.Set("Authorization", c.Request().Header.Get("Authorization"))
			c.Set("UserId", claims.UserID)
			c.Set("UserName", claims.Name)
			c.Set("Roles", claims.RealmAccess.Roles)
			return next(c)
		}
	}
}

func ApiMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {

		operationId := strings.ToLower(c.Param("operationId"))
		framework, _, _, err := common.GetApiSpec(operationId)
		if err != nil || framework == "" {
			commonResponse := common.CommonResponseStatusNotFound(operationId + "-" + err.Error())
			return c.JSON(commonResponse.Status.StatusCode, commonResponse)
		}

		commonRequest := &common.CommonRequest{
			Request: map[string]string{
				"framework":   framework,
				"operationid": operationId,
			},
		}
		commonResponse, err := common.AnyCaller(c, "Getpermissionticket", commonRequest, true)
		if err != nil || commonResponse.Status.StatusCode != 200 {
			return c.JSON(commonResponse.Status.StatusCode, commonResponse)
		}

		c.Set("Authorization", commonResponse.ResponseData.(map[string]interface{})["access_token"])

		return next(c)
	}
}

func SelfApiMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {

		operationId := strings.ToLower(strings.TrimPrefix(c.Request().RequestURI, "/api/"))
		framework, _, _, err := common.GetApiSpec(operationId)
		if err != nil || framework == "" {
			commonResponse := common.CommonResponseStatusNotFound(operationId + "-" + err.Error())
			return c.JSON(commonResponse.Status.StatusCode, commonResponse)
		}
		commonRequest := &common.CommonRequest{
			Request: map[string]string{
				"framework":   framework,
				"operationid": operationId,
			},
		}
		commonResponse, err := common.AnyCaller(c, "Getpermissionticket", commonRequest, true)
		if err != nil || commonResponse.Status.StatusCode != 200 {
			return c.JSON(commonResponse.Status.StatusCode, commonResponse)
		}

		c.Set("Authorization", commonResponse.ResponseData.(map[string]interface{})["access_token"])

		return next(c)
	}
}
