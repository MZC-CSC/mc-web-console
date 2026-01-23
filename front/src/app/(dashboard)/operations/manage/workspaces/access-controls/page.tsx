'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { CrudPageTemplate } from '@/components/templates/CrudPageTemplate';
import { AccessControl } from '@/types/workspace';
import {
  useAccessControls,
  useAppendAccessControlPolicy,
  useUpdateAccessControlPolicy,
  useDeleteAccessControlPolicy,
} from '@/hooks/api/useAccessControls';
import { AccessControlDetail } from '@/components/access-controls/AccessControlDetail';
import { AccessControlModal } from '@/components/access-controls/AccessControlModal';
import { WorkspaceSelector } from '@/components/common/WorkspaceSelector';
import { useWorkspace } from '@/hooks/useWorkspace';

/**
 * Access Controls 관리 페이지
 */
export default function AccessControlsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentWorkspace } = useWorkspace();
  // 쿼리 파라미터 또는 현재 선택된 workspace 사용
  const workspaceId = searchParams.get('workspaceId') || currentWorkspace?.id || '';
  
  const [selectedControl, setSelectedControl] = useState<AccessControl | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const framework = 'mciam';

  const handleWorkspaceChange = (newWorkspaceId: string) => {
    router.push(`/operations/manage/workspaces/access-controls?workspaceId=${newWorkspaceId}`);
  };

  const { accessControls, isLoading, refetch } = useAccessControls(workspaceId, framework);
  const appendMutation = useAppendAccessControlPolicy(workspaceId, framework);
  const updateMutation = useUpdateAccessControlPolicy(framework);
  const deleteMutation = useDeleteAccessControlPolicy(framework);

  // 테이블 컬럼 정의
  const columns: ColumnDef<AccessControl>[] = [
    {
      accessorKey: 'operationId',
      header: 'Operation ID',
      cell: ({ row }) => <div className="font-medium">{row.getValue('operationId')}</div>,
    },
    {
      accessorKey: 'resource',
      header: 'Resource',
      cell: ({ row }) => (
        <div className="text-muted-foreground">{row.getValue('resource') || '-'}</div>
      ),
    },
    {
      accessorKey: 'policies',
      header: 'Policies',
      cell: ({ row }) => {
        const policies = row.getValue('policies') as AccessControl['policies'];
        return <div>{policies?.length || 0}개</div>;
      },
    },
    {
      id: 'actions',
      header: '작업',
      cell: ({ row }) => {
        const control = row.original;
        return (
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedControl(control);
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
                // Access Control 삭제는 Policy 삭제로 처리
                if (control.policies && control.policies.length > 0) {
                  handleDeletePolicy(control, control.policies[0].id!);
                }
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
    setSelectedControl(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleUpdate = (control: AccessControl) => {
    setSelectedControl(control);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeletePolicy = async (control: AccessControl, policyId: string) => {
    if (confirm(`정말로 이 권한 정책을 삭제하시겠습니까?`)) {
      try {
        await deleteMutation.mutateAsync({
          operationId: control.operationId,
          policyId,
        });
        if (selectedControl?.id === control.id) {
          setSelectedControl(null);
        }
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const handleModalSubmit = async (data: { operationId: string; policy: any }) => {
    try {
      if (modalMode === 'create') {
        await appendMutation.mutateAsync(data);
      } else {
        await updateMutation.mutateAsync(data);
      }
      setIsModalOpen(false);
      setSelectedControl(null);
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
          <CrudPageTemplate
        data={accessControls}
        columns={columns}
        selectedItem={selectedControl}
        onItemSelect={setSelectedControl}
        onRefresh={refetch}
        isLoading={isLoading}
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        detailComponent={AccessControlDetail}
        title="Access Controls 관리"
        addButtonLabel="권한 정책 추가"
        emptyMessage="Access Control이 없습니다."
        />
        )}
      </div>

      {isModalOpen && workspaceId && (
        <AccessControlModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          mode={modalMode}
          accessControl={modalMode === 'edit' ? selectedControl : undefined}
          onSubmit={handleModalSubmit}
          isLoading={appendMutation.isPending || updateMutation.isPending}
        />
      )}
    </>
  );
}
