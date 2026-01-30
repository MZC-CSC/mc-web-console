// app/(dashboard)/settings/accountnaccess/organizations/users/UsersClient.tsx

'use client';

import { useState } from 'react';
import { UsersListTable } from '@/components/users/UsersListTable';
import { UserDetailCard } from '@/components/users-management/UserDetailCard';
import { UserCreateForm } from '@/components/users-management/UserCreateForm';
import { Button } from '@/components/common/Button';
import type { User, UserMode } from '@/types/users';

export function UsersClient() {
  // 모드 관리
  const [mode, setMode] = useState<UserMode>('list');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Handlers
  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setMode('view');
  };

  const handleAddUser = () => {
    setMode('create');
  };

  const handleCloseViewMode = () => {
    setSelectedUser(null);
    setMode('list');
  };

  const handleCloseCreateMode = () => {
    setMode('list');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage users and their roles</p>
        </div>
        {mode === 'list' && (
          <Button onClick={handleAddUser}>
            Add User
          </Button>
        )}
      </div>

      {/* List Mode */}
      {mode === 'list' && (
        <UsersListTable
          onUserSelect={handleUserSelect}
          onAddUser={handleAddUser}
        />
      )}

      {/* View Mode */}
      {mode === 'view' && selectedUser && (
        <div className="space-y-4">
          <Button variant="outline" onClick={handleCloseViewMode}>
            ← Back to List
          </Button>
          <UserDetailCard
            item={selectedUser}
            onClose={handleCloseViewMode}
          />
        </div>
      )}

      {/* Create Mode */}
      {mode === 'create' && (
        <div className="space-y-4">
          <Button variant="outline" onClick={handleCloseCreateMode}>
            ← Back to List
          </Button>
          <UserCreateForm
            onSubmit={async (data) => {
              // Create user logic will be handled by the form component
              setMode('list');
            }}
            onCancel={handleCloseCreateMode}
            isLoading={false}
          />
        </div>
      )}
    </div>
  );
}
