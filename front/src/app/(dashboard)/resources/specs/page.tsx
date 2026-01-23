'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CrudPageTemplate } from '@/components/templates/CrudPageTemplate';
import { WorkspaceSelector } from '@/components/common/WorkspaceSelector';
import { ProjectSelector } from '@/components/common/ProjectSelector';
import { ServerSpec } from '@/types/resources';
import {
  useSpecs,
  useCreateSpec,
  useUpdateSpec,
  useDeleteSpec,
} from '@/hooks/api/useSpecs';
import { useProject } from '@/hooks/useProject';
import { SpecModal } from '@/components/specs/SpecModal';
import { SpecDetail } from '@/components/specs/SpecDetail';

/**
 * Server Specs 관리 페이지
 */
export default function ServerSpecsPage() {
  const { currentProject } = useProject();
  const nsId = currentProject?.ns_id || null;
  const [selectedSpec, setSelectedSpec] = useState<ServerSpec | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  const { specs, isLoading, refetch } = useSpecs(nsId);
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
    if (!nsId) {
      alert('Namespace를 선택해주세요.');
      return;
    }
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleUpdate = (spec: ServerSpec) => {
    if (!nsId) {
      alert('Namespace를 선택해주세요.');
      return;
    }
    setSelectedSpec(spec);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (spec: ServerSpec) => {
    if (!nsId) {
      alert('Namespace를 선택해주세요.');
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
      <div className="flex gap-4">
        <WorkspaceSelector />
        <ProjectSelector />
      </div>

      {/* Server Specs 목록 */}
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
        detailComponent={SpecDetail}
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
    </div>
  );
}
