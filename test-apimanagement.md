# API Management System - Browser Test Script

## 테스트 시나리오

### 1. 사전 준비
- API 서버 실행 확인: `http://localhost:8080` (또는 설정된 API 포트)
- Frontend 서버 실행 확인: `http://localhost:3000` (또는 설정된 Front 포트)
- `conf/frameworks.yaml`에 mc-iam-manager 추가 확인

### 2. 테스트 케이스

#### TC-01: Framework 목록 조회
**목표**: API Management 페이지 접속 및 Framework 목록 확인

**Steps**:
1. 브라우저에서 `http://localhost:3000/webconsole/dev/apimanagement` 접속
2. Framework 목록 테이블이 표시되는지 확인
3. 다음 Framework가 표시되는지 확인:
   - CB-Spider (cb-spider)
   - CB-Tumblebug (cb-tumblebug)
   - CM-Ant (cm-ant)
   - CM-Beetle (cm-beetle)
   - CM-Honeybee (cm-honeybee)
   - MC-IAM-Manager (mc-iam-manager)

**Expected**:
- 테이블에 6개 이상의 Framework 표시
- 각 Framework의 Active Version 표시
- Actions 버튼 (Versions, Edit, Delete) 표시

---

#### TC-02: Framework 상세 정보 확인
**목표**: mc-iam-manager Framework의 버전 정보 확인

**Steps**:
1. mc-iam-manager 행에서 "Versions" 버튼 클릭
2. Versions 모달 창 표시 확인
3. Version 0.1.0 정보 확인:
   - Swagger URL: `https://raw.githubusercontent.com/m-cmp/mc-iam-manager/main/docs/swagger.yaml`
   - Base URL: `http://mc-iam-manager:8080`
   - Auth Type: bearer
   - Enabled: Yes

**Expected**:
- 모달 창에 버전 목록 표시
- Sync 버튼 표시

---

#### TC-03: Swagger 동기화 (개별)
**목표**: mc-iam-manager의 Swagger 파일 동기화

**Steps**:
1. mc-iam-manager Versions 모달에서 "Sync" 버튼 클릭
2. 동기화 확인 메시지 표시 확인
3. "Yes" 또는 "OK" 클릭
4. 성공 알림 메시지 확인

**Expected**:
- "Framework synced successfully" 메시지 표시
- `conf/apiServerInfo.yaml`에 `mc-iam-manager_0.1.0` 항목 생성
- `conf/apiOperationInfo.yaml`에 `mc-iam-manager_0.1.0` 항목 및 API operations 생성

---

#### TC-04: API Operations 조회
**목표**: mc-iam-manager의 API 명세 조회

**Steps**:
1. "View API Operations" 버튼 클릭 또는 `/webconsole/dev/apimanagement/operations` 직접 접속
2. Framework 선택 드롭다운에서 "MC-IAM-Manager (mc-iam-manager)" 선택
3. Version은 "Active Version (0.1.0)" 유지
4. Format은 "JSON" 선택
5. "Load" 버튼 클릭
6. API Operations 테이블 확인

**Expected**:
- Operations 테이블에 mc-iam-manager의 API 목록 표시
- 각 Operation의 정보 확인:
  - Operation ID
  - Method (GET, POST, PUT, DELETE)
  - Resource Path
  - Description
- Info 섹션에 Framework, Version, Total Operations 표시

**검증 포인트**:
- `/auth/login` (POST) - 로그인 API
- `/auth/refresh` (POST) - 토큰 갱신
- `/role` (GET, POST) - 역할 관리
- `/user` (GET, POST) - 사용자 관리
- `/workspace` (GET, POST) - 워크스페이스 관리

---

#### TC-05: YAML 포맷 조회
**목표**: API 명세를 YAML 포맷으로 조회

**Steps**:
1. Operations 페이지에서 Framework 선택: mc-iam-manager
2. Format 선택: YAML
3. "Load" 버튼 클릭
4. YAML 내용 확인

**Expected**:
- YAML 형식의 API 명세 표시
- 코드 블록 형태로 포맷팅된 내용
- serviceActions 구조 확인

---

#### TC-06: Export 기능
**목표**: API 명세를 JSON/YAML 파일로 다운로드

**Steps**:
1. Operations 페이지에서 mc-iam-manager operations 로드
2. "Export JSON" 버튼 클릭
3. 파일 다운로드 확인: `mc-iam-manager_0.1.0_operations.json`
4. "Export YAML" 버튼 클릭
5. 파일 다운로드 확인: `mc-iam-manager_0.1.0_operations.yaml`

**Expected**:
- 두 파일 모두 정상 다운로드
- JSON 파일: 유효한 JSON 형식
- YAML 파일: 유효한 YAML 형식

---

#### TC-07: Framework 추가
**목표**: 새로운 Framework 추가 (테스트용)

**Steps**:
1. API Management 메인 페이지에서 "Add Framework" 버튼 클릭
2. Framework 정보 입력:
   - Name: test-framework
   - Display Name: Test Framework
   - Active Version: 1.0.0
   - Version 설정:
     - Version: 1.0.0
     - Swagger URL: (임의의 유효한 URL)
     - Base URL: http://test:8080
     - Auth Type: none
     - Enabled: checked
3. "Save" 버튼 클릭
4. 성공 메시지 확인
5. Framework 목록에 추가된 항목 확인

**Expected**:
- "Framework created successfully" 메시지
- 목록에 새 Framework 표시
- `conf/frameworks.yaml`에 새 항목 추가

---

#### TC-08: Active Version 변경
**목표**: Framework의 Active Version 변경 (다중 버전 존재 시)

**Steps**:
1. Framework에 여러 버전이 있는 경우 (또는 버전 추가 후)
2. Versions 모달에서 다른 버전 선택
3. "Set Active" 버튼 클릭 (구현된 경우)
4. 또는 Edit Framework에서 Active Version 변경
5. 변경 확인

**Expected**:
- Active Version 즉시 변경
- 메모리 캐시 업데이트
- 이후 API 호출 시 새 버전 사용

---

#### TC-09: Sync All Frameworks
**목표**: 모든 Framework를 한 번에 동기화

**Steps**:
1. API Management 메인 페이지에서 "Sync All" 버튼 클릭
2. 확인 메시지에 "Yes" 클릭
3. 동기화 진행 확인
4. 완료 메시지 확인

**Expected**:
- "All frameworks synced successfully" 메시지 (또는 에러 수와 함께)
- 모든 enabled된 Framework의 Swagger 동기화
- `apiOperationInfo.yaml` 업데이트

---

#### TC-10: Framework 삭제
**목표**: 테스트 Framework 삭제

**Steps**:
1. test-framework 행에서 "Delete" 버튼 클릭
2. 확인 메시지에 "Yes" 클릭
3. 삭제 확인

**Expected**:
- "Framework deleted successfully" 메시지
- 목록에서 제거
- `conf/frameworks.yaml`에서 항목 삭제

---

### 3. API 엔드포인트 테스트 (curl 또는 Postman)

#### GET - Framework 목록 조회
```bash
curl -X GET "http://localhost:8080/api/v1/apimanagement/frameworks"
```

#### GET - 특정 Framework 조회
```bash
curl -X GET "http://localhost:8080/api/v1/apimanagement/frameworks/mc-iam-manager"
```

#### GET - Framework Versions 조회
```bash
curl -X GET "http://localhost:8080/api/v1/apimanagement/frameworks/mc-iam-manager/versions"
```

#### POST - Swagger 동기화
```bash
curl -X POST "http://localhost:8080/api/v1/apimanagement/frameworks/mc-iam-manager/versions/0.1.0/sync"
```

#### GET - API Operations 조회 (JSON)
```bash
curl -X GET "http://localhost:8080/api/v1/apimanagement/operations?framework=mc-iam-manager&version=0.1.0&format=json"
```

#### GET - API Operations 조회 (YAML)
```bash
curl -X GET "http://localhost:8080/api/v1/apimanagement/operations?framework=mc-iam-manager&format=yaml"
```

#### GET - Active Versions 조회
```bash
curl -X GET "http://localhost:8080/api/v1/apimanagement/active-versions"
```

#### PUT - Active Version 변경
```bash
curl -X PUT "http://localhost:8080/api/v1/apimanagement/frameworks/mc-iam-manager/active-version" \
  -H "Content-Type: application/json" \
  -d '{"version": "0.1.0"}'
```

---

### 4. 파일 시스템 검증

#### frameworks.yaml 확인
```bash
cat conf/frameworks.yaml | grep -A 10 "mc-iam-manager"
```

#### apiServerInfo.yaml 확인
```bash
cat conf/apiServerInfo.yaml | grep -A 5 "mc-iam-manager_0.1.0"
```

#### apiOperationInfo.yaml 확인
```bash
cat conf/apiOperationInfo.yaml | grep -A 10 "mc-iam-manager_0.1.0"
```

---

### 5. 예상 결과

#### apiServerInfo.yaml 예상 내용
```yaml
services:
  mc-iam-manager_0.1.0:
    version: 0.1.0
    baseurl: http://mc-iam-manager:8080
    auth:
      type: bearer
```

#### apiOperationInfo.yaml 예상 내용 (일부)
```yaml
serviceActions:
  mc-iam-manager_0.1.0:
    CreateRole:
      method: post
      resourcePath: /role
      description: Create a new role
    GetRoles:
      method: get
      resourcePath: /role
      description: Get all roles
    LoginUser:
      method: post
      resourcePath: /auth/login
      description: User login
    # ... 더 많은 operations
```

---

### 6. 트러블슈팅

#### 문제: Swagger 파싱 시 0개 operations 추출
**원인**: Swagger 파일의 operationId 형식이 다를 수 있음
**해결**: swagger-parser.go의 ExtractOperations 함수 확인 및 수정

#### 문제: "framework not found" 에러
**원인**: 캐시 초기화 실패 또는 frameworks.yaml 로드 실패
**해결**: 
1. 서버 로그 확인
2. frameworks.yaml 파일 경로 및 권한 확인
3. 서버 재시작

#### 문제: CORS 에러
**원인**: API 서버와 Frontend 서버 간 CORS 설정
**해결**: api/actions/app.go에서 CORS 설정 확인

#### 문제: 파일 경로 에러
**원인**: 상대 경로 문제
**해결**: 
- API 서버는 `api/` 디렉토리에서 실행
- `../conf/` 경로로 설정 파일 접근

---

### 7. 성공 기준

✅ 모든 Framework가 목록에 표시
✅ mc-iam-manager의 Swagger 동기화 성공
✅ 35개 paths에서 operations 정상 추출
✅ API Operations 페이지에서 operations 목록 표시
✅ JSON/YAML export 정상 동작
✅ Active version 변경 시 메모리 캐시 즉시 반영
✅ Framework CRUD 작업 정상 동작

