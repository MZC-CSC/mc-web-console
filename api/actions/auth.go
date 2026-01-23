package actions

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"mc_web_console_api/handler"
	"mc_web_console_api/handler/self"
	"mc_web_console_api/models"
	"net/http"
	"strings"

	"log"

	"github.com/gobuffalo/buffalo"
	"github.com/gobuffalo/pop/v6"
	"github.com/m-cmp/mc-iam-manager/iamtokenvalidator"
)

// SELF AUTH

func AuthLogin(c buffalo.Context) error {
	commonRequest := &handler.CommonRequest{}
	if err := c.Bind(commonRequest); err != nil {
		commonResponse := handler.CommonResponseStatusBadRequest(err)
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}
	log.Println("commonRequest : ", commonRequest)
	id := commonRequest.Request.(map[string]interface{})["id"].(string)
	password := commonRequest.Request.(map[string]interface{})["password"].(string)

	tokenSet, err := self.GetUserToken(id, password)
	if err != nil {
		commonResponse := handler.CommonResponseStatusBadRequest(err)
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	tx := c.Value("tx").(*pop.Connection)
	userSess := &models.Usersess{
		UserID:           id,
		AccessToken:      tokenSet.Accresstoken,
		ExpiresIn:        float64(tokenSet.ExpiresIn),
		RefreshToken:     tokenSet.RefreshToken,
		RefreshExpiresIn: float64(tokenSet.RefreshExpiresIn),
	}
	_, err = self.CreateUserSess(tx, userSess)
	if err != nil {
		commonResponse := handler.CommonResponseStatusBadRequest(err)
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	commonResponse := handler.CommonResponseStatusOK(tokenSet)
	return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
}

func AuthLoginRefresh(c buffalo.Context) error {
	tx := c.Value("tx").(*pop.Connection)
	userId := c.Value("UserId").(string)
	sess, err := self.GetUserByUserId(tx, userId)
	if err != nil {
		app.Logger.Error(err.Error())
		commonResponse := handler.CommonResponseStatusBadRequest(err.Error())
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	tokenSet, err := self.RefreshAccessToken(sess.RefreshToken)
	if err != nil {
		app.Logger.Error(err.Error())
		commonResponse := handler.CommonResponseStatusBadRequest(err.Error())
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	sess.AccessToken = tokenSet.Accresstoken
	sess.ExpiresIn = float64(tokenSet.ExpiresIn)
	sess.RefreshToken = tokenSet.Accresstoken
	sess.RefreshExpiresIn = float64(tokenSet.RefreshExpiresIn)

	_, err = self.UpdateUserSess(tx, sess)
	if err != nil {
		app.Logger.Error(err.Error())
		commonResponse := handler.CommonResponseStatusBadRequest(err.Error())
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	commonResponse := handler.CommonResponseStatusOK(tokenSet)

	return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
}

func AuthLogout(c buffalo.Context) error {
	tx := c.Value("tx").(*pop.Connection)
	_, err := self.DestroyUserSessByAccesstokenforLogout(tx, c.Value("UserId").(string))
	if err != nil {
		log.Println("AuthLogout err : ", err.Error())
		commonResponse := handler.CommonResponseStatusBadRequest("no user session")
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}
	commonResponse := handler.CommonResponseStatusNoContent(nil)
	return c.Render(http.StatusOK, r.JSON(commonResponse))
}

func AuthUserinfo(c buffalo.Context) error {
	commonResponse := handler.CommonResponseStatusOK(map[string]interface{}{
		"userid":   c.Value("UserId").(string),
		"username": c.Value("UserName").(string),
		"email":    c.Value("Email").(string),
		"role":     c.Value("Role").(string),
	})
	return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
}

func AuthValidate(c buffalo.Context) error {
	commonResponse := handler.CommonResponseStatusOK(nil)
	return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
}

// extractPreferredUsernameFromToken extracts preferred_username from JWT token
// This is needed because DB stores preferred_username (e.g., "mcmp"), not sub (UUID)
func extractPreferredUsernameFromToken(accessToken string) (string, error) {
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
		log.Printf("extractPreferredUsernameFromToken: Found preferred_username: %s", preferredUsername)
		return preferredUsername, nil
	}

	// Fallback to sub if preferred_username not available
	if sub, ok := claims["sub"].(string); ok {
		log.Printf("extractPreferredUsernameFromToken: Using sub as fallback: %s", sub)
		return sub, nil
	}

	return "", fmt.Errorf("preferred_username or sub not found in token")
}

// MCMP AUTH

func AuthMCIAMLogin(c buffalo.Context) error {
	commonRequest := &handler.CommonRequest{}
	c.Bind(commonRequest)

	commonResponse, _ := handler.AnyCaller(c, "mciamLogin", commonRequest, false)
	if commonResponse.Status.StatusCode != 200 && commonResponse.Status.StatusCode != 201 {
		log.Println("AuthMCIAMLogin commonResponse : ", commonResponse)
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}
	log.Println("AuthMCIAMLogin commonResponse : ", commonResponse)
	tx := c.Value("tx").(*pop.Connection)

	// Extract user ID from request
	userId, ok := commonRequest.Request.(map[string]interface{})["id"]
	if !ok {
		log.Println("AuthMCIAMLogin error: 'id' field not found in request")
		return c.Render(http.StatusBadRequest, r.JSON(map[string]interface{}{"error": "id field is required"}))
	}

	userIdStr, ok := userId.(string)
	if !ok {
		log.Println("AuthMCIAMLogin error: 'id' field is not a string")
		return c.Render(http.StatusBadRequest, r.JSON(map[string]interface{}{"error": "id must be a string"}))
	}

	_, err := self.CreateUserSessFromResponseData(tx, commonResponse, userIdStr)
	if err != nil {
		log.Println("AuthMCIAMLogin CreateUserSessFromResponseData error:", err.Error())
		return c.Render(http.StatusInternalServerError, r.JSON(map[string]interface{}{"error": err.Error()}))
	}

	return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
}

func AuthMCIAMLoginRefresh(c buffalo.Context) error {
	commonRequest := &handler.CommonRequest{}
	c.Bind(commonRequest)

	tx := c.Value("tx").(*pop.Connection)
	var refreshRes *handler.CommonResponse

	// Extract UserId from token if not set in context
	var userId string
	if userIdVal := c.Value("UserId"); userIdVal != nil {
		userId = userIdVal.(string)
	} else {
		// Extract UserId from access token
		accessToken := strings.TrimPrefix(c.Request().Header.Get("Authorization"), "Bearer ")
		// Extract preferred_username from token (DB stores this, not sub UUID)
		preferredUsername, err := extractPreferredUsernameFromToken(accessToken)
		if err != nil {
			log.Println("AuthMCIAMLoginRefresh: Failed to extract preferred_username from token:", err.Error())
			// Fallback to claims.UserID if token parsing fails
			claims, claimsErr := iamtokenvalidator.GetTokenClaimsByIamManagerClaims(accessToken)
			if claimsErr != nil {
				return c.Render(http.StatusUnauthorized, r.JSON(map[string]interface{}{"error": "Invalid token: " + claimsErr.Error()}))
			}
			userId = claims.UserID
		} else {
			userId = preferredUsername
		}
		log.Println("AuthMCIAMLoginRefresh: Extracted UserId from token:", userId)
	}

	log.Println("AuthMCIAMLoginRefresh commonRequest : ", commonRequest)
	log.Println("UserId : ", userId)

	// Check if refresh_token is provided in request
	var refreshToken string
	if commonRequest.Request != nil {
		if reqMap, ok := commonRequest.Request.(map[string]interface{}); ok {
			if rt, ok := reqMap["refresh_token"].(string); ok && rt != "" {
				refreshToken = rt
			}
		}
	}

	if refreshToken != "" {
		// Use provided refresh_token
		refreshRes, _ = handler.AnyCaller(c, "mciamRefreshToken", commonRequest, true)
	} else {
		// Get refresh_token from DB
		sess, err := self.GetUserByUserId(tx, userId)
		if err != nil {
			log.Println("AuthMCIAMLoginRefresh: GetUserByUserId error for userId:", userId, "error:", err.Error())
			return c.Render(http.StatusInternalServerError, r.JSON(map[string]interface{}{"error": err.Error()}))
		}
		commonRequest.Request = map[string]interface{}{"refresh_token": sess.RefreshToken}
		refreshRes, _ = handler.AnyCaller(c, "mciamRefreshToken", commonRequest, true)
	}
	if refreshRes.Status.StatusCode != 200 {
		return c.Render(refreshRes.Status.StatusCode, r.JSON(map[string]interface{}{"error": refreshRes.Status.Message}))
	}
	log.Println("refreshRes : ", refreshRes)
	log.Println("AuthMCIAMLoginRefresh: Using userId for DB update:", userId)

	_, err := self.UpdateUserSesssFromResponseData(tx, refreshRes, userId)
	if err != nil {
		log.Println("AuthMCIAMLoginRefresh: UpdateUserSesssFromResponseData error:", err.Error())
		return c.Render(http.StatusInternalServerError, r.JSON(map[string]interface{}{"error": err.Error()}))
	}

	return c.Render(refreshRes.Status.StatusCode, r.JSON(refreshRes))
}

func AuthMCIAMLogout(c buffalo.Context) error {
	tx := c.Value("tx").(*pop.Connection)

	// Extract UserId from token if not set in context
	var userId string
	if userIdVal := c.Value("UserId"); userIdVal != nil {
		userId = userIdVal.(string)
	} else {
		// Extract UserId from access token
		accessToken := strings.TrimPrefix(c.Request().Header.Get("Authorization"), "Bearer ")
		// Extract preferred_username from token (DB stores this, not sub UUID)
		preferredUsername, err := extractPreferredUsernameFromToken(accessToken)
		if err != nil {
			log.Println("AuthMCIAMLogout: Failed to extract preferred_username from token:", err.Error())
			// Fallback to claims.UserID if token parsing fails
			claims, claimsErr := iamtokenvalidator.GetTokenClaimsByIamManagerClaims(accessToken)
			if claimsErr != nil {
				return c.Render(http.StatusUnauthorized, r.JSON(map[string]interface{}{"error": "Invalid token: " + claimsErr.Error()}))
			}
			userId = claims.UserID
		} else {
			userId = preferredUsername
		}
		log.Println("AuthMCIAMLogout: Extracted UserId from token:", userId)
	}

	rt, err := self.DestroyUserSessByAccesstokenforLogout(tx, userId)
	if err != nil {
		commonResponse := handler.CommonResponseStatusBadRequest(err.Error())
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}
	commonRequest := &handler.CommonRequest{
		Request: map[string]string{
			"refresh_token": rt,
		},
	}
	commonResponse, _ := handler.AnyCaller(c, "mciamLogout", commonRequest, true)
	return c.Render(http.StatusOK, r.JSON(commonResponse))
}

func AuthMCIAMUserinfo(c buffalo.Context) error {
	// Get user info from context (already set by SetContextMiddleware)
	// SetContextMiddleware uses iamtokenvalidator.GetTokenClaimsByIamManagerClaims
	userId := ""
	userName := ""
	roles := []string{}

	if userIdVal := c.Value("UserId"); userIdVal != nil {
		userId = userIdVal.(string)
	}
	if userNameVal := c.Value("UserName"); userNameVal != nil {
		userName = userNameVal.(string)
	}
	if rolesVal := c.Value("Roles"); rolesVal != nil {
		roles = rolesVal.([]string)
	}

	// Build user info response from context values
	userInfo := map[string]interface{}{
		"userid":   userId,
		"username": userName,
		"roles":    roles,
	}

	commonResponse := handler.CommonResponseStatusOK(userInfo)
	return c.Render(200, r.JSON(commonResponse))
}

func AuthMCIAMValidate(c buffalo.Context) error {
	// Token validation is already done by TokenValidMiddleware
	// This endpoint just confirms the token is valid
	commonResponse := handler.CommonResponseStatusOK(map[string]interface{}{
		"valid": true,
	})
	return c.Render(200, r.JSON(commonResponse))
}
