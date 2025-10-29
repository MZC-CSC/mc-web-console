package apispecmanager

import (
	"fmt"
	"os"
	"strings"

	"gopkg.in/yaml.v2"
)

const (
	FrameworksYamlPath       = "../conf/frameworks.yaml"
	ApiServerInfoYamlPath    = "../conf/apiServerInfo.yaml"
	ApiOperationInfoYamlPath = "../conf/apiOperationInfo.yaml"
)

// LoadFrameworks reads and parses frameworks.yaml
func LoadFrameworks() (*FrameworksConfig, error) {
	data, err := os.ReadFile(FrameworksYamlPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read frameworks.yaml: %w", err)
	}

	var config FrameworksConfig
	err = yaml.Unmarshal(data, &config)
	if err != nil {
		return nil, fmt.Errorf("failed to parse frameworks.yaml: %w", err)
	}

	return &config, nil
}

// SaveFrameworks saves frameworks configuration to frameworks.yaml
func SaveFrameworks(frameworksConfig *FrameworksConfig) error {
	data, err := yaml.Marshal(frameworksConfig)
	if err != nil {
		return fmt.Errorf("failed to marshal frameworks config: %w", err)
	}

	err = os.WriteFile(FrameworksYamlPath, data, 0644)
	if err != nil {
		return fmt.Errorf("failed to write frameworks.yaml: %w", err)
	}

	return nil
}

// GetFramework returns a specific framework by name
func GetFramework(frameworkName string) (*Framework, error) {
	config, err := LoadFrameworks()
	if err != nil {
		return nil, err
	}

	for _, fw := range config.Frameworks {
		if fw.Name == frameworkName {
			return &fw, nil
		}
	}

	return nil, fmt.Errorf("framework not found: %s", frameworkName)
}

// GetFrameworkVersion returns a specific version of a framework
func GetFrameworkVersion(frameworkName, versionNumber string) (*FrameworkVersion, error) {
	fw, err := GetFramework(frameworkName)
	if err != nil {
		return nil, err
	}

	for _, ver := range fw.Versions {
		if ver.Version == versionNumber {
			return &ver, nil
		}
	}

	return nil, fmt.Errorf("version %s not found for framework %s", versionNumber, frameworkName)
}

// AddFramework adds a new framework to the configuration
func AddFramework(framework *Framework) error {
	config, err := LoadFrameworks()
	if err != nil {
		return err
	}

	// Check if framework already exists
	for _, fw := range config.Frameworks {
		if fw.Name == framework.Name {
			return fmt.Errorf("framework already exists: %s", framework.Name)
		}
	}

	config.Frameworks = append(config.Frameworks, *framework)
	return SaveFrameworks(config)
}

// UpdateFramework updates an existing framework
func UpdateFramework(frameworkName string, framework *Framework) error {
	config, err := LoadFrameworks()
	if err != nil {
		return err
	}

	found := false
	for i, fw := range config.Frameworks {
		if fw.Name == frameworkName {
			config.Frameworks[i] = *framework
			found = true
			break
		}
	}

	if !found {
		return fmt.Errorf("framework not found: %s", frameworkName)
	}

	return SaveFrameworks(config)
}

// DeleteFramework removes a framework from the configuration
func DeleteFramework(frameworkName string) error {
	config, err := LoadFrameworks()
	if err != nil {
		return err
	}

	found := false
	for i, fw := range config.Frameworks {
		if fw.Name == frameworkName {
			config.Frameworks = append(config.Frameworks[:i], config.Frameworks[i+1:]...)
			found = true
			break
		}
	}

	if !found {
		return fmt.Errorf("framework not found: %s", frameworkName)
	}

	return SaveFrameworks(config)
}

// AddFrameworkVersion adds a new version to an existing framework
func AddFrameworkVersion(frameworkName string, frameworkVersion *FrameworkVersion) error {
	config, err := LoadFrameworks()
	if err != nil {
		return err
	}

	found := false
	for i, fw := range config.Frameworks {
		if fw.Name == frameworkName {
			// Check if version already exists
			for _, ver := range fw.Versions {
				if ver.Version == frameworkVersion.Version {
					return fmt.Errorf("version %s already exists for framework %s", frameworkVersion.Version, frameworkName)
				}
			}
			config.Frameworks[i].Versions = append(config.Frameworks[i].Versions, *frameworkVersion)
			found = true
			break
		}
	}

	if !found {
		return fmt.Errorf("framework not found: %s", frameworkName)
	}

	return SaveFrameworks(config)
}

// UpdateFrameworkVersion updates an existing framework version
func UpdateFrameworkVersion(frameworkName, versionNumber string, frameworkVersion *FrameworkVersion) error {
	config, err := LoadFrameworks()
	if err != nil {
		return err
	}

	frameworkFound := false
	versionFound := false

	for i, fw := range config.Frameworks {
		if fw.Name == frameworkName {
			frameworkFound = true
			for j, ver := range fw.Versions {
				if ver.Version == versionNumber {
					config.Frameworks[i].Versions[j] = *frameworkVersion
					versionFound = true
					break
				}
			}
			break
		}
	}

	if !frameworkFound {
		return fmt.Errorf("framework not found: %s", frameworkName)
	}
	if !versionFound {
		return fmt.Errorf("version %s not found for framework %s", versionNumber, frameworkName)
	}

	return SaveFrameworks(config)
}

// DeleteFrameworkVersion removes a version from a framework
func DeleteFrameworkVersion(frameworkName, versionNumber string) error {
	config, err := LoadFrameworks()
	if err != nil {
		return err
	}

	frameworkFound := false
	versionFound := false

	for i, fw := range config.Frameworks {
		if fw.Name == frameworkName {
			frameworkFound = true
			for j, ver := range fw.Versions {
				if ver.Version == versionNumber {
					config.Frameworks[i].Versions = append(fw.Versions[:j], fw.Versions[j+1:]...)
					versionFound = true
					break
				}
			}
			break
		}
	}

	if !frameworkFound {
		return fmt.Errorf("framework not found: %s", frameworkName)
	}
	if !versionFound {
		return fmt.Errorf("version %s not found for framework %s", versionNumber, frameworkName)
	}

	return SaveFrameworks(config)
}

// SetActiveVersion sets the active version for a framework
func SetActiveVersion(frameworkName, versionNumber string) error {
	config, err := LoadFrameworks()
	if err != nil {
		return err
	}

	frameworkFound := false
	versionExists := false

	for i, fw := range config.Frameworks {
		if fw.Name == frameworkName {
			frameworkFound = true
			// Verify that the version exists
			for _, ver := range fw.Versions {
				if ver.Version == versionNumber {
					versionExists = true
					break
				}
			}
			if versionExists {
				config.Frameworks[i].ActiveVersion = versionNumber
			}
			break
		}
	}

	if !frameworkFound {
		return fmt.Errorf("framework not found: %s", frameworkName)
	}
	if !versionExists {
		return fmt.Errorf("version %s not found for framework %s", versionNumber, frameworkName)
	}

	return SaveFrameworks(config)
}

// LoadApiServerInfo reads and parses apiServerInfo.yaml
func LoadApiServerInfo() (map[string]interface{}, error) {
	data, err := os.ReadFile(ApiServerInfoYamlPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read apiServerInfo.yaml: %w", err)
	}

	var result map[string]interface{}
	err = yaml.Unmarshal(data, &result)
	if err != nil {
		return nil, fmt.Errorf("failed to parse apiServerInfo.yaml: %w", err)
	}

	return result, nil
}

// SaveApiServerInfo saves server info to apiServerInfo.yaml
func SaveApiServerInfo(serverInfoData map[string]interface{}) error {
	data, err := yaml.Marshal(serverInfoData)
	if err != nil {
		return fmt.Errorf("failed to marshal server info: %w", err)
	}

	err = os.WriteFile(ApiServerInfoYamlPath, data, 0644)
	if err != nil {
		return fmt.Errorf("failed to write apiServerInfo.yaml: %w", err)
	}

	return nil
}

// LoadApiOperationInfo reads and parses apiOperationInfo.yaml
func LoadApiOperationInfo() (map[string]interface{}, error) {
	data, err := os.ReadFile(ApiOperationInfoYamlPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read apiOperationInfo.yaml: %w", err)
	}

	var result map[string]interface{}
	err = yaml.Unmarshal(data, &result)
	if err != nil {
		return nil, fmt.Errorf("failed to parse apiOperationInfo.yaml: %w", err)
	}

	return result, nil
}

// SaveApiOperationInfo saves operation info to apiOperationInfo.yaml
func SaveApiOperationInfo(operationInfoData map[string]interface{}) error {
	data, err := yaml.Marshal(operationInfoData)
	if err != nil {
		return fmt.Errorf("failed to marshal operation info: %w", err)
	}

	err = os.WriteFile(ApiOperationInfoYamlPath, data, 0644)
	if err != nil {
		return fmt.Errorf("failed to write apiOperationInfo.yaml: %w", err)
	}

	return nil
}

// MakeServiceKey creates a service key in the format "framework_version"
// Example: MakeServiceKey("cb-spider", "0.11.13") returns "cb-spider_0.11.13"
func MakeServiceKey(frameworkName, versionNumber string) string {
	return fmt.Sprintf("%s_%s", frameworkName, versionNumber)
}

// ParseServiceKey parses a service key and returns framework name and version
// Example: ParseServiceKey("cb-spider_0.11.13") returns ("cb-spider", "0.11.13", nil)
func ParseServiceKey(serviceKey string) (string, string, error) {
	parts := strings.Split(serviceKey, "_")
	if len(parts) < 2 {
		return "", "", fmt.Errorf("invalid service key format: %s", serviceKey)
	}

	// Framework name might contain underscores, so we need to handle that
	// Version is always the last part
	versionNumber := parts[len(parts)-1]
	frameworkName := strings.Join(parts[:len(parts)-1], "_")

	return frameworkName, versionNumber, nil
}
