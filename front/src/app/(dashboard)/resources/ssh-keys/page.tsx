'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CrudPageTemplate } from '@/components/templates/CrudPageTemplate';
import { WorkspaceProjectSelector } from '@/components/common/WorkspaceProjectSelector';
import { useWorkspaceProjectSelection } from '@/hooks/useWorkspaceProjectSelection';
import { Card } from '@/components/ui/card';
import { SSHKey } from '@/types/resources';
import {
  useSSHKeys,
  useCreateSSHKey,
  useUpdateSSHKey,
  useDeleteSSHKey,
} from '@/hooks/api/useSSHKeys';
import { SSHKeyModal } from '@/components/ssh-keys/SSHKeyModal';
import { SSHKeyDetail } from '@/components/ssh-keys/SSHKeyDetail';

/**
 * SSH Keys 관리 페이지
 */
export default function SSHKeysPage() {
  const [selectedSSHKey, setSelectedSSHKey] = useState<SSHKey | null>(null);
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

  const { sshKeys, isLoading, refetch } = useSSHKeys(nsId || null);
  const createMutation = useCreateSSHKey();
  const updateMutation = useUpdateSSHKey();
  const deleteMutation = useDeleteSSHKey();

  // 테이블 컬럼 정의
  const columns: ColumnDef<SSHKey>[] = [
    {
      accessorKey: 'name',
      header: '이름',
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'fingerprint',
      header: 'Fingerprint',
      cell: ({ row }) => <div className="text-muted-foreground font-mono text-sm">{row.getValue('fingerprint') || '-'}</div>,
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

  const handleUpdate = (sshKey: SSHKey) => {
    if (!nsId) {
      alert('Namespace를 선택해주세요.');
      return;
    }
    setSelectedSSHKey(sshKey);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (sshKey: SSHKey) => {
    if (!nsId) {
      alert('Namespace를 선택해주세요.');
      return;
    }
    if (confirm(`정말로 "${sshKey.name}" SSH Key를 삭제하시겠습니까?`)) {
      try {
        await deleteMutation.mutateAsync({ nsId, sshKeyId: sshKey.id });
        if (selectedSSHKey?.id === sshKey.id) {
          setSelectedSSHKey(null);
        }
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const handleModalSubmit = async (data: Omit<SSHKey, 'id'>) => {
    if (!nsId) {
      return;
    }

    try {
      if (modalMode === 'create') {
        await createMutation.mutateAsync({ nsId, sshKey: data });
      } else if (selectedSSHKey) {
        await updateMutation.mutateAsync({ nsId, sshKeyId: selectedSSHKey.id, sshKey: data });
      }
      setIsModalOpen(false);
      setSelectedSSHKey(null);
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
                ? 'SSH Keys를 조회하려면 Workspace를 선택하세요.'
                : !selectedProjectId
                  ? 'SSH Keys를 조회하려면 Project를 선택하세요.'
                  : ''}
            </span>
          </div>
        </Card>
      )}

      {/* SSH Keys 목록 (Project 선택 시에만 표시) */}
      {isWorkspaceProjectSelected && (
        <>
          <CrudPageTemplate
            data={sshKeys}
            columns={columns}
            selectedItem={selectedSSHKey}
            onItemSelect={setSelectedSSHKey}
            onRefresh={refetch}
            isLoading={isLoading}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            detailComponent={(props) => <SSHKeyDetail sshKey={props.item} />}
            title="SSH Keys"
            addButtonLabel="SSH Key 추가"
            emptyMessage="SSH Key가 없습니다."
          />

          {isModalOpen && (
            <SSHKeyModal
              open={isModalOpen}
              onOpenChange={setIsModalOpen}
              mode={modalMode}
              sshKey={modalMode === 'edit' ? selectedSSHKey : undefined}
              onSubmit={handleModalSubmit}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          )}
        </>
      )}
    </div>
  );
}
