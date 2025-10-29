package apispecmanager

import (
  "fmt"
  "testing"
)

// TestLoadFrameworks tests loading frameworks from YAML
func TestLoadFrameworks(t *testing.T) {
  config, err := LoadFrameworks()
  if err != nil {
    t.Fatalf("Failed to load frameworks: %v", err)
  }

  if config == nil {
    t.Fatal("Config is nil")
  }

  if len(config.Frameworks) == 0 {
    t.Fatal("No frameworks loaded")
  }

  fmt.Printf("✓ Loaded %d frameworks\n", len(config.Frameworks))

  // Check if mc-iam-manager is loaded
  found := false
  for _, fw := range config.Frameworks {
    fmt.Printf("  - %s (%s) - Active: %s\n", fw.DisplayName, fw.Name, fw.ActiveVersion)
    if fw.Name == "mc-iam-manager" {
      found = true
      if fw.ActiveVersion != "0.1.0" {
        t.Errorf("Expected active version 0.1.0, got %s", fw.ActiveVersion)
      }
      if len(fw.Versions) == 0 {
        t.Error("mc-iam-manager has no versions")
      }
    }
  }

  if !found {
    t.Error("mc-iam-manager not found in frameworks")
  }
}

// TestMakeServiceKey tests service key generation
func TestMakeServiceKey(t *testing.T) {
  tests := []struct {
    frameworkName string
    versionNumber string
    expected      string
  }{
    {"cb-spider", "0.11.13", "cb-spider_0.11.13"},
    {"mc-iam-manager", "0.1.0", "mc-iam-manager_0.1.0"},
    {"cm-beetle", "0.4.0", "cm-beetle_0.4.0"},
  }

  for _, tt := range tests {
    result := MakeServiceKey(tt.frameworkName, tt.versionNumber)
    if result != tt.expected {
      t.Errorf("MakeServiceKey(%s, %s) = %s, expected %s",
        tt.frameworkName, tt.versionNumber, result, tt.expected)
    } else {
      fmt.Printf("✓ MakeServiceKey(%s, %s) = %s\n", tt.frameworkName, tt.versionNumber, result)
    }
  }
}

// TestParseServiceKey tests service key parsing
func TestParseServiceKey(t *testing.T) {
  tests := []struct {
    serviceKey       string
    expectedFramework string
    expectedVersion  string
    expectError      bool
  }{
    {"cb-spider_0.11.13", "cb-spider", "0.11.13", false},
    {"mc-iam-manager_0.1.0", "mc-iam-manager", "0.1.0", false},
    {"invalid", "", "", true},
  }

  for _, tt := range tests {
    framework, version, err := ParseServiceKey(tt.serviceKey)
    
    if tt.expectError {
      if err == nil {
        t.Errorf("Expected error for serviceKey=%s, got nil", tt.serviceKey)
      } else {
        fmt.Printf("✓ ParseServiceKey(%s) correctly returned error\n", tt.serviceKey)
      }
      continue
    }

    if err != nil {
      t.Errorf("ParseServiceKey(%s) returned error: %v", tt.serviceKey, err)
      continue
    }

    if framework != tt.expectedFramework || version != tt.expectedVersion {
      t.Errorf("ParseServiceKey(%s) = (%s, %s), expected (%s, %s)",
        tt.serviceKey, framework, version, tt.expectedFramework, tt.expectedVersion)
    } else {
      fmt.Printf("✓ ParseServiceKey(%s) = (%s, %s)\n", tt.serviceKey, framework, version)
    }
  }
}

// TestGetFramework tests getting a specific framework
func TestGetFramework(t *testing.T) {
  frameworks := []string{"cb-spider", "cb-tumblebug", "mc-iam-manager"}

  for _, name := range frameworks {
    fw, err := GetFramework(name)
    if err != nil {
      t.Errorf("Failed to get framework %s: %v", name, err)
      continue
    }

    if fw.Name != name {
      t.Errorf("Expected framework name %s, got %s", name, fw.Name)
    } else {
      fmt.Printf("✓ GetFramework(%s) = %s (Active: %s)\n", name, fw.DisplayName, fw.ActiveVersion)
    }
  }

  // Test non-existent framework
  _, err := GetFramework("non-existent")
  if err == nil {
    t.Error("Expected error for non-existent framework, got nil")
  } else {
    fmt.Printf("✓ GetFramework(non-existent) correctly returned error\n")
  }
}

// TestFetchSwagger tests swagger fetching (only if network available)
func TestFetchSwagger(t *testing.T) {
  // Skip in CI or if no network
  if testing.Short() {
    t.Skip("Skipping network test in short mode")
  }

  url := "https://raw.githubusercontent.com/m-cmp/mc-iam-manager/main/docs/swagger.yaml"
  fmt.Printf("Fetching swagger from: %s\n", url)

  data, err := FetchSwagger(url)
  if err != nil {
    t.Logf("Warning: Failed to fetch swagger (might be network issue): %v", err)
    return
  }

  if len(data) == 0 {
    t.Error("Fetched swagger is empty")
    return
  }

  fmt.Printf("✓ Successfully fetched %d bytes from mc-iam-manager swagger\n", len(data))

  // Try to parse it
  spec, err := ParseSwagger(data)
  if err != nil {
    t.Errorf("Failed to parse swagger: %v", err)
    return
  }

  fmt.Printf("✓ Successfully parsed swagger: %s v%s\n", spec.Info.Title, spec.Info.Version)
  fmt.Printf("  Found %d paths\n", len(spec.Paths))

  // Extract operations
  operations := ExtractOperations(spec)
  fmt.Printf("✓ Extracted %d operations\n", len(operations))

  // Print first few operations
  count := 0
  for opId, op := range operations {
    if count < 5 {
      fmt.Printf("  - %s: %s %s\n", opId, op.Method, op.ResourcePath)
      count++
    }
  }
}

// TestCacheOperations tests cache initialization and operations
func TestCacheOperations(t *testing.T) {
  // Initialize cache
  err := InitCache()
  if err != nil {
    t.Fatalf("Failed to initialize cache: %v", err)
  }

  fmt.Println("✓ Cache initialized successfully")

  // Test GetActiveVersion
  frameworks := []string{"cb-spider", "mc-iam-manager", "cm-beetle"}
  for _, name := range frameworks {
    version, err := GetActiveVersion(name)
    if err != nil {
      t.Errorf("Failed to get active version for %s: %v", name, err)
      continue
    }
    fmt.Printf("✓ Active version of %s: %s\n", name, version)
  }

  // Test GetCachedFrameworks
  config := GetCachedFrameworks()
  if config == nil {
    t.Fatal("GetCachedFrameworks returned nil")
  }
  fmt.Printf("✓ GetCachedFrameworks returned %d frameworks\n", len(config.Frameworks))

  // Test GetAllActiveVersions
  activeVersions := GetAllActiveVersions()
  fmt.Printf("✓ GetAllActiveVersions returned %d entries\n", len(activeVersions))
  for name, version := range activeVersions {
    fmt.Printf("  %s: %s\n", name, version)
  }
}

