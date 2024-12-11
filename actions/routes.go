package actions

import (
	"fmt"
	"log"
	"net/http"
	"regexp"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/m-cmp/mc-web-console/common"
	v "github.com/m-cmp/mc-web-console/variables"
)

func AnyController(c echo.Context) error {
	log.Println("#### AnyController")
	operationId := strings.ToLower(c.Param("operationId"))
	if operationId == "" {
		commonResponse := common.CommonResponseStatusNotFound("no operationId is provided")
		return c.JSON(commonResponse.Status.StatusCode, commonResponse)
	}

	commonRequest := &common.CommonRequest{}
	c.Bind(commonRequest)

	log.Printf("== operationId\t:[ %s ]\n== commonRequest\t:\n%+v\n==\n", operationId, commonRequest)
	commonResponse, _ := common.AnyCaller(c, operationId, commonRequest, true)

	return c.JSON(commonResponse.Status.StatusCode, commonResponse)
}

// SubsystemAnyController 는 중복되는 operationId 를 가지는 서브시스템을 호출하기 위해 사용 가능한 handler 입니다.
// subsystemName 과 operationId 를 path parameter 로 전달받아 사용합니다.
// 소문자로 변환한 각각의 값을 conf/api.yaml 에 정의된 subsystem 과 operationId 와 매칭하여 매칭된 api 를 호출합니다.
// AnyController 와 동일한 방식으로 작동합니다.
func SubsystemAnyController(c echo.Context) error {
	log.Println("#### SubsystemAnyController")
	subsystemName := strings.ToLower(c.Param("subsystemName"))
	operationId := strings.ToLower(c.Param("operationId"))

	if subsystemName == "" {
		commonResponse := common.CommonResponseStatusNotFound("no subsystemName is provided")
		return c.JSON(commonResponse.Status.StatusCode, commonResponse)
	}

	if operationId == "" {
		commonResponse := common.CommonResponseStatusNotFound("no operationId is provided")
		return c.JSON(commonResponse.Status.StatusCode, commonResponse)
	}

	commonRequest := &common.CommonRequest{}
	c.Bind(commonRequest)

	log.Printf("==subsystemName\t:[ %s ]\n== operationId\t:[ %s ]\n== commonRequest\t:\n%+v\n==\n", subsystemName, operationId, commonRequest)
	commonResponse, _ := common.SubsystemAnyCaller(c, subsystemName, operationId, commonRequest, true)

	return c.JSON(commonResponse.Status.StatusCode, commonResponse)
}

func GetApiHosts(c echo.Context) error {
	apiHosts, err := common.GetApiHosts()
	if err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"error": err.Error()})
	}
	commonResponse := common.CommonResponseStatusOK(apiHosts)

	re := regexp.MustCompile(`:(\d+.*)`)
	if v.IFRAME_TARGET_IS_HOST {
		for fw, host := range apiHosts {
			portUrlStr := re.FindString(host.BaseURL)
			if portUrlStr != "" {
				host.BaseURL = portUrlStr
				apiHosts[fw] = host
			}
		}
		fmt.Println(apiHosts)
		commonResponse = common.CommonResponseStatusOK(apiHosts)
	}

	return c.JSON(commonResponse.Status.StatusCode, commonResponse)
}
