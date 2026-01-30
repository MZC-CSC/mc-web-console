'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';

/**
 * Operation Service (NLB) 페이지
 *
 * Network Load Balancer 관리
 * - NLB 목록 조회
 * - NLB 생성, 수정, 삭제
 * - TODO: Backend API 준비 필요 (NLB 관련 API가 api.yaml에 없음)
 * - 향후 API: Getallnlb, Getnlb, Postnlb, Delnlb 추가 후 연동
 */

interface NLB {
  id: string;
  name: string;
  type: 'application' | 'network' | 'gateway';
  status: 'active' | 'inactive' | 'error';
  protocol: 'HTTP' | 'HTTPS' | 'TCP' | 'UDP';
  port: number;
  targetPort: number;
  mciId: string;
  nsId: string;
  healthCheck: {
    enabled: boolean;
    interval: number;
    timeout: number;
  };
  targets: Array<{
    vmId: string;
    status: 'healthy' | 'unhealthy';
  }>;
  createdAt: Date;
}

export default function OperationServicePage() {
  const [nlbs, setNlbs] = useState<NLB[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: API 연동
    // API: Getallnlb (mc-infra-manager)
    // 경로: /ns/{nsId}/mci/{mciId}/nlb
    const fetchNLBs = async () => {
      try {
        setLoading(true);

        // Mock data
        await new Promise((resolve) => setTimeout(resolve, 500));

        setNlbs([
          {
            id: 'nlb-1',
            name: 'production-nlb',
            type: 'application',
            status: 'active',
            protocol: 'HTTPS',
            port: 443,
            targetPort: 8080,
            mciId: 'production-mci',
            nsId: 'default-ns',
            healthCheck: {
              enabled: true,
              interval: 30,
              timeout: 5,
            },
            targets: [
              { vmId: 'web-server-01', status: 'healthy' },
              { vmId: 'web-server-02', status: 'healthy' },
            ],
            createdAt: new Date('2026-01-20T10:00:00'),
          },
          {
            id: 'nlb-2',
            name: 'staging-nlb',
            type: 'network',
            status: 'active',
            protocol: 'TCP',
            port: 80,
            targetPort: 8080,
            mciId: 'staging-mci',
            nsId: 'default-ns',
            healthCheck: {
              enabled: true,
              interval: 30,
              timeout: 5,
            },
            targets: [
              { vmId: 'app-server-01', status: 'healthy' },
            ],
            createdAt: new Date('2026-01-18T14:30:00'),
          },
          {
            id: 'nlb-3',
            name: 'api-gateway-nlb',
            type: 'gateway',
            status: 'inactive',
            protocol: 'HTTPS',
            port: 443,
            targetPort: 3000,
            mciId: 'production-mci',
            nsId: 'default-ns',
            healthCheck: {
              enabled: false,
              interval: 60,
              timeout: 10,
            },
            targets: [
              { vmId: 'api-server-01', status: 'unhealthy' },
              { vmId: 'api-server-02', status: 'healthy' },
            ],
            createdAt: new Date('2026-01-15T09:00:00'),
          },
        ]);
      } catch (error) {
        console.error('Failed to fetch NLBs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNLBs();
  }, []);

  const handleCreate = () => {
    console.log('Create NLB');
    // TODO: 생성 모달 열기 또는 생성 페이지로 이동
    // API: Postnlb (mc-infra-manager)
    // 경로: /ns/{nsId}/mci/{mciId}/nlb
  };

  const handleEdit = (nlb: NLB) => {
    console.log('Edit NLB:', nlb);
    // TODO: 수정 모달 열기 또는 수정 페이지로 이동
    // API: Getnlb (mc-infra-manager)
    // 경로: /ns/{nsId}/mci/{mciId}/nlb/{nlbId}
  };

  const handleDelete = (nlb: NLB) => {
    console.log('Delete NLB:', nlb);
    // TODO: 삭제 확인 후 API 호출
    // API: Delnlb (mc-infra-manager)
    // 경로: /ns/{nsId}/mci/{mciId}/nlb/{nlbId}
  };

  // 테이블 컬럼 정의
  const columns = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.name}</div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }: any) => {
        const type = row.original.type;
        const colors: Record<string, string> = {
          application: 'bg-blue-500',
          network: 'bg-green-500',
          gateway: 'bg-purple-500',
        };
        return (
          <Badge variant="outline" className={colors[type]}>
            {type.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'protocol',
      header: 'Protocol',
      cell: ({ row }: any) => (
        <Badge variant="secondary">{row.original.protocol}</Badge>
      ),
    },
    {
      accessorKey: 'port',
      header: 'Port',
      cell: ({ row }: any) => (
        <span className="text-sm">
          {row.original.port} → {row.original.targetPort}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.original.status;
        const variants: Record<string, 'default' | 'destructive' | 'secondary'> = {
          active: 'default',
          inactive: 'secondary',
          error: 'destructive',
        };
        const colors: Record<string, string> = {
          active: 'text-green-600',
          inactive: 'text-gray-600',
          error: 'text-red-600',
        };
        return (
          <Badge variant={variants[status]} className={colors[status]}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'targets',
      header: 'Targets',
      cell: ({ row }: any) => {
        const targets = row.original.targets || [];
        const healthy = targets.filter((t: any) => t.status === 'healthy').length;
        const total = targets.length;
        return (
          <span className="text-sm">
            {healthy}/{total} healthy
          </span>
        );
      },
    },
    {
      accessorKey: 'mciId',
      header: 'MCI',
      cell: ({ row }: any) => (
        <span className="text-sm text-muted-foreground">{row.original.mciId}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => {
        const nlb = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => handleEdit(nlb)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-destructive"
              onClick={() => handleDelete(nlb)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Operation Service</h1>
          <p className="text-muted-foreground mt-2">
            Network Load Balancer 관리
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create NLB
        </Button>
      </div>

      {/* NLB 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>Network Load Balancers ({nlbs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {nlbs.length === 0 ? (
            <EmptyState
              type="no-data"
              title="NLB가 없습니다"
              description="새로운 Network Load Balancer를 생성하세요"
              action={{
                label: 'Create NLB',
                onClick: handleCreate,
              }}
            />
          ) : (
            <DataTable columns={columns} data={nlbs} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
