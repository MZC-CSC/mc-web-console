'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CrudPageTemplate } from '@/components/templates/CrudPageTemplate';
import { PMKCluster, PMKClusterCreateRequest } from '@/types/pmk-workloads';
import {
  usePMKClusters,
  useCreatePMKCluster,
  useDeletePMKCluster,
} from '@/hooks/api/usePMKWorkloads';
import { ClusterCreateForm } from '@/components/pmk-workloads/ClusterCreateForm';

/**
 * PMK Workloads 관리 페이지
 */
export default function PMKWorkloadsPage() {
  const [selectedCluster, setSelectedCluster] = useState<PMKCluster | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);

  const { clusters, isLoading, refetch } = usePMKClusters();
  const createMutation = useCreatePMKCluster();
  const deleteMutation = useDeletePMKCluster();

  // 테이블 컬럼 정의
  const columns: ColumnDef<PMKCluster>[] = [
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
      accessorKey: 'version',
      header: '버전',
      cell: ({ row }) => <div>{row.getValue('version') || '-'}</div>,
    },
    {
      accessorKey: 'status',
      header: '상태',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const statusColors: Record<string, string> = {
          running: 'bg-green-100 text-green-800',
          stopped: 'bg-yellow-100 text-yellow-800',
          terminated: 'bg-gray-100 text-gray-800',
          failed: 'bg-red-100 text-red-800',
          etc: 'bg-blue-100 text-blue-800',
        };
        return (
          <span
            className={`px-2 py-1 rounded text-xs ${
              statusColors[status] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: '생성일',
      cell: ({ row }) => {
        const date = row.getValue('createdAt') as string | undefined;
        return <div>{date ? new Date(date).toLocaleString() : '-'}</div>;
      },
    },
    {
      id: 'actions',
      header: '작업',
      cell: ({ row }) => {
        const cluster = row.original;
        return (
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(cluster);
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
    setIsCreateMode(true);
  };

  const handleCancelCreate = () => {
    setIsCreateMode(false);
  };

  const handleCreateSubmit = async (data: PMKClusterCreateRequest) => {
    try {
      await createMutation.mutateAsync(data);
      setIsCreateMode(false);
    } catch (error) {
      console.error('Create error:', error);
      throw error;
    }
  };

  const handleDelete = async (cluster: PMKCluster) => {
    if (confirm(`정말로 "${cluster.name}" PMK Cluster를 삭제하시겠습니까?`)) {
      try {
        await deleteMutation.mutateAsync(cluster.id);
        if (selectedCluster?.id === cluster.id) {
          setSelectedCluster(null);
        }
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {isCreateMode ? (
        <ClusterCreateForm
          onSubmit={handleCreateSubmit}
          onCancel={handleCancelCreate}
          isLoading={createMutation.isPending}
        />
      ) : (
        <CrudPageTemplate
          data={clusters}
          columns={columns}
          selectedItem={selectedCluster}
          onItemSelect={setSelectedCluster}
          onRefresh={refetch}
          isLoading={isLoading}
          onAdd={handleAdd}
          onDelete={handleDelete}
          title="PMK Workloads"
          addButtonLabel="PMK Cluster 추가"
          emptyMessage="PMK Cluster가 없습니다."
        />
      )}
    </div>
  );
}
