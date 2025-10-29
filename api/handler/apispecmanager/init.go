package apispecmanager

import (
	"log"
	"os"
)

func init() {
	log.Println("[APISpecManager] Initializing...")

	// Check if frameworks.yaml exists
	if _, err := os.Stat(FrameworksYamlPath); os.IsNotExist(err) {
		log.Println("[APISpecManager] frameworks.yaml not found, creating default...")
		err := createDefaultFrameworksYaml()
		if err != nil {
			log.Printf("[APISpecManager] WARNING: Failed to create default frameworks.yaml: %v", err)
		}
	}

	// Initialize cache with active versions
	if err := InitCache(); err != nil {
		log.Printf("[APISpecManager] WARNING: Failed to initialize framework cache: %v", err)
		log.Println("[APISpecManager] Server will continue but API management features may not work correctly")
		return
	}

	// Check and generate apiServerInfo.yaml if needed
	if _, err := os.Stat(ApiServerInfoYamlPath); os.IsNotExist(err) {
		log.Println("[APISpecManager] apiServerInfo.yaml not found, generating...")
		config := GetCachedFrameworks()
		if config != nil {
			err := GenerateApiServerInfo(config)
			if err != nil {
				log.Printf("[APISpecManager] WARNING: Failed to generate apiServerInfo.yaml: %v", err)
			} else {
				log.Println("[APISpecManager] apiServerInfo.yaml generated successfully")
			}
		}
	}

	// Check and generate apiOperationInfo.yaml if needed
	if _, err := os.Stat(ApiOperationInfoYamlPath); os.IsNotExist(err) {
		log.Println("[APISpecManager] apiOperationInfo.yaml not found, generating...")
		config := GetCachedFrameworks()
		if config != nil {
			// Generate for active versions of each framework
			for _, fw := range config.Frameworks {
				for _, ver := range fw.Versions {
					if ver.Version == fw.ActiveVersion && ver.Enabled {
						log.Printf("[APISpecManager] Generating API operations for %s v%s", fw.Name, ver.Version)
						err := GenerateApiOperationInfo(&fw, &ver)
						if err != nil {
							log.Printf("[APISpecManager] WARNING: Failed to generate operations for %s v%s: %v", fw.Name, ver.Version, err)
						}
						break
					}
				}
			}
			log.Println("[APISpecManager] apiOperationInfo.yaml generation completed")
		}
	}

	log.Println("[APISpecManager] Initialization completed successfully")
}

// createDefaultFrameworksYaml creates a default frameworks.yaml file with sample data
func createDefaultFrameworksYaml() error {
	defaultConfig := &FrameworksConfig{
		Frameworks: []Framework{
			{
				Name:          "cb-spider",
				DisplayName:   "CB-Spider",
				ActiveVersion: "0.11.13",
				Versions: []FrameworkVersion{
					{
						Version:    "0.11.13",
						SwaggerUrl: "https://raw.githubusercontent.com/cloud-barista/cb-spider/main/api/swagger.yaml",
						BaseUrl:    "http://cb-spider:1024/spider",
						AuthType:   "none",
						Username:   "",
						Password:   "",
						Enabled:    true,
					},
				},
			},
			{
				Name:          "cb-tumblebug",
				DisplayName:   "CB-Tumblebug",
				ActiveVersion: "0.11.13",
				Versions: []FrameworkVersion{
					{
						Version:    "0.11.13",
						SwaggerUrl: "https://raw.githubusercontent.com/cloud-barista/cb-tumblebug/main/src/api/rest/docs/swagger.yaml",
						BaseUrl:    "http://cb-tumblebug:1323/tumblebug",
						AuthType:   "basic",
						Username:   "default",
						Password:   "default",
						Enabled:    true,
					},
				},
			},
		},
	}

	return SaveFrameworks(defaultConfig)
}
