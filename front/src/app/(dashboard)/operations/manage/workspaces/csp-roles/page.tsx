'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { CrudPageTemplate } from '@/components/templates/CrudPageTemplate';
import { CSPRole } from '@/types/workspace';
import {
  useCSPRoles,
  useCreateCSPRole,
  useUpdateCSPRole,
  useDeleteCSPRole,
} from '@/hooks/api/useCSPRoles';
import { CSPRoleDetail } from '@/components/roles/CSPRoleDetail';
import { CSPRoleModal } from '@/components/roles/CSPRoleModal';
import { WorkspaceSelector } from '@/components/common/WorkspaceSelector';
import { useWorkspace } from '@/hooks/useWorkspace';

/**
 * CSP Roles 관리 페이지
 */
export default function CSPRolesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentWorkspace } = useWorkspace();
  // 쿼리 파라미터 또는 현재 선택된 workspace 사용
  const workspaceId = searchParams.get('workspaceId') || currentWorkspace?.id || '';
  
  const [selectedRole, setSelectedRole] = useState<CSPRole | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [providerFilter, setProviderFilter] = useState<string>('');

  const handleWorkspaceChange = (newWorkspaceId: string) => {
    router.push(`/operations/manage/workspaces/csp-roles?workspaceId=${newWorkspaceId}`);
  };

  const { cspRoles, isLoading, refetch } = useCSPRoles(workspaceId, providerFilter || undefined);
  const createMutation = useCreateCSPRole(workspaceId);
  const updateMutation = useUpdateCSPRole();
  const deleteMutation = useDeleteCSPRole();

  // 테이블 컬럼 정의
  const columns: ColumnDef<CSPRole>[] = [
    {
      accessorKey: 'name',
      header: '이름',
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'provider',
      header: 'CSP',
      cell: ({ row }) => (
        <div className="uppercase">{row.getValue('provider')}</div>
      ),
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

  const handleUpdate = (role: CSPRole) => {
    setSelectedRole(role);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (role: CSPRole) => {
    if (confirm(`정말로 "${role.name}" CSP Role을 삭제하시겠습니까?`)) {
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

  const handleModalSubmit = async (roleData: Omit<CSPRole, 'id'> | CSPRole) => {
    try {
      if (modalMode === 'create') {
        await createMutation.mutateAsync(roleData as Omit<CSPRole, 'id'>);
      } else {
        await updateMutation.mutateAsync(roleData as CSPRole);
      }
      setIsModalOpen(false);
      setSelectedRole(null);
    } catch (error) {
      console.error('Submit error:', error);
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
          <>
            {/* Provider 필터 */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">CSP Provider:</label>
              <select
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
                className="flex h-10 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">전체</option>
                <option value="aws">AWS</option>
                <option value="gcp">GCP</option>
                <option value="azure">Azure</option>
                <option value="alibaba">Alibaba</option>
                <option value="tencent">Tencent</option>
              </select>
            </div>

            <CrudPageTemplate
          data={cspRoles}
          columns={columns}
          selectedItem={selectedRole}
          onItemSelect={setSelectedRole}
          onRefresh={refetch}
          isLoading={isLoading}
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          detailComponent={CSPRoleDetail}
        title="CSP Roles 관리"
        addButtonLabel="CSP Role 추가"
        emptyMessage="CSP Role이 없습니다."
        />
          </>
        )}
      </div>

      {isModalOpen && workspaceId && (
        <CSPRoleModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          mode={modalMode}
          role={modalMode === 'edit' ? selectedRole : undefined}
          onSubmit={handleModalSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </>
  );
}
