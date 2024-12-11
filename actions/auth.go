package actions

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/m-cmp/mc-web-console/common"
	"github.com/m-cmp/mc-web-console/handler"
	"github.com/m-cmp/mc-web-console/models"
	"gorm.io/gorm"

	"log"
)

// SELF AUTH

func AuthLogin(c echo.Context) error {
	commonRequest := &common.CommonRequest{}
	if err := c.Bind(commonRequest); err != nil {
		commonResponse := common.CommonResponseStatusBadRequest(err)
		return c.JSON(commonResponse.Status.StatusCode, commonResponse)
	}

	id := commonRequest.Request.(map[string]interface{})["id"].(string)
	password := commonRequest.Request.(map[string]interface{})["password"].(string)

	tokenSet, err := handler.GetUserToken(id, password)
	if err != nil {
		commonResponse := common.CommonResponseStatusBadRequest(err)
		return c.JSON(commonResponse.Status.StatusCode, commonResponse)
	}

	userSess := &models.Usersess{
		UserID:           id,
		AccessToken:      tokenSet.Accresstoken,
		ExpiresIn:        float64(tokenSet.ExpiresIn),
		RefreshToken:     tokenSet.RefreshToken,
		RefreshExpiresIn: float64(tokenSet.RefreshExpiresIn),
	}
	tx := c.Get("tx").(*gorm.DB)
	_, err = handler.CreateUserSess(tx, userSess)
	if err != nil {
		commonResponse := common.CommonResponseStatusBadRequest(err)
		return c.JSON(commonResponse.Status.StatusCode, commonResponse)
	}

	commonResponse := common.CommonResponseStatusOK(tokenSet)
	return c.JSON(commonResponse.Status.StatusCode, commonResponse)
}

func AuthLoginRefresh(c echo.Context) error {
	tx := c.Get("tx").(*gorm.DB)
	userId := c.Get("UserId").(string)
	sess, err := handler.GetUserByUserId(tx, userId)
	if err != nil {
		app.Logger.Error(err.Error())
		commonResponse := common.CommonResponseStatusBadRequest(err.Error())
		return c.JSON(commonResponse.Status.StatusCode, commonResponse)
	}

	tokenSet, err := handler.RefreshAccessToken(sess.RefreshToken)
	if err != nil {
		app.Logger.Error(err.Error())
		commonResponse := common.CommonResponseStatusBadRequest(err.Error())
		return c.JSON(commonResponse.Status.StatusCode, commonResponse)
	}

	sess.AccessToken = tokenSet.Accresstoken
	sess.ExpiresIn = float64(tokenSet.ExpiresIn)
	sess.RefreshToken = tokenSet.Accresstoken
	sess.RefreshExpiresIn = float64(tokenSet.RefreshExpiresIn)

	_, err = handler.UpdateUserSess(tx, sess)
	if err != nil {
		app.Logger.Error(err.Error())
		commonResponse := common.CommonResponseStatusBadRequest(err.Error())
		return c.JSON(commonResponse.Status.StatusCode, commonResponse)
	}

	commonResponse := common.CommonResponseStatusOK(tokenSet)

	return c.JSON(commonResponse.Status.StatusCode, commonResponse)
}

func AuthLogout(c echo.Context) error {
	tx := c.Get("tx").(*gorm.DB)
	_, err := handler.DestroyUserSessByAccessTokenForLogout(tx, c.Get("UserId").(string))
	if err != nil {
		log.Println("AuthLogout err : ", err.Error())
		commonResponse := common.CommonResponseStatusBadRequest("no user session")
		return c.JSON(commonResponse.Status.StatusCode, commonResponse)
	}
	commonResponse := common.CommonResponseStatusNoContent(nil)
	return c.JSON(http.StatusOK, commonResponse)
}

func AuthUserinfo(c echo.Context) error {
	commonResponse := common.CommonResponseStatusOK(map[string]interface{}{
		"userid":   c.Get("UserId").(string),
		"username": c.Get("UserName").(string),
		"email":    c.Get("Email").(string),
		"role":     c.Get("Role").(string),
	})
	return c.JSON(commonResponse.Status.StatusCode, commonResponse)
}

func AuthValidate(c echo.Context) error {
	commonResponse := common.CommonResponseStatusOK(nil)
	return c.JSON(commonResponse.Status.StatusCode, commonResponse)
}

// MCMP AUTH

func AuthMCIAMLogin(c echo.Context) error {
	commonRequest := &common.CommonRequest{}
	c.Bind(commonRequest)

	commonResponse, _ := common.AnyCaller(c, "login", commonRequest, false)
	if commonResponse.Status.StatusCode != 200 && commonResponse.Status.StatusCode != 201 {
		return c.JSON(commonResponse.Status.StatusCode, commonResponse)
	}

	tx := c.Get("tx").(*gorm.DB)
	_, err := handler.CreateUserSessFromResponseData(tx, commonResponse, commonRequest.Request.(map[string]interface{})["id"].(string))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{"error": err.Error()})
	}

	return c.JSON(commonResponse.Status.StatusCode, commonResponse)
}

func AuthMCIAMLoginRefresh(c echo.Context) error {
	commonRequest := &common.CommonRequest{}
	c.Bind(commonRequest)

	tx := c.Get("tx").(*gorm.DB)
	var refreshRes *common.CommonResponse

	if commonRequest.Request != nil {
		refreshRes, _ = common.AnyCaller(c, "loginrefresh", commonRequest, true)
	} else {
		sess, err := handler.GetUserByUserId(tx, c.Get("UserId").(string))
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]interface{}{"error": err.Error()})
		}
		commonRequest.Request = map[string]interface{}{"refresh_token": sess.RefreshToken}
		refreshRes, _ = common.AnyCaller(c, "loginrefresh", commonRequest, true)
	}
	if refreshRes.Status.StatusCode != 200 {
		return c.JSON(refreshRes.Status.StatusCode, map[string]interface{}{"error": refreshRes.Status.Message})
	}

	_, err := handler.UpdateUserSessFromResponseData(tx, refreshRes, c.Get("UserId").(string))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{"error": err.Error()})
	}

	return c.JSON(refreshRes.Status.StatusCode, refreshRes)
}

func AuthMCIAMLogout(c echo.Context) error {
	tx := c.Get("tx").(*gorm.DB)
	rt, err := handler.DestroyUserSessByAccessTokenForLogout(tx, c.Get("UserId").(string))
	if err != nil {
		commonResponse := common.CommonResponseStatusBadRequest(err.Error())
		return c.JSON(commonResponse.Status.StatusCode, commonResponse)
	}
	commonRequest := &common.CommonRequest{
		Request: map[string]string{
			"refresh_token": rt,
		},
	}
	commonResponse, _ := common.AnyCaller(c, "logout", commonRequest, true)
	return c.JSON(http.StatusOK, commonResponse)
}

func AuthMCIAMUserinfo(c echo.Context) error {
	commonRequest := &common.CommonRequest{}
	commonResponse, _ := common.AnyCaller(c, "getuserinfo", commonRequest, true)
	return c.JSON(200, commonResponse)
}

func AuthMCIAMValidate(c echo.Context) error {
	commonRequest := &common.CommonRequest{}
	c.Bind(commonRequest)
	commonResponse, _ := common.AnyCaller(c, "authgetuservalidate", commonRequest, true)
	return c.JSON(commonResponse.Status.StatusCode, commonResponse)
}
