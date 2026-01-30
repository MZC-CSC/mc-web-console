'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Plus, Pencil, Trash2, Play, ExternalLink } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWorkflows, useRunWorkflow, useWorkflowExecutions } from '@/hooks/api/useWorkflows';
import { toast } from 'sonner';

/**
 * Workflow Management 페이지
 *
 * 워크플로우 관리
 * - Workflow 목록 조회 및 CRUD
 * - Workflow 실행
 * - IFrame 통합 (네이티브 + IFrame 혼합)
 * - API 연동 완료: GetWorkflowListUsingGET, RunWorkflowGetUsingGET
 */

interface Workflow {
  workflowIdx: number;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft' | 'error';
  type: 'manual' | 'scheduled' | 'triggered';
  steps: Array<{
    stepIdx: number;
    name: string;
    type: string;
    order: number;
  }>;
  lastExecutedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export default function WorkflowPage() {
  const [activeTab, setActiveTab] = useState<'native' | 'iframe'>('native');
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  // API Hooks
  const { workflows, isLoading: loading, refetch } = useWorkflows();
  const { mutate: runWorkflow } = useRunWorkflow();
  const { executions } = useWorkflowExecutions(selectedWorkflow?.workflowIdx);

  // Workflow 실행
  const handleRunWorkflow = (workflow: Workflow) => {
    runWorkflow(workflow.workflowIdx, {
      onSuccess: () => {
        toast.success(`Workflow "${workflow.name}" 실행이 시작되었습니다.`);
        refetch();
      },
      onError: (error: any) => {
        toast.error(`Workflow 실행 실패: ${error.message}`);
      },
    });
  };

  const handleCreate = () => {
    console.log('Create workflow');
    // TODO: 생성 모달 열기 또는 생성 페이지로 이동
    // API: RegistWorkflowUsingPOST (mc-workflow-manager)
    // 경로: /workflow
  };

  const handleEdit = (workflow: Workflow) => {
    console.log('Edit workflow:', workflow);
    // TODO: 수정 모달 열기 또는 수정 페이지로 이동
    // API: GetWorkflowUsingGET (mc-workflow-manager)
    // 경로: /workflow/{workflowIdx}
  };

  const handleDelete = (workflow: Workflow) => {
    console.log('Delete workflow:', workflow);
    // TODO: 삭제 확인 후 API 호출
    // API: DeleteWorkflowUsingDELETE (mc-workflow-manager)
    // 경로: /workflow/{workflowIdx}
  };

  const handleExecute = (workflow: Workflow) => {
    handleRunWorkflow(workflow);
  };

  const handleViewDetails = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
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
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }: any) => {
        const type = row.original.type;
        const colors: Record<string, string> = {
          manual: 'bg-blue-500',
          scheduled: 'bg-green-500',
          triggered: 'bg-purple-500',
        };
        return (
          <Badge variant="outline" className={colors[type]}>
            {type.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.original.status;
        const variants: Record<string, 'default' | 'destructive' | 'secondary'> = {
          active: 'default',
          inactive: 'secondary',
          draft: 'secondary',
          error: 'destructive',
        };
        const colors: Record<string, string> = {
          active: 'text-green-600',
          inactive: 'text-gray-600',
          draft: 'text-yellow-600',
          error: 'text-red-600',
        };
        return (
          <Badge variant={variants[status]} className={colors[status]}>
            {status.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'steps',
      header: 'Steps',
      cell: ({ row }: any) => {
        const steps = row.original.steps || [];
        return <span className="text-sm">{steps.length} steps</span>;
      },
    },
    {
      accessorKey: 'lastExecutedAt',
      header: 'Last Executed',
      cell: ({ row }: any) => {
        const date = row.original.lastExecutedAt;
        if (!date) return <span className="text-sm text-muted-foreground">-</span>;
        return (
          <div className="text-sm">
            <div>{new Date(date).toLocaleDateString('ko-KR')}</div>
            <div className="text-xs text-muted-foreground">
              {new Date(date).toLocaleTimeString('ko-KR')}
            </div>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => {
        const workflow = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => handleViewDetails(workflow)}
              title="View Details"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-green-600"
              onClick={() => handleExecute(workflow)}
              title="Execute"
              disabled={workflow.status !== 'active'}
            >
              <Play className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => handleEdit(workflow)}
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-destructive"
              onClick={() => handleDelete(workflow)}
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
          <h1 className="text-3xl font-bold tracking-tight">Workflow Management</h1>
          <p className="text-muted-foreground mt-2">
            워크플로우 생성, 관리 및 실행
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      {/* 탭 */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList>
          <TabsTrigger value="native">Native View</TabsTrigger>
          <TabsTrigger value="iframe">IFrame View</TabsTrigger>
        </TabsList>

        {/* Native 탭 */}
        <TabsContent value="native" className="space-y-4">
          {/* 통계 카드 */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{workflows.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {workflows.filter((w) => w.status === 'active').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Running</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {executions.filter((e) => e.status === 'running').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {executions.length > 0
                    ? Math.round(
                        (executions.filter((e) => e.status === 'success').length /
                          executions.filter((e) => e.status !== 'running' && e.status !== 'pending')
                            .length) *
                          100
                      )
                    : 0}
                  %
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Workflow 목록 */}
          <Card>
            <CardHeader>
              <CardTitle>Workflows ({workflows.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {workflows.length === 0 ? (
                <EmptyState
                  type="no-data"
                  title="워크플로우가 없습니다"
                  description="새로운 워크플로우를 생성하세요"
                  action={{
                    label: 'Create Workflow',
                    onClick: handleCreate,
                  }}
                />
              ) : (
                <DataTable columns={columns} data={workflows} />
              )}
            </CardContent>
          </Card>

          {/* Workflow 상세 (선택 시) */}
          {selectedWorkflow && (
            <Card>
              <CardHeader>
                <CardTitle>Workflow Details: {selectedWorkflow.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedWorkflow.description}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Steps ({selectedWorkflow.steps.length})</h4>
                    <div className="space-y-2">
                      {selectedWorkflow.steps.map((step, index) => (
                        <div
                          key={step.stepIdx}
                          className="flex items-center gap-3 p-2 border rounded"
                        >
                          <Badge variant="outline">{index + 1}</Badge>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{step.name}</div>
                            <div className="text-xs text-muted-foreground">{step.type}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold">Type:</span>{' '}
                      <Badge variant="outline">{selectedWorkflow.type}</Badge>
                    </div>
                    <div>
                      <span className="font-semibold">Status:</span>{' '}
                      <Badge>{selectedWorkflow.status}</Badge>
                    </div>
                    <div>
                      <span className="font-semibold">Created By:</span>{' '}
                      {selectedWorkflow.createdBy}
                    </div>
                    <div>
                      <span className="font-semibold">Last Executed:</span>{' '}
                      {selectedWorkflow.lastExecutedAt
                        ? new Date(selectedWorkflow.lastExecutedAt).toLocaleString()
                        : 'Never'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* IFrame 탭 */}
        <TabsContent value="iframe" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Manager (IFrame)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden" style={{ height: '600px' }}>
                <iframe
                  src="/workflow-manager-iframe"
                  className="w-full h-full"
                  title="Workflow Manager"
                  sandbox="allow-same-origin allow-scripts allow-forms"
                />
                {/* TODO: 실제 IFrame URL 설정 */}
                {/* 예: src="https://workflow-manager.example.com" */}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                ⚠️ IFrame URL을 설정하여 외부 워크플로우 관리 도구를 통합할 수 있습니다.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
