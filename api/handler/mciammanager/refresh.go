package mciammanager

import (
	"fmt"
	"log"
	"mc_web_console_api/handler"
	"mc_web_console_api/handler/self"

	"github.com/gobuffalo/buffalo"
	"github.com/gobuffalo/pop/v6"
)

// RefreshMCIAMToken은 refresh token을 사용하여 새로운 access token을 발급받습니다.
// Middleware와 Handler에서 공통으로 사용할 수 있도록 로직을 분리합니다.
//
// Parameters:
//   - c: Buffalo Context (Transaction 포함)
//   - userId: 사용자 ID
//
// Returns:
//   - *handler.CommonResponse: 성공 시 새로운 token 정보 포함
//   - error: 실패 시 에러
func RefreshMCIAMToken(c buffalo.Context, userId string) (*handler.CommonResponse, error) {
	tx := c.Value("tx").(*pop.Connection)

	// 1. DB에서 refresh token 조회 (기존 함수 재사용)
	sess, err := self.GetUserByUserId(tx, userId)
	if err != nil {
		log.Println("RefreshMCIAMToken: GetUserByUserId error for userId:", userId, "error:", err.Error())
		return nil, fmt.Errorf("failed to get user session")
	}

	// 2. mc-iam-manager의 mciamRefreshToken 호출
	commonRequest := &handler.CommonRequest{
		Request: map[string]interface{}{
			"refresh_token": sess.RefreshToken,
		},
	}
	refreshRes, err := handler.AnyCaller(c, "mciamRefreshToken", commonRequest, false)
	if err != nil || refreshRes.Status.StatusCode != 200 {
		log.Println("RefreshMCIAMToken: mciamRefreshToken call failed, error:", err)
		return nil, fmt.Errorf("failed to refresh token from mc-iam-manager")
	}

	log.Println("RefreshMCIAMToken: mciamRefreshToken response received")

	// 3. DB 업데이트 (기존 함수 재사용)
	_, err = self.UpdateUserSesssFromResponseData(tx, refreshRes, userId)
	if err != nil {
		log.Println("RefreshMCIAMToken: UpdateUserSesssFromResponseData error:", err.Error())
		return nil, fmt.Errorf("failed to update user session in database")
	}

	log.Println("RefreshMCIAMToken: Token refreshed successfully for userId:", userId)
	return refreshRes, nil
}
