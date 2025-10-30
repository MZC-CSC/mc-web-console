package handler

import (
	"bytes"
	"crypto/tls"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"mc_web_console_api/handler/apispecmanager"
	"mime/multipart"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"

	"github.com/gobuffalo/buffalo"
)

// ////////////////////////////////////////////////////////////////
type CommonRequest struct {
	PathParams  map[string]string `json:"pathParams"`
	QueryParams map[string]string `json:"queryParams"`
	Request     interface{}       `json:"request"`
}

// 모든 응답을 CommonResponse로 한다.
type CommonResponse struct {
	ResponseData interface{} `json:"responseData"`
	Status       WebStatus   `json:"status"`
}

type WebStatus struct {
	StatusCode int    `json:"code"`
	Message    string `json:"message"`
}

// ////////////////////////////////////////////////////////////////

type Auth struct {
	Type     string `mapstructure:"type"`
	Username string `mapstructure:"username"`
	Password string `mapstructure:"password"`
}

type Service struct {
	BaseURL string `mapstructure:"baseurl"`
	Auth    Auth   `mapstructure:"auth"`
}

type ServiceNoAuth struct {
	BaseURL string `mapstructure:"baseurl"`
}

type Spec struct {
	Method       string `mapstructure:"method"`
	ResourcePath string `mapstructure:"resourcePath"`
	Description  string `mapstructure:"description"`
}

type ApiYaml struct {
	CLISpecVersion string                     `mapstructure:"cliSpecVersion"`
	Services       map[string]Service         `mapstructure:"services"`
	ServiceActions map[string]map[string]Spec `mapstructure:"serviceActions"`
}

// ////////////////////////////////////////////////////////////////

var (
	ApiYamlSet ApiYaml
)

func init() {
	log.Println("[http-util] Starting initialization...")

	// Load from apiServerInfo.yaml and apiOperationInfo.yaml
	serverInfo, err := apispecmanager.LoadApiServerInfo()
	if err != nil {
		log.Printf("[http-util] ERROR: Failed to load apiServerInfo.yaml: %v", err)
		log.Printf("[http-util] Falling back to legacy api.yaml")
		loadFromLegacyApiYaml()
		return
	}
	log.Println("[http-util] Successfully loaded apiServerInfo.yaml")

	operationInfo, err := apispecmanager.LoadApiOperationInfo()
	if err != nil {
		log.Printf("[http-util] ERROR: Failed to load apiOperationInfo.yaml: %v", err)
		log.Printf("[http-util] Falling back to legacy api.yaml")
		loadFromLegacyApiYaml()
		return
	}
	log.Println("[http-util] Successfully loaded apiOperationInfo.yaml")

	// Convert to ApiYamlSet structure
	ApiYamlSet.Services = make(map[string]Service)
	ApiYamlSet.ServiceActions = make(map[string]map[string]Spec)

	// Parse services - handle both map types
	var services map[string]interface{}
	if svc, ok := serverInfo["services"].(map[string]interface{}); ok {
		services = svc
	} else if svc, ok := serverInfo["services"].(map[interface{}]interface{}); ok {
		services = convertMap(svc)
	} else {
		log.Printf("[http-util] ERROR: services is not a map, type: %T", serverInfo["services"])
	}

	if services != nil {
		log.Printf("[http-util] Parsing %d services", len(services))
		for serviceKey, serviceData := range services {
			svcMap := convertMap(serviceData)
			if len(svcMap) > 0 {
				service := Service{
					BaseURL: getStringValue(svcMap, "baseurl"),
				}

				if authData, ok := svcMap["auth"]; ok {
					authMap := convertMap(authData)
					service.Auth = Auth{
						Type:     getStringValue(authMap, "type"),
						Username: getStringValue(authMap, "username"),
						Password: getStringValue(authMap, "password"),
					}
				}

				ApiYamlSet.Services[serviceKey] = service
				log.Printf("[http-util] Parsed service: %s -> %s", serviceKey, service.BaseURL)
			}
		}
	}

	// Parse serviceActions - handle both map types
	var serviceActions map[string]interface{}
	if sa, ok := operationInfo["serviceActions"].(map[string]interface{}); ok {
		serviceActions = sa
	} else if sa, ok := operationInfo["serviceActions"].(map[interface{}]interface{}); ok {
		serviceActions = convertMap(sa)
	}

	if serviceActions != nil {
		log.Printf("[http-util] Parsing serviceActions, found %d service keys", len(serviceActions))
		for serviceKey, operations := range serviceActions {
			// Convert operations map
			opsMap := convertMap(operations)

			if len(opsMap) == 0 {
				// Skip if empty (e.g., empty {} or null)
				log.Printf("[http-util] Skipping serviceActions for %s (empty map)", serviceKey)
				ApiYamlSet.ServiceActions[serviceKey] = make(map[string]Spec)
				continue
			}

			ApiYamlSet.ServiceActions[serviceKey] = make(map[string]Spec)
			log.Printf("[http-util] Parsing operations for %s, found %d operations", serviceKey, len(opsMap))

			for opId, opData := range opsMap {
				opMap := convertMap(opData)

				if len(opMap) == 0 {
					log.Printf("[http-util] Skipping operation %s.%s (empty map)", serviceKey, opId)
					continue
				}

				spec := Spec{
					Method:       getStringValue(opMap, "method"),
					ResourcePath: getStringValue(opMap, "resourcePath"),
					Description:  getStringValue(opMap, "description"),
				}
				ApiYamlSet.ServiceActions[serviceKey][opId] = spec
				log.Printf("[http-util]   Added operation: %s -> %s %s", opId, spec.Method, spec.ResourcePath)
			}
		}
	}

	log.Println("[http-util] Loaded API configuration from apiServerInfo.yaml and apiOperationInfo.yaml")
	log.Printf("[http-util] Loaded %d services", len(ApiYamlSet.Services))
	log.Printf("[http-util] Loaded %d service actions", len(ApiYamlSet.ServiceActions))

	// Debug: Print loaded service keys
	// for serviceKey := range ApiYamlSet.Services {
	// 	log.Printf("[http-util]   Service: %s", serviceKey)
	// }
	// for serviceKey, ops := range ApiYamlSet.ServiceActions {
	// 	log.Printf("[http-util]   ServiceAction: %s (%d operations)", serviceKey, len(ops))
	// 	for opId := range ops {
	// 		log.Printf("[http-util]     - %s", opId)
	// 	}
	// }
}

func getStringValue(m map[string]interface{}, key string) string {
	if val, ok := m[key]; ok {
		if str, ok := val.(string); ok {
			return str
		}
	}
	return ""
}

// convertMap converts map[interface{}]interface{} to map[string]interface{}
func convertMap(input interface{}) map[string]interface{} {
	result := make(map[string]interface{})

	switch m := input.(type) {
	case map[string]interface{}:
		return m
	case map[interface{}]interface{}:
		for k, v := range m {
			key, ok := k.(string)
			if !ok {
				continue
			}

			// Recursively convert nested maps
			switch val := v.(type) {
			case map[interface{}]interface{}:
				result[key] = convertMap(val)
			case map[string]interface{}:
				result[key] = val
			default:
				result[key] = v
			}
		}
		return result
	}

	return result
}

func loadFromLegacyApiYaml() {
	// Fallback to legacy api.yaml loading (kept for backward compatibility)
	log.Println("[http-util] Loading from legacy api.yaml")
	// Keep existing viper-based loading code here if needed
}

// AnyCaller는 buffalo.Context, operationId, commonRequest, auth유무 를 받아 conf/api.yaml 정보를 바탕으로 commonCaller를 호출합니다.
// 모든 error 는 기본적으로 commonResponse 에 담아져 반환됩니다.
func AnyCaller(c buffalo.Context, operationId string, commonRequest *CommonRequest, auth bool) (*CommonResponse, error) {
	_, targetFrameworkInfo, targetApiSpec, err := GetApiSpec(strings.ToLower(operationId))
	if (err != nil || targetFrameworkInfo == Service{} || targetApiSpec == Spec{}) {
		commonResponse := CommonResponseStatusNotFound(operationId + "-" + err.Error())
		return commonResponse, err
	}

	var authString string
	if auth {
		authString, err = getAuth(c, targetFrameworkInfo)
		if err != nil {
			commonResponse := CommonResponseStatusBadRequest(err.Error())
			return commonResponse, err
		}
	} else {
		authString = ""
	}

	commonResponse, err := CommonCaller(strings.ToUpper(targetApiSpec.Method), targetFrameworkInfo.BaseURL, targetApiSpec.ResourcePath, commonRequest, authString)
	if err != nil {
		return commonResponse, err
	}
	return commonResponse, err
}

// SubsystemAnyCaller buffalo.Context, subsystemName, operationId, commonRequest, auth유무 를 받아 conf/api.yaml 정보를 바탕으로 commonCaller를 호출합니다.
// AnyCaller 와 동일한 방식으로 작동하며, subsystemName, operationId 로 호출할 서브시스템의 함수를 특정합니다.
// 모든 응답과 error 는 commonResponse 내 설정되어 반환됩니다.
func SubsystemAnyCaller(c buffalo.Context, subsystemName, operationId string, commonRequest *CommonRequest, auth bool) (*CommonResponse, error) {
	log.Printf("[SubsystemAnyCaller] subsystemName=%s, operationId=%s, auth=%v", subsystemName, operationId, auth)
	
	targetFrameworkInfo, targetApiSpec, err := getApiSpecBySubsystem(subsystemName, operationId)
	if (err != nil || targetFrameworkInfo == Service{} || targetApiSpec == Spec{}) {
		log.Printf("[SubsystemAnyCaller] ERROR: getApiSpecBySubsystem failed: %v", err)
		commonResponse := CommonResponseStatusNotFound(operationId + "-" + err.Error())
		return commonResponse, err
	}
	log.Printf("[SubsystemAnyCaller] Found spec - Method: %s, ResourcePath: %s, BaseURL: %s", 
		targetApiSpec.Method, targetApiSpec.ResourcePath, targetFrameworkInfo.BaseURL)

	var authString string
	if auth {
		log.Printf("[SubsystemAnyCaller] Attempting to get auth token...")
		authString, err = getAuth(c, targetFrameworkInfo)
		if err != nil {
			log.Printf("[SubsystemAnyCaller] ERROR: getAuth failed: %v", err)
			commonResponse := CommonResponseStatusBadRequest(err.Error())
			return commonResponse, err
		}
		log.Printf("[SubsystemAnyCaller] Auth token obtained successfully")
	} else {
		authString = ""
		log.Printf("[SubsystemAnyCaller] No auth required")
	}

	log.Printf("[SubsystemAnyCaller] Calling CommonCaller...")
	commonResponse, err := CommonCaller(strings.ToUpper(targetApiSpec.Method), targetFrameworkInfo.BaseURL, targetApiSpec.ResourcePath, commonRequest, authString)
	if err != nil {
		log.Printf("[SubsystemAnyCaller] ERROR: CommonCaller failed: %v", err)
		return commonResponse, err
	}
	log.Printf("[SubsystemAnyCaller] CommonCaller succeeded, status: %d", commonResponse.Status.StatusCode)
	return commonResponse, err
}

// getApiSpec은 OpertinoId를 받아 conf/api.yaml에 정의된 Service, Spec 을 반환합니다.
// 없을경우 not found error를 반환합니다.
func GetApiSpec(requestOpertinoId string) (string, Service, Spec, error) {
	log.Printf("[GetApiSpec] Looking for operationId: %s", requestOpertinoId)
	requestOpertinoIdLower := strings.ToLower(requestOpertinoId)

	for framework, api := range ApiYamlSet.ServiceActions {
		for opertinoId, spec := range api {
			if strings.ToLower(opertinoId) == requestOpertinoIdLower {
				log.Printf("[GetApiSpec] Found: framework=%s, operationId=%s", framework, opertinoId)
				service, ok := ApiYamlSet.Services[framework]
				if !ok {
					log.Printf("[GetApiSpec] WARNING: Service not found for framework: %s", framework)
					return "", Service{}, Spec{}, fmt.Errorf("service not found for framework: %s", framework)
				}
				return framework, service, spec, nil
			}
		}
	}
	log.Printf("[GetApiSpec] Not found! Available operations:")
	for framework, api := range ApiYamlSet.ServiceActions {
		for opId := range api {
			log.Printf("[GetApiSpec]   %s -> %s", framework, opId)
		}
	}
	return "", Service{}, Spec{}, fmt.Errorf("getApiSpec not found")
}

// getApiSpecBySubsystem 은 subsystemName, OpertinoId 를 받아 conf/api.yaml에 정의된 Service, Spec 을 반환합니다.
// 없을경우 not found error를 반환합니다.
func getApiSpecBySubsystem(subsystemName, requestOpertinoId string) (Service, Spec, error) {
	log.Printf("[getApiSpecBySubsystem] Looking for subsystem: %s, operationId: %s", subsystemName, requestOpertinoId)
	subsystemNameLower := strings.ToLower(subsystemName)
	requestOpertinoIdLower := strings.ToLower(requestOpertinoId)

	// Search for service key that starts with subsystemName (may include version)
	for serviceKey, apis := range ApiYamlSet.ServiceActions {
		serviceKeyLower := strings.ToLower(serviceKey)

		// Match subsystemName (with or without version)
		// e.g., "mc-iam-manager" should match "mc-iam-manager_0.4.0"
		if serviceKeyLower == subsystemNameLower || strings.HasPrefix(serviceKeyLower, subsystemNameLower+"_") {
			log.Printf("[getApiSpecBySubsystem] Found matching service: %s", serviceKey)

			for opertinoId, spec := range apis {
				if strings.ToLower(opertinoId) == requestOpertinoIdLower {
					log.Printf("[getApiSpecBySubsystem] Found operation: %s", opertinoId)
					service, ok := ApiYamlSet.Services[serviceKey]
					if !ok {
						log.Printf("[getApiSpecBySubsystem] WARNING: Service not found for key: %s", serviceKey)
						return Service{}, Spec{}, fmt.Errorf("service not found for key: %s", serviceKey)
					}
					return service, spec, nil
				}
			}

			// If we found the matching service but not the operation, log available operations
			log.Printf("[getApiSpecBySubsystem] Operation not found in %s. Available operations:", serviceKey)
			for opId := range apis {
				log.Printf("[getApiSpecBySubsystem]   - %s", opId)
			}
		}
	}

	log.Printf("[getApiSpecBySubsystem] Subsystem not found: %s", subsystemName)
	return Service{}, Spec{}, fmt.Errorf("getApiSpec not found")
}

// getAuth는 컨텍스트 및 대상 서비스 정보를 받아, 옳바른 Authorization 값을 반환합니다.
// 오류의 경우 각 경우, 해당하는 오류가 반환됩니다.
// Auth 방식이 없을경우, 아무것도 반환되지 않습니다.
func getAuth(c buffalo.Context, service Service) (string, error) {
	switch service.Auth.Type {
	case "basic":
		if apiUserInfo := service.Auth.Username + ":" + service.Auth.Password; service.Auth.Username != "" && service.Auth.Password != "" {
			encA := base64.StdEncoding.EncodeToString([]byte(apiUserInfo))
			return "Basic " + encA, nil
		} else {
			return "", fmt.Errorf("username or password is empty")
		}
	case "bearer":
		authValue, ok := c.Value("Authorization").(string)
		if !ok || authValue == "" {
			return "", fmt.Errorf("authorization key does not exist or is empty")
		}
		// Check if the token already has Bearer prefix
		if !strings.HasPrefix(authValue, "Bearer ") {
			authValue = "Bearer " + authValue
		}
		return authValue, nil
	default:
		return "", nil
	}
}

func GetApiHosts() (map[string]ServiceNoAuth, error) {
	servicesNoAuth := make(map[string]ServiceNoAuth)
	for key, service := range ApiYamlSet.Services {
		servicesNoAuth[key] = ServiceNoAuth{
			BaseURL: service.BaseURL,
		}
	}
	return servicesNoAuth, nil
}

////////////////////////////////////////////////////////////////

func CommonCaller(callMethod string, targetFwUrl string, endPoint string, commonRequest *CommonRequest, auth string) (*CommonResponse, error) {
	pathParamsUrl := mappingUrlPathParams(endPoint, commonRequest)
	log.Printf("[CommonCaller] After PathParams mapping: %s", pathParamsUrl)
	queryParamsUrl := mappingQueryParams(pathParamsUrl, commonRequest)
	log.Printf("[CommonCaller] After QueryParams mapping: %s", queryParamsUrl)
	requestUrl := targetFwUrl + queryParamsUrl
	log.Printf("[CommonCaller] Final request URL: %s", requestUrl)
	log.Printf("[CommonCaller] Method: %s", callMethod)
	log.Printf("[CommonCaller] Request body: %+v", commonRequest.Request)
	commonResponse, err := CommonHttpToCommonResponse(requestUrl, commonRequest.Request, callMethod, auth)
	return commonResponse, err
}

func CommonCallerWithoutToken(callMethod string, targetFwUrl string, endPoint string, commonRequest *CommonRequest) (*CommonResponse, error) {
	pathParamsUrl := mappingUrlPathParams(endPoint, commonRequest)
	queryParamsUrl := mappingQueryParams(pathParamsUrl, commonRequest)
	requestUrl := targetFwUrl + queryParamsUrl
	commonResponse, err := CommonHttpToCommonResponse(requestUrl, commonRequest.Request, callMethod, "")
	return commonResponse, err
}

////////////////////////////////////////////////////////////////

func mappingUrlPathParams(endPoint string, commonRequest *CommonRequest) string {
	u := endPoint
	for k, r := range commonRequest.PathParams {
		u = strings.Replace(u, "{"+k+"}", r, -1)
	}
	return u
}

func mappingQueryParams(targeturl string, commonRequest *CommonRequest) string {
	u, err := url.Parse(targeturl)
	if err != nil {
		return ""
	}
	q := u.Query()
	for k, v := range commonRequest.QueryParams {
		q.Set(string(k), v)
	}
	u.RawQuery = q.Encode()
	return u.String()
}

func CommonHttpToCommonResponse(url string, s interface{}, httpMethod string, auth string) (*CommonResponse, error) {
	log.Println("CommonHttp - METHOD:" + httpMethod + " => url:" + url)
	log.Println("isauth:", auth)

	// FormData 요청인지 확인 (file 필드가 있는지 체크)
	log.Println("Checking for file field in request data...")
	if hasFileField(s) {
		log.Println("File field detected, calling handleFileTransferRequest")
		return handleFileTransferRequest(url, s, httpMethod, auth)
	} else {
		log.Println("No file field detected, proceeding with normal JSON processing")
	}

	jsonData, err := json.Marshal(s)
	if err != nil {
		log.Println("commonPostERR : json.Marshal : ", err.Error())
		return nil, err
	}

	req, err := http.NewRequest(httpMethod, url, bytes.NewBuffer(jsonData))
	if err != nil {
		log.Println("Error CommonHttp creating request:", err)
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	if auth != "" {
		req.Header.Add("Authorization", auth)
	}

	requestDump, err := httputil.DumpRequest(req, true)
	if err != nil {
		log.Println("Error CommonHttp creating httputil.DumpRequest:", err)
	}
	log.Println("\n", string(requestDump))

	// TODO : TLSClientConfig InsecureSkipVerify 해제 v0.2.0 이후 작업예정
	customTransport := &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	}
	client := &http.Client{Transport: customTransport}
	resp, err := client.Do(req)
	if err != nil {
		log.Println("Error CommonHttp request:", err)
		return CommonResponseStatusInternalServerError(err), err
	}
	defer resp.Body.Close()

	respBody, ioerr := io.ReadAll(resp.Body)
	if ioerr != nil {
		log.Println("Error CommonHttp reading response:", ioerr)
	}

	commonResponse := &CommonResponse{}
	commonResponse.Status.Message = resp.Status
	commonResponse.Status.StatusCode = resp.StatusCode

	jsonerr := json.Unmarshal(respBody, &commonResponse.ResponseData)
	if jsonerr != nil {
		commonResponse.ResponseData = strings.TrimSpace(string(respBody))
		return commonResponse, nil
	}

	return commonResponse, nil
}

func isJSONResponse(body []byte) bool {
	var js map[string]interface{}
	return json.Unmarshal(body, &js) == nil
}

////////////////////////////////////////////////////////////////

func CommonResponseStatusOK(responseData interface{}) *CommonResponse {
	webStatus := WebStatus{
		StatusCode: http.StatusOK,
		Message:    http.StatusText(http.StatusOK),
	}
	return &CommonResponse{
		ResponseData: responseData,
		Status:       webStatus,
	}
}

func CommonResponseStatusNoContent(responseData interface{}) *CommonResponse {
	webStatus := WebStatus{
		StatusCode: http.StatusNoContent,
		Message:    http.StatusText(http.StatusNoContent),
	}
	return &CommonResponse{
		ResponseData: responseData,
		Status:       webStatus,
	}
}

func CommonResponseStatusNotFound(responseData interface{}) *CommonResponse {
	webStatus := WebStatus{
		StatusCode: http.StatusNotFound,
		Message:    http.StatusText(http.StatusNotFound),
	}
	return &CommonResponse{
		ResponseData: responseData,
		Status:       webStatus,
	}
}

func CommonResponseStatusStatusUnauthorized(responseData interface{}) *CommonResponse {
	webStatus := WebStatus{
		StatusCode: http.StatusUnauthorized,
		Message:    http.StatusText(http.StatusUnauthorized),
	}
	return &CommonResponse{
		ResponseData: responseData,
		Status:       webStatus,
	}
}

func CommonResponseStatusBadRequest(responseData interface{}) *CommonResponse {
	webStatus := WebStatus{
		StatusCode: http.StatusBadRequest,
		Message:    http.StatusText(http.StatusBadRequest),
	}
	return &CommonResponse{
		ResponseData: responseData,
		Status:       webStatus,
	}
}

func CommonResponseStatusInternalServerError(responseData interface{}) *CommonResponse {
	webStatus := WebStatus{
		StatusCode: http.StatusInternalServerError,
		Message:    http.StatusText(http.StatusInternalServerError),
	}
	return &CommonResponse{
		ResponseData: responseData,
		Status:       webStatus,
	}
}

// handleFileTransferRequest는 파일 전송 요청을 처리합니다
func handleFileTransferRequest(url string, s interface{}, httpMethod string, auth string) (*CommonResponse, error) {
	log.Println("handleFileTransferRequest - Processing file transfer request")

	// JSON 데이터를 파싱
	jsonData, err := json.Marshal(s)
	if err != nil {
		log.Println("Error marshaling request data:", err)
		return nil, err
	}

	var requestData map[string]interface{}
	err = json.Unmarshal(jsonData, &requestData)
	if err != nil {
		log.Println("Error unmarshaling request data:", err)
		return nil, err
	}

	// FormData 생성
	var buf bytes.Buffer
	writer := multipart.NewWriter(&buf)

	// path 필드 추가 (최상위 또는 request 내부에서 찾기)
	var path string
	if p, ok := requestData["path"].(string); ok {
		path = p
	} else if request, ok := requestData["request"].(map[string]interface{}); ok {
		if p, ok := request["path"].(string); ok {
			path = p
		}
	}
	if path != "" {
		writer.WriteField("path", path)
	}

	// file 필드 추가 (최상위 또는 request 내부에서 찾기)
	var fileData map[string]interface{}
	if file, ok := requestData["file"].(map[string]interface{}); ok {
		fileData = file
	} else if request, ok := requestData["request"].(map[string]interface{}); ok {
		if file, ok := request["file"].(map[string]interface{}); ok {
			fileData = file
		}
	}

	if fileData != nil {
		if fileName, ok := fileData["name"].(string); ok {
			if fileBase64, ok := fileData["data"].(string); ok {
				// base64 데이터에서 실제 파일 데이터 추출
				commaIndex := strings.Index(fileBase64, ",")
				if commaIndex != -1 {
					fileBase64 = fileBase64[commaIndex+1:]
				}

				// base64 디코딩
				fileBytes, err := base64.StdEncoding.DecodeString(fileBase64)
				if err != nil {
					log.Println("Error decoding base64 file data:", err)
					return nil, err
				}

				// 파일 파트 생성
				part, err := writer.CreateFormFile("file", fileName)
				if err != nil {
					log.Println("Error creating form file:", err)
					return nil, err
				}

				// 파일 데이터 쓰기
				_, err = part.Write(fileBytes)
				if err != nil {
					log.Println("Error writing file data:", err)
					return nil, err
				}
			}
		}
	}

	writer.Close()

	// HTTP 요청 생성
	req, err := http.NewRequest(httpMethod, url, &buf)
	if err != nil {
		log.Println("Error creating request:", err)
		return nil, err
	}

	// Content-Type 헤더 설정
	req.Header.Set("Content-Type", writer.FormDataContentType())
	if auth != "" {
		req.Header.Add("Authorization", auth)
	}

	// HTTP 클라이언트로 요청
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Println("Error making request:", err)
		return nil, err
	}
	defer resp.Body.Close()

	// 응답 읽기
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Println("Error reading response:", err)
		return nil, err
	}

	// 응답 파싱
	var responseData interface{}
	err = json.Unmarshal(respBody, &responseData)
	if err != nil {
		// JSON이 아닌 경우 문자열로 처리
		responseData = string(respBody)
	}

	// CommonResponse 생성
	webStatus := WebStatus{
		StatusCode: resp.StatusCode,
		Message:    resp.Status,
	}

	return &CommonResponse{
		ResponseData: responseData,
		Status:       webStatus,
	}, nil
}

// hasFileField는 요청 데이터에 file 필드가 있는지 확인합니다
func hasFileField(s interface{}) bool {

	// JSON 데이터를 파싱
	jsonData, err := json.Marshal(s)
	if err != nil {
		log.Println("Error marshaling data for file field check:", err)
		return false
	}

	var requestData map[string]interface{}
	err = json.Unmarshal(jsonData, &requestData)
	if err != nil {
		log.Println("Error unmarshaling data for file field check:", err)
		return false
	}

	// file 필드가 최상위에 있는지 확인
	if requestData["file"] != nil {
		return true
	}

	// request 필드가 있는지 확인 (기존 구조 지원)
	if requestData["request"] != nil {
		if request, ok := requestData["request"].(map[string]interface{}); ok {
			// file 필드가 있는지 확인
			if request["file"] != nil {
				return true
			} else {
				log.Println("No 'file' field in request data")
			}
		} else {
			log.Println("hasFileField: 'request' field is not a map")
		}
	} else {
		log.Println("No 'request' field found")
	}

	log.Println("hasFileField: No file field detected, returning false")
	return false
}
