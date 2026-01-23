# 네이밍 컨벤션

이 문서는 MC Web Console Next.js 프로젝트의 네이밍 컨벤션을 정의합니다. 모든 코드는 이 컨벤션을 따라 작성해야 합니다.

---

## 1. 파일 및 폴더 네이밍

### 1.1 파일명

- **일반 파일**: `camelCase.tsx`, `camelCase.ts`
  - 예: `apiClient.ts`, `errorHandler.ts`, `useAuth.ts`
- **컴포넌트 파일**: `PascalCase.tsx`
  - 예: `LoginForm.tsx`, `UserTable.tsx`, `WorkspaceDetail.tsx`
- **페이지 파일**: `page.tsx`, `layout.tsx` (Next.js App Router 규칙)
- **타입 정의 파일**: `camelCase.ts`
  - 예: `auth.ts`, `common.ts`, `menu.ts`

### 1.2 폴더명

- **모든 폴더**: `camelCase`
  - 예: `components/`, `hooks/`, `lib/`, `types/`, `constants/`
- **컴포넌트 폴더**: 기능별로 그룹화
  - 예: `components/auth/`, `components/layout/`, `components/common/`

---

## 2. 변수 및 함수 네이밍

### 2.1 변수

- **일반 변수**: `camelCase`
  ```typescript
  const userName = 'admin';
  const workspaceList = [];
  const selectedWorkspace = null;
  const isLoading = false;
  ```

- **상수**: `UPPER_SNAKE_CASE`
  ```typescript
  const API_BASE_URL = 'https://api.example.com';
  const MAX_RETRY_COUNT = 3;
  const DEFAULT_PAGE_SIZE = 10;
  ```

- **배열/리스트**: 복수형 사용
  ```typescript
  const users = [];
  const menuItems = [];
  const workspaceList = [];
  ```

- **불리언 변수**: `is`, `has`, `should` 접두사 사용
  ```typescript
  const isAuthenticated = true;
  const hasPermission = false;
  const shouldRefresh = true;
  ```

### 2.2 함수

- **일반 함수**: `camelCase` + 동사 접두사
  ```typescript
  function getUserInfo() {}
  function fetchWorkspaceList() {}
  function handleUserSelect() {}
  function validateForm() {}
  ```

- **이벤트 핸들러**: `handle` 접두사 사용
  ```typescript
  function handleClick() {}
  function handleSubmit() {}
  function handleChange() {}
  ```

- **API 함수**: HTTP 메서드 접두사 사용
  ```typescript
  function getWorkspaceList() {}
  function createWorkspace() {}
  function updateWorkspace() {}
  function deleteWorkspace() {}
  ```

- **유틸리티 함수**: 동작을 명확히 표현
  ```typescript
  function formatDate() {}
  function parseError() {}
  function validateEmail() {}
  ```

### 2.3 비동기 함수

- **Promise 반환 함수**: `async` 키워드 사용
  ```typescript
  async function fetchUserData() {
    return await api.get('/user');
  }
  ```

---

## 3. 타입 및 인터페이스 네이밍

### 3.1 타입 정의

- **인터페이스**: `PascalCase` + 명사
  ```typescript
  interface UserInfo {}
  interface WorkspaceData {}
  interface ApiResponse {}
  ```

- **타입 별칭**: `PascalCase` + 명사
  ```typescript
  type UserId = string;
  type WorkspaceList = Workspace[];
  type ErrorCode = 'UNAUTHORIZED' | 'FORBIDDEN';
  ```

- **제네릭 타입**: `T`, `U`, `V` 또는 의미있는 이름 사용
  ```typescript
  interface ApiResponse<T> {}
  interface PaginatedResponse<TData> {}
  ```

### 3.2 Props 인터페이스

- **컴포넌트 Props**: `[ComponentName]Props`
  ```typescript
  interface UserTableProps {
    users: User[];
    onSelect: (user: User) => void;
  }
  
  interface WorkspaceDetailProps {
    workspace: Workspace;
    isLoading?: boolean;
  }
  ```

---

## 4. 컴포넌트 네이밍

### 4.1 컴포넌트 함수

- **컴포넌트**: `PascalCase`
  ```typescript
  export function UserTable() {}
  export function WorkspaceDetail() {}
  export function LoginForm() {}
  ```

- **컴포넌트 파일명**: 컴포넌트명과 동일
  - `UserTable.tsx` → `export function UserTable() {}`
  - `WorkspaceDetail.tsx` → `export function WorkspaceDetail() {}`

### 4.2 Hook 네이밍

- **Custom Hook**: `use` 접두사 + `PascalCase`
  ```typescript
  export function useAuth() {}
  export function useWorkspaces() {}
  export function useMenu() {}
  ```

- **Hook 파일명**: Hook명과 동일
  - `useAuth.ts` → `export function useAuth() {}`
  - `useWorkspaces.ts` → `export function useWorkspaces() {}`

---

## 5. API 관련 네이밍

### 5.1 OperationId

- **OperationId 상수**: `UPPER_SNAKE_CASE`
  ```typescript
  export const OPERATION_IDS = {
    GET_WORKSPACE_LIST: 'GetWorkspaceList',
    CREATE_WORKSPACE: 'CreateWorkspace',
    UPDATE_WORKSPACE: 'UpdateWorkspace',
    DELETE_WORKSPACE: 'DeleteWorkspace',
  } as const;
  ```

### 5.2 API 함수

- **API 클라이언트 함수**: `camelCase` + HTTP 메서드 접두사
  ```typescript
  function getWorkspaceList() {}
  function createWorkspace() {}
  function updateWorkspace() {}
  function deleteWorkspace() {}
  ```

### 5.3 API 타입

- **요청 타입**: `[Action][Resource]Request`
  ```typescript
  interface GetWorkspaceListRequest {}
  interface CreateWorkspaceRequest {}
  interface UpdateWorkspaceRequest {}
  ```

- **응답 타입**: `[Action][Resource]Response`
  ```typescript
  interface GetWorkspaceListResponse {}
  interface CreateWorkspaceResponse {}
  interface UpdateWorkspaceResponse {}
  ```

---

## 6. 상수 네이밍

### 6.1 상수 객체

- **상수 객체**: `UPPER_SNAKE_CASE`
  ```typescript
  export const ERROR_CODES = {
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
  } as const;
  
  export const ROUTES = {
    LOGIN: '/login',
    DASHBOARD: '/dashboard',
  } as const;
  ```

### 6.2 열거형 (Enum)

- **Enum**: `PascalCase` (사용하지 않는 것을 권장, 상수 객체 사용)
  ```typescript
  // 권장하지 않음
  enum ErrorCode {
    UNAUTHORIZED = 'UNAUTHORIZED',
  }
  
  // 권장: 상수 객체 사용
  export const ERROR_CODES = {
    UNAUTHORIZED: 'UNAUTHORIZED',
  } as const;
  ```

---

## 7. 코딩 스타일

### 7.1 기본 규칙

- **들여쓰기**: 2칸 (스페이스)
- **따옴표**: 작은따옴표 (`'`) 사용
- **세미콜론**: 모든 구문 끝에 사용
- **라인 길이**: 최대 100자

### 7.2 예시

```typescript
// ✅ 좋은 예
const userName = 'admin';
const workspaceList: Workspace[] = [];

function getUserInfo(): Promise<UserInfo> {
  return api.get('/user');
}

// ❌ 나쁜 예
const userName = "admin";  // 큰따옴표 사용
const workspaceList:Workspace[]=[];  // 공백 없음
function getUserInfo(){return api.get('/user')}  // 세미콜론 없음
```

---

## 8. 특수 케이스

### 8.1 이벤트 핸들러

- **onClick, onChange 등**: `on` 접두사 + 이벤트명
  ```typescript
  interface ButtonProps {
    onClick: () => void;
    onChange: (value: string) => void;
    onSubmit: (data: FormData) => void;
  }
  ```

### 8.2 상태 관리

- **useState**: 의미있는 이름 사용
  ```typescript
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [workspaceList, setWorkspaceList] = useState<Workspace[]>([]);
  ```

### 8.3 Context

- **Context**: `[Name]Context`
  ```typescript
  const AlertContext = createContext<AlertContextType | undefined>(undefined);
  const LoadingContext = createContext<LoadingContextType | undefined>(undefined);
  ```

- **Provider**: `[Name]Provider`
  ```typescript
  export function AlertProvider() {}
  export function LoadingProvider() {}
  ```

---

## 9. 네이밍 체크리스트

코드를 작성할 때 다음 사항을 확인하세요:

- [ ] 파일명이 컨벤션을 따르는가?
- [ ] 변수명이 `camelCase`인가?
- [ ] 상수명이 `UPPER_SNAKE_CASE`인가?
- [ ] 함수명이 동사로 시작하는가?
- [ ] 컴포넌트명이 `PascalCase`인가?
- [ ] Hook명이 `use`로 시작하는가?
- [ ] 타입/인터페이스명이 `PascalCase`인가?
- [ ] Props 인터페이스명이 `[ComponentName]Props`인가?
- [ ] 이벤트 핸들러가 `handle` 또는 `on` 접두사를 사용하는가?

---

## 10. 참고 문서

- [DEVELOPMENT_GUIDE_FROM_HTML_TO_NEXT.md](../../mc-web-console-spec/mig-plan-html/DEVELOPMENT_GUIDE_FROM_HTML_TO_NEXT.md) - 개발 지침
- [08_development_guide.md](../../mc-web-console-spec/mig-plan2/08_development_guide.md) - 신규 기능 개발 가이드

---

**문서 작성일**: 2025-01-XX  
**최종 수정일**: 2025-01-XX
