package mciammanager

import (
	"encoding/base64"
	"encoding/json"
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
			log.Printf("GetPubkeyIamManager failed with certUrl: %s, error: %v", certEndPoint, err)
			err = iamtokenvalidator.GetPubkeyIamManagerTlsSkipped(certEndPoint)
			if err != nil {
				log.Printf("GetPubkeyIamManagerTlsSkipped also failed with certUrl: %s, error: %v", certEndPoint, err)
				panic("Get jwks fail :" + err.Error())
			}
		}
	}
}

// extractUserIdFromExpiredToken은 만료된 JWT에서도 userId를 추출합니다.
// 검증 없이 payload를 디코딩하여 preferred_username 또는 sub를 반환합니다.
func extractUserIdFromExpiredToken(accessToken string) (string, error) {
	parts := strings.Split(accessToken, ".")
	if len(parts) != 3 {
		return "", fmt.Errorf("invalid token format")
	}

	// Decode payload (second part) - Base64 URL-safe decoding
	payload := parts[1]
	// Replace URL-safe characters
	payload = strings.ReplaceAll(payload, "-", "+")
	payload = strings.ReplaceAll(payload, "_", "/")

	// Add padding if needed
	switch len(payload) % 4 {
	case 2:
		payload += "=="
	case 3:
		payload += "="
	}

	decoded, err := base64.StdEncoding.DecodeString(payload)
	if err != nil {
		return "", fmt.Errorf("failed to decode token payload: %v", err)
	}

	var claims map[string]interface{}
	if err := json.Unmarshal(decoded, &claims); err != nil {
		return "", fmt.Errorf("failed to unmarshal token claims: %v", err)
	}

	// Try preferred_username first (matches DB user_id)
	if preferredUsername, ok := claims["preferred_username"].(string); ok && preferredUsername != "" {
		log.Printf("extractUserIdFromExpiredToken: Found preferred_username: %s", preferredUsername)
		return preferredUsername, nil
	}

	// Fallback to sub if preferred_username not available
	if sub, ok := claims["sub"].(string); ok {
		log.Printf("extractUserIdFromExpiredToken: Using sub as fallback: %s", sub)
		return sub, nil
	}

	return "", fmt.Errorf("preferred_username or sub not found in token")
}

func getCertsEndpoint() string {
	viper.SetConfigName("api")
	viper.SetConfigType("yaml")
	viper.AddConfigPath("./conf")
	viper.AddConfigPath("../conf")
	if err := viper.ReadInConfig(); err != nil {
		log.Fatalf("Error reading config file, %s", err)
	}
	baseUrl := viper.GetString("services.mc-iam-manager.baseurl")
	certUri := viper.GetString("serviceActions.mc-iam-manager.mciamAuthCerts.resourcePath")
	if baseUrl == "" || certUri == "" {
		log.Fatalf("Missing required config: services.mc-iam-manager.baseurl or serviceActions.mc-iam-manager.mciamAuthCerts.resourcePath")
	}
	fmt.Println("Cert Endpoint is : ", baseUrl+certUri)
	return baseUrl + certUri
}

func TokenValidMiddleware(next buffalo.Handler) buffalo.Handler {
	return func(c buffalo.Context) error {
		accessToken := strings.TrimPrefix(c.Request().Header.Get("Authorization"), "Bearer ")
		err := iamtokenvalidator.IsTokenValid(accessToken)

		if err != nil {
			// Token이 만료된 경우 자동 갱신 시도
			if strings.Contains(err.Error(), "token is expired") {
				log.Println("@@@ Token expired, attempting auto-refresh...")

				// 만료된 token에서 userId 추출 (검증 없이 payload 디코딩)
				userId, userIdErr := extractUserIdFromExpiredToken(accessToken)
				if userIdErr != nil {
					log.Println("@@@ Failed to extract userId from expired token:", userIdErr.Error())
					return c.Render(http.StatusUnauthorized, render.JSON(map[string]interface{}{"error": err.Error()}))
				}

				// Refresh token으로 새로운 access token 발급
				refreshRes, refreshErr := RefreshMCIAMToken(c, userId)
				if refreshErr != nil {
					log.Println("@@@ Auto-refresh failed:", refreshErr.Error())
					return c.Render(http.StatusUnauthorized, render.JSON(map[string]interface{}{"error": "Token refresh failed"}))
				}

				// 새로운 access token을 request header에 설정
				newAccessToken := refreshRes.ResponseData.(map[string]interface{})["access_token"].(string)
				c.Request().Header.Set("Authorization", "Bearer "+newAccessToken)

				// Frontend가 새 token을 감지할 수 있도록 response header에도 추가
				c.Response().Header().Set("X-New-Access-Token", newAccessToken)

				// Refresh token도 포함 (선택적)
				if newRefreshToken, ok := refreshRes.ResponseData.(map[string]interface{})["refresh_token"].(string); ok {
					c.Response().Header().Set("X-New-Refresh-Token", newRefreshToken)
				}

				log.Println("@@@ Token refreshed successfully for user:", userId)
				// 새로운 token으로 요청 계속 진행
				return next(c)
			}

			// 다른 종류의 에러인 경우 401 반환
			log.Println(err.Error())
			return c.Render(http.StatusUnauthorized, render.JSON(map[string]interface{}{"error": err.Error()}))
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
