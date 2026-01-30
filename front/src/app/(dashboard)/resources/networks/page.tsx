'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CrudPageTemplate } from '@/components/templates/CrudPageTemplate';
import { WorkspaceProjectSelector } from '@/components/common/WorkspaceProjectSelector';
import { useWorkspaceProjectSelection } from '@/hooks/useWorkspaceProjectSelection';
import { Card } from '@/components/ui/card';
import { Network } from '@/types/resources';
import {
  useNetworks,
  useCreateNetwork,
  useDeleteNetwork,
} from '@/hooks/api/useNetworks';
import { NetworkModal } from '@/components/networks/NetworkModal';
import { NetworkDetail } from '@/components/networks/NetworkDetail';

/**
 * Networks 관리 페이지
 */
export default function NetworksPage() {
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const { networks, isLoading, refetch } = useNetworks(nsId || null);
  const createMutation = useCreateNetwork();
  const deleteMutation = useDeleteNetwork();

  // 테이블 컬럼 정의
  const columns: ColumnDef<Network>[] = [
    {
      accessorKey: 'name',
      header: '이름',
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'cidr',
      header: 'CIDR',
      cell: ({ row }) => <div>{row.getValue('cidr') || '-'}</div>,
    },
    {
      accessorKey: 'subnets',
      header: 'Subnets',
      cell: ({ row }) => {
        const subnets = row.getValue('subnets') as Network['subnets'];
        return <div>{subnets?.length || 0}</div>;
      },
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
    setIsModalOpen(true);
  };

  const handleDelete = async (network: Network) => {
    if (!isWorkspaceProjectSelected || !nsId) {
      alert('Workspace와 Project를 선택해주세요.');
      return;
    }
    if (confirm(`정말로 "${network.name}" Network를 삭제하시겠습니까?`)) {
      try {
        await deleteMutation.mutateAsync({ nsId, vNetId: network.id });
        if (selectedNetwork?.id === network.id) {
          setSelectedNetwork(null);
        }
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const handleModalSubmit = async (data: Omit<Network, 'id'>) => {
    if (!nsId) {
      return;
    }

    try {
      await createMutation.mutateAsync({ nsId, network: data });
      setIsModalOpen(false);
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
                ? 'Networks를 조회하려면 Workspace를 선택하세요.'
                : !selectedProjectId
                  ? 'Networks를 조회하려면 Project를 선택하세요.'
                  : ''}
            </span>
          </div>
        </Card>
      )}

      {/* Networks 목록 (Project 선택 시에만 표시) */}
      {isWorkspaceProjectSelected && (
        <>
          <CrudPageTemplate
            data={networks}
            columns={columns}
            selectedItem={selectedNetwork}
            onItemSelect={setSelectedNetwork}
            onRefresh={refetch}
            isLoading={isLoading}
            onAdd={handleAdd}
            onDelete={handleDelete}
            detailComponent={(props) => <NetworkDetail network={props.item} />}
            title="Networks"
            addButtonLabel="Network 추가"
            emptyMessage="Network가 없습니다."
          />

          {isModalOpen && (
            <NetworkModal
              open={isModalOpen}
              onOpenChange={setIsModalOpen}
              onSubmit={handleModalSubmit}
              isLoading={createMutation.isPending}
            />
          )}
        </>
      )}
    </div>
  );
}
