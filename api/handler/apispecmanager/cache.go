package apispecmanager

import (
	"fmt"
	"log"
	"sync"
)

var (
	// activeVersionCache stores framework name -> active version mapping
	activeVersionCache map[string]string
	// cacheMutex protects concurrent access to cache
	cacheMutex sync.RWMutex
	// frameworksConfig stores the full frameworks configuration
	frameworksConfig *FrameworksConfig
)

// InitCache initializes the cache by loading frameworks.yaml
// This should be called when the server starts
func InitCache() error {
	cacheMutex.Lock()
	defer cacheMutex.Unlock()

	config, err := LoadFrameworks()
	if err != nil {
		return fmt.Errorf("failed to load frameworks: %w", err)
	}

	frameworksConfig = config
	activeVersionCache = make(map[string]string)

	for _, fw := range config.Frameworks {
		activeVersionCache[fw.Name] = fw.ActiveVersion
		log.Printf("[Cache] Loaded framework: %s, active version: %s", fw.Name, fw.ActiveVersion)
	}

	log.Printf("[Cache] Initialized with %d frameworks", len(config.Frameworks))
	return nil
}

// GetActiveVersion returns the active version for a given framework name
// This function reads from memory cache for fast access
func GetActiveVersion(frameworkName string) (string, error) {
	cacheMutex.RLock()
	defer cacheMutex.RUnlock()

	versionNumber, exists := activeVersionCache[frameworkName]
	if !exists {
		return "", fmt.Errorf("framework not found: %s", frameworkName)
	}
	return versionNumber, nil
}

// UpdateActiveVersion updates the active version for a framework
// This updates both the file and memory cache
func UpdateActiveVersion(frameworkName, versionNumber string) error {
	cacheMutex.Lock()
	defer cacheMutex.Unlock()

	// Update file
	err := SetActiveVersion(frameworkName, versionNumber)
	if err != nil {
		return fmt.Errorf("failed to update active version in file: %w", err)
	}

	// Update memory cache
	activeVersionCache[frameworkName] = versionNumber
	log.Printf("[Cache] Updated active version for %s: %s", frameworkName, versionNumber)

	return nil
}

// RefreshCache reloads the entire cache from frameworks.yaml
// This should be called after adding or deleting frameworks
func RefreshCache() error {
	log.Println("[Cache] Refreshing cache...")
	return InitCache()
}

// GetCachedFrameworks returns the full frameworks configuration from memory
func GetCachedFrameworks() *FrameworksConfig {
	cacheMutex.RLock()
	defer cacheMutex.RUnlock()
	return frameworksConfig
}

// GetCachedFramework returns a specific framework from memory cache
func GetCachedFramework(frameworkName string) (*Framework, error) {
	cacheMutex.RLock()
	defer cacheMutex.RUnlock()

	if frameworksConfig == nil {
		return nil, fmt.Errorf("frameworks config not initialized")
	}

	for _, fw := range frameworksConfig.Frameworks {
		if fw.Name == frameworkName {
			return &fw, nil
		}
	}

	return nil, fmt.Errorf("framework not found: %s", frameworkName)
}

// GetCachedFrameworkVersion returns a specific version of a framework from memory cache
func GetCachedFrameworkVersion(frameworkName, versionNumber string) (*FrameworkVersion, error) {
	fw, err := GetCachedFramework(frameworkName)
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

// GetAllActiveVersions returns a map of all framework names and their active versions
func GetAllActiveVersions() map[string]string {
	cacheMutex.RLock()
	defer cacheMutex.RUnlock()

	result := make(map[string]string)
	for k, v := range activeVersionCache {
		result[k] = v
	}
	return result
}
