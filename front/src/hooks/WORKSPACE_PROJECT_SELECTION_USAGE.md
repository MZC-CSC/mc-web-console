# Workspace/Project 선택 공통 사용 가이드

모든 화면에서 Workspace와 Project 선택 시 자동으로 localStorage에 저장하고, 페이지 로드 시 복원하는 기능을 제공합니다.

## 기본 사용법

### 1. 공통 Hook 사용

```typescript
import { useWorkspaceProjectSelection } from '@/hooks/useWorkspaceProjectSelection';
import { WorkspaceProjectSelector } from '@/components/common/WorkspaceProjectSelector';
import { Card } from '@/components/ui/card';

export default function YourPage() {
  // Workspace/Project 선택 및 복원 (공통 Hook 사용)
  const {
    selectedWorkspaceId,
    selectedProjectId,
    selectedProject,
    isWorkspaceProjectSelected,
    handleWorkspaceChange,
    handleProjectChange,
  } = useWorkspaceProjectSelection();

  // 선택된 project의 ns_id 사용
  const nsId = selectedProject?.ns_id;

  // API 호출 (예시)
  const { data, isLoading } = useYourData(nsId);

  return (
    <div className="space-y-6">
      {/* Workspace/Project 선택 */}
      <Card className="p-6">
        <WorkspaceProjectSelector
          selectedWorkspaceId={selectedWorkspaceId}
          selectedProjectId={selectedProjectId}
          onWorkspaceChange={handleWorkspaceChange}
          onProjectChange={handleProjectChange}
        />
      </Card>

      {/* 선택 안내 (선택사항) */}
      {!isWorkspaceProjectSelected && (
        <Card className="p-4 bg-muted/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">안내:</span>
            <span>
              {!selectedWorkspaceId
                ? '데이터를 조회하려면 Workspace를 선택하세요.'
                : !selectedProjectId
                  ? '데이터를 조회하려면 Project를 선택하세요.'
                  : ''}
            </span>
          </div>
        </Card>
      )}

      {/* 데이터 표시 (Project 선택 시에만) */}
      {isWorkspaceProjectSelected && (
        <YourDataComponent data={data} isLoading={isLoading} />
      )}
    </div>
  );
}
```

## Hook 반환값

### 상태
- `selectedWorkspaceId`: 선택된 Workspace ID
- `selectedProjectId`: 선택된 Project ID
- `selectedProject`: 선택된 Project 객체 (ns_id 포함)
- `workspaces`: 사용자에게 할당된 Workspace 목록
- `projects`: 선택된 Workspace의 Project 목록
- `isWorkspaceProjectSelected`: Workspace와 Project가 모두 선택되었는지 여부

### 핸들러
- `handleWorkspaceChange`: Workspace 변경 핸들러 (자동으로 localStorage에 저장)
- `handleProjectChange`: Project 변경 핸들러 (자동으로 localStorage에 저장)
- `setSelectedWorkspaceId`: Workspace ID 직접 설정 (필요한 경우)
- `setSelectedProjectId`: Project ID 직접 설정 (필요한 경우)

## 자동 기능

1. **자동 저장**: Workspace/Project 선택 시 자동으로 localStorage에 저장
2. **자동 복원**: 페이지 로드 시 저장된 값 자동 복원
3. **유효성 검증**: 복원 시 현재 목록에 존재하는지 확인
4. **자동 초기화**: Workspace 변경 시 Project 자동 초기화

## 예외 처리

예외가 필요한 화면에서는 직접 수정할 수 있습니다:

```typescript
// 예: 기본 동작을 오버라이드하고 싶은 경우
const {
  selectedWorkspaceId,
  selectedProjectId,
  setSelectedWorkspaceId,
  setSelectedProjectId,
  // ... 기타
} = useWorkspaceProjectSelection();

// 커스텀 핸들러
const handleCustomWorkspaceChange = (workspaceId: string) => {
  // 커스텀 로직 추가
  setSelectedWorkspaceId(workspaceId);
  // 추가 작업...
};
```

## 참고

- MCI Workloads 페이지가 기본 사용 예시입니다: `app/(dashboard)/operations/manage/workloads/mciworkloads/page.tsx`
- WorkspaceProjectSelector 컴포넌트: `components/common/WorkspaceProjectSelector.tsx`
