package actions

import (
	"fmt"
	"log"
	"mc_web_console_api/handler"
	"regexp"
	"strings"

	"github.com/gobuffalo/buffalo"
)

func AnyController(c buffalo.Context) error {
	log.Println("#### AnyController")
	operationId := strings.ToLower(c.Param("operationId"))
	if operationId == "" {
		commonResponse := handler.CommonResponseStatusNotFound("no operationId is provided")
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	commonRequest := &handler.CommonRequest{}
	c.Bind(commonRequest)

	log.Printf("== operationId\t:[ %s ]\n== commonRequest\t:\n%+v\n==\n", operationId, commonRequest)
	commonResponse, _ := handler.AnyCaller(c, operationId, commonRequest, true)

	return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
}

// SubsystemAnyController 는 중복되는 operationId 를 가지는 서브시스템을 호출하기 위해 사용 가능한 handler 입니다.
// subsystemName 과 operationId 를 path parameter 로 전달받아 사용합니다.
// 소문자로 변환한 각각의 값을 conf/api.yaml 에 정의된 subsystem 과 operationId 와 매칭하여 매칭된 api 를 호출합니다.
// AnyController 와 동일한 방식으로 작동합니다.
func SubsystemAnyController(c buffalo.Context) error {
	log.Println("#### SubsystemAnyController")
	subsystemName := strings.ToLower(c.Param("subsystemName"))
	operationId := strings.ToLower(c.Param("operationId"))

	if subsystemName == "" {
		commonResponse := handler.CommonResponseStatusNotFound("no subsystemName is provided")
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	if operationId == "" {
		commonResponse := handler.CommonResponseStatusNotFound("no operationId is provided")
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	commonRequest := &handler.CommonRequest{}
	c.Bind(commonRequest)

	log.Printf("==subsystemName\t:[ %s ]\n== operationId\t:[ %s ]\n== commonRequest\t:\n%+v\n==\n", subsystemName, operationId, commonRequest)
	commonResponse, _ := handler.SubsystemAnyCaller(c, subsystemName, operationId, commonRequest, true)

	return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
}

func GetApiHosts(c buffalo.Context) error {
	apiHosts, err := handler.GetApiHosts()
	if err != nil {
		return c.Render(200, r.JSON(map[string]interface{}{"error": err.Error()}))
	}
	commonResponse := handler.CommonResponseStatusOK(apiHosts)

	re := regexp.MustCompile(`:(\d+.*)`)
	if IFRAME_TARGET_IS_HOST {
		for fw, host := range apiHosts {
			portUrlStr := re.FindString(host.BaseURL)
			if portUrlStr != "" {
				host.BaseURL = portUrlStr
				apiHosts[fw] = host
			}
		}
		fmt.Println(apiHosts)
		commonResponse = handler.CommonResponseStatusOK(apiHosts)
	}

	return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
}

func ListServicesAndActions(c buffalo.Context) error {
	// MCIAM_USE에 따라 적절한 subsystem의 ListServicesAndActions operationId 호출
	var subsystemName string
	if MCIAM_USE {
		subsystemName = "mc-iam-manager"
	} else {
		subsystemName = "mc-web-console"
	}

	commonRequest := &handler.CommonRequest{}
	c.Bind(commonRequest)

	log.Printf("== ListServicesAndActions\t:\n== subsystemName\t:[ %s ]\n== MCIAM_USE\t:[ %v ]\n==\n", subsystemName, MCIAM_USE)
	
	commonResponse, err := handler.SubsystemAnyCaller(c, subsystemName, "listservicesandactions", commonRequest, true)
	if err != nil {
		log.Printf("ListServicesAndActions error: %v", err)
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
}

// DirectCallRequest 는 직접 endpoint 호출을 위한 요청 구조입니다.
type DirectCallRequest struct {
	TargetUrl      string                  `json:"targetUrl"`
	Endpoint       string                  `json:"endpoint"`
	Method         string                  `json:"method"`
	TargetAuthToken string                 `json:"targetAuthToken,omitempty"`
	Parameters     *handler.CommonRequest `json:"parameters,omitempty"`
}

// DirectCallController 는 대상 서비스 URL, endpoint, HTTP 메소드를 직접 지정하여 호출하는 handler 입니다.
// Backend 호출은 access-token을 자동으로 전달하고, 지정된 targetAuthToken을 대상 서비스 호출 시 사용합니다.
func DirectCallController(c buffalo.Context) error {
	log.Println("#### DirectCallController")

	directCallRequest := &DirectCallRequest{}
	if err := c.Bind(directCallRequest); err != nil {
		commonResponse := handler.CommonResponseStatusBadRequest("invalid request body: " + err.Error())
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	// 필수 필드 검증
	if directCallRequest.TargetUrl == "" {
		commonResponse := handler.CommonResponseStatusBadRequest("targetUrl is required")
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	if directCallRequest.Endpoint == "" {
		commonResponse := handler.CommonResponseStatusBadRequest("endpoint is required")
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	if directCallRequest.Method == "" {
		commonResponse := handler.CommonResponseStatusBadRequest("method is required")
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	// HTTP 메소드 검증 및 대문자 변환
	method := strings.ToUpper(directCallRequest.Method)
	validMethods := map[string]bool{
		"GET":    true,
		"POST":   true,
		"PUT":    true,
		"DELETE": true,
		"PATCH":  true,
	}
	if !validMethods[method] {
		commonResponse := handler.CommonResponseStatusBadRequest("invalid method: " + directCallRequest.Method)
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	// Parameters가 없으면 빈 CommonRequest 생성
	commonRequest := directCallRequest.Parameters
	if commonRequest == nil {
		commonRequest = &handler.CommonRequest{}
	}

	// targetAuthToken 설정 (있으면 사용, 없으면 빈 문자열)
	targetAuthToken := ""
	if directCallRequest.TargetAuthToken != "" {
		// Bearer 접두사가 없으면 추가
		if !strings.HasPrefix(directCallRequest.TargetAuthToken, "Bearer ") {
			targetAuthToken = "Bearer " + directCallRequest.TargetAuthToken
		} else {
			targetAuthToken = directCallRequest.TargetAuthToken
		}
	}

	log.Printf("== DirectCall\t:\n== targetUrl\t:[ %s ]\n== endpoint\t:[ %s ]\n== method\t:[ %s ]\n== targetAuthToken\t:[ %s ]\n== commonRequest\t:\n%+v\n==\n",
		directCallRequest.TargetUrl, directCallRequest.Endpoint, method, targetAuthToken, commonRequest)

	// CommonCaller를 사용하여 대상 서비스 호출
	commonResponse, err := handler.CommonCaller(method, directCallRequest.TargetUrl, directCallRequest.Endpoint, commonRequest, targetAuthToken)
	if err != nil {
		log.Printf("DirectCallController error: %v", err)
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
}
