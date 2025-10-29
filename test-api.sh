#!/bin/bash

# API Management System Test Script
# This script tests the API endpoints without requiring a running server
# It validates the configuration files and structure

echo "======================================"
echo "API Management System - Test Script"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base paths
CONF_DIR="./conf"
API_BASE="http://localhost:8080/api/v1/apimanagement"

# Test counters
PASS=0
FAIL=0

# Function to print test result
print_result() {
  local test_name="$1"
  local result="$2"
  local message="$3"
  
  if [ "$result" = "PASS" ]; then
    echo -e "${GREEN}✓ PASS${NC} - $test_name"
    [ -n "$message" ] && echo "  → $message"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}✗ FAIL${NC} - $test_name"
    [ -n "$message" ] && echo "  → $message"
    FAIL=$((FAIL + 1))
  fi
}

# Test 1: Check if frameworks.yaml exists
echo "Test 1: Configuration File Validation"
echo "--------------------------------------"

if [ -f "$CONF_DIR/frameworks.yaml" ]; then
  print_result "frameworks.yaml exists" "PASS" "File: $CONF_DIR/frameworks.yaml"
else
  print_result "frameworks.yaml exists" "FAIL" "File not found: $CONF_DIR/frameworks.yaml"
fi
echo ""

# Test 2: Validate frameworks.yaml content
echo "Test 2: frameworks.yaml Content Validation"
echo "-------------------------------------------"

if [ -f "$CONF_DIR/frameworks.yaml" ]; then
  # Check for mc-iam-manager
  if grep -q "mc-iam-manager" "$CONF_DIR/frameworks.yaml"; then
    print_result "mc-iam-manager entry exists" "PASS"
    
    # Extract mc-iam-manager section
    echo "  mc-iam-manager configuration:"
    grep -A 10 "name: mc-iam-manager" "$CONF_DIR/frameworks.yaml" | sed 's/^/    /'
  else
    print_result "mc-iam-manager entry exists" "FAIL" "mc-iam-manager not found in frameworks.yaml"
  fi
  
  # Check other frameworks
  frameworks=("cb-spider" "cb-tumblebug" "cm-ant" "cm-beetle" "cm-honeybee")
  for fw in "${frameworks[@]}"; do
    if grep -q "name: $fw" "$CONF_DIR/frameworks.yaml"; then
      print_result "$fw entry exists" "PASS"
    else
      print_result "$fw entry exists" "FAIL"
    fi
  done
fi
echo ""

# Test 3: Count total frameworks
echo "Test 3: Framework Count"
echo "-----------------------"

if [ -f "$CONF_DIR/frameworks.yaml" ]; then
  count=$(grep -c "^  - name:" "$CONF_DIR/frameworks.yaml")
  print_result "Total frameworks count" "PASS" "Found $count frameworks"
fi
echo ""

# Test 4: Check YAML syntax
echo "Test 4: YAML Syntax Validation"
echo "-------------------------------"

if command -v python3 &> /dev/null; then
  if python3 -c "import yaml; yaml.safe_load(open('$CONF_DIR/frameworks.yaml'))" 2>/dev/null; then
    print_result "YAML syntax is valid" "PASS"
  else
    print_result "YAML syntax is valid" "FAIL" "Invalid YAML syntax"
  fi
else
  print_result "YAML syntax validation" "SKIP" "Python3 not available"
fi
echo ""

# Test 5: API Endpoint Tests (requires server running)
echo "Test 5: API Endpoint Tests"
echo "--------------------------"
echo -e "${YELLOW}Note: These tests require the API server to be running${NC}"
echo ""

# Check if server is running
if curl -s "$API_BASE/frameworks" > /dev/null 2>&1; then
  echo -e "${GREEN}Server is running!${NC}"
  echo ""
  
  # Test 5.1: GET /frameworks
  echo "Test 5.1: GET /frameworks"
  response=$(curl -s "$API_BASE/frameworks")
  if echo "$response" | grep -q "responseData"; then
    print_result "GET /frameworks" "PASS"
    # Count frameworks in response
    fw_count=$(echo "$response" | grep -o '"name"' | wc -l)
    echo "  → Returned $fw_count frameworks"
  else
    print_result "GET /frameworks" "FAIL"
  fi
  echo ""
  
  # Test 5.2: GET /frameworks/mc-iam-manager
  echo "Test 5.2: GET /frameworks/mc-iam-manager"
  response=$(curl -s "$API_BASE/frameworks/mc-iam-manager")
  if echo "$response" | grep -q "mc-iam-manager"; then
    print_result "GET /frameworks/mc-iam-manager" "PASS"
  else
    print_result "GET /frameworks/mc-iam-manager" "FAIL"
  fi
  echo ""
  
  # Test 5.3: GET /active-versions
  echo "Test 5.3: GET /active-versions"
  response=$(curl -s "$API_BASE/active-versions")
  if echo "$response" | grep -q "mc-iam-manager"; then
    print_result "GET /active-versions" "PASS"
    # Show active versions
    echo "  Active versions:"
    echo "$response" | python3 -m json.tool 2>/dev/null | grep -A 1 '"mc-iam-manager"' | sed 's/^/    /'
  else
    print_result "GET /active-versions" "FAIL"
  fi
  echo ""
  
  # Test 5.4: GET /operations (requires swagger sync first)
  echo "Test 5.4: GET /operations?framework=mc-iam-manager"
  response=$(curl -s "$API_BASE/operations?framework=mc-iam-manager")
  if echo "$response" | grep -q "responseData"; then
    print_result "GET /operations" "PASS"
    # Check if operations exist
    if echo "$response" | grep -q "method"; then
      op_count=$(echo "$response" | grep -o '"method"' | wc -l)
      echo "  → Found $op_count operations for mc-iam-manager"
    else
      echo "  → No operations found (swagger not synced yet)"
    fi
  else
    print_result "GET /operations" "FAIL"
  fi
  echo ""
  
else
  echo -e "${YELLOW}Server is not running. Skipping API endpoint tests.${NC}"
  echo "To run the API server, execute:"
  echo "  cd api && go run ./cmd/app/main.go"
  echo ""
fi

# Test 6: File Structure Validation
echo "Test 6: File Structure Validation"
echo "----------------------------------"

required_files=(
  "api/handler/apispecmanager/models.go"
  "api/handler/apispecmanager/cache.go"
  "api/handler/apispecmanager/yaml-manager.go"
  "api/handler/apispecmanager/swagger-parser.go"
  "api/handler/apispecmanager/init.go"
  "api/actions/apimanager.go"
  "front/templates/pages/dev/apimanagement.html"
  "front/templates/pages/dev/apimanagement/operations.html"
  "front/assets/js/pages/dev/apimanagement/manage.js"
  "front/assets/js/pages/dev/apimanagement/operations.js"
)

for file in "${required_files[@]}"; do
  if [ -f "$file" ]; then
    print_result "$file exists" "PASS"
  else
    print_result "$file exists" "FAIL"
  fi
done
echo ""

# Summary
echo "======================================"
echo "Test Summary"
echo "======================================"
echo -e "Total: $((PASS + FAIL)) tests"
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}✗ Some tests failed. Please check the output above.${NC}"
  exit 1
fi

