'use client';

import { Workspace } from '@/types/workspace';

interface WorkspaceDetailsTabProps {
  workspace: Workspace;
}

/**
 * 워크스페이스 상세 정보 탭 컴포넌트
 */
export function WorkspaceDetailsTab({ workspace }: WorkspaceDetailsTabProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-muted-foreground">ID</label>
        <p className="text-sm">{workspace.id}</p>
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">이름</label>
        <p className="text-sm font-medium">{workspace.name}</p>
      </div>
      {workspace.description && (
        <div>
          <label className="text-sm font-medium text-muted-foreground">설명</label>
          <p className="text-sm">{workspace.description}</p>
        </div>
      )}
    </div>
  );
}
