'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, FileText } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';

/**
 * MCI Policy Management 페이지
 *
 * MCI 정책 관리
 * - MCI Policy 목록 조회
 * - MCI Policy 생성, 수정, 삭제
 * - TODO: Backend API 준비 필요 (MCI Policy 관련 API가 api.yaml에 없음)
 * - 향후 API: Getallmcipolicy, Getmcipolicy, Postmcipolicy, Delmcipolicy 추가 후 연동
 */

interface MCIPolicy {
  id: string;
  mciId: string;
  name: string;
  description: string;
  nsId: string;
  policyType: 'scaling' | 'availability' | 'performance' | 'cost';
  rules: Array<{
    condition: string;
    action: string;
  }>;
  enabled: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function MCIPolicyPage() {
  const [policies, setPolicies] = useState<MCIPolicy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: API 연동
    // API: Getallmcipolicy (mc-infra-manager)
    // 경로: /ns/{nsId}/policy/mci
    const fetchPolicies = async () => {
      try {
        setLoading(true);

        // Mock data
        await new Promise((resolve) => setTimeout(resolve, 500));

        setPolicies([
          {
            id: 'policy-1',
            mciId: 'production-mci',
            name: 'Auto Scaling Policy',
            description: 'Automatically scale based on CPU usage',
            nsId: 'default-ns',
            policyType: 'scaling',
            rules: [
              {
                condition: 'cpu_usage > 80%',
                action: 'scale_out(+2)',
              },
              {
                condition: 'cpu_usage < 30%',
                action: 'scale_in(-1)',
              },
            ],
            enabled: true,
            priority: 1,
            createdAt: new Date('2026-01-20T10:00:00'),
            updatedAt: new Date('2026-01-20T10:00:00'),
          },
          {
            id: 'policy-2',
            mciId: 'production-mci',
            name: 'High Availability Policy',
            description: 'Maintain minimum 3 instances',
            nsId: 'default-ns',
            policyType: 'availability',
            rules: [
              {
                condition: 'instance_count < 3',
                action: 'launch_instance',
              },
              {
                condition: 'instance_health == unhealthy',
                action: 'replace_instance',
              },
            ],
            enabled: true,
            priority: 2,
            createdAt: new Date('2026-01-18T14:30:00'),
            updatedAt: new Date('2026-01-19T09:00:00'),
          },
          {
            id: 'policy-3',
            mciId: 'staging-mci',
            name: 'Performance Optimization',
            description: 'Optimize resource allocation',
            nsId: 'default-ns',
            policyType: 'performance',
            rules: [
              {
                condition: 'memory_usage > 85%',
                action: 'increase_memory',
              },
              {
                condition: 'response_time > 2s',
                action: 'optimize_resources',
              },
            ],
            enabled: false,
            priority: 3,
            createdAt: new Date('2026-01-15T09:00:00'),
            updatedAt: new Date('2026-01-15T09:00:00'),
          },
          {
            id: 'policy-4',
            mciId: 'development-mci',
            name: 'Cost Optimization',
            description: 'Reduce costs during off-peak hours',
            nsId: 'default-ns',
            policyType: 'cost',
            rules: [
              {
                condition: 'time == 22:00-06:00',
                action: 'scale_to_minimum',
              },
              {
                condition: 'weekend == true',
                action: 'shutdown_non_critical',
              },
            ],
            enabled: true,
            priority: 4,
            createdAt: new Date('2026-01-10T11:00:00'),
            updatedAt: new Date('2026-01-10T11:00:00'),
          },
        ]);
      } catch (error) {
        console.error('Failed to fetch MCI policies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, []);

  const handleCreate = () => {
    console.log('Create MCI policy');
    // TODO: 생성 모달 열기 또는 생성 페이지로 이동
    // API: Postmcipolicy (mc-infra-manager)
    // 경로: /ns/{nsId}/policy/mci/{mciId}
  };

  const handleEdit = (policy: MCIPolicy) => {
    console.log('Edit MCI policy:', policy);
    // TODO: 수정 모달 열기 또는 수정 페이지로 이동
    // API: Getmcipolicy (mc-infra-manager)
    // 경로: /ns/{nsId}/policy/mci/{mciId}
  };

  const handleDelete = (policy: MCIPolicy) => {
    console.log('Delete MCI policy:', policy);
    // TODO: 삭제 확인 후 API 호출
    // API: Delmcipolicy (mc-infra-manager)
    // 경로: /ns/{nsId}/policy/mci/{mciId}
  };

  const handleViewDetails = (policy: MCIPolicy) => {
    console.log('View policy details:', policy);
    // TODO: 상세 페이지로 이동 또는 상세 모달 열기
  };

  // 테이블 컬럼 정의
  const columns = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.description}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'mciId',
      header: 'MCI ID',
      cell: ({ row }: any) => (
        <span className="font-mono text-sm">{row.original.mciId}</span>
      ),
    },
    {
      accessorKey: 'policyType',
      header: 'Type',
      cell: ({ row }: any) => {
        const type = row.original.policyType;
        const colors: Record<string, string> = {
          scaling: 'bg-blue-500',
          availability: 'bg-green-500',
          performance: 'bg-purple-500',
          cost: 'bg-yellow-500',
        };
        return (
          <Badge variant="outline" className={colors[type]}>
            {type.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'rules',
      header: 'Rules',
      cell: ({ row }: any) => {
        const rules = row.original.rules || [];
        return (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{rules.length} rule{rules.length !== 1 ? 's' : ''}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'enabled',
      header: 'Status',
      cell: ({ row }: any) => {
        const enabled = row.original.enabled;
        return (
          <Badge variant={enabled ? 'default' : 'secondary'}>
            {enabled ? 'Enabled' : 'Disabled'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }: any) => (
        <Badge variant="outline">P{row.original.priority}</Badge>
      ),
    },
    {
      accessorKey: 'updatedAt',
      header: 'Updated At',
      cell: ({ row }: any) => {
        const date = new Date(row.original.updatedAt);
        return (
          <div className="text-sm">
            <div>{date.toLocaleDateString('ko-KR')}</div>
            <div className="text-xs text-muted-foreground">
              {date.toLocaleTimeString('ko-KR')}
            </div>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => {
        const policy = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => handleViewDetails(policy)}
              title="View Details"
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => handleEdit(policy)}
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-destructive"
              onClick={() => handleDelete(policy)}
              title="Delete"
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
          <h1 className="text-3xl font-bold tracking-tight">MCI Policy Management</h1>
          <p className="text-muted-foreground mt-2">
            MCI 정책 관리 및 설정
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Policy
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{policies.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Enabled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {policies.filter((p) => p.enabled).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Scaling Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {policies.filter((p) => p.policyType === 'scaling').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">HA Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {policies.filter((p) => p.policyType === 'availability').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 정책 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>MCI Policies ({policies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {policies.length === 0 ? (
            <EmptyState
              type="no-data"
              title="MCI 정책이 없습니다"
              description="새로운 MCI 정책을 생성하세요"
              action={{
                label: 'Create Policy',
                onClick: handleCreate,
              }}
            />
          ) : (
            <DataTable columns={columns} data={policies} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
