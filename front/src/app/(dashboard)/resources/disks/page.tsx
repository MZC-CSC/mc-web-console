'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CrudPageTemplate } from '@/components/templates/CrudPageTemplate';
import { WorkspaceProjectSelector } from '@/components/common/WorkspaceProjectSelector';
import { useWorkspaceProjectSelection } from '@/hooks/useWorkspaceProjectSelection';
import { Card } from '@/components/ui/card';
import { Disk } from '@/types/resources';
import {
  useDisks,
  useCreateDisk,
  useUpdateDisk,
  useDeleteDisk,
} from '@/hooks/api/useDisks';
import { DiskModal } from '@/components/disks/DiskModal';
import { DiskDetail } from '@/components/disks/DiskDetail';

/**
 * Disks 관리 페이지
 */
export default function DisksPage() {
  const [selectedDisk, setSelectedDisk] = useState<Disk | null>(null);
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

  const { disks, isLoading, refetch } = useDisks(nsId || null);
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
    if (!isWorkspaceProjectSelected || !nsId) {
      alert('Workspace와 Project를 선택해주세요.');
      return;
    }
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleUpdate = (disk: Disk) => {
    if (!isWorkspaceProjectSelected || !nsId) {
      alert('Workspace와 Project를 선택해주세요.');
      return;
    }
    setSelectedDisk(disk);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (disk: Disk) => {
    if (!isWorkspaceProjectSelected || !nsId) {
      alert('Workspace와 Project를 선택해주세요.');
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
                ? 'Disks를 조회하려면 Workspace를 선택하세요.'
                : !selectedProjectId
                  ? 'Disks를 조회하려면 Project를 선택하세요.'
                  : ''}
            </span>
          </div>
        </Card>
      )}

      {/* Disks 목록 (Project 선택 시에만 표시) */}
      {isWorkspaceProjectSelected && (
        <>
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
            detailComponent={(props) => <DiskDetail disk={props.item} />}
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
        </>
      )}
    </div>
  );
}
