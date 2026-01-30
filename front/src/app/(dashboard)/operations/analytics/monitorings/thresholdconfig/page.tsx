'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { Switch } from '@/components/ui/switch';

/**
 * Threshold Config 페이지
 *
 * 임계값 설정 관리
 * - 임계값 목록 조회
 * - 임계값 생성, 수정, 삭제
 * - 임계값 활성화/비활성화
 * - TODO: Backend API 준비 필요 (mc-observability 임계값 API가 api.yaml에 없음)
 * - 향후 mc-observability 서비스 API 추가 후 연동
 */

interface ThresholdConfig {
  id: string;
  name: string;
  description: string;
  metric: 'cpu' | 'memory' | 'disk' | 'network';
  target: string;
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq';
  value: number;
  unit: string;
  severity: 'info' | 'warning' | 'critical';
  duration: number;
  enabled: boolean;
  actions: Array<{
    type: 'email' | 'slack' | 'webhook';
    destination: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export default function ThresholdConfigPage() {
  const [configs, setConfigs] = useState<ThresholdConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: API 연동
    // API: 임계값 설정 조회 API (mc-observability)
    const fetchConfigs = async () => {
      try {
        setLoading(true);

        // Mock data
        await new Promise((resolve) => setTimeout(resolve, 500));

        setConfigs([
          {
            id: 'threshold-1',
            name: 'High CPU Usage',
            description: 'Alert when CPU usage exceeds 80%',
            metric: 'cpu',
            target: 'production-mci/*',
            operator: 'gt',
            value: 80,
            unit: '%',
            severity: 'critical',
            duration: 300,
            enabled: true,
            actions: [
              { type: 'email', destination: 'ops@example.com' },
              { type: 'slack', destination: '#alerts' },
            ],
            createdAt: new Date('2026-01-20T10:00:00'),
            updatedAt: new Date('2026-01-20T10:00:00'),
          },
          {
            id: 'threshold-2',
            name: 'High Memory Usage',
            description: 'Alert when memory usage exceeds 75%',
            metric: 'memory',
            target: 'production-mci/*',
            operator: 'gt',
            value: 75,
            unit: '%',
            severity: 'warning',
            duration: 600,
            enabled: true,
            actions: [
              { type: 'email', destination: 'ops@example.com' },
            ],
            createdAt: new Date('2026-01-18T14:30:00'),
            updatedAt: new Date('2026-01-19T09:00:00'),
          },
          {
            id: 'threshold-3',
            name: 'Disk Space Low',
            description: 'Alert when disk usage exceeds 85%',
            metric: 'disk',
            target: 'production-mci/db-*',
            operator: 'gt',
            value: 85,
            unit: '%',
            severity: 'critical',
            duration: 300,
            enabled: true,
            actions: [
              { type: 'email', destination: 'ops@example.com' },
              { type: 'webhook', destination: 'https://api.example.com/alerts' },
            ],
            createdAt: new Date('2026-01-15T09:00:00'),
            updatedAt: new Date('2026-01-15T09:00:00'),
          },
          {
            id: 'threshold-4',
            name: 'Network Traffic High',
            description: 'Alert when network traffic exceeds 100 Mbps',
            metric: 'network',
            target: 'staging-mci/*',
            operator: 'gt',
            value: 100,
            unit: 'Mbps',
            severity: 'info',
            duration: 900,
            enabled: false,
            actions: [
              { type: 'slack', destination: '#monitoring' },
            ],
            createdAt: new Date('2026-01-10T11:00:00'),
            updatedAt: new Date('2026-01-10T11:00:00'),
          },
        ]);
      } catch (error) {
        console.error('Failed to fetch threshold configs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfigs();
  }, []);

  const handleCreate = () => {
    console.log('Create threshold config');
    // TODO: 생성 모달 열기
  };

  const handleEdit = (config: ThresholdConfig) => {
    console.log('Edit threshold config:', config);
    // TODO: 수정 모달 열기
  };

  const handleDelete = (config: ThresholdConfig) => {
    console.log('Delete threshold config:', config);
    // TODO: 삭제 확인 후 API 호출
  };

  const handleToggle = (config: ThresholdConfig) => {
    console.log('Toggle threshold config:', config);
    // TODO: API 호출하여 활성화/비활성화
    setConfigs((prev) =>
      prev.map((c) =>
        c.id === config.id ? { ...c, enabled: !c.enabled } : c
      )
    );
  };

  // 테이블 컬럼 정의
  const columns = [
    {
      accessorKey: 'enabled',
      header: 'Status',
      cell: ({ row }: any) => {
        const config = row.original;
        return (
          <Switch
            checked={config.enabled}
            onCheckedChange={() => handleToggle(config)}
          />
        );
      },
    },
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
      accessorKey: 'metric',
      header: 'Metric',
      cell: ({ row }: any) => {
        const metric = row.original.metric;
        const colors: Record<string, string> = {
          cpu: 'bg-blue-500',
          memory: 'bg-green-500',
          disk: 'bg-yellow-500',
          network: 'bg-purple-500',
        };
        return (
          <Badge variant="outline" className={colors[metric]}>
            {metric.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'condition',
      header: 'Condition',
      cell: ({ row }: any) => {
        const config = row.original;
        const operatorSymbols: Record<string, string> = {
          gt: '>',
          gte: '≥',
          lt: '<',
          lte: '≤',
          eq: '=',
        };
        return (
          <span className="text-sm font-mono">
            {operatorSymbols[config.operator]} {config.value} {config.unit}
          </span>
        );
      },
    },
    {
      accessorKey: 'severity',
      header: 'Severity',
      cell: ({ row }: any) => {
        const severity = row.original.severity;
        const variants: Record<string, 'default' | 'destructive' | 'secondary'> = {
          critical: 'destructive',
          warning: 'default',
          info: 'secondary',
        };
        const colors: Record<string, string> = {
          critical: 'text-red-600',
          warning: 'text-yellow-600',
          info: 'text-blue-600',
        };
        return (
          <div className="flex items-center gap-2">
            <AlertTriangle className={`h-4 w-4 ${colors[severity]}`} />
            <Badge variant={variants[severity]}>{severity}</Badge>
          </div>
        );
      },
    },
    {
      accessorKey: 'target',
      header: 'Target',
      cell: ({ row }: any) => (
        <span className="text-sm text-muted-foreground font-mono">
          {row.original.target}
        </span>
      ),
    },
    {
      accessorKey: 'duration',
      header: 'Duration',
      cell: ({ row }: any) => {
        const seconds = row.original.duration;
        const minutes = Math.floor(seconds / 60);
        return <span className="text-sm">{minutes}m</span>;
      },
    },
    {
      accessorKey: 'actions',
      header: 'Actions Count',
      cell: ({ row }: any) => {
        const actions = row.original.actions || [];
        return (
          <Badge variant="outline">
            {actions.length} action{actions.length !== 1 ? 's' : ''}
          </Badge>
        );
      },
    },
    {
      id: 'operations',
      header: 'Operations',
      cell: ({ row }: any) => {
        const config = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => handleEdit(config)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-destructive"
              onClick={() => handleDelete(config)}
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
          <h1 className="text-3xl font-bold tracking-tight">Threshold Config</h1>
          <p className="text-muted-foreground mt-2">
            임계값 설정 관리 및 모니터링
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Threshold
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Thresholds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{configs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Thresholds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {configs.filter((c) => c.enabled).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {configs.filter((c) => c.severity === 'critical' && c.enabled).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 임계값 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>Threshold Configurations ({configs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {configs.length === 0 ? (
            <EmptyState
              type="no-data"
              title="임계값 설정이 없습니다"
              description="새로운 임계값을 설정하세요"
              action={{
                label: 'Create Threshold',
                onClick: handleCreate,
              }}
            />
          ) : (
            <DataTable columns={columns} data={configs} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
