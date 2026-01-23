# Project 조회 API 변경 사항

## 개요
Workspace 선택 시 Project 목록을 조회하는 API를 Buffalo와 동일하게 `GetWPmappingListByWorkspaceId` operationId를 사용하도록 변경

---

## 변경된 파일

### 1. `src/constants/api.ts`
**변경 내용**: operationId 상수 추가

```typescript
// Project
GET_WORKSPACE_PROJECTS: 'listWorkspaceProjects',
GET_WORKSPACE_PROJECTS_BY_WORKSPACE_ID: 'GetWPmappingListByWorkspaceId', // ✅ 추가
LIST_PROJECTS: 'listProjects',
CREATE_PROJECT: 'createProject',
DELETE_PROJECT: 'deleteProject',
ADD_PROJECT_TO_WORKSPACE: 'addProjectToWorkspace',
REMOVE_PROJECT_FROM_WORKSPACE: 'removeProjectFromWorkspace',
```

### 2. `src/lib/api/client.ts`
**변경 내용**: subsystem 매핑에 새 operationId 추가

```typescript
const mcIamManagerOperations: OperationId[] = [
  OPERATION_IDS.GET_WORKSPACE_LIST,
  OPERATION_IDS.LIST_WORKSPACES,
  // ... 기타 operation IDs
  OPERATION_IDS.GET_WORKSPACE_PROJECTS,
  OPERATION_IDS.GET_WORKSPACE_PROJECTS_BY_WORKSPACE_ID, // ✅ 추가
  OPERATION_IDS.GET_MENU_LIST,
  // ...
];
```

### 3. `src/hooks/api/useProjects.ts`
**변경 내용**: API 호출 로직 변경

#### 변경 전
```typescript
export function useWorkspaceProjects(workspaceId?: string) {
  const { data, isLoading, error, refetch } = useQuery<Project[]>({
    queryKey: ['workspace-projects', workspaceId],
    queryFn: async () => {
      if (!workspaceId) {
        return [];
      }

      // ❌ Workspace 전체 데이터 조회 후 projects 추출
      const response = await apiPost<any>(
        OPERATION_IDS.GET_WORKSPACE,
        {
          request: {
            id: workspaceId,
          },
        }
      );

      const workspace = response.responseData;
      return Array.isArray(workspace?.projects) ? workspace.projects : [];
    },
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 5,
  });
  // ...
}
```

#### 변경 후
```typescript
export function useWorkspaceProjects(workspaceId?: string) {
  const { data, isLoading, error, refetch } = useQuery<Project[]>({
    queryKey: ['workspace-projects', workspaceId],
    queryFn: async () => {
      if (!workspaceId) {
        return [];
      }

      // ✅ GetWPmappingListByWorkspaceId 전용 API 호출
      const response = await apiPost<any>(
        OPERATION_IDS.GET_WORKSPACE_PROJECTS_BY_WORKSPACE_ID,
        {
          pathParams: {
            workspaceId: workspaceId,
          },
        }
      );

      const projects = response.responseData?.projects;
      return Array.isArray(projects) ? projects : [];
    },
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 5,
  });
  // ...
}
```

---

## API 비교

### Buffalo와 Next.js 모두 동일한 API 사용

**API 엔드포인트:**
```
POST /api/mc-iam-manager/GetWPmappingListByWorkspaceId
```

**OperationId:**
```
GetWPmappingListByWorkspaceId
```

**Request:**
```json
{
  "operationId": "GetWPmappingListByWorkspaceId",
  "pathParams": {
    "workspaceId": "workspace-123"
  }
}
```

**Response:**
```json
{
  "status": {
    "code": 200
  },
  "responseData": {
    "projects": [
      {
        "id": "project-1",
        "name": "Project 1",
        "ns_id": "ns-1",
        "description": "..."
      },
      {
        "id": "project-2",
        "name": "Project 2",
        "ns_id": "ns-2",
        "description": "..."
      }
    ]
  }
}
```

---

## 변경 이유

### 이전 방식의 문제점
1. **불필요한 데이터 조회**: Workspace 전체 정보를 조회해서 projects만 추출
2. **API 불일치**: Buffalo와 Next.js가 다른 API를 사용
3. **성능 저하**: Workspace 상세 정보가 포함되어 응답 크기가 큼

### 새 방식의 장점
1. ✅ **Buffalo와 동일한 API**: 백엔드 통합 관리 용이
2. ✅ **최적화된 조회**: Project 목록만 조회 (경량화)
3. ✅ **명확한 의도**: API 이름이 목적을 명확히 표현

---

## 마이그레이션 영향도

### 영향 받는 컴포넌트
- `src/components/mci-workloads/WorkspaceProjectSelector.tsx`
- `src/app/(dashboard)/operations/manage/workloads/mciworkloads/page.tsx`
- `src/app/(dashboard)/operations/manage/workloads/pmkworkloads/page.tsx` (예정)
- 기타 Workspace/Project 선택이 있는 모든 페이지

### 호환성
- ✅ **이전 코드와 호환**: `useWorkspaceProjects()` Hook 시그니처 동일
- ✅ **타입 안전성**: TypeScript 타입 변경 없음
- ✅ **캐싱**: React Query 캐시 키 동일 (`['workspace-projects', workspaceId]`)

### 테스트 필요 사항
- [ ] Workspace 선택 시 Project 목록이 올바르게 조회되는지 확인
- [ ] Project 선택 후 MCI/PMK 목록이 올바르게 조회되는지 확인
- [ ] React Query 캐싱이 정상적으로 동작하는지 확인
- [ ] 에러 처리가 올바르게 동작하는지 확인 (Workspace가 없는 경우, API 오류 등)

---

## 실행 흐름

### Buffalo
```
Workspace 선택
  ↓
navbar.js: setPrjSelectBox(workspaceId)
  ↓
workspace_api.js: getProjectListByWorkspaceId(workspaceId)
  ↓
API: POST /api/mc-iam-manager/GetWPmappingListByWorkspaceId
  ↓
response.data.responseData.projects
  ↓
DOM 업데이트 (selectBox 옵션 추가)
```

### Next.js
```
Workspace 선택
  ↓
handleWorkspaceChange(workspaceId)
  ↓
setSelectedWorkspaceId(workspaceId)
  ↓
useWorkspaceProjects(selectedWorkspaceId) 자동 감지 (React Query)
  ↓
API: POST /api/mc-iam-manager/GetWPmappingListByWorkspaceId
  ↓
response.responseData.projects
  ↓
projects state 자동 업데이트 (React Query)
  ↓
컴포넌트 자동 리렌더링
```

---

## 결론

Buffalo와 Next.js가 **동일한 API**를 사용하도록 변경하여:
- ✅ 백엔드 API 통합 관리 용이
- ✅ 코드 일관성 향상
- ✅ API 최적화 (필요한 데이터만 조회)
- ✅ 명확한 API 의도 표현

Next.js는 **React Query를 통한 자동 캐싱 및 상태 관리**로 Buffalo보다 더 나은 사용자 경험을 제공합니다.
