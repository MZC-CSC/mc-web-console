# Resources 화면 테스트 가이드

## 개발 서버 실행

```bash
cd develop/front
npm run dev
```

서버가 실행되면 `http://localhost:3000`에서 접근할 수 있습니다.

## 테스트할 Resources 화면 목록

다음 URL들을 브라우저에서 직접 접근하여 테스트할 수 있습니다:

1. **Server Specs**: http://localhost:3000/resources/specs
2. **Images**: http://localhost:3000/resources/images
3. **My Images**: http://localhost:3000/resources/my-images
4. **Networks**: http://localhost:3000/resources/networks
5. **Security Groups**: http://localhost:3000/resources/security
6. **Disks**: http://localhost:3000/resources/disks
7. **SSH Keys**: http://localhost:3000/resources/ssh-keys

## 확인 사항

각 화면에서 다음을 확인하세요:

### 1. WorkspaceSelector와 ProjectSelector 표시
- 화면 상단에 "Workspace"와 "Project" 선택 드롭다운이 표시되는지 확인
- 두 Selector가 나란히 배치되어 있는지 확인

### 2. Workspace 선택 동작
- Workspace를 선택하면 Project 목록이 자동으로 갱신되는지 확인
- Workspace 미선택 시 Project Selector가 비활성화되는지 확인

### 3. Project 선택 동작
- Project를 선택하면 해당 Project의 리소스 목록이 조회되는지 확인
- Project 미선택 시 빈 목록이 표시되는지 확인
- Project 변경 시 리소스 목록이 자동으로 갱신되는지 확인

### 4. 리소스 목록 표시
- Project 선택 후 해당 Project의 리소스가 테이블에 표시되는지 확인
- 리소스가 없을 경우 "없습니다" 메시지가 표시되는지 확인

### 5. CRUD 기능
- "새로고침" 버튼이 작동하는지 확인
- "추가" 버튼이 표시되는지 확인
- 리소스 항목 클릭 시 상세 정보가 표시되는지 확인
- 삭제 기능이 작동하는지 확인

## 예상 동작

1. **초기 상태**: Workspace와 Project가 선택되지 않은 상태
2. **Workspace 선택**: Project 목록이 자동으로 로드됨
3. **Project 선택**: 해당 Project의 `ns_id`를 사용하여 리소스 목록 조회
4. **리소스 표시**: 선택된 Project의 리소스가 테이블에 표시됨

## 문제 해결

### WorkspaceSelector/ProjectSelector가 보이지 않는 경우
- 브라우저 콘솔에서 에러 확인
- 네트워크 탭에서 API 요청 실패 여부 확인

### 리소스 목록이 표시되지 않는 경우
- Project가 선택되었는지 확인
- 브라우저 콘솔에서 API 에러 확인
- Network 탭에서 API 요청 상태 확인

### 로그인이 필요한 경우
- 먼저 `/login` 페이지에서 로그인
- 로그인 후 Resources 화면으로 이동
