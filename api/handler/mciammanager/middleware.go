package mciammanager

import (
	"fmt"
	"log"
	"mc_web_console_api/handler"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/gobuffalo/buffalo"
	"github.com/gobuffalo/buffalo/render"

	"github.com/m-cmp/mc-iam-manager/iamtokenvalidator"
	"github.com/spf13/viper"
)

func init() {
	MCIAM_USE, _ := strconv.ParseBool(os.Getenv("MCIAM_USE"))
	if MCIAM_USE {
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

func TokenValidMiddleware(next buffalo.Handler) buffalo.Handler {
	return func(c buffalo.Context) error {
		accessToken := strings.TrimPrefix(c.Request().Header.Get("Authorization"), "Bearer ")
		err := iamtokenvalidator.IsTokenValid(accessToken)
		if err != nil {
			if strings.Contains(err.Error(), "token signature is invalid") {
				return c.Render(http.StatusForbidden, render.JSON(map[string]interface{}{"error": err.Error()}))
			} else if strings.Contains(err.Error(), "token is expired") {
				return c.Render(http.StatusUnauthorized, render.JSON(map[string]interface{}{"error": err.Error()}))
			}
			log.Println(err.Error())
			return c.Render(http.StatusInternalServerError, render.JSON(map[string]interface{}{"error": err.Error()}))
		}
		return next(c)
	}
}

func SetContextMiddleware(next buffalo.Handler) buffalo.Handler {
	return func(c buffalo.Context) error {
		accessToken := strings.TrimPrefix(c.Request().Header.Get("Authorization"), "Bearer ")
		claims, err := iamtokenvalidator.GetTokenClaimsByIamManagerClaims(accessToken)
		if err != nil {
			log.Println(err.Error())
			return c.Render(http.StatusInternalServerError, render.JSON(map[string]interface{}{"error": err.Error()}))
		}
		c.Set("Authorization", c.Request().Header.Get("Authorization"))
		c.Set("UserId", claims.UserID)
		c.Set("UserName", claims.Name)
		c.Set("Roles", claims.RealmAccess.Roles)
		return next(c)
	}
}

func ApiMiddleware(next buffalo.Handler) buffalo.Handler {
	return func(c buffalo.Context) error {

		operationId := strings.ToLower(c.Param("operationId"))
		framework, _, _, err := handler.GetApiSpec(operationId)
		if err != nil || framework == "" {
			commonResponse := handler.CommonResponseStatusNotFound(operationId + "-" + err.Error())
			return c.Render(commonResponse.Status.StatusCode, render.JSON(commonResponse))
		}

		commonRequest := &handler.CommonRequest{
			Request: map[string]string{
				"framework":   framework,
				"operationid": operationId,
			},
		}
		commonResponse, err := handler.AnyCaller(c, "Getpermissionticket", commonRequest, true)
		if err != nil || commonResponse.Status.StatusCode != 200 {
			return c.Render(commonResponse.Status.StatusCode, render.JSON(commonResponse))
		}

		c.Set("Authorization", commonResponse.ResponseData.(map[string]interface{})["access_token"])

		return next(c)
	}
}

func SelfApiMiddleware(next buffalo.Handler) buffalo.Handler {
	return func(c buffalo.Context) error {

		operationId := strings.ToLower(strings.TrimPrefix(c.Request().RequestURI, "/api/"))
		framework, _, _, err := handler.GetApiSpec(operationId)
		if err != nil || framework == "" {
			commonResponse := handler.CommonResponseStatusNotFound(operationId + "-" + err.Error())
			return c.Render(commonResponse.Status.StatusCode, render.JSON(commonResponse))
		}
		commonRequest := &handler.CommonRequest{
			Request: map[string]string{
				"framework":   framework,
				"operationid": operationId,
			},
		}
		commonResponse, err := handler.AnyCaller(c, "Getpermissionticket", commonRequest, true)
		if err != nil || commonResponse.Status.StatusCode != 200 {
			return c.Render(commonResponse.Status.StatusCode, render.JSON(commonResponse))
		}

		c.Set("Authorization", commonResponse.ResponseData.(map[string]interface{})["access_token"])

		return next(c)
	}
}
