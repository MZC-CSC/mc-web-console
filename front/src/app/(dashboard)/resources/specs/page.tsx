'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CrudPageTemplate } from '@/components/templates/CrudPageTemplate';
import { WorkspaceProjectSelector } from '@/components/common/WorkspaceProjectSelector';
import { useWorkspaceProjectSelection } from '@/hooks/useWorkspaceProjectSelection';
import { Card } from '@/components/ui/card';
import { ServerSpec } from '@/types/resources';
import {
  useSpecs,
  useCreateSpec,
  useUpdateSpec,
  useDeleteSpec,
} from '@/hooks/api/useSpecs';
import { SpecModal } from '@/components/specs/SpecModal';
import { SpecDetail } from '@/components/specs/SpecDetail';

/**
 * Server Specs 관리 페이지
 */
export default function ServerSpecsPage() {
  const [selectedSpec, setSelectedSpec] = useState<ServerSpec | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  // Workspace/Project 선택 및 복원 (공통 Hook 사용)
  const {
    selectedWorkspaceId,
    selectedProjectId,
    selectedProject,
    isWorkspaceProjectSelected,
    handleWorkspaceChange,
    handleProjectChange,
  } = useWorkspaceProjectSelection();

  // 선택된 project의 ns_id 조회
  const nsId = selectedProject?.nsid;

  const { specs, isLoading, refetch } = useSpecs(nsId || null);
  const createMutation = useCreateSpec();
  const updateMutation = useUpdateSpec();
  const deleteMutation = useDeleteSpec();

  // 테이블 컬럼 정의
  const columns: ColumnDef<ServerSpec>[] = [
    {
      accessorKey: 'name',
      header: '이름',
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'cpu',
      header: 'CPU',
      cell: ({ row }) => <div>{row.getValue('cpu') || '-'}</div>,
    },
    {
      accessorKey: 'memory',
      header: 'Memory',
      cell: ({ row }) => <div>{row.getValue('memory') || '-'}</div>,
    },
    {
      accessorKey: 'connectionName',
      header: 'Connection',
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue('connectionName') || '-'}</div>,
    },
  ];

  const handleAdd = () => {
    if (!isWorkspaceProjectSelected || !nsId) {
      alert('Workspace와 Project를 선택해주세요.');
      return;
    }
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleUpdate = (spec: ServerSpec) => {
    if (!isWorkspaceProjectSelected || !nsId) {
      alert('Workspace와 Project를 선택해주세요.');
      return;
    }
    setSelectedSpec(spec);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (spec: ServerSpec) => {
    if (!isWorkspaceProjectSelected || !nsId) {
      alert('Workspace와 Project를 선택해주세요.');
      return;
    }
    if (confirm(`정말로 "${spec.name}" Server Spec을 삭제하시겠습니까?`)) {
      try {
        await deleteMutation.mutateAsync({ nsId, specId: spec.id });
        if (selectedSpec?.id === spec.id) {
          setSelectedSpec(null);
        }
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const handleModalSubmit = async (data: Omit<ServerSpec, 'id'>) => {
    if (!nsId) {
      return;
    }

    try {
      if (modalMode === 'create') {
        await createMutation.mutateAsync({ nsId, spec: data });
      } else if (selectedSpec) {
        await updateMutation.mutateAsync({ nsId, specId: selectedSpec.id, spec: data });
      }
      setIsModalOpen(false);
      setSelectedSpec(null);
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace/Project 선택 */}
      <Card className="p-6">
        <WorkspaceProjectSelector
          selectedWorkspaceId={selectedWorkspaceId}
          selectedProjectId={selectedProjectId}
          onWorkspaceChange={handleWorkspaceChange}
          onProjectChange={handleProjectChange}
        />
      </Card>

      {/* Workspace/Project 선택 안내 */}
      {!isWorkspaceProjectSelected && (
        <Card className="p-4 bg-muted/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">안내:</span>
            <span>
              {!selectedWorkspaceId
                ? 'Server Specs를 조회하려면 Workspace를 선택하세요.'
                : !selectedProjectId
                  ? 'Server Specs를 조회하려면 Project를 선택하세요.'
                  : ''}
            </span>
          </div>
        </Card>
      )}

      {/* Server Specs 목록 (Project 선택 시에만 표시) */}
      {isWorkspaceProjectSelected && (
        <>
          <CrudPageTemplate
            data={specs}
            columns={columns}
            selectedItem={selectedSpec}
            onItemSelect={setSelectedSpec}
            onRefresh={refetch}
            isLoading={isLoading}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            detailComponent={(props) => <SpecDetail spec={props.item} />}
            title="Server Specs"
            addButtonLabel="Server Spec 추가"
            emptyMessage="Server Spec이 없습니다."
          />

          {isModalOpen && (
            <SpecModal
              open={isModalOpen}
              onOpenChange={setIsModalOpen}
              mode={modalMode}
              spec={modalMode === 'edit' ? selectedSpec : undefined}
              onSubmit={handleModalSubmit}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          )}
        </>
      )}
    </div>
  );
}
