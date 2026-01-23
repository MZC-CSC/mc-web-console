'use client';

import { useUsers } from '@/hooks/api/useUsers';
import { CrudTable } from '@/components/templates/CrudTable';
import { ColumnDef } from '@tanstack/react-table';
import { UserInfo } from '@/types/auth';

interface WorkspaceMembersTabProps {
  workspaceId: string;
}

/**
 * 워크스페이스 Members 탭 컴포넌트
 */
export function WorkspaceMembersTab({ workspaceId }: WorkspaceMembersTabProps) {
  const { users, isLoading } = useUsers({ workspaceId });

  const columns: ColumnDef<UserInfo>[] = [
    {
      accessorKey: 'username',
      header: '사용자명',
      cell: ({ row }) => <div className="font-medium">{row.getValue('username')}</div>,
    },
    {
      accessorKey: 'email',
      header: '이메일',
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue('email') || '-'}</div>,
    },
    {
      accessorKey: 'firstName',
      header: '이름',
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {row.original.firstName || row.original.lastName
            ? `${row.original.firstName || ''} ${row.original.lastName || ''}`.trim()
            : '-'}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <CrudTable
        data={users}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="멤버가 없습니다."
      />
    </div>
  );
}
