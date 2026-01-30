'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/components/monitoring/MetricCard';
import { ChartWidget } from '@/components/charts/ChartWidget';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { FolderOpen, Server, Users, Calendar } from 'lucide-react';
import { useWorkspaces } from '@/hooks/api/useWorkspaces';
import { useWorkspaceStats } from '@/hooks/api/useWorkspaceDashboard';

/**
 * Workspace Dashboard 페이지
 *
 * 워크스페이스별 리소스 통계 및 차트
 * - Workspace 선택 드롭다운
 * - 통계 카드 3개 (Projects, MCI, Users)
 * - Workspace 리소스 통계 차트
 * - API 연동 완료: listWorkspaces, getWorkspaceProjectsByWorkspaceId
 */

export default function WorkspaceDashboardPage() {
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');

  // API Hooks
  const { workspaces, isLoading: workspacesLoading } = useWorkspaces();
  const { stats, isLoading: statsLoading } = useWorkspaceStats(selectedWorkspace);

  const loading = workspacesLoading || statsLoading;

  useEffect(() => {
    // 워크스페이스 목록이 로드되면 첫 번째 워크스페이스 선택
    if (workspaces.length > 0 && !selectedWorkspace) {
      setSelectedWorkspace(workspaces[0].id);
    }
  }, [workspaces, selectedWorkspace]);

  // 차트 데이터
  const resourceTrendData = [
    { date: '1주 전', Projects: 6, MCI: 12, Users: 4 },
    { date: '5일 전', Projects: 7, MCI: 13, Users: 4 },
    { date: '3일 전', Projects: 7, MCI: 14, Users: 5 },
    { date: '1일 전', Projects: 8, MCI: 14, Users: 5 },
    { date: '오늘', Projects: 8, MCI: 15, Users: 5 },
  ];

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Workspace Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            워크스페이스별 리소스 현황
          </p>
        </div>

        {/* Workspace 선택 */}
        <Select value={selectedWorkspace} onValueChange={setSelectedWorkspace}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="워크스페이스 선택" />
          </SelectTrigger>
          <SelectContent>
            {workspaces.map((ws) => (
              <SelectItem key={ws.id} value={ws.id}>
                {ws.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 통계 카드 3개 */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Projects"
          value={stats.projects}
          icon={FolderOpen}
          trend={{ value: 2, direction: 'up' }}
          description="프로젝트 수"
        />
        <MetricCard
          title="MCI"
          value={stats.mci}
          icon={Server}
          trend={{ value: 3, direction: 'up' }}
          description="Multi-Cloud Infrastructure"
        />
        <MetricCard
          title="Users"
          value={stats.users}
          icon={Users}
          trend={{ value: 1, direction: 'up' }}
          description="참여 사용자"
        />
      </div>

      {/* Workspace 리소스 통계 차트 */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartWidget
          title="리소스 증가 추이"
          type="line"
          data={resourceTrendData}
          height={300}
          dataKey="Projects"
        />
        <ChartWidget
          title="리소스 분포"
          type="pie"
          data={[
            { name: 'Projects', value: stats.projects },
            { name: 'MCI', value: stats.mci },
            { name: 'Users', value: stats.users },
          ]}
          height={300}
        />
      </div>

      {/* Workspace 활동 로그 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <CardTitle>최근 활동</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ActivityFeed
            activities={[
              {
                id: '1',
                type: 'success',
                message: 'Project 생성',
                description: 'web-app 프로젝트가 생성되었습니다',
                timestamp: new Date(Date.now() - 1000 * 60 * 10),
                user: '김철수',
                resource: 'project-123',
              },
              {
                id: '2',
                type: 'info',
                message: 'MCI 업데이트',
                description: 'prod-mci 설정이 변경되었습니다',
                timestamp: new Date(Date.now() - 1000 * 60 * 30),
                user: '이영희',
                resource: 'mci-456',
              },
              {
                id: '3',
                type: 'success',
                message: '사용자 추가',
                description: '새로운 사용자가 워크스페이스에 추가되었습니다',
                timestamp: new Date(Date.now() - 1000 * 60 * 60),
                user: 'Admin',
                resource: 'user-789',
              },
            ]}
            maxItems={5}
            showLoadMore
          />
        </CardContent>
      </Card>
    </div>
  );
}
