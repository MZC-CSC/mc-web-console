'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { RefreshCw, Plus, Play, Square, Trash2 } from 'lucide-react';

/**
 * VM List Demo 페이지
 *
 * VM 목록 데모 및 테스트
 * - VM 목록 표시
 * - VM 작업 (시작, 중지, 삭제)
 * - 데모 목적으로 Mock 데이터 사용 (의도적)
 */

interface VM {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'pending';
  type: string;
  ip: string;
  cpu: number;
  memory: number;
  createdAt: Date;
}

export default function VMListDemoPage() {
  const [vms, setVms] = useState<VM[]>([
    {
      id: 'vm-001',
      name: 'web-server-01',
      status: 'running',
      type: 't2.medium',
      ip: '192.168.1.10',
      cpu: 2,
      memory: 4096,
      createdAt: new Date('2026-01-20T10:00:00'),
    },
    {
      id: 'vm-002',
      name: 'db-server-01',
      status: 'running',
      type: 't2.large',
      ip: '192.168.1.11',
      cpu: 4,
      memory: 8192,
      createdAt: new Date('2026-01-18T14:30:00'),
    },
    {
      id: 'vm-003',
      name: 'app-server-01',
      status: 'stopped',
      type: 't2.small',
      ip: '192.168.1.12',
      cpu: 1,
      memory: 2048,
      createdAt: new Date('2026-01-15T09:00:00'),
    },
    {
      id: 'vm-004',
      name: 'test-server-01',
      status: 'pending',
      type: 't2.micro',
      ip: '192.168.1.13',
      cpu: 1,
      memory: 1024,
      createdAt: new Date('2026-01-26T11:00:00'),
    },
  ]);

  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const handleStart = (vm: VM) => {
    alert(`Starting VM: ${vm.name}`);
    setVms((prev) =>
      prev.map((v) => (v.id === vm.id ? { ...v, status: 'running' as const } : v))
    );
  };

  const handleStop = (vm: VM) => {
    alert(`Stopping VM: ${vm.name}`);
    setVms((prev) =>
      prev.map((v) => (v.id === vm.id ? { ...v, status: 'stopped' as const } : v))
    );
  };

  const handleDelete = (vm: VM) => {
    if (confirm(`Delete VM: ${vm.name}?`)) {
      setVms((prev) => prev.filter((v) => v.id !== vm.id));
    }
  };

  const columns = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.name}</div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.original.status;
        const variants: Record<string, 'default' | 'destructive' | 'secondary'> = {
          running: 'default',
          stopped: 'secondary',
          pending: 'secondary',
        };
        const colors: Record<string, string> = {
          running: 'text-green-600',
          stopped: 'text-gray-600',
          pending: 'text-yellow-600',
        };
        return (
          <Badge variant={variants[status]} className={colors[status]}>
            {status.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }: any) => (
        <span className="text-sm">{row.original.type}</span>
      ),
    },
    {
      accessorKey: 'ip',
      header: 'IP Address',
      cell: ({ row }: any) => (
        <span className="text-sm font-mono">{row.original.ip}</span>
      ),
    },
    {
      accessorKey: 'resources',
      header: 'Resources',
      cell: ({ row }: any) => (
        <div className="text-sm">
          <div>{row.original.cpu} vCPU</div>
          <div className="text-xs text-muted-foreground">
            {row.original.memory} MB
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }: any) => {
        const date = new Date(row.original.createdAt);
        return (
          <div className="text-sm">
            {date.toLocaleDateString('ko-KR')}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => {
        const vm = row.original;
        return (
          <div className="flex items-center gap-2">
            {vm.status === 'stopped' && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-green-600"
                onClick={() => handleStart(vm)}
                title="Start"
              >
                <Play className="h-4 w-4" />
              </Button>
            )}
            {vm.status === 'running' && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-yellow-600"
                onClick={() => handleStop(vm)}
                title="Stop"
              >
                <Square className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-destructive"
              onClick={() => handleDelete(vm)}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">VM List Demo</h1>
            <Badge variant="secondary">DEMO</Badge>
          </div>
          <p className="text-muted-foreground mt-2">
            VM 목록 데모 및 테스트 페이지
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create VM
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total VMs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vms.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Running</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {vms.filter((v) => v.status === 'running').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Stopped</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {vms.filter((v) => v.status === 'stopped').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* VM 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>Virtual Machines ({vms.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={vms} />
        </CardContent>
      </Card>

      {/* Demo 안내 */}
      <Card className="bg-muted">
        <CardHeader>
          <CardTitle>Demo Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <strong>기능:</strong> VM 시작, 중지, 삭제 기능을 테스트할 수 있습니다.
            </p>
            <p>
              <strong>데이터:</strong> 모든 VM 데이터는 Mock 데이터입니다.
            </p>
            <p>
              <strong>상태 변경:</strong> VM 작업 시 상태가 실시간으로 변경됩니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
