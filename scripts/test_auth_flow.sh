#!/bin/bash

# MCIAM 인증 플로우 테스트 스크립트
# 사용법: ./test_auth_flow.sh <user_id> <password>

set -e

API_BASE_URL="http://localhost:4000"
USER_ID="${1:-test_user}"
PASSWORD="${2:-test_password}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 MCIAM 인증 플로우 테스트"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "API Base URL: $API_BASE_URL"
echo "User ID: $USER_ID"
echo ""

# 1. Health Check
echo "1️⃣ Health Check"
echo "   GET $API_BASE_URL/readyz"
HEALTH_RESPONSE=$(curl -s "$API_BASE_URL/readyz")
echo "   응답: $HEALTH_RESPONSE"
echo ""

# 2. Login
echo "2️⃣ 로그인"
echo "   POST $API_BASE_URL/api/auth/login"
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"request\": {\"id\": \"$USER_ID\", \"password\": \"$PASSWORD\"}}")

echo "   응답: $LOGIN_RESPONSE"

# 토큰 추출
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"refresh_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "   ❌ 로그인 실패: 토큰을 받지 못했습니다"
  echo "   전체 응답: $LOGIN_RESPONSE"
  exit 1
fi

echo "   ✅ 로그인 성공"
echo "   Access Token: ${ACCESS_TOKEN:0:50}..."
echo "   Refresh Token: ${REFRESH_TOKEN:0:50}..."
echo ""

# 3. Validate Token
echo "3️⃣ 토큰 검증"
echo "   POST $API_BASE_URL/api/auth/validate"
VALIDATE_RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/auth/validate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{}")
echo "   응답: $VALIDATE_RESPONSE"
echo ""

# 4. Get User Info
echo "4️⃣ 사용자 정보 조회"
echo "   POST $API_BASE_URL/api/auth/userinfo"
USERINFO_RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/auth/userinfo" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{}")
echo "   응답: $USERINFO_RESPONSE"
echo ""

# 5. Get Menu Tree
echo "5️⃣ 메뉴 트리 조회"
echo "   POST $API_BASE_URL/api/getmenutree"
MENU_RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/getmenutree" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{}")
MENU_COUNT=$(echo "$MENU_RESPONSE" | grep -o '"menus"' | wc -l || echo "0")
echo "   응답 길이: $(echo "$MENU_RESPONSE" | wc -c) bytes"
echo "   메뉴 항목 수: $MENU_COUNT"
echo ""

# 6. Refresh Token
echo "6️⃣ 토큰 갱신"
echo "   POST $API_BASE_URL/api/auth/refresh"
REFRESH_RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/auth/refresh" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{\"request\": {\"refresh_token\": \"$REFRESH_TOKEN\"}}")

NEW_ACCESS_TOKEN=$(echo "$REFRESH_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
if [ -n "$NEW_ACCESS_TOKEN" ]; then
  echo "   ✅ 토큰 갱신 성공"
  echo "   New Access Token: ${NEW_ACCESS_TOKEN:0:50}..."
else
  echo "   ⚠️  토큰 갱신 응답: $REFRESH_RESPONSE"
fi
echo ""

# 7. Logout
echo "7️⃣ 로그아웃"
echo "   POST $API_BASE_URL/api/auth/logout"
LOGOUT_RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/auth/logout" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${NEW_ACCESS_TOKEN:-$ACCESS_TOKEN}" \
  -d "{}")
echo "   응답: $LOGOUT_RESPONSE"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 인증 플로우 테스트 완료"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
