'use client';

interface WorkspaceCostAnalyticsTabProps {
  workspaceId: string;
}

/**
 * 워크스페이스 Cost Analytics 탭 컴포넌트
 * TODO: 실제 비용 분석 데이터 연동 필요
 */
export function WorkspaceCostAnalyticsTab({ workspaceId }: WorkspaceCostAnalyticsTabProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">
          비용 분석 기능은 개발 예정입니다.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Workspace ID: {workspaceId}
        </p>
      </div>
    </div>
  );
}
