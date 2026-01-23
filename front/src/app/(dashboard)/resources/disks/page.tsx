'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CrudPageTemplate } from '@/components/templates/CrudPageTemplate';
import { WorkspaceSelector } from '@/components/common/WorkspaceSelector';
import { ProjectSelector } from '@/components/common/ProjectSelector';
import { Disk } from '@/types/resources';
import {
  useDisks,
  useCreateDisk,
  useUpdateDisk,
  useDeleteDisk,
} from '@/hooks/api/useDisks';
import { useProject } from '@/hooks/useProject';
import { DiskModal } from '@/components/disks/DiskModal';
import { DiskDetail } from '@/components/disks/DiskDetail';

/**
 * Disks 관리 페이지
 */
export default function DisksPage() {
  const { currentProject } = useProject();
  const nsId = currentProject?.ns_id || null;
  const [selectedDisk, setSelectedDisk] = useState<Disk | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  const { disks, isLoading, refetch } = useDisks(nsId);
  const createMutation = useCreateDisk();
  const updateMutation = useUpdateDisk();
  const deleteMutation = useDeleteDisk();

  // 테이블 컬럼 정의
  const columns: ColumnDef<Disk>[] = [
    {
      accessorKey: 'name',
      header: '이름',
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'size',
      header: 'Size',
      cell: ({ row }) => <div>{row.getValue('size') || '-'}</div>,
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => <div>{row.getValue('type') || '-'}</div>,
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

  const handleUpdate = (disk: Disk) => {
    if (!nsId) {
      alert('Namespace를 선택해주세요.');
      return;
    }
    setSelectedDisk(disk);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (disk: Disk) => {
    if (!nsId) {
      alert('Namespace를 선택해주세요.');
      return;
    }
    if (confirm(`정말로 "${disk.name}" Disk를 삭제하시겠습니까?`)) {
      try {
        await deleteMutation.mutateAsync({ nsId, dataDiskId: disk.id });
        if (selectedDisk?.id === disk.id) {
          setSelectedDisk(null);
        }
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const handleModalSubmit = async (data: Omit<Disk, 'id'>) => {
    if (!nsId) {
      return;
    }

    try {
      if (modalMode === 'create') {
        await createMutation.mutateAsync({ nsId, disk: data });
      } else if (selectedDisk) {
        await updateMutation.mutateAsync({ nsId, dataDiskId: selectedDisk.id, disk: data });
      }
      setIsModalOpen(false);
      setSelectedDisk(null);
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

      {/* Disks 목록 */}
      <CrudPageTemplate
        data={disks}
        columns={columns}
        selectedItem={selectedDisk}
        onItemSelect={setSelectedDisk}
        onRefresh={refetch}
        isLoading={isLoading}
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        detailComponent={DiskDetail}
        title="Disks"
        addButtonLabel="Disk 추가"
        emptyMessage="Disk가 없습니다."
      />

      {isModalOpen && (
        <DiskModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          mode={modalMode}
          disk={modalMode === 'edit' ? selectedDisk : undefined}
          onSubmit={handleModalSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}
