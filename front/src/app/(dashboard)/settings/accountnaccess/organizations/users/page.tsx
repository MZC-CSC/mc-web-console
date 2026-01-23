'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CrudPageTemplate } from '@/components/templates/CrudPageTemplate';
import { User, UserCreateRequest } from '@/types/users';
import {
  useUsers,
  useCreateUser,
  useDeleteUser,
} from '@/hooks/api/useUsersManagement';
import { UserDetailCard } from '@/components/users-management/UserDetailCard';
import { UserCreateForm } from '@/components/users-management/UserCreateForm';

/**
 * Users 관리 페이지 (Settings > Account & Access > Organizations > Users)
 */
export default function UsersManagementPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);

  const { users, isLoading, refetch } = useUsers();
  const createMutation = useCreateUser();
  const deleteMutation = useDeleteUser();

  // 테이블 컬럼 정의
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'username',
      header: 'ID',
      cell: ({ row }) => <div className="font-medium">{row.getValue('username')}</div>,
    },
    {
      accessorKey: 'firstName',
      header: 'Name',
      cell: ({ row }) => {
        const firstName = row.getValue('firstName') as string | undefined;
        const lastName = row.original.lastName;
        return <div>{firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || '-'}</div>;
      },
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => <div>{row.getValue('email')}</div>,
    },
    {
      accessorKey: 'enabled',
      header: 'Status',
      cell: ({ row }) => {
        const enabled = row.getValue('enabled') as boolean | undefined;
        return (
          <span className={`px-2 py-1 rounded text-xs ${enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            {enabled ? 'Enabled' : 'Disabled'}
          </span>
        );
      },
    },
    {
      id: 'platformRoles',
      header: 'Platform Roles',
      cell: ({ row }) => {
        const roles = row.original.platformRoles || [];
        return <div>{roles.length > 0 ? `${roles.length} roles` : '-'}</div>;
      },
    },
    {
      id: 'workspaceRoles',
      header: 'Workspace Roles',
      cell: ({ row }) => {
        const roles = row.original.workspaceRoles || [];
        return <div>{roles.length > 0 ? `${roles.length} roles` : '-'}</div>;
      },
    },
    {
      id: 'cspRoles',
      header: 'CSP Roles',
      cell: ({ row }) => {
        const roles = row.original.cspRoles || [];
        return <div>{roles.length > 0 ? `${roles.length} roles` : '-'}</div>;
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
                handleDelete(user);
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

  const handleAdd = () => {
    setIsCreateMode(true);
  };

  const handleCancelCreate = () => {
    setIsCreateMode(false);
  };

  const handleCreateSubmit = async (data: UserCreateRequest) => {
    try {
      await createMutation.mutateAsync(data);
      setIsCreateMode(false);
    } catch (error) {
      console.error('Create error:', error);
      throw error;
    }
  };

  const handleDelete = async (user: User) => {
    if (confirm(`정말로 "${user.username}" 사용자를 삭제하시겠습니까?`)) {
      try {
        await deleteMutation.mutateAsync(user.id);
        if (selectedUser?.id === user.id) {
          setSelectedUser(null);
        }
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {isCreateMode ? (
        <UserCreateForm
          onSubmit={handleCreateSubmit}
          onCancel={handleCancelCreate}
          isLoading={createMutation.isPending}
        />
      ) : (
        <CrudPageTemplate
          data={users}
          columns={columns}
          selectedItem={selectedUser}
          onItemSelect={setSelectedUser}
          onRefresh={refetch}
          isLoading={isLoading}
          onAdd={handleAdd}
          onDelete={handleDelete}
          detailComponent={UserDetailCard}
          title="Users"
          addButtonLabel="Add User"
          emptyMessage="사용자가 없습니다."
        />
      )}
    </div>
  );
}
