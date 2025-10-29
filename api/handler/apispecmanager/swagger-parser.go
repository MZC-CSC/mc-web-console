package apispecmanager

import (
	"crypto/tls"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"gopkg.in/yaml.v2"
)

// FetchSwagger downloads swagger content from the given URL
// This function is similar to the logic in getapiyaml.sh
func FetchSwagger(swaggerUrl string) ([]byte, error) {
	log.Printf("[Swagger] Fetching swagger from: %s", swaggerUrl)

	// Create HTTP client with timeout and TLS skip (if needed)
	client := &http.Client{
		Timeout: 30 * time.Second,
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}

	resp, err := client.Get(swaggerUrl)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch swagger: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to fetch swagger: status code %d", resp.StatusCode)
	}

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read swagger content: %w", err)
	}

	log.Printf("[Swagger] Successfully fetched %d bytes", len(data))
	return data, nil
}

// ParseSwagger parses the swagger YAML content
func ParseSwagger(yamlContent []byte) (*SwaggerSpec, error) {
	var spec SwaggerSpec
	err := yaml.Unmarshal(yamlContent, &spec)
	if err != nil {
		return nil, fmt.Errorf("failed to parse swagger: %w", err)
	}

	log.Printf("[Swagger] Parsed swagger: %s v%s", spec.Info.Title, spec.Info.Version)
	log.Printf("[Swagger] Found %d paths", len(spec.Paths))

	return &spec, nil
}

// ExtractOperations extracts operations from swagger spec and returns them in api.yaml format
func ExtractOperations(swaggerSpec *SwaggerSpec) map[string]ApiOperationSpec {
	operations := make(map[string]ApiOperationSpec)

	for path, methods := range swaggerSpec.Paths {
		for method, operation := range methods {
			if operation.OperationId == "" {
				continue
			}

			description := operation.Description
			if description == "" {
				description = operation.Summary
			}

			operations[operation.OperationId] = ApiOperationSpec{
				Method:       method,
				ResourcePath: path,
				Description:  description,
			}
		}
	}

	log.Printf("[Swagger] Extracted %d operations", len(operations))
	return operations
}

// SyncFrameworkVersion synchronizes a specific framework version
// It fetches the swagger, parses it, and updates apiServerInfo.yaml and apiOperationInfo.yaml
func SyncFrameworkVersion(framework *Framework, frameworkVersion *FrameworkVersion) error {
	log.Printf("[Sync] Syncing %s v%s", framework.Name, frameworkVersion.Version)

	// Fetch swagger
	swaggerData, err := FetchSwagger(frameworkVersion.SwaggerUrl)
	if err != nil {
		return fmt.Errorf("failed to fetch swagger for %s v%s: %w", framework.Name, frameworkVersion.Version, err)
	}

	// Parse swagger
	swaggerSpec, err := ParseSwagger(swaggerData)
	if err != nil {
		return fmt.Errorf("failed to parse swagger for %s v%s: %w", framework.Name, frameworkVersion.Version, err)
	}

	// Update apiServerInfo.yaml
	err = updateApiServerInfo(framework.Name, frameworkVersion)
	if err != nil {
		return fmt.Errorf("failed to update apiServerInfo for %s v%s: %w", framework.Name, frameworkVersion.Version, err)
	}

	// Update apiOperationInfo.yaml
	err = updateApiOperationInfo(framework.Name, frameworkVersion.Version, swaggerSpec)
	if err != nil {
		return fmt.Errorf("failed to update apiOperationInfo for %s v%s: %w", framework.Name, frameworkVersion.Version, err)
	}

	log.Printf("[Sync] Successfully synced %s v%s", framework.Name, frameworkVersion.Version)
	return nil
}

// SyncAllFrameworks synchronizes all frameworks with their active versions
func SyncAllFrameworks() error {
	log.Println("[Sync] Starting full synchronization...")

	config, err := LoadFrameworks()
	if err != nil {
		return fmt.Errorf("failed to load frameworks: %w", err)
	}

	errorCount := 0
	successCount := 0

	for _, fw := range config.Frameworks {
		for _, ver := range fw.Versions {
			if ver.Enabled {
				err := SyncFrameworkVersion(&fw, &ver)
				if err != nil {
					log.Printf("[Sync] ERROR: %v", err)
					errorCount++
				} else {
					successCount++
				}
			}
		}
	}

	log.Printf("[Sync] Completed: %d succeeded, %d failed", successCount, errorCount)

	if errorCount > 0 {
		return fmt.Errorf("synchronization completed with %d errors", errorCount)
	}

	return nil
}

// updateApiServerInfo updates the apiServerInfo.yaml file with framework version info
func updateApiServerInfo(frameworkName string, frameworkVersion *FrameworkVersion) error {
	// Load existing data
	serverInfo, err := LoadApiServerInfo()
	if err != nil {
		// If file doesn't exist, create new map
		serverInfo = make(map[string]interface{})
	}

	// Get or create services map
	var services map[string]interface{}
	if s, ok := serverInfo["services"].(map[interface{}]interface{}); ok {
		services = make(map[string]interface{})
		for k, v := range s {
			services[fmt.Sprintf("%v", k)] = v
		}
	} else if s, ok := serverInfo["services"].(map[string]interface{}); ok {
		services = s
	} else {
		services = make(map[string]interface{})
	}

	// Create service key
	serviceKey := MakeServiceKey(frameworkName, frameworkVersion.Version)

	// Create server info
	info := ApiServerInfo{
		Version: frameworkVersion.Version,
		BaseUrl: frameworkVersion.BaseUrl,
	}

	if frameworkVersion.AuthType != "" && frameworkVersion.AuthType != "none" {
		info.Auth = ApiAuthInfo{
			Type:     frameworkVersion.AuthType,
			Username: frameworkVersion.Username,
			Password: frameworkVersion.Password,
		}
	}

	// Convert to map for yaml
	infoMap := map[string]interface{}{
		"version": info.Version,
		"baseurl": info.BaseUrl,
	}

	if info.Auth.Type != "" {
		authMap := map[string]interface{}{
			"type": info.Auth.Type,
		}
		if info.Auth.Username != "" {
			authMap["username"] = info.Auth.Username
		}
		if info.Auth.Password != "" {
			authMap["password"] = info.Auth.Password
		}
		infoMap["auth"] = authMap
	}

	services[serviceKey] = infoMap

	// Update server info
	serverInfo["services"] = services

	return SaveApiServerInfo(serverInfo)
}

// updateApiOperationInfo updates the apiOperationInfo.yaml file with operations
func updateApiOperationInfo(frameworkName, versionNumber string, swaggerSpec *SwaggerSpec) error {
	// Load existing data
	operationInfo, err := LoadApiOperationInfo()
	if err != nil {
		// If file doesn't exist, create new map
		operationInfo = make(map[string]interface{})
	}

	// Get or create serviceActions map
	var serviceActions map[string]interface{}
	if sa, ok := operationInfo["serviceActions"].(map[interface{}]interface{}); ok {
		serviceActions = make(map[string]interface{})
		for k, v := range sa {
			serviceActions[fmt.Sprintf("%v", k)] = v
		}
	} else if sa, ok := operationInfo["serviceActions"].(map[string]interface{}); ok {
		serviceActions = sa
	} else {
		serviceActions = make(map[string]interface{})
	}

	// Create service key
	serviceKey := MakeServiceKey(frameworkName, versionNumber)

	// Extract operations
	operations := ExtractOperations(swaggerSpec)

	// Convert operations to map
	operationsMap := make(map[string]interface{})
	for opId, spec := range operations {
		operationsMap[opId] = map[string]interface{}{
			"method":       spec.Method,
			"resourcePath": spec.ResourcePath,
			"description":  spec.Description,
		}
	}

	serviceActions[serviceKey] = operationsMap

	// Update operation info
	operationInfo["serviceActions"] = serviceActions

	return SaveApiOperationInfo(operationInfo)
}

// GenerateApiServerInfo generates apiServerInfo.yaml from frameworks configuration
func GenerateApiServerInfo(frameworksConfig *FrameworksConfig) error {
	log.Println("[Generate] Generating apiServerInfo.yaml...")

	serverInfo := map[string]interface{}{
		"services": make(map[string]interface{}),
	}

	services := serverInfo["services"].(map[string]interface{})

	for _, fw := range frameworksConfig.Frameworks {
		for _, ver := range fw.Versions {
			if !ver.Enabled {
				continue
			}

			serviceKey := MakeServiceKey(fw.Name, ver.Version)

			info := map[string]interface{}{
				"version": ver.Version,
				"baseurl": ver.BaseUrl,
			}

			if ver.AuthType != "" && ver.AuthType != "none" {
				authMap := map[string]interface{}{
					"type": ver.AuthType,
				}
				if ver.Username != "" {
					authMap["username"] = ver.Username
				}
				if ver.Password != "" {
					authMap["password"] = ver.Password
				}
				info["auth"] = authMap
			}

			services[serviceKey] = info
		}
	}

	err := SaveApiServerInfo(serverInfo)
	if err != nil {
		return err
	}

	log.Println("[Generate] apiServerInfo.yaml generated successfully")
	return nil
}

// GenerateApiOperationInfo generates apiOperationInfo.yaml for a specific framework version
func GenerateApiOperationInfo(framework *Framework, frameworkVersion *FrameworkVersion) error {
	log.Printf("[Generate] Generating apiOperationInfo for %s v%s", framework.Name, frameworkVersion.Version)

	// Fetch and parse swagger
	swaggerData, err := FetchSwagger(frameworkVersion.SwaggerUrl)
	if err != nil {
		return fmt.Errorf("failed to fetch swagger: %w", err)
	}

	swaggerSpec, err := ParseSwagger(swaggerData)
	if err != nil {
		return fmt.Errorf("failed to parse swagger: %w", err)
	}

	// Update operation info
	return updateApiOperationInfo(framework.Name, frameworkVersion.Version, swaggerSpec)
}
