'use client';

import { useWorkspaceRoles } from '@/hooks/api/useWorkspaceRoles';
import { CrudTable } from '@/components/templates/CrudTable';
import { ColumnDef } from '@tanstack/react-table';
import { Role } from '@/types/workspace';

interface WorkspaceRolesTabProps {
  workspaceId: string;
}

/**
 * 워크스페이스 Roles 탭 컴포넌트
 */
export function WorkspaceRolesTab({ workspaceId }: WorkspaceRolesTabProps) {
  const { roles, isLoading } = useWorkspaceRoles(workspaceId);

  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: 'name',
      header: '이름',
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'description',
      header: '설명',
      cell: ({ row }) => (
        <div className="text-muted-foreground">{row.getValue('description') || '-'}</div>
      ),
    },
    {
      accessorKey: 'roleType',
      header: '타입',
      cell: ({ row }) => {
        const roleType = row.getValue('roleType') as string;
        return (
          <div className="text-muted-foreground">
            {roleType === 'platform' ? 'Platform' : roleType === 'workspace' ? 'Workspace' : 'CSP'}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <CrudTable
        data={roles}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="역할이 없습니다."
      />
    </div>
  );
}
