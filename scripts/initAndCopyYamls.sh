#!/bin/bash

# 에러 발생 시 중단
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONF_DIR="$SCRIPT_DIR/../conf"
DEST_DIR="$SCRIPT_DIR/container-volume/mc-web-console-api/conf"

echo "=========================================="
echo "Initializing and copying YAML files"
echo "=========================================="

# Step 1: conf 디렉토리로 이동하여 initApiYamls.sh 실행
echo ""
echo "Step 1: Generating YAML files from frameworks.yaml..."
cd "$CONF_DIR"
bash initApiYamls.sh
if [ $? -ne 0 ]; then
  echo "ERROR: Failed to generate YAML files"
  exit 1
fi

# Step 2: 대상 디렉토리 생성
echo ""
echo "Step 2: Creating destination directory..."
mkdir -p "$DEST_DIR"

# Step 3: 생성된 파일들 복사
echo ""
echo "Step 3: Copying YAML files to container volume..."
cp frameworks.yaml "$DEST_DIR/frameworks.yaml"
cp apiServerInfo.yaml "$DEST_DIR/apiServerInfo.yaml"
cp apiOperationInfo.yaml "$DEST_DIR/apiOperationInfo.yaml"

# Step 4: 레거시 api.yaml도 폴백용으로 복사
if [ -f api.yaml ]; then
  cp api.yaml "$DEST_DIR/api.yaml"
  echo "  ✓ Copied api.yaml (fallback)"
fi

echo ""
echo "=========================================="
echo "Success! All files copied to:"
echo "  $DEST_DIR"
echo "=========================================="
echo ""
echo "Copied files:"
echo "  - frameworks.yaml"
echo "  - apiServerInfo.yaml"
echo "  - apiOperationInfo.yaml"
if [ -f "$DEST_DIR/api.yaml" ]; then
  echo "  - api.yaml (fallback)"
fi

