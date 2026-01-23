'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CrudPageTemplate } from '@/components/templates/CrudPageTemplate';
import { WorkspaceSelector } from '@/components/common/WorkspaceSelector';
import { ProjectSelector } from '@/components/common/ProjectSelector';
import { Network } from '@/types/resources';
import {
  useNetworks,
  useCreateNetwork,
  useDeleteNetwork,
} from '@/hooks/api/useNetworks';
import { useProject } from '@/hooks/useProject';
import { NetworkModal } from '@/components/networks/NetworkModal';
import { NetworkDetail } from '@/components/networks/NetworkDetail';

/**
 * Networks 관리 페이지
 */
export default function NetworksPage() {
  const { currentProject } = useProject();
  const nsId = currentProject?.ns_id || null;
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { networks, isLoading, refetch } = useNetworks(nsId);
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
    if (!nsId) {
      alert('Namespace를 선택해주세요.');
      return;
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (network: Network) => {
    if (!nsId) {
      alert('Namespace를 선택해주세요.');
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
      <div className="flex gap-4">
        <WorkspaceSelector />
        <ProjectSelector />
      </div>

      {/* Networks 목록 */}
      <CrudPageTemplate
        data={networks}
        columns={columns}
        selectedItem={selectedNetwork}
        onItemSelect={setSelectedNetwork}
        onRefresh={refetch}
        isLoading={isLoading}
        onAdd={handleAdd}
        onDelete={handleDelete}
        detailComponent={NetworkDetail}
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
    </div>
  );
}
