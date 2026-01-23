# Backend API 호출 방식 비교: Buffalo → Next.js 마이그레이션 가이드

## 개요
Buffalo 프레임워크 기반의 front-buffalo를 Next.js로 마이그레이션하는 과정에서 backend 호출 방식 비교 분석

---

## 1. 파일 구조 비교

### Buffalo Front (front-buffalo)
```
develop/front-buffalo/assets/js/
├── common/api/
│   ├── http.js (공통 HTTP 클라이언트)
│   └── services/
│       ├── workspace_api.js
│       ├── mci_api.js
│       ├── disk_api.js
│       ├── vmimage_api.js
│       ├── monitoring_api.js
│       ├── pmk_api.js
│       └── ...
└── pages/
    └── demo/rest/apicall.js (API 호출 예제)
```

### Next.js Front (front)
```
develop/front/src/
├── lib/api/
│   └── client.ts (공통 API 클라이언트)
├── hooks/api/
│   ├── useWorkspaces.ts
│   ├── useMCIWorkloads.ts
│   ├── useDisks.ts
│   ├── useImages.ts
│   ├── useMonitoringConfig.ts
│   ├── usePMKWorkloads.ts
│   └── ...
└── constants/
    └── api.ts (operationId 상수 정의)
```

**차이점:**
- Buffalo: `services/` 폴더에 API 함수들을 직접 정의
- Next.js: `hooks/api/` 폴더에 React Query 기반 커스텀 훅으로 정의

---

## 2. 공통 API 클라이언트 비교

### Buffalo: `webconsolejs["common/api/http"].commonAPIPost`

**호출 방식:**
```javascript
const controller = "/api/" + "mc-iam-manager/" + "GetWorkspaceList";
const response = await webconsolejs["common/api/http"].commonAPIPost(
  controller,
  data,
  null
);
```

**특징:**
- 직접적인 URL 문자열 조합 방식
- subsystem과 operationId를 수동으로 결합
- 전역 객체 `webconsolejs` 사용

### Next.js: `apiPost` (client.ts)

**호출 방식:**
```typescript
import { apiPost } from '@/lib/api/client';
import { OPERATION_IDS } from '@/constants/api';

const response = await apiPost<Workspace[]>(
  OPERATION_IDS.LIST_WORKSPACES,
  requestData
);
```

**특징:**
- operationId만 전달하면 subsystem 자동 결정
- TypeScript 타입 안전성 보장
- Axios 인터셉터를 통한 자동 토큰 갱신

---

## 3. 세부 API 호출 패턴 비교

### 3.1 Workspace API

#### Buffalo: `workspace_api.js`

| 함수명 | OperationId | 호출 형태 |
|--------|------------|----------|
| `getAllWorksaceList()` | GetWorkspaceList | `/api/mc-iam-manager/GetWorkspaceList` |
| `getWorkspaceById(wsId)` | GetWorkspaceById | `/api/mc-iam-manager/GetWorkspaceById` |
| `createWorkspace(name, desc)` | CreateWorkspace | `/api/mc-iam-manager/CreateWorkspace` |
| `updateWorkspaceById(wsId, desc)` | UpdateWorkspaceById | `/api/mc-iam-manager/UpdateWorkspaceById` |
| `deleteWorkspaceById(wsId)` | DeleteWorkspaceById | `/api/mc-iam-manager/DeleteWorkspaceById` |

**Buffalo 예시 코드:**
```javascript
// workspace_api.js - 목록 조회
export async function getAllWorksaceList() {
  const controller = '/api/mc-iam-manager/GetWorkspaceList';
  const response = await webconsolejs["common/api/http"].commonAPIPost(
    controller,
    null,
    null
  );
  return response.data.responseData;
}

// workspace_api.js - 생성
export async function createWorkspace(name, description) {
  const controller = '/api/mc-iam-manager/CreateWorkspace';
  var data = {
    request: {
      "name": name,
      "description": description
    },
  };
  const response = await webconsolejs["common/api/http"].commonAPIPost(
    controller,
    data,
    null
  );
  return response.data.responseData;
}

// workspace_api.js - 단건 조회
export async function getWorkspaceById(wsId) {
  const controller = '/api/mc-iam-manager/GetWorkspaceById';
  var data = {
    pathParams: {
      workspaceId: wsId,
    },
  };
  const response = await webconsolejs["common/api/http"].commonAPIPost(
    controller,
    data
  );
  return response.data.responseData;
}
```

#### Next.js: `useWorkspaces.ts`

| Hook명 | OperationId | 호출 형태 |
|--------|------------|----------|
| `useWorkspaces()` | LIST_WORKSPACES | `apiPost(OPERATION_IDS.LIST_WORKSPACES, ...)` |
| `useWorkspace(id)` | GET_WORKSPACE | `apiPost(OPERATION_IDS.GET_WORKSPACE, ...)` |
| `useCreateWorkspace()` | CREATE_WORKSPACE | `apiPost(OPERATION_IDS.CREATE_WORKSPACE, ...)` |
| `useUpdateWorkspace()` | UPDATE_WORKSPACE | `apiPost(OPERATION_IDS.UPDATE_WORKSPACE, ...)` |
| `useDeleteWorkspace()` | DELETE_WORKSPACE | `apiPost(OPERATION_IDS.DELETE_WORKSPACE, ...)` |

**Next.js 예시 코드:**
```typescript
// useWorkspaces.ts - 목록 조회
export function useWorkspaces() {
  const { data, isLoading, error, refetch } = useQuery<Workspace[]>({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const requestData = {
        request: {},
      };

      const response = await apiPost<Workspace[]>(
        OPERATION_IDS.LIST_WORKSPACES,
        requestData
      );

      return response.responseData || [];
    },
    staleTime: 1000 * 60 * 5, // 5분
  });

  return {
    workspaces: data || [],
    isLoading,
    error,
    refetch,
  };
}

// useWorkspaces.ts - 생성
export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workspace: Omit<Workspace, 'id'>) => {
      const response = await apiPost<Workspace>(
        OPERATION_IDS.CREATE_WORKSPACE,
        {
          request: workspace,
        }
      );

      return response.responseData!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      toastSuccess('워크스페이스가 생성되었습니다.');
    },
  });
}

// useWorkspaces.ts - 단건 조회
export function useWorkspace(workspaceId: string | null) {
  const { data, isLoading, error } = useQuery<Workspace>({
    queryKey: ['workspace', workspaceId],
    queryFn: async () => {
      if (!workspaceId) {
        throw new Error('Workspace ID is required');
      }

      const response = await apiPost<Workspace>(
        OPERATION_IDS.GET_WORKSPACE,
        {
          request: {
            id: workspaceId,
          },
        }
      );

      return response.responseData!;
    },
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 5, // 5분
  });

  return {
    workspace: data,
    isLoading,
    error,
  };
}
```

---

### 3.2 MCI Workloads API

#### Buffalo: `mci_api.js`

| 함수명 | OperationId | 호출 형태 |
|--------|------------|----------|
| `getMciList(nsId)` | GetAllMci | `/api/mc-infra-manager/GetAllMci` |
| `getMci(nsId, mciId)` | GetMci | `/api/mc-infra-manager/GetMci` |
| `getMciVm(nsId, mciId, vmId)` | GetMciVm | `/api/mc-infra-manager/GetMciVm` |
| `mciLifeCycle(type, mciId, nsId)` | GetControlMci | `/api/mc-infra-manager/GetControlMci` |
| `mciDelete(mciId, nsId)` | Delmci | `/api/mc-infra-manager/Delmci` |
| `mciDynamic(name, desc, config, nsId)` | PostMciDynamic | `/api/mc-infra-manager/PostMciDynamic` |
| `vmDynamic(mciId, nsId, config)` | PostMciVmDynamic | `/api/mc-infra-manager/PostMciVmDynamic` |

**Buffalo 예시 코드:**
```javascript
// mci_api.js - 목록 조회
export async function getMciList(nsId) {
  if (nsId == "") {
    console.log("Project has not set");
    return;
  }

  var data = {
    pathParams: {
      nsId: nsId,
    },
  };

  var controller = "/api/mc-infra-manager/GetAllMci";
  const response = await webconsolejs["common/api/http"].commonAPIPost(
    controller,
    data
  );

  var mciList = response.data.responseData;
  return mciList;
}

// mci_api.js - 단건 조회
export async function getMci(nsId, mciId) {
  if (nsId == "" || nsId == undefined || mciId == undefined || mciId == "") {
    console.log(" undefined nsId: " + nsId + " mciId " + mciId);
    return;
  }
  const data = {
    pathParams: {
      nsId: nsId,
      mciId: mciId
    }
  };

  var controller = "/api/mc-infra-manager/GetMci";
  const response = await webconsolejs["common/api/http"].commonAPIPost(
    controller,
    data
  );

  return response.data;
}

// mci_api.js - 생성 (Dynamic)
export async function mciDynamic(mciName, mciDesc, Express_Server_Config_Arr, nsId) {
  var obj = {};
  obj['name'] = mciName;
  obj['description'] = mciDesc;
  obj['vm'] = Express_Server_Config_Arr;

  const data = {
    pathParams: {
      "nsId": nsId
    },
    Request: {
      "name": obj['name'],
      "description": obj['description'],
      "vm": obj['vm'],
    }
  };

  var controller = "/api/mc-infra-manager/PostMciDynamic";
  const response = webconsolejs["common/api/http"].commonAPIPost(
    controller,
    data
  );

  alert("생성요청 완료");
  window.location = "/webconsole/operations/manage/workloads/mciworkloads";
}
```

#### Next.js: `useMCIWorkloads.ts`

| Hook명 | OperationId | 호출 형태 |
|--------|------------|----------|
| `useMCIWorkloads(nsId)` | GET_ALL_MCI | `apiPost(OPERATION_IDS.GET_ALL_MCI, ...)` |
| `useMCIStatus(nsId)` | GET_MCI_STATUS | `apiPost(OPERATION_IDS.GET_MCI_STATUS, ...)` |
| `useServerStatus(nsId)` | GET_SERVER_STATUS | `apiPost(OPERATION_IDS.GET_SERVER_STATUS, ...)` |
| `useCreateMCIWorkload()` | CREATE_MCI_WORKLOAD | `apiPost(OPERATION_IDS.CREATE_MCI_WORKLOAD, ...)` |
| `useDeleteMCIWorkload()` | DELETE_MCI_WORKLOAD | `apiPost(OPERATION_IDS.DELETE_MCI_WORKLOAD, ...)` |

**Next.js 예시 코드:**
```typescript
// useMCIWorkloads.ts - 목록 조회
export function useMCIWorkloads(nsId?: string) {
  const { data, isLoading, error, refetch } = useQuery<MCIWorkload[]>({
    queryKey: ['mci-workloads', nsId],
    queryFn: async () => {
      if (!nsId) {
        return [];
      }

      const response = await apiPost<MCIWorkload[]>(
        OPERATION_IDS.GET_ALL_MCI,
        {
          pathParams: {
            nsId,
          },
        }
      );

      return response.responseData || [];
    },
    enabled: !!nsId, // nsId가 있을 때만 조회
    staleTime: 1000 * 60 * 2, // 2분
  });

  return {
    workloads: data || [],
    isLoading,
    error,
    refetch,
  };
}

// useMCIWorkloads.ts - 생성
export function useCreateMCIWorkload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: MCICreateRequest) => {
      const response = await apiPost<MCIWorkload>(
        OPERATION_IDS.CREATE_MCI_WORKLOAD,
        {
          request,
        }
      );

      return response.responseData!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mci-workloads'] });
      queryClient.invalidateQueries({ queryKey: ['mci-status'] });
      queryClient.invalidateQueries({ queryKey: ['server-status'] });
      toastSuccess('MCI Workload가 생성되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'MCI Workload 생성에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}
```

---

### 3.3 Disk API

#### Buffalo: `disk_api.js`

| 함수명 | OperationId | 호출 형태 |
|--------|------------|----------|
| `getCommonLookupDiskInfo(provider, conn)` | disklookup | `/api/disklookup` |

**Buffalo 예시 코드:**
```javascript
// disk_api.js - Disk 정보 조회
export async function getCommonLookupDiskInfo(provider, connectionName) {
  const data = {
    queryParams: {
      "provider": provider,
      "connectionName": connectionName
    }
  };

  var controller = "/api/disklookup";
  const response = await webconsolejs["common/api/http"].commonAPIPost(
    controller,
    data
  );

  console.log("lookup disk info response : ", response);
  var responseData = response.data.responseData;

  return responseData;
}
```

#### Next.js: `useDisks.ts`

| Hook명 | OperationId | 호출 형태 |
|--------|------------|----------|
| `useDisks(nsId)` | GET_DISK_LIST | `apiPost(OPERATION_IDS.GET_DISK_LIST, ...)` |
| `useDisk(nsId, diskId)` | GET_DISK | `apiPost(OPERATION_IDS.GET_DISK, ...)` |
| `useCreateDisk()` | CREATE_DISK | `apiPost(OPERATION_IDS.CREATE_DISK, ...)` |
| `useUpdateDisk()` | UPDATE_DISK | `apiPost(OPERATION_IDS.UPDATE_DISK, ...)` |
| `useDeleteDisk()` | DELETE_DISK | `apiPost(OPERATION_IDS.DELETE_DISK, ...)` |

**Next.js 예시 코드:**
```typescript
// useDisks.ts - 목록 조회
export function useDisks(nsId: string | null) {
  const { data, isLoading, error, refetch } = useQuery<Disk[]>({
    queryKey: ['disks', nsId],
    queryFn: async () => {
      if (!nsId) {
        throw new Error('Namespace ID is required');
      }

      const response = await apiPost<Disk[]>(
        OPERATION_IDS.GET_DISK_LIST,
        {
          pathParams: {
            nsId,
          },
          request: {},
        }
      );

      return response.responseData || [];
    },
    enabled: !!nsId,
    staleTime: 1000 * 60 * 5, // 5분
  });

  return {
    disks: data || [],
    isLoading,
    error,
    refetch,
  };
}

// useDisks.ts - 생성
export function useCreateDisk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nsId, disk }: { nsId: string; disk: Omit<Disk, 'id'> }) => {
      const response = await apiPost<Disk>(
        OPERATION_IDS.CREATE_DISK,
        {
          pathParams: {
            nsId,
          },
          request: disk,
        }
      );

      return response.responseData!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['disks', variables.nsId] });
      toastSuccess('Disk가 생성되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Disk 생성에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}
```

---

## 4. Request 데이터 구조 비교

### Buffalo Request 구조
```javascript
const data = {
  pathParams: {
    nsId: "namespace-id",
    mciId: "mci-id"
  },
  queryParams: {
    option: "id",
    filterVerified: true
  },
  request: {
    name: "example",
    description: "desc"
  }
};
```

### Next.js Request 구조
```typescript
const requestData = {
  pathParams: {
    nsId: "namespace-id",
    mciId: "mci-id"
  },
  queryParams: {
    option: "id",
    filterVerified: true
  },
  request: {
    name: "example",
    description: "desc"
  }
};

// client.ts가 자동으로 operationId 추가
const requestBody = {
  operationId: OPERATION_IDS.GET_ALL_MCI,
  ...requestData
};
```

**차이점:**
- Buffalo: 데이터 구조만 전달
- Next.js: `apiPost` 함수가 내부적으로 `operationId`를 자동 추가

---

## 5. 주요 차이점 및 개선 사항

### 5.1 타입 안전성
- **Buffalo**: JavaScript, 런타임 에러 가능
- **Next.js**: TypeScript, 컴파일 타임 타입 체크

### 5.2 상태 관리
- **Buffalo**: 수동 상태 관리, 직접 호출
- **Next.js**: React Query 자동 캐싱, 리페칭, 낙관적 업데이트

### 5.3 에러 처리
- **Buffalo**: 각 함수에서 개별 처리
```javascript
try {
  return { success: true, message: response.data.responseData };
} catch(error) {
  console.log(error);
  return { success: false, message: response.response.data.responseData };
}
```

- **Next.js**: 중앙 집중식 에러 처리
```typescript
// Axios 인터셉터에서 자동 처리
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 401 에러 시 자동 토큰 갱신
    if (error.response?.status === 401) {
      // refreshAccessToken() 호출
    }
    return Promise.reject(error);
  }
);

// Hook에서 에러 처리
onError: (error) => {
  handleError(error, {
    operationId: OPERATION_IDS.DELETE_WORKSPACE,
    fallbackMessage: '워크스페이스 삭제에 실패했습니다.',
  });
}
```

### 5.4 URL 생성 방식
- **Buffalo**: 수동 문자열 결합
```javascript
var controller = "/api/" + "mc-infra-manager/" + "GetAllMci";
```

- **Next.js**: 자동 subsystem 결정
```typescript
function getSubsystemName(operationId: string): string {
  if (mcIamManagerOperations.includes(operationId)) {
    return 'mc-iam-manager';
  }
  if (mcInfraManagerOperations.includes(operationId)) {
    return 'mc-infra-manager';
  }
  return '';
}

const path = subsystemName
  ? `/api/${subsystemName}/${operationId}`
  : `/api/${operationId}`;
```

### 5.5 인증 토큰 관리
- **Buffalo**: 수동 관리
- **Next.js**:
  - Axios 인터셉터에서 자동 토큰 첨부
  - 401 에러 시 자동 refresh token으로 갱신
  - 갱신 실패 시 자동 로그아웃 및 로그인 페이지 리다이렉션

---

## 6. 마이그레이션 가이드

### Buffalo API 함수를 Next.js Hook으로 변환하는 절차

1. **파일 생성**
   - `develop/front/src/hooks/api/use{Resource}.ts` 파일 생성

2. **operationId 상수 정의**
   - `develop/front/src/constants/api.ts`에 operationId 추가
   ```typescript
   export const OPERATION_IDS = {
     // ...
     GET_ALL_MCI: 'GetAllMci',
     CREATE_MCI: 'PostMciDynamic',
   } as const;
   ```

3. **subsystem 매핑**
   - `develop/front/src/lib/api/client.ts`의 `getSubsystemName()` 함수에 operationId 추가
   ```typescript
   const mcInfraManagerOperations: OperationId[] = [
     // ...
     OPERATION_IDS.GET_ALL_MCI,
     OPERATION_IDS.CREATE_MCI,
   ];
   ```

4. **Hook 구현**
   - 조회(GET): `useQuery` 사용
   - 생성/수정/삭제(POST/PUT/DELETE): `useMutation` 사용

5. **타입 정의**
   - `develop/front/src/types/{resource}.ts`에 TypeScript 타입 정의

### 변환 예시

**Buffalo:**
```javascript
// mci_api.js
export async function getMciList(nsId) {
  var data = {
    pathParams: { nsId: nsId },
  };
  var controller = "/api/mc-infra-manager/GetAllMci";
  const response = await webconsolejs["common/api/http"].commonAPIPost(
    controller,
    data
  );
  return response.data.responseData;
}
```

**Next.js:**
```typescript
// useMCIWorkloads.ts
export function useMCIWorkloads(nsId?: string) {
  const { data, isLoading, error, refetch } = useQuery<MCIWorkload[]>({
    queryKey: ['mci-workloads', nsId],
    queryFn: async () => {
      if (!nsId) return [];

      const response = await apiPost<MCIWorkload[]>(
        OPERATION_IDS.GET_ALL_MCI,
        { pathParams: { nsId } }
      );

      return response.responseData || [];
    },
    enabled: !!nsId,
    staleTime: 1000 * 60 * 2,
  });

  return { workloads: data || [], isLoading, error, refetch };
}
```

---

## 7. Buffalo vs Next.js API 매핑 테이블

### 전체 API 파일 매핑

| Buffalo 파일 | Next.js 파일 | 비고 |
|--------------|--------------|------|
| `workspace_api.js` | `useWorkspaces.ts` | Workspace, Project, User, Role 관리 |
| `mci_api.js` | `useMCIWorkloads.ts` | MCI 워크로드 관리 |
| `disk_api.js` | `useDisks.ts` | Disk 리소스 관리 |
| `vmimage_api.js` | `useImages.ts`, `useMyImages.ts` | 이미지 관리 |
| `monitoring_api.js` | `useMonitoringConfig.ts`, `useMCIsMonitoring.ts` | 모니터링 |
| `pmk_api.js` | `usePMKWorkloads.ts` | PMK 워크로드 |
| `eventalarm_api.js` | `useAlarms.ts`, `useLogs.ts` | 알람 및 로그 |
| `monitoringinfo_api.js` | `useCloudResourcesOverview.ts` | 리소스 개요 |
| `remotecmd_api.js` | (미구현) | 원격 명령 |

---

## 8. 체크리스트

마이그레이션 시 확인해야 할 사항:

- [ ] operationId가 constants/api.ts에 정의되어 있는가?
- [ ] subsystem 매핑이 client.ts의 getSubsystemName()에 추가되어 있는가?
- [ ] TypeScript 타입이 정의되어 있는가?
- [ ] React Query의 queryKey가 고유한가?
- [ ] 에러 처리가 구현되어 있는가?
- [ ] 성공 시 Toast 메시지가 표시되는가?
- [ ] mutation 성공 시 관련 쿼리가 invalidate되는가?
- [ ] pathParams, queryParams, request 구조가 올바른가?
- [ ] enabled 옵션이 필요한 경우 설정되어 있는가?
- [ ] staleTime이 적절하게 설정되어 있는가?

---

## 9. 결론

Next.js 마이그레이션을 통해:
- ✅ 타입 안전성 향상 (TypeScript)
- ✅ 자동 캐싱 및 상태 관리 (React Query)
- ✅ 중앙 집중식 에러 처리
- ✅ 자동 토큰 갱신
- ✅ 코드 재사용성 향상 (Custom Hooks)
- ✅ 개발자 경험 개선 (DX)

Buffalo의 수동적인 API 호출 방식에서 Next.js의 선언적이고 자동화된 방식으로 개선되었습니다.
