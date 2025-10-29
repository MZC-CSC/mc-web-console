package actions

import (
	"fmt"
	"log"
	"mc_web_console_api/handler"
	"mc_web_console_api/handler/apispecmanager"

	"github.com/gobuffalo/buffalo"
	"gopkg.in/yaml.v2"
)

// ListFrameworks returns all frameworks from memory cache
func ListFrameworks(c buffalo.Context) error {
	log.Println("#### ListFrameworks")

	config := apispecmanager.GetCachedFrameworks()
	if config == nil {
		commonResponse := handler.CommonResponseStatusInternalServerError("frameworks configuration not initialized")
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	commonResponse := handler.CommonResponseStatusOK(config.Frameworks)
	return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
}

// GetFramework returns a specific framework by name
func GetFramework(c buffalo.Context) error {
	log.Println("#### GetFramework")

	frameworkName := c.Param("frameworkName")
	if frameworkName == "" {
		commonResponse := handler.CommonResponseStatusBadRequest("frameworkName parameter is required")
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	framework, err := apispecmanager.GetCachedFramework(frameworkName)
	if err != nil {
		commonResponse := handler.CommonResponseStatusNotFound(err.Error())
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	commonResponse := handler.CommonResponseStatusOK(framework)
	return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
}

// CreateFramework creates a new framework
func CreateFramework(c buffalo.Context) error {
	log.Println("#### CreateFramework")

	var framework apispecmanager.Framework
	if err := c.Bind(&framework); err != nil {
		commonResponse := handler.CommonResponseStatusBadRequest(fmt.Sprintf("invalid request body: %v", err))
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	// Validate required fields
	if framework.Name == "" || framework.DisplayName == "" || framework.ActiveVersion == "" {
		commonResponse := handler.CommonResponseStatusBadRequest("name, displayName, and activeVersion are required")
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	if len(framework.Versions) == 0 {
		commonResponse := handler.CommonResponseStatusBadRequest("at least one version is required")
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	err := apispecmanager.AddFramework(&framework)
	if err != nil {
		commonResponse := handler.CommonResponseStatusBadRequest(err.Error())
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	// Refresh cache after adding framework
	if err := apispecmanager.RefreshCache(); err != nil {
		log.Printf("WARNING: Failed to refresh cache: %v", err)
	}

	commonResponse := handler.CommonResponseStatusOK(map[string]string{"message": "Framework created successfully"})
	return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
}

// UpdateFramework updates an existing framework
func UpdateFramework(c buffalo.Context) error {
	log.Println("#### UpdateFramework")

	frameworkName := c.Param("frameworkName")
	if frameworkName == "" {
		commonResponse := handler.CommonResponseStatusBadRequest("frameworkName parameter is required")
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	var framework apispecmanager.Framework
	if err := c.Bind(&framework); err != nil {
		commonResponse := handler.CommonResponseStatusBadRequest(fmt.Sprintf("invalid request body: %v", err))
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	err := apispecmanager.UpdateFramework(frameworkName, &framework)
	if err != nil {
		commonResponse := handler.CommonResponseStatusBadRequest(err.Error())
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	// Refresh cache after updating framework
	if err := apispecmanager.RefreshCache(); err != nil {
		log.Printf("WARNING: Failed to refresh cache: %v", err)
	}

	commonResponse := handler.CommonResponseStatusOK(map[string]string{"message": "Framework updated successfully"})
	return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
}

// DeleteFramework deletes a framework
func DeleteFramework(c buffalo.Context) error {
	log.Println("#### DeleteFramework")

	frameworkName := c.Param("frameworkName")
	if frameworkName == "" {
		commonResponse := handler.CommonResponseStatusBadRequest("frameworkName parameter is required")
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	err := apispecmanager.DeleteFramework(frameworkName)
	if err != nil {
		commonResponse := handler.CommonResponseStatusNotFound(err.Error())
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	// Refresh cache after deleting framework
	if err := apispecmanager.RefreshCache(); err != nil {
		log.Printf("WARNING: Failed to refresh cache: %v", err)
	}

	commonResponse := handler.CommonResponseStatusOK(map[string]string{"message": "Framework deleted successfully"})
	return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
}

// ListFrameworkVersions returns all versions of a specific framework
func ListFrameworkVersions(c buffalo.Context) error {
	log.Println("#### ListFrameworkVersions")

	frameworkName := c.Param("frameworkName")
	if frameworkName == "" {
		commonResponse := handler.CommonResponseStatusBadRequest("frameworkName parameter is required")
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	framework, err := apispecmanager.GetCachedFramework(frameworkName)
	if err != nil {
		commonResponse := handler.CommonResponseStatusNotFound(err.Error())
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	commonResponse := handler.CommonResponseStatusOK(framework.Versions)
	return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
}

// AddFrameworkVersion adds a new version to an existing framework
func AddFrameworkVersion(c buffalo.Context) error {
	log.Println("#### AddFrameworkVersion")

	frameworkName := c.Param("frameworkName")
	if frameworkName == "" {
		commonResponse := handler.CommonResponseStatusBadRequest("frameworkName parameter is required")
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	var frameworkVersion apispecmanager.FrameworkVersion
	if err := c.Bind(&frameworkVersion); err != nil {
		commonResponse := handler.CommonResponseStatusBadRequest(fmt.Sprintf("invalid request body: %v", err))
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	// Validate required fields
	if frameworkVersion.Version == "" || frameworkVersion.SwaggerUrl == "" || frameworkVersion.BaseUrl == "" {
		commonResponse := handler.CommonResponseStatusBadRequest("version, swaggerUrl, and baseUrl are required")
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	err := apispecmanager.AddFrameworkVersion(frameworkName, &frameworkVersion)
	if err != nil {
		commonResponse := handler.CommonResponseStatusBadRequest(err.Error())
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	// Refresh cache after adding version
	if err := apispecmanager.RefreshCache(); err != nil {
		log.Printf("WARNING: Failed to refresh cache: %v", err)
	}

	commonResponse := handler.CommonResponseStatusOK(map[string]string{"message": "Version added successfully"})
	return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
}

// UpdateFrameworkVersion updates an existing framework version
func UpdateFrameworkVersion(c buffalo.Context) error {
	log.Println("#### UpdateFrameworkVersion")

	frameworkName := c.Param("frameworkName")
	versionNumber := c.Param("versionNumber")

	if frameworkName == "" || versionNumber == "" {
		commonResponse := handler.CommonResponseStatusBadRequest("frameworkName and versionNumber parameters are required")
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	var frameworkVersion apispecmanager.FrameworkVersion
	if err := c.Bind(&frameworkVersion); err != nil {
		commonResponse := handler.CommonResponseStatusBadRequest(fmt.Sprintf("invalid request body: %v", err))
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	err := apispecmanager.UpdateFrameworkVersion(frameworkName, versionNumber, &frameworkVersion)
	if err != nil {
		commonResponse := handler.CommonResponseStatusBadRequest(err.Error())
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	// Refresh cache after updating version
	if err := apispecmanager.RefreshCache(); err != nil {
		log.Printf("WARNING: Failed to refresh cache: %v", err)
	}

	commonResponse := handler.CommonResponseStatusOK(map[string]string{"message": "Version updated successfully"})
	return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
}

// DeleteFrameworkVersion deletes a version from a framework
func DeleteFrameworkVersion(c buffalo.Context) error {
	log.Println("#### DeleteFrameworkVersion")

	frameworkName := c.Param("frameworkName")
	versionNumber := c.Param("versionNumber")

	if frameworkName == "" || versionNumber == "" {
		commonResponse := handler.CommonResponseStatusBadRequest("frameworkName and versionNumber parameters are required")
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	err := apispecmanager.DeleteFrameworkVersion(frameworkName, versionNumber)
	if err != nil {
		commonResponse := handler.CommonResponseStatusNotFound(err.Error())
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	// Refresh cache after deleting version
	if err := apispecmanager.RefreshCache(); err != nil {
		log.Printf("WARNING: Failed to refresh cache: %v", err)
	}

	commonResponse := handler.CommonResponseStatusOK(map[string]string{"message": "Version deleted successfully"})
	return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
}

// SetActiveVersion sets the active version for a framework
func SetActiveVersion(c buffalo.Context) error {
	log.Println("#### SetActiveVersion")

	frameworkName := c.Param("frameworkName")
	if frameworkName == "" {
		commonResponse := handler.CommonResponseStatusBadRequest("frameworkName parameter is required")
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	var req struct {
		Version string `json:"version"`
	}

	if err := c.Bind(&req); err != nil {
		commonResponse := handler.CommonResponseStatusBadRequest(fmt.Sprintf("invalid request body: %v", err))
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	if req.Version == "" {
		commonResponse := handler.CommonResponseStatusBadRequest("version is required")
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	// Update both file and memory cache
	err := apispecmanager.UpdateActiveVersion(frameworkName, req.Version)
	if err != nil {
		commonResponse := handler.CommonResponseStatusBadRequest(err.Error())
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	commonResponse := handler.CommonResponseStatusOK(map[string]string{
		"message":   "Active version updated successfully",
		"framework": frameworkName,
		"version":   req.Version,
	})
	return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
}

// SyncFrameworkVersion synchronizes a specific framework version with its swagger
func SyncFrameworkVersion(c buffalo.Context) error {
	log.Println("#### SyncFrameworkVersion")

	frameworkName := c.Param("frameworkName")
	versionNumber := c.Param("versionNumber")

	if frameworkName == "" || versionNumber == "" {
		commonResponse := handler.CommonResponseStatusBadRequest("frameworkName and versionNumber parameters are required")
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	framework, err := apispecmanager.GetCachedFramework(frameworkName)
	if err != nil {
		commonResponse := handler.CommonResponseStatusNotFound(err.Error())
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	frameworkVersion, err := apispecmanager.GetCachedFrameworkVersion(frameworkName, versionNumber)
	if err != nil {
		commonResponse := handler.CommonResponseStatusNotFound(err.Error())
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	err = apispecmanager.SyncFrameworkVersion(framework, frameworkVersion)
	if err != nil {
		commonResponse := handler.CommonResponseStatusInternalServerError(fmt.Sprintf("sync failed: %v", err))
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	commonResponse := handler.CommonResponseStatusOK(map[string]string{
		"message":   "Framework version synced successfully",
		"framework": frameworkName,
		"version":   versionNumber,
	})
	return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
}

// SyncAllFrameworks synchronizes all enabled framework versions
func SyncAllFrameworks(c buffalo.Context) error {
	log.Println("#### SyncAllFrameworks")

	err := apispecmanager.SyncAllFrameworks()
	if err != nil {
		commonResponse := handler.CommonResponseStatusInternalServerError(fmt.Sprintf("sync failed: %v", err))
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	commonResponse := handler.CommonResponseStatusOK(map[string]string{"message": "All frameworks synced successfully"})
	return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
}

// GetApiOperations returns API operations for a specific framework version
func GetApiOperations(c buffalo.Context) error {
	log.Println("#### GetApiOperations")

	frameworkName := c.Param("framework")
	versionNumber := c.Param("version")
	outputFormat := c.Param("format") // json or yaml

	if frameworkName == "" {
		commonResponse := handler.CommonResponseStatusBadRequest("framework parameter is required")
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	// If version not specified, use active version
	if versionNumber == "" {
		activeVer, err := apispecmanager.GetActiveVersion(frameworkName)
		if err != nil {
			commonResponse := handler.CommonResponseStatusNotFound(err.Error())
			return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
		}
		versionNumber = activeVer
	}

	// Load operation info
	operationInfo, err := apispecmanager.LoadApiOperationInfo()
	if err != nil {
		commonResponse := handler.CommonResponseStatusInternalServerError(fmt.Sprintf("failed to load operations: %v", err))
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	// Get serviceActions
	var serviceActions map[string]interface{}
	if sa, ok := operationInfo["serviceActions"].(map[interface{}]interface{}); ok {
		serviceActions = make(map[string]interface{})
		for k, v := range sa {
			serviceActions[fmt.Sprintf("%v", k)] = v
		}
	} else if sa, ok := operationInfo["serviceActions"].(map[string]interface{}); ok {
		serviceActions = sa
	} else {
		commonResponse := handler.CommonResponseStatusNotFound("no operations found")
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	// Get operations for the specific framework_version
	serviceKey := apispecmanager.MakeServiceKey(frameworkName, versionNumber)
	operations, ok := serviceActions[serviceKey]
	if !ok {
		commonResponse := handler.CommonResponseStatusNotFound(fmt.Sprintf("no operations found for %s", serviceKey))
		return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
	}

	// Return in requested format
	if outputFormat == "yaml" {
		yamlData, err := yaml.Marshal(operations)
		if err != nil {
			commonResponse := handler.CommonResponseStatusInternalServerError(fmt.Sprintf("failed to convert to yaml: %v", err))
			return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
		}
		return c.Render(200, r.String(string(yamlData)))
	}

	// Default: JSON format
	commonResponse := handler.CommonResponseStatusOK(operations)
	return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
}

// GetActiveVersions returns all framework names with their active versions
func GetActiveVersions(c buffalo.Context) error {
	log.Println("#### GetActiveVersions")

	activeVersions := apispecmanager.GetAllActiveVersions()
	commonResponse := handler.CommonResponseStatusOK(activeVersions)
	return c.Render(commonResponse.Status.StatusCode, r.JSON(commonResponse))
}
