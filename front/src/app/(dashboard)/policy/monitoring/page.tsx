'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { Switch } from '@/components/ui/switch';

/**
 * Monitoring Configuration & Alarms History 페이지
 *
 * 모니터링 정책 관리
 * - Anomaly Detection 설정 관리
 * - Trigger History 조회
 * - TODO: Backend API 준비 필요 (mc-observability 서비스가 api.yaml에 없음)
 * - 향후 API: Getallanomalydetectionsettings, Postanomalydetectionsettings, Gettriggerhistoryalllist 추가 후 연동
 */

interface AnomalyDetectionSetting {
  id: string;
  name: string;
  description: string;
  metric: string;
  target: string;
  algorithm: 'isolation_forest' | 'z_score' | 'moving_average';
  sensitivity: 'low' | 'medium' | 'high';
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface TriggerHistory {
  id: string;
  policyName: string;
  triggerType: 'anomaly' | 'threshold' | 'manual';
  severity: 'info' | 'warning' | 'critical';
  target: string;
  metric: string;
  value: number;
  message: string;
  status: 'triggered' | 'acknowledged' | 'resolved';
  triggeredAt: Date;
  resolvedAt?: Date;
}

export default function MonitoringPolicyPage() {
  const [activeTab, setActiveTab] = useState<'configuration' | 'history'>('configuration');
  const [configurations, setConfigurations] = useState<AnomalyDetectionSetting[]>([]);
  const [triggerHistory, setTriggerHistory] = useState<TriggerHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: API 연동
    // API: Getallanomalydetectionsettings (mc-observability)
    // 경로: /api/o11y/insight/anomaly-detection/settings
    const fetchData = async () => {
      try {
        setLoading(true);

        // Mock data for configurations
        await new Promise((resolve) => setTimeout(resolve, 500));

        setConfigurations([
          {
            id: 'config-1',
            name: 'CPU Anomaly Detection',
            description: 'Detect abnormal CPU usage patterns',
            metric: 'cpu_usage',
            target: 'production-mci/*',
            algorithm: 'isolation_forest',
            sensitivity: 'high',
            enabled: true,
            createdAt: new Date('2026-01-20T10:00:00'),
            updatedAt: new Date('2026-01-20T10:00:00'),
          },
          {
            id: 'config-2',
            name: 'Memory Anomaly Detection',
            description: 'Detect memory usage anomalies',
            metric: 'memory_usage',
            target: 'production-mci/*',
            algorithm: 'z_score',
            sensitivity: 'medium',
            enabled: true,
            createdAt: new Date('2026-01-18T14:30:00'),
            updatedAt: new Date('2026-01-19T09:00:00'),
          },
          {
            id: 'config-3',
            name: 'Network Traffic Anomaly',
            description: 'Detect unusual network patterns',
            metric: 'network_traffic',
            target: 'staging-mci/*',
            algorithm: 'moving_average',
            sensitivity: 'low',
            enabled: false,
            createdAt: new Date('2026-01-15T09:00:00'),
            updatedAt: new Date('2026-01-15T09:00:00'),
          },
        ]);

        // Mock data for trigger history
        // API: Gettriggerhistoryalllist (mc-observability)
        // 경로: /api/o11y/trigger/policy/history
        setTriggerHistory([
          {
            id: 'trigger-1',
            policyName: 'CPU Anomaly Detection',
            triggerType: 'anomaly',
            severity: 'critical',
            target: 'production-mci/web-server-01',
            metric: 'cpu_usage',
            value: 95.8,
            message: 'Abnormal CPU spike detected',
            status: 'resolved',
            triggeredAt: new Date('2026-01-26T10:30:00'),
            resolvedAt: new Date('2026-01-26T11:00:00'),
          },
          {
            id: 'trigger-2',
            policyName: 'Memory Anomaly Detection',
            triggerType: 'anomaly',
            severity: 'warning',
            target: 'production-mci/app-server-02',
            metric: 'memory_usage',
            value: 78.5,
            message: 'Memory usage pattern anomaly',
            status: 'acknowledged',
            triggeredAt: new Date('2026-01-26T09:15:00'),
          },
          {
            id: 'trigger-3',
            policyName: 'Network Traffic Anomaly',
            triggerType: 'anomaly',
            severity: 'info',
            target: 'staging-mci/web-server-03',
            metric: 'network_traffic',
            value: 125.0,
            message: 'Unusual traffic pattern detected',
            status: 'resolved',
            triggeredAt: new Date('2026-01-25T23:30:00'),
            resolvedAt: new Date('2026-01-26T00:15:00'),
          },
        ]);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateConfig = () => {
    console.log('Create anomaly detection setting');
    // TODO: 생성 모달 열기
    // API: Postanomalydetectionsettings (mc-observability)
  };

  const handleEditConfig = (config: AnomalyDetectionSetting) => {
    console.log('Edit config:', config);
    // TODO: 수정 모달 열기
  };

  const handleDeleteConfig = (config: AnomalyDetectionSetting) => {
    console.log('Delete config:', config);
    // TODO: 삭제 확인 후 API 호출
  };

  const handleToggleConfig = (config: AnomalyDetectionSetting) => {
    console.log('Toggle config:', config);
    // TODO: API 호출하여 활성화/비활성화
    setConfigurations((prev) =>
      prev.map((c) =>
        c.id === config.id ? { ...c, enabled: !c.enabled } : c
      )
    );
  };

  // Configuration 테이블 컬럼
  const configColumns = [
    {
      accessorKey: 'enabled',
      header: 'Status',
      cell: ({ row }: any) => {
        const config = row.original;
        return (
          <Switch
            checked={config.enabled}
            onCheckedChange={() => handleToggleConfig(config)}
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
      cell: ({ row }: any) => (
        <Badge variant="outline">{row.original.metric}</Badge>
      ),
    },
    {
      accessorKey: 'algorithm',
      header: 'Algorithm',
      cell: ({ row }: any) => {
        const algorithm = row.original.algorithm;
        const labels: Record<string, string> = {
          isolation_forest: 'Isolation Forest',
          z_score: 'Z-Score',
          moving_average: 'Moving Average',
        };
        return <span className="text-sm">{labels[algorithm]}</span>;
      },
    },
    {
      accessorKey: 'sensitivity',
      header: 'Sensitivity',
      cell: ({ row }: any) => {
        const sensitivity = row.original.sensitivity;
        const colors: Record<string, string> = {
          low: 'bg-blue-500',
          medium: 'bg-yellow-500',
          high: 'bg-red-500',
        };
        return (
          <Badge variant="outline" className={colors[sensitivity]}>
            {sensitivity.toUpperCase()}
          </Badge>
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
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => {
        const config = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => handleEditConfig(config)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-destructive"
              onClick={() => handleDeleteConfig(config)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  // Trigger History 테이블 컬럼
  const historyColumns = [
    {
      accessorKey: 'severity',
      header: 'Severity',
      cell: ({ row }: any) => {
        const severity = row.original.severity;
        const variants: Record<string, 'destructive' | 'default' | 'secondary'> = {
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
      accessorKey: 'policyName',
      header: 'Policy',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.policyName}</div>
      ),
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
      accessorKey: 'message',
      header: 'Message',
      cell: ({ row }: any) => (
        <div className="text-sm">{row.original.message}</div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.original.status;
        const variants: Record<string, 'destructive' | 'default' | 'secondary'> = {
          triggered: 'destructive',
          acknowledged: 'default',
          resolved: 'secondary',
        };
        return <Badge variant={variants[status]}>{status}</Badge>;
      },
    },
    {
      accessorKey: 'triggeredAt',
      header: 'Triggered At',
      cell: ({ row }: any) => {
        const date = new Date(row.original.triggeredAt);
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
  ];

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Monitoring Policy</h1>
        <p className="text-muted-foreground mt-2">
          모니터링 정책 및 알람 이력 관리
        </p>
      </div>

      {/* 탭 컨텐츠 */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="history">Alarms History</TabsTrigger>
        </TabsList>

        {/* Configuration 탭 */}
        <TabsContent value="configuration" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Anomaly Detection Settings</h2>
              <p className="text-sm text-muted-foreground">
                이상 탐지 설정을 관리합니다
              </p>
            </div>
            <Button onClick={handleCreateConfig}>
              <Plus className="h-4 w-4 mr-2" />
              Create Setting
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detection Settings ({configurations.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {configurations.length === 0 ? (
                <EmptyState
                  type="no-data"
                  title="설정이 없습니다"
                  description="새로운 이상 탐지 설정을 생성하세요"
                  action={{
                    label: 'Create Setting',
                    onClick: handleCreateConfig,
                  }}
                />
              ) : (
                <DataTable columns={configColumns} data={configurations} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alarms History 탭 */}
        <TabsContent value="history" className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Trigger History</h2>
            <p className="text-sm text-muted-foreground">
              정책 트리거 이력을 조회합니다
            </p>
          </div>

          {/* 통계 카드 */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Triggers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{triggerHistory.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Triggers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {triggerHistory.filter((t) => t.status === 'triggered').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {triggerHistory.filter((t) => t.status === 'resolved').length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Trigger History ({triggerHistory.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {triggerHistory.length === 0 ? (
                <EmptyState
                  type="no-data"
                  title="트리거 이력이 없습니다"
                  description="정책 트리거가 발생하면 여기에 표시됩니다"
                />
              ) : (
                <DataTable columns={historyColumns} data={triggerHistory} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
