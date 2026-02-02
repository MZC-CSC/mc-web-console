// components/users/UsersTable.tsx

'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CrudPageTemplate } from '@/components/templates/CrudPageTemplate';
import { UserDetailCard } from '@/components/users-management/UserDetailCard';
import type { User } from '@/types/users';

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
  selectedUser: User | null;
  onUserSelect: (user: User | null) => void;
  onRefresh: () => void;
  onAdd: () => void;
  onDelete: (user: User) => void;
}

/**
 * Users 테이블 컴포넌트
 * 컬럼 정의와 테이블 구조를 포함
 */
export function UsersTable({
  users,
  isLoading,
  selectedUser,
  onUserSelect,
  onRefresh,
  onAdd,
  onDelete,
}: UsersTableProps) {
  // 테이블 컬럼 정의
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'username',
      header: 'Username',
      cell: ({ row }) => <div className="font-medium">{row.getValue('username')}</div>,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => <div className="text-sm">{row.getValue('email')}</div>,
    },
    {
      accessorKey: 'firstName',
      header: 'First Name',
      cell: ({ row }) => <div className="text-sm">{row.getValue('firstName')}</div>,
    },
    {
      accessorKey: 'lastName',
      header: 'Last Name',
      cell: ({ row }) => <div className="text-sm">{row.getValue('lastName')}</div>,
    },
    {
      accessorKey: 'enabled',
      header: 'Status',
      cell: ({ row }) => {
        const enabled = row.getValue('enabled') as boolean;
        return (
          <div className="text-center">
            <span
              className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                enabled
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}
            >
              {enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => {
        const createdAt = row.getValue('createdAt') as string | undefined;
        return (
          <div className="text-sm">
            {createdAt ? new Date(createdAt).toLocaleDateString() : '-'}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: '작업',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(user);
              }}
              className="text-destructive hover:underline text-sm"
            >
              삭제
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <CrudPageTemplate
      data={users}
      columns={columns}
      selectedItem={selectedUser}
      onItemSelect={onUserSelect}
      onRefresh={onRefresh}
      isLoading={isLoading}
      onAdd={onAdd}
      onDelete={onDelete}
      title="Users"
      addButtonLabel="Add User"
      emptyMessage="사용자가 없습니다."
      hideRefreshButton={true}
      detailComponent={({ item }) => (
        <UserDetailCard item={item} onClose={() => onUserSelect(null)} />
      )}
    />
  );
}
