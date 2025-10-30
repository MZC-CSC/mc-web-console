#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

CONF_DIR="."
FRAMEWORKS_YAML="$CONF_DIR/frameworks.yaml"
API_SERVER_INFO_YAML="$CONF_DIR/apiServerInfo.yaml"
API_OPERATION_INFO_YAML="$CONF_DIR/apiOperationInfo.yaml"

echo "=========================================="
echo "Initialize apiServerInfo.yaml & apiOperationInfo.yaml"
echo "from frameworks.yaml"
echo "=========================================="
echo ""

# Check if frameworks.yaml exists
if [ ! -f "$FRAMEWORKS_YAML" ]; then
  echo -e "${RED}ERROR: frameworks.yaml not found at $FRAMEWORKS_YAML${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Found frameworks.yaml${NC}"

# Check for Python3
if ! command -v python3 &> /dev/null; then
  echo -e "${RED}ERROR: python3 is required but not installed${NC}"
  exit 1
fi

# Check for required Python packages
python3 -c "import yaml" 2>/dev/null
if [ $? -ne 0 ]; then
  echo -e "${YELLOW}Installing PyYAML...${NC}"
  pip3 install pyyaml
fi

python3 -c "import requests" 2>/dev/null
if [ $? -ne 0 ]; then
  echo -e "${YELLOW}Installing requests...${NC}"
  pip3 install requests
fi

echo ""
echo "Generating API YAML files from frameworks.yaml..."
echo ""

# Python script to generate YAML files
python3 <<'PYTHON_SCRIPT'
import yaml
import sys
import requests
from urllib.parse import urljoin
import urllib3

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def fetch_swagger(url):
    """Fetch swagger content from URL"""
    try:
        print(f"  → Fetching swagger from: {url}")
        response = requests.get(url, timeout=30, verify=False)
        response.raise_for_status()
        return yaml.safe_load(response.text)
    except Exception as e:
        print(f"  ✗ WARNING: Failed to fetch {url}: {e}")
        return None

def extract_operations(swagger_spec):
    """Extract operations from swagger spec"""
    operations = {}
    if not swagger_spec or 'paths' not in swagger_spec:
        return operations
    
    for path, methods in swagger_spec['paths'].items():
        if not isinstance(methods, dict):
            continue
        for method, operation in methods.items():
            if not isinstance(operation, dict):
                continue
            if 'operationId' in operation:
                op_id = operation['operationId']
                operations[op_id] = {
                    'method': method.lower(),
                    'resourcePath': path,
                    'description': operation.get('description', operation.get('summary', ''))
                }
    return operations

try:
    # Load frameworks.yaml
    with open('frameworks.yaml', 'r') as f:
        config = yaml.safe_load(f)
except Exception as e:
    print(f"ERROR: Failed to read frameworks.yaml: {e}")
    sys.exit(1)

# Initialize output structures
api_server_info = {'services': {}}
api_operation_info = {'serviceActions': {}}

# Process each framework
for framework in config.get('frameworks', []):
    fw_name = framework.get('name')
    active_version = framework.get('activeVersion')
    
    print(f"\n[{fw_name}]")
    
    for version in framework.get('versions', []):
        if not version.get('enabled', True):
            print(f"  Skipping {version.get('version')} (disabled)")
            continue
        
        ver_num = version.get('version')
        service_key = f"{fw_name}_{ver_num}"
        
        print(f"  Processing version {ver_num}...")
        
        # Add to apiServerInfo
        server_info = {
            'version': ver_num,
            'baseurl': version.get('baseUrl')
        }
        
        auth_type = version.get('authType', 'none')
        if auth_type and auth_type != 'none':
            server_info['auth'] = {
                'type': auth_type
            }
            if version.get('username'):
                server_info['auth']['username'] = version['username']
            if version.get('password'):
                server_info['auth']['password'] = version['password']
        
        api_server_info['services'][service_key] = server_info
        print(f"  ✓ Added to apiServerInfo: {service_key}")
        
        # Fetch and parse swagger for active versions or all enabled versions
        swagger_url = version.get('swaggerUrl')
        if swagger_url:
            swagger_spec = fetch_swagger(swagger_url)
            if swagger_spec:
                operations = extract_operations(swagger_spec)
                if operations:
                    api_operation_info['serviceActions'][service_key] = operations
                    print(f"  ✓ Extracted {len(operations)} operations")
                else:
                    print(f"  ! No operations found in swagger")
                    api_operation_info['serviceActions'][service_key] = {}
            else:
                api_operation_info['serviceActions'][service_key] = {}
        else:
            print(f"  ! No swagger URL defined")
            api_operation_info['serviceActions'][service_key] = {}

# Write apiServerInfo.yaml
try:
    with open('apiServerInfo.yaml', 'w') as f:
        yaml.dump(api_server_info, f, default_flow_style=False, allow_unicode=True, sort_keys=False)
    print(f"\n✓ Generated: apiServerInfo.yaml")
except Exception as e:
    print(f"\nERROR: Failed to write apiServerInfo.yaml: {e}")
    sys.exit(1)

# Write apiOperationInfo.yaml
try:
    with open('apiOperationInfo.yaml', 'w') as f:
        yaml.dump(api_operation_info, f, default_flow_style=False, allow_unicode=True, sort_keys=False)
    print(f"✓ Generated: apiOperationInfo.yaml")
except Exception as e:
    print(f"\nERROR: Failed to write apiOperationInfo.yaml: {e}")
    sys.exit(1)

print("\n" + "="*50)
print("Generation completed successfully!")
print("="*50)

PYTHON_SCRIPT

exit_code=$?

if [ $exit_code -eq 0 ]; then
  echo ""
  echo -e "${GREEN}=========================================="
  echo "Success!"
  echo "==========================================${NC}"
  echo ""
  echo "Generated files:"
  echo "  - $API_SERVER_INFO_YAML"
  echo "  - $API_OPERATION_INFO_YAML"
  echo ""
  exit 0
else
  echo -e "${RED}ERROR: Failed to generate API YAML files${NC}"
  exit 1
fi

