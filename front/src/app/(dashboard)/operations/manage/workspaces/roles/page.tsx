'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { CrudPageTemplate } from '@/components/templates/CrudPageTemplate';
import { Role } from '@/types/workspace';
import {
  useWorkspaceRoles,
  useWorkspaceRole,
  useCreateWorkspaceRole,
  useUpdateWorkspaceRole,
  useDeleteWorkspaceRole,
} from '@/hooks/api/useWorkspaceRoles';
import { RoleDetail } from '@/components/roles/RoleDetail';
import { RoleModal } from '@/components/roles/RoleModal';
import { AssignUserModal } from '@/components/roles/AssignUserModal';
import { useAssignWorkspaceRole } from '@/hooks/api/useAssignRole';
import { WorkspaceSelector } from '@/components/common/WorkspaceSelector';
import { useWorkspace } from '@/hooks/useWorkspace';

/**
 * Workspace Roles 관리 페이지
 */
export default function WorkspaceRolesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentWorkspace } = useWorkspace();
  // 쿼리 파라미터 또는 현재 선택된 workspace 사용
  const workspaceId = searchParams.get('workspaceId') || currentWorkspace?.id || '';
  
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isAssignUserModalOpen, setIsAssignUserModalOpen] = useState(false);

  const handleWorkspaceChange = (newWorkspaceId: string) => {
    router.push(`/operations/manage/workspaces/roles?workspaceId=${newWorkspaceId}`);
  };

  const { roles, isLoading, refetch } = useWorkspaceRoles(workspaceId);
  // Phase 2: Role 상세 정보 조회 (View 모드용)
  const { role: roleDetail, isLoading: isRoleDetailLoading } = useWorkspaceRole(
    selectedRole?.id || null
  );
  const createMutation = useCreateWorkspaceRole(workspaceId);
  const updateMutation = useUpdateWorkspaceRole();
  const deleteMutation = useDeleteWorkspaceRole();
  const assignUserMutation = useAssignWorkspaceRole();

  // 테이블 컬럼 정의
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
      id: 'actions',
      header: '작업',
      cell: ({ row }) => {
        const role = row.original;
        return (
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRole(role);
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
                setSelectedRole(role);
                setIsAssignUserModalOpen(true);
              }}
              className="text-primary hover:underline text-sm"
            >
              사용자 할당
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(role);
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
    setSelectedRole(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleUpdate = (role: Role) => {
    setSelectedRole(role);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (role: Role) => {
    if (confirm(`정말로 "${role.name}" Role을 삭제하시겠습니까?`)) {
      try {
        await deleteMutation.mutateAsync(role.id);
        if (selectedRole?.id === role.id) {
          setSelectedRole(null);
        }
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const handleModalSubmit = async (roleData: Omit<Role, 'id'> | Role) => {
    try {
      if (modalMode === 'create') {
        await createMutation.mutateAsync(roleData as Omit<Role, 'id'>);
      } else {
        await updateMutation.mutateAsync(roleData as Role);
      }
      setIsModalOpen(false);
      setSelectedRole(null);
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleAssignUser = async (userId: string) => {
    if (!selectedRole) return;
    try {
      await assignUserMutation.mutateAsync({
        workspaceId,
        roleId: selectedRole.id,
        userId,
      });
      setIsAssignUserModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Assign user error:', error);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Workspace 선택 */}
        <div className="flex gap-4">
          <WorkspaceSelector onWorkspaceChange={handleWorkspaceChange} />
        </div>

        {!workspaceId ? (
          <div className="text-muted-foreground">Workspace를 선택해주세요.</div>
        ) : (
          <CrudPageTemplate
            data={roles}
            columns={columns}
            selectedItem={selectedRole}
            onItemSelect={setSelectedRole}
            onRefresh={refetch}
            isLoading={isLoading}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            detailComponent={(props) => (
              <RoleDetail
                item={roleDetail || props.item}
                onUpdate={props.onUpdate}
              />
            )}
            title="Workspace Roles 관리"
            addButtonLabel="Role 추가"
            emptyMessage="Role이 없습니다."
          />
        )}
      </div>

      {isModalOpen && workspaceId && (
        <RoleModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          mode={modalMode}
          role={modalMode === 'edit' ? (roleDetail || selectedRole) : undefined}
          workspaceId={workspaceId}
          onSubmit={handleModalSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {isAssignUserModalOpen && selectedRole && workspaceId && (
        <AssignUserModal
          open={isAssignUserModalOpen}
          onOpenChange={setIsAssignUserModalOpen}
          role={selectedRole}
          workspaceId={workspaceId}
          onAssign={handleAssignUser}
          isLoading={assignUserMutation.isPending}
        />
      )}
    </>
  );
}
