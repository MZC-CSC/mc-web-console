'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CrudPageTemplate } from '@/components/templates/CrudPageTemplate';
import { UserInfo } from '@/types/auth';
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from '@/hooks/api/useUsers';
import { UserDetail } from '@/components/users/UserDetail';
import { UserModal } from '@/components/users/UserModal';

/**
 * 사용자 관리 페이지
 */
export default function UsersPage() {
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [searchQuery, setSearchQuery] = useState('');

  const { users, isLoading, refetch } = useUsers({ search: searchQuery });
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  // 테이블 컬럼 정의
  const columns: ColumnDef<UserInfo>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <div className="font-medium">{row.getValue('id')}</div>,
    },
    {
      accessorKey: 'username',
      header: '사용자명',
      cell: ({ row }) => <div>{row.getValue('username')}</div>,
    },
    {
      accessorKey: 'email',
      header: '이메일',
      cell: ({ row }) => <div>{row.getValue('email')}</div>,
    },
    {
      accessorKey: 'roles',
      header: '역할',
      cell: ({ row }) => {
        const roles = row.getValue('roles') as string[] | undefined;
        return <div>{roles?.join(', ') || '-'}</div>;
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
                setSelectedUser(user);
                setModalMode('edit');
                setIsModalOpen(true);
              }}
              className="text-primary hover:underline text-sm"
            >
              수정
            </button>
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
    setSelectedUser(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleUpdate = (user: UserInfo) => {
    setSelectedUser(user);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (user: UserInfo) => {
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

  const handleModalSubmit = async (userData: Omit<UserInfo, 'id'> | UserInfo) => {
    try {
      if (modalMode === 'create') {
        await createMutation.mutateAsync(userData as Omit<UserInfo, 'id'>);
      } else {
        await updateMutation.mutateAsync(userData as UserInfo);
      }
      setIsModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* 검색 영역 */}
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="사용자 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <CrudPageTemplate
          data={users}
          columns={columns}
          selectedItem={selectedUser}
          onItemSelect={setSelectedUser}
          onRefresh={refetch}
          isLoading={isLoading}
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          detailComponent={UserDetail}
          title="사용자 관리"
          addButtonLabel="사용자 추가"
          emptyMessage="사용자가 없습니다."
        />
      </div>

      {isModalOpen && (
        <UserModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          mode={modalMode}
          user={modalMode === 'edit' ? selectedUser : undefined}
          onSubmit={handleModalSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </>
  );
}
