# Workspace/Project 선택 로직 비교: Buffalo vs Next.js

## 개요
MCI Workloads 화면에서 Workspace 선택 시 Project 목록을 가져오는 로직 비교 분석

---

## 1. 전체 흐름 비교

### Buffalo (front-buffalo)
```
페이지 로드
  ↓
initMci() 실행
  ↓
workspaceProjectInit() 호출 (navbar.js)
  ↓
localStorage에서 workspace/project 정보 조회
  ↓
Workspace 선택박스 설정
  ↓
(Workspace가 있으면) Project 목록 조회 및 선택박스 설정
  ↓
sessionStorage에 현재 workspace/project 저장
  ↓
currentNsId를 이용해 MCI 목록 조회
```

### Next.js (front)
```
페이지 컴포넌트 마운트
  ↓
WorkspaceProjectSelector 컴포넌트 렌더링
  ↓
useUserWorkspaces() Hook으로 워크스페이스 목록 조회 (React Query)
  ↓
사용자가 Workspace 선택
  ↓
onWorkspaceChange 핸들러 실행
  ↓
selectedWorkspaceId 상태 업데이트
  ↓
useWorkspaceProjects(selectedWorkspaceId) Hook이 자동 실행
  ↓
Project 목록 조회 (React Query)
  ↓
사용자가 Project 선택
  ↓
onProjectChange 핸들러 실행
  ↓
selectedProjectId 상태 업데이트
  ↓
nsId 추출 (projects 배열에서 find)
  ↓
useMCIWorkloads(nsId) Hook이 자동 실행
  ↓
MCI 목록 조회 (React Query)
```

---

## 2. 파일 구조 비교

### Buffalo

| 파일 | 역할 |
|------|------|
| `templates/pages/operations/manage/workloads/mciworkloads.html` | 페이지 템플릿 (HTML) |
| `assets/js/pages/operation/manage/mci.js` | 페이지 로직 (JavaScript) |
| `assets/js/partials/layout/navbar.js` | Navbar의 Workspace/Project 선택 로직 |
| `assets/js/common/api/services/workspace_api.js` | Workspace/Project API 함수 |
| `assets/js/common/api/services/mci_api.js` | MCI API 함수 |

### Next.js

| 파일 | 역할 |
|------|------|
| `src/app/(dashboard)/operations/manage/workloads/mciworkloads/page.tsx` | 페이지 컴포넌트 (React) |
| `src/components/mci-workloads/WorkspaceProjectSelector.tsx` | Workspace/Project 선택 컴포넌트 |
| `src/hooks/api/useWorkspaces.ts` | Workspace API Hook |
| `src/hooks/api/useProjects.ts` | Project API Hook |
| `src/hooks/api/useMCIWorkloads.ts` | MCI API Hook |

---

## 3. 상세 로직 비교

### 3.1 Buffalo: Workspace 선택 시 Project 목록 조회

#### navbar.js (30-40줄)
```javascript
// Workspace 선택 이벤트 핸들러
workspaceListselectBox.addEventListener('change', function () {
    if (this.value === ""){
        this.classList.add('is-invalid');
        return
    }else{
        this.classList.remove('is-invalid');
    }
    let workspace = {
        "Id": this.value,
        "Name": this.options[this.selectedIndex].text
    }
    webconsolejs["common/api/services/workspace_api"].setCurrentWorkspace(workspace); // 세션에 저장
    setPrjSelectBox(workspace.Id); // Project 목록 조회 및 셀렉트박스 설정
});
```

#### navbar.js (60-83줄) - setPrjSelectBox 함수
```javascript
export async function setPrjSelectBox(workspaceId) {
    // API 호출: Workspace ID로 Project 목록 조회
    let projectList = await webconsolejs["common/api/services/workspace_api"]
        .getProjectListByWorkspaceId(workspaceId);

    console.log("projectList ", projectList);

    // 기존 옵션 제거
    while (projectListselectBox.options.length > 0) {
        projectListselectBox.remove(0);
    }

    // 기본 옵션 추가
    const defaultOpt = document.createElement("option");
    defaultOpt.value = ""
    defaultOpt.textContent = "Please select a project";
    projectListselectBox.appendChild(defaultOpt);

    // Project 목록을 옵션으로 추가
    let curProjectId = webconsolejs["common/api/services/workspace_api"]
        .getCurrentProject()?.Id;

    for (const p in projectList) {
        const opt = document.createElement("option");
        opt.value = projectList[p].id;
        opt.textContent = projectList[p].name;
        projectListselectBox.appendChild(opt);

        // 현재 선택된 Project가 있으면 selected 설정
        if (curProjectId != "" && projectList[p].id == curProjectId) {
            opt.setAttribute("selected", "selected");
        }
    }
}
```

#### workspace_api.js (84-104줄) - getProjectListByWorkspaceId
```javascript
export async function getProjectListByWorkspaceId(workspaceId) {
  console.debug("getProjectListByWorkspaceId", workspaceId);

  let requestObject = {
    "pathParams": {
      "workspaceId": workspaceId
    }
  };

  let projectList = [];

  // API 호출: GetWPmappingListByWorkspaceId
  const response = await webconsolejs["common/api/http"].commonAPIPost(
    '/api/mc-iam-manager/getwpmappinglistbyworkspaceid',
    requestObject
  );

  let data = response.data.responseData.projects;
  console.debug("GetWPmappingListByWorkspaceId data :", data);

  data.forEach(item => {
    console.debug(item);
    projectList.push(item);
  });

  return projectList;
}
```

#### mci.js (4-16줄) - Project 선택 시 MCI 목록 조회
```javascript
// Project 선택 이벤트 핸들러
$("#select-current-project").on('change', async function () {
  console.log("select-current-project changed ");

  let project = {
    "Id": this.value,
    "Name": this.options[this.selectedIndex].text,
    "NsId": this.options[this.selectedIndex].text  // NsId는 Project의 text 값 사용
  };

  if (this.value == "") return;

  // 세션에 현재 Project 저장
  webconsolejs["common/api/services/workspace_api"].setCurrentProject(project);
  console.log("select-current-project on change ", project);

  // 현재 NsId 업데이트
  currentNsId = webconsolejs["common/api/services/workspace_api"].getCurrentProject()?.NsId;

  // MCI 목록 조회
  var respMciList = await webconsolejs["common/api/services/mci_api"].getMciList(project.NsId);
  getMciListCallbackSuccess(project.NsId, respMciList);
});
```

#### mci.js (54-92줄) - 페이지 초기화
```javascript
async function initMci() {
  initMciTable(); // Tabulator 테이블 초기화
  console.log("initMci");

  try {
    webconsolejs["partials/operation/manage/mcicreate"].initMciCreate();

    const targetSection = "mcicreate";
    const createBtnName = "Add Mci";
    webconsolejs['partials/layout/navigatePages'].addPageHeaderButton(targetSection, createBtnName);
  } catch (e) {
    console.log(e);
  }

  // 1. Workspace/Project 초기화 (localStorage에서 가져오기)
  selectedWorkspaceProject = await webconsolejs["partials/layout/navbar"].workspaceProjectInit();

  // 2. Workspace/Project 선택 체크
  webconsolejs["partials/layout/modal"].checkWorkspaceSelection(selectedWorkspaceProject);

  // 3. 현재 NsId 가져오기
  currentNsId = webconsolejs["common/api/services/workspace_api"].getCurrentProject()?.NsId;

  // 4. URL 파라미터 처리 (특정 MCI 선택)
  const url = window.location.href;
  const urlObj = new URL(url);
  const params = new URLSearchParams(urlObj.search);
  var selectedMciID = params.get('mciID');

  console.log('selectedMciID:', selectedMciID);
  if (selectedMciID) {
    currentMciId = selectedMciID;
    toggleRowSelection(selectedMciID);
  }

  // 5. MCI 목록 새로고침
  refreshMciList();

  // Policy 탭 초기화
  const policyTabEl = document.querySelector('a[data-bs-toggle="tab"][href="#tabs-mci-policy"]');
  policyTabEl.addEventListener('shown.bs.tab', function (event) {
    initPolicyPage();
  });
}
```

---

### 3.2 Next.js: Workspace 선택 시 Project 목록 자동 조회

#### page.tsx (29-54줄) - 상태 관리 및 자동 조회
```typescript
export default function MCIWorkloadsPage() {
  const [selectedWorkload, setSelectedWorkload] = useState<MCIWorkload | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  // 1. 선택된 Workspace의 Project 목록 조회 (자동)
  //    selectedWorkspaceId가 변경되면 자동으로 재조회
  const { projects } = useWorkspaceProjects(selectedWorkspaceId);

  // 2. 선택된 Project에서 ns_id 추출
  const selectedProject = Array.isArray(projects)
    ? projects.find((p) => p.id === selectedProjectId)
    : undefined;
  const nsId = selectedProject?.ns_id;

  // 3. nsId로 MCI 목록 조회 (자동)
  //    nsId가 변경되면 자동으로 재조회
  const { workloads, isLoading, refetch } = useMCIWorkloads(nsId);
  const { mciStatus, isLoading: isStatusLoading } = useMCIStatus(nsId);
  const { serverStatus, isLoading: isServerStatusLoading } = useServerStatus(nsId);
  const createMutation = useCreateMCIWorkload();
  const deleteMutation = useDeleteMCIWorkload();

  // 4. Workspace 변경 시 Project 선택 초기화
  useEffect(() => {
    if (selectedWorkspaceId) {
      setSelectedProjectId('');
    }
  }, [selectedWorkspaceId]);
```

#### WorkspaceProjectSelector.tsx - Workspace/Project 선택 컴포넌트
```typescript
export function WorkspaceProjectSelector({
  selectedWorkspaceId,
  selectedProjectId,
  onWorkspaceChange,
  onProjectChange,
  className,
}: WorkspaceProjectSelectorProps) {
  // 1. 사용자에게 할당된 Workspace 목록 조회 (자동)
  const { workspaces, isLoading: isWorkspacesLoading } = useUserWorkspaces();

  // 2. 선택된 Workspace의 Project 목록 조회 (자동)
  //    selectedWorkspaceId가 변경되면 자동으로 재조회
  const { projects, isLoading: isProjectsLoading } = useWorkspaceProjects(selectedWorkspaceId);

  // 3. Workspace 옵션 생성
  const workspaceOptions = workspaces.map((workspace: Workspace) => ({
    value: workspace.id,
    label: workspace.name,
  }));

  // 4. Project 옵션 생성
  const projectOptions = projects.map((project: Project) => ({
    value: project.id,
    label: project.name,
  }));

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className || ''}`}>
      {/* Workspace 선택 */}
      <FormSelect
        label="Workspace"
        value={selectedWorkspaceId || ''}
        onChange={onWorkspaceChange} // 부모 컴포넌트의 핸들러 호출
        options={workspaceOptions}
        placeholder="Workspace 선택"
        disabled={isWorkspacesLoading}
        helperText={
          isWorkspacesLoading
            ? 'Workspace 목록 조회 중...'
            : workspaceOptions.length === 0
              ? '할당된 Workspace가 없습니다.'
              : undefined
        }
        required
      />

      {/* Project 선택 */}
      <FormSelect
        label="Project"
        value={selectedProjectId || ''}
        onChange={onProjectChange} // 부모 컴포넌트의 핸들러 호출
        options={projectOptions}
        placeholder={selectedWorkspaceId ? 'Project 선택' : 'Workspace를 먼저 선택하세요'}
        disabled={!selectedWorkspaceId || isProjectsLoading}
        helperText={
          !selectedWorkspaceId
            ? 'Workspace를 먼저 선택하세요'
            : isProjectsLoading
              ? 'Project 목록 조회 중...'
              : projectOptions.length === 0
                ? 'Project가 없습니다.'
                : undefined
        }
        required
      />
    </div>
  );
}
```

#### useProjects.ts (12-52줄) - useWorkspaceProjects Hook
```typescript
export function useWorkspaceProjects(workspaceId?: string): {
  projects: Project[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const { data, isLoading, error, refetch } = useQuery<Project[]>({
    queryKey: ['workspace-projects', workspaceId],
    queryFn: async () => {
      if (!workspaceId) {
        return [];
      }

      // GetWPmappingListByWorkspaceId API 호출
      const response = await apiPost<any>(
        OPERATION_IDS.GET_WORKSPACE_PROJECTS_BY_WORKSPACE_ID,
        {
          pathParams: {
            workspaceId: workspaceId,
          },
        }
      );

      // response.responseData.projects 배열 추출
      const projects = response.responseData?.projects;
      return Array.isArray(projects) ? projects : [];
    },
    enabled: !!workspaceId, // workspaceId가 있을 때만 조회
    staleTime: 1000 * 60 * 5, // 5분간 캐시
  });

  // 안전하게 배열 반환 보장
  const projectsArray = Array.isArray(data) ? data : [];

  return {
    projects: projectsArray,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
```

#### page.tsx (218-225줄) - 핸들러 함수
```typescript
const handleWorkspaceChange = (workspaceId: string) => {
  setSelectedWorkspaceId(workspaceId);
  // selectedWorkspaceId 변경 → useWorkspaceProjects 자동 실행 → Project 목록 조회
};

const handleProjectChange = (projectId: string) => {
  setSelectedProjectId(projectId);
  // selectedProjectId 변경 → nsId 자동 추출 → useMCIWorkloads 자동 실행 → MCI 목록 조회
};
```

---

## 4. 주요 차이점

### 4.1 상태 관리

| Buffalo | Next.js |
|---------|---------|
| sessionStorage에 수동 저장/조회 | React 컴포넌트 state 자동 관리 |
| `setCurrentWorkspace()` / `getCurrentWorkspace()` | `useState()` Hook |
| 전역 변수 사용 (`currentNsId`) | 로컬 state 및 props 전달 |
| 페이지 로드 시 localStorage에서 복원 | React Query 자동 캐싱 |

**Buffalo 예시:**
```javascript
// 세션에 저장
webconsolejs["common/api/services/workspace_api"].setCurrentWorkspace(workspace);

// 세션에서 가져오기
let curWorkspace = webconsolejs["common/api/services/workspace_api"].getCurrentWorkspace();
```

**Next.js 예시:**
```typescript
// React state로 관리
const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');

// 값 설정
setSelectedWorkspaceId(workspaceId);
```

### 4.2 데이터 조회 방식

| Buffalo | Next.js |
|---------|---------|
| 수동 API 호출 및 DOM 업데이트 | React Query 자동 캐싱 및 재조회 |
| 이벤트 핸들러에서 직접 호출 | Hook dependency 변경 시 자동 실행 |
| 로딩 상태 수동 관리 | `isLoading` 자동 제공 |
| 에러 처리 수동 | `error` 자동 제공 |

**Buffalo 예시:**
```javascript
// Workspace 선택 시 수동으로 Project 목록 조회
workspaceListselectBox.addEventListener('change', function () {
  let workspace = { "Id": this.value, "Name": this.options[this.selectedIndex].text }
  webconsolejs["common/api/services/workspace_api"].setCurrentWorkspace(workspace);

  // 수동으로 API 호출
  setPrjSelectBox(workspace.Id);
});

async function setPrjSelectBox(workspaceId) {
  // 수동으로 API 호출 및 DOM 업데이트
  let projectList = await webconsolejs["common/api/services/workspace_api"]
    .getProjectListByWorkspaceId(workspaceId);

  // DOM 직접 조작
  while (projectListselectBox.options.length > 0) {
    projectListselectBox.remove(0);
  }

  for (const p in projectList) {
    const opt = document.createElement("option");
    opt.value = projectList[p].id;
    opt.textContent = projectList[p].name;
    projectListselectBox.appendChild(opt);
  }
}
```

**Next.js 예시:**
```typescript
// Workspace 선택 시 state만 업데이트
const handleWorkspaceChange = (workspaceId: string) => {
  setSelectedWorkspaceId(workspaceId);
  // 이후 자동 처리:
  // 1. useWorkspaceProjects Hook이 자동으로 감지
  // 2. React Query가 API 호출
  // 3. projects state 자동 업데이트
  // 4. 컴포넌트 자동 리렌더링
};

// Hook이 자동으로 조회
const { projects, isLoading } = useWorkspaceProjects(selectedWorkspaceId);
```

### 4.3 의존성 관리

| Buffalo | Next.js |
|---------|---------|
| 순차적 실행 (async/await) | 선언적 의존성 (React Query) |
| 수동 연쇄 호출 | 자동 연쇄 조회 |
| 에러 시 수동 처리 | 에러 시 자동 fallback |

**Buffalo 흐름:**
```javascript
// 1. Workspace 선택
workspaceListselectBox.addEventListener('change', function () {
  setPrjSelectBox(workspace.Id); // 수동 호출
});

// 2. Project 목록 조회
async function setPrjSelectBox(workspaceId) {
  let projectList = await getProjectListByWorkspaceId(workspaceId);
  // DOM 업데이트
}

// 3. Project 선택
$("#select-current-project").on('change', async function () {
  var respMciList = await getMciList(project.NsId); // 수동 호출
  getMciListCallbackSuccess(project.NsId, respMciList);
});
```

**Next.js 흐름:**
```typescript
// 1. Workspace 선택 → state 업데이트
setSelectedWorkspaceId(workspaceId);

// 2. useWorkspaceProjects Hook이 자동 감지 및 조회
const { projects } = useWorkspaceProjects(selectedWorkspaceId);

// 3. Project 선택 → state 업데이트
setSelectedProjectId(projectId);

// 4. nsId 자동 추출
const nsId = projects.find(p => p.id === selectedProjectId)?.ns_id;

// 5. useMCIWorkloads Hook이 자동 감지 및 조회
const { workloads } = useMCIWorkloads(nsId);
```

### 4.4 DOM 조작

| Buffalo | Next.js |
|---------|---------|
| jQuery 및 직접 DOM 조작 | React 가상 DOM 자동 관리 |
| `appendChild()`, `remove()` 수동 호출 | JSX 선언적 렌더링 |
| 이벤트 리스너 수동 등록 | React 이벤트 자동 바인딩 |

**Buffalo 예시:**
```javascript
// 직접 DOM 조작
while (projectListselectBox.options.length > 0) {
  projectListselectBox.remove(0);
}

const defaultOpt = document.createElement("option");
defaultOpt.value = "";
defaultOpt.textContent = "Please select a project";
projectListselectBox.appendChild(defaultOpt);

for (const p in projectList) {
  const opt = document.createElement("option");
  opt.value = projectList[p].id;
  opt.textContent = projectList[p].name;
  projectListselectBox.appendChild(opt);
}
```

**Next.js 예시:**
```typescript
// JSX로 선언적 렌더링 (자동 업데이트)
<FormSelect
  label="Project"
  value={selectedProjectId || ''}
  onChange={onProjectChange}
  options={projectOptions} // projects 배열이 자동으로 옵션으로 변환
  placeholder={selectedWorkspaceId ? 'Project 선택' : 'Workspace를 먼저 선택하세요'}
  disabled={!selectedWorkspaceId || isProjectsLoading}
/>
```

### 4.5 API 호출 횟수

| Buffalo | Next.js |
|---------|---------|
| 중복 호출 가능 (캐싱 없음) | React Query 자동 캐싱 (5분) |
| 페이지 새로고침 시 재조회 | staleTime 동안 캐시 사용 |
| 수동 새로고침 버튼 필요 | `refetch()` 함수 제공 |

**Buffalo:**
- Workspace 선택할 때마다 API 호출
- 같은 Workspace 여러 번 선택해도 매번 API 호출
- localStorage에 저장하여 페이지 새로고침 시에도 사용

**Next.js:**
- Workspace 선택 시 React Query 캐시 확인
- staleTime(5분) 내에는 캐시된 데이터 사용
- 5분 후 자동으로 백그라운드 재조회

### 4.6 에러 처리

| Buffalo | Next.js |
|---------|---------|
| try-catch 수동 처리 | React Query 자동 에러 상태 |
| 에러 시 alert() 또는 console.log() | 에러 UI 자동 표시 |
| 에러 복구 수동 | `refetch()` 자동 재시도 |

**Buffalo 예시:**
```javascript
async function setPrjSelectBox(workspaceId) {
  try {
    let projectList = await getProjectListByWorkspaceId(workspaceId);
    // ...
  } catch (error) {
    console.error("Failed to load projects:", error);
    alert("Project 목록을 불러오는데 실패했습니다.");
  }
}
```

**Next.js 예시:**
```typescript
const { projects, isLoading, error } = useWorkspaceProjects(selectedWorkspaceId);

// UI에서 자동 표시
{error && (
  <div className="text-destructive">
    Project 목록을 불러오는데 실패했습니다.
  </div>
)}
```

---

## 5. API 호출 비교

### Buffalo: GetWPmappingListByWorkspaceId

**API 엔드포인트:**
```
POST /api/mc-iam-manager/getwpmappinglistbyworkspaceid
```

**Request:**
```javascript
{
  "pathParams": {
    "workspaceId": "workspace-123"
  }
}
```

**Response:**
```javascript
{
  "status": {
    "code": 200
  },
  "responseData": {
    "projects": [
      {
        "id": "project-1",
        "name": "Project 1",
        "ns_id": "ns-1"
      },
      {
        "id": "project-2",
        "name": "Project 2",
        "ns_id": "ns-2"
      }
    ]
  }
}
```

### Next.js: GetWPmappingListByWorkspaceId

**API 엔드포인트:**
```
POST /api/mc-iam-manager/GetWPmappingListByWorkspaceId
```

**Request:**
```typescript
{
  "operationId": "GetWPmappingListByWorkspaceId",
  "pathParams": {
    "workspaceId": "workspace-123"
  }
}
```

**Response:**
```typescript
{
  "status": {
    "code": 200
  },
  "responseData": {
    "projects": [
      {
        "id": "project-1",
        "name": "Project 1",
        "ns_id": "ns-1"
      },
      {
        "id": "project-2",
        "name": "Project 2",
        "ns_id": "ns-2"
      }
    ]
  }
}
```

**주요 차이점:**
- **Buffalo와 Next.js 모두 동일한 API 사용**: `GetWPmappingListByWorkspaceId`
- Buffalo: 직접 API 호출 및 DOM 조작
- Next.js: React Query Hook으로 자동 캐싱 및 상태 관리
- Buffalo: sessionStorage에 수동 저장
- Next.js: React Query 캐시 자동 관리 (staleTime: 5분)

---

## 6. 실행 순서 비교 (시퀀스)

### Buffalo

```
사용자 액션: Workspace 선택
  ↓
[navbar.js] workspaceListselectBox 'change' 이벤트 발생
  ↓
[navbar.js] workspace 객체 생성 { Id, Name }
  ↓
[workspace_api.js] setCurrentWorkspace(workspace) → sessionStorage 저장
  ↓
[navbar.js] setPrjSelectBox(workspace.Id) 호출
  ↓
[workspace_api.js] getProjectListByWorkspaceId(workspaceId) API 호출
  ↓
[backend] POST /api/mc-iam-manager/getwpmappinglistbyworkspaceid
  ↓
[workspace_api.js] response.data.responseData.projects 반환
  ↓
[navbar.js] projectListselectBox DOM 직접 조작
  - 기존 옵션 모두 제거
  - 새 옵션 추가 (projects 배열 순회)
  ↓
사용자 액션: Project 선택
  ↓
[mci.js] $("#select-current-project") 'change' 이벤트 발생
  ↓
[mci.js] project 객체 생성 { Id, Name, NsId }
  ↓
[workspace_api.js] setCurrentProject(project) → sessionStorage 저장
  ↓
[mci.js] currentNsId = getCurrentProject()?.NsId
  ↓
[mci_api.js] getMciList(project.NsId) API 호출
  ↓
[backend] POST /api/mc-infra-manager/GetAllMci
  ↓
[mci_api.js] response.data.responseData 반환
  ↓
[mci.js] getMciListCallbackSuccess(project.NsId, respMciList)
  ↓
[mci.js] Tabulator 테이블 업데이트
```

### Next.js

```
컴포넌트 마운트
  ↓
[useUserWorkspaces] React Query 자동 실행
  ↓
[backend] POST /api/mc-iam-manager/ListUserWorkspaces
  ↓
[useUserWorkspaces] workspaces state 업데이트
  ↓
[WorkspaceProjectSelector] workspaces 배열로 옵션 자동 생성
  ↓
사용자 액션: Workspace 선택
  ↓
[WorkspaceProjectSelector] onChange 이벤트 발생
  ↓
[page.tsx] handleWorkspaceChange(workspaceId) 호출
  ↓
[page.tsx] setSelectedWorkspaceId(workspaceId) 실행
  ↓
[React] selectedWorkspaceId state 업데이트
  ↓
[useWorkspaceProjects] selectedWorkspaceId 변경 감지 (React Query)
  ↓
[useWorkspaceProjects] queryFn 자동 실행
  ↓
[backend] POST /api/mc-iam-manager/GetWorkspace
  ↓
[useWorkspaceProjects] workspace.projects 추출
  ↓
[useWorkspaceProjects] projects state 업데이트 (React Query)
  ↓
[WorkspaceProjectSelector] projects 배열로 옵션 자동 생성
  ↓
[page.tsx] useEffect 실행 → setSelectedProjectId('') 초기화
  ↓
사용자 액션: Project 선택
  ↓
[WorkspaceProjectSelector] onChange 이벤트 발생
  ↓
[page.tsx] handleProjectChange(projectId) 호출
  ↓
[page.tsx] setSelectedProjectId(projectId) 실행
  ↓
[React] selectedProjectId state 업데이트
  ↓
[page.tsx] projects.find(p => p.id === selectedProjectId) 실행
  ↓
[page.tsx] nsId = selectedProject?.ns_id 추출
  ↓
[useMCIWorkloads] nsId 변경 감지 (React Query)
  ↓
[useMCIWorkloads] queryFn 자동 실행
  ↓
[backend] POST /api/mc-infra-manager/GetAllMci
  ↓
[useMCIWorkloads] workloads state 업데이트 (React Query)
  ↓
[page.tsx] CrudPageTemplate에 workloads 자동 전달
  ↓
[CrudPageTemplate] 테이블 자동 렌더링
```

---

## 7. 장단점 비교

### Buffalo 방식

**장점:**
- 직접적인 제어 가능
- 디버깅이 명시적
- 레거시 코드와 호환

**단점:**
- 수동 상태 관리 (sessionStorage)
- DOM 직접 조작으로 인한 복잡도
- 중복 API 호출 가능 (캐싱 없음)
- 에러 처리 수동
- 코드 재사용성 낮음
- 테스트 어려움

### Next.js 방식

**장점:**
- 선언적 코드 (읽기 쉬움)
- React Query 자동 캐싱 (성능 향상)
- 상태 자동 관리
- 에러 처리 자동
- 로딩 상태 자동 제공
- 코드 재사용성 높음 (Hook)
- 테스트 용이

**단점:**
- React Query 학습 필요
- 복잡한 의존성 체인 디버깅 어려울 수 있음
- 초기 설정 복잡

---

## 8. 마이그레이션 체크리스트

Buffalo → Next.js 마이그레이션 시 확인 사항:

- [ ] sessionStorage 사용 → React state로 변경
- [ ] DOM 직접 조작 → JSX 선언적 렌더링으로 변경
- [ ] 이벤트 리스너 수동 등록 → React 이벤트 핸들러로 변경
- [ ] 수동 API 호출 → React Query Hook으로 변경
- [ ] 순차적 async/await → 선언적 의존성으로 변경
- [ ] try-catch 에러 처리 → React Query 자동 에러 처리로 변경
- [ ] 로딩 상태 수동 관리 → isLoading 자동 제공
- [ ] 캐싱 없음 → staleTime 설정으로 자동 캐싱
- [ ] API 응답 직접 파싱 → TypeScript 타입으로 안전하게 처리
- [ ] 전역 변수 사용 → props 및 state로 변경

---

## 9. 결론

### Buffalo의 명령형 프로그래밍
- "어떻게(How)" 동작할지 명시
- 순서대로 실행
- 개발자가 모든 과정 제어

### Next.js의 선언형 프로그래밍
- "무엇을(What)" 보여줄지 선언
- React가 자동으로 최적화
- 데이터 흐름에 집중

### 핵심 개선 사항
1. **자동화된 데이터 흐름**: Workspace 선택 → Project 목록 자동 조회 → Project 선택 → MCI 목록 자동 조회
2. **캐싱 최적화**: 동일 요청 시 캐시된 데이터 사용 (5분)
3. **타입 안전성**: TypeScript로 컴파일 타임 에러 방지
4. **코드 간결성**: Hook 재사용으로 코드량 감소
5. **유지보수성**: 선언적 코드로 가독성 향상

Buffalo의 절차적 방식에서 Next.js의 선언적 방식으로 전환하면서,
개발자는 "어떻게 할지"보다 "무엇을 보여줄지"에 집중할 수 있게 되었습니다.
