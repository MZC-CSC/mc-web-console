// app/(dashboard)/settings/accountnaccess/organizations/users/UsersClient.tsx

'use client';

import { useState } from 'react';
import { UsersTable } from '@/components/users/UsersTable';
import { UserCreateForm } from '@/components/users-management/UserCreateForm';
import { Button } from '@/components/common/Button';
import { useUsers, useDeleteUser } from '@/hooks/api/useUsersManagement';
import type { User } from '@/types/users';

/**
 * Users 관리 클라이언트 컴포넌트
 * 데이터 조회 및 상태 관리만 담당
 */
export function UsersClient() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);

  // Data fetching - 데이터 조회만 수행
  const { data, isLoading, refetch } = useUsers();
  const deleteMutation = useDeleteUser();

  const handleAdd = () => {
    setIsCreateMode(true);
  };

  const handleCancelCreate = () => {
    setIsCreateMode(false);
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
        <div className="space-y-4">
          <Button variant="outline" onClick={handleCancelCreate}>
            ← Back to List
          </Button>
          <UserCreateForm
            onSubmit={async (data) => {
              setIsCreateMode(false);
            }}
            onCancel={handleCancelCreate}
            isLoading={false}
          />
        </div>
      ) : (
        <>
          {/* Users Table - 데이터만 전달 */}
          <UsersTable
            users={data?.users || []}
            isLoading={isLoading}
            selectedUser={selectedUser}
            onUserSelect={setSelectedUser}
            onRefresh={refetch}
            onAdd={handleAdd}
            onDelete={handleDelete}
          />
        </>
      )}
    </div>
  );
}
