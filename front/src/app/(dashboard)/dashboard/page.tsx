'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/components/monitoring/MetricCard';
import { ResourceUsageChart } from '@/components/operation/ResourceUsageChart';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { Users, FolderOpen, Server, Building2 } from 'lucide-react';
import { useDashboardStats } from '@/hooks/api/useDashboardStats';

/**
 * Dashboard 페이지
 *
 * 메인 대시보드 화면
 * - 통계 카드 4개 (Workspaces, Projects, MCI, Users)
 * - 리소스 사용량 차트
 * - 최근 활동 목록
 * - API 연동 완료: listWorkspaces, listProjects, listUsers
 */

export default function DashboardPage() {
  const { stats, isLoading: loading } = useDashboardStats();

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Multi-Cloud Web Console 대시보드
        </p>
      </div>

      {/* 통계 카드 4개 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Workspaces"
          value={stats.workspaces}
          icon={Building2}
          trend={{ value: 2, direction: 'up' }}
          description="활성 워크스페이스"
        />
        <MetricCard
          title="Projects"
          value={stats.projects}
          icon={FolderOpen}
          trend={{ value: 5, direction: 'up' }}
          description="진행 중인 프로젝트"
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
          description="등록된 사용자"
        />
      </div>

      {/* 리소스 사용량 차트 */}
      <div className="grid gap-4 md:grid-cols-2">
        <ResourceUsageChart
          title="CPU 사용량"
          metrics={[
            {
              type: 'cpu',
              label: 'CPU',
              data: [
                { timestamp: '00:00', value: 45 },
                { timestamp: '04:00', value: 52 },
                { timestamp: '08:00', value: 68 },
                { timestamp: '12:00', value: 75 },
                { timestamp: '16:00', value: 62 },
                { timestamp: '20:00', value: 55 },
              ],
              unit: '%',
              threshold: { warning: 70, critical: 90 },
            },
          ]}
          height={300}
        />
        <ResourceUsageChart
          title="메모리 사용량"
          metrics={[
            {
              type: 'memory',
              label: 'Memory',
              data: [
                { timestamp: '00:00', value: 55 },
                { timestamp: '04:00', value: 58 },
                { timestamp: '08:00', value: 72 },
                { timestamp: '12:00', value: 78 },
                { timestamp: '16:00', value: 70 },
                { timestamp: '20:00', value: 62 },
              ],
              unit: '%',
              threshold: { warning: 70, critical: 90 },
            },
          ]}
          height={300}
        />
      </div>

      {/* 최근 활동 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>최근 활동</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityFeed
            activities={[
              {
                id: '1',
                type: 'success',
                message: 'VM 생성 완료',
                description: 'web-server-01이 생성되었습니다',
                timestamp: new Date(Date.now() - 1000 * 60 * 5),
                user: '홍길동',
                resource: 'vm-123',
              },
              {
                id: '2',
                type: 'info',
                message: '설정 변경',
                description: 'MCI 설정이 업데이트되었습니다',
                timestamp: new Date(Date.now() - 1000 * 60 * 15),
                user: '김철수',
                resource: 'mci-456',
              },
              {
                id: '3',
                type: 'warning',
                message: '리소스 삭제',
                description: 'test-vm-01이 삭제되었습니다',
                timestamp: new Date(Date.now() - 1000 * 60 * 30),
                user: '이영희',
                resource: 'vm-789',
              },
              {
                id: '4',
                type: 'warning',
                message: 'CPU 사용률 경고',
                description: 'prod-server-01의 CPU 사용률이 85%에 도달했습니다',
                timestamp: new Date(Date.now() - 1000 * 60 * 45),
                resource: 'vm-101',
              },
              {
                id: '5',
                type: 'info',
                message: '시스템 업데이트',
                description: '시스템이 최신 버전으로 업데이트되었습니다',
                timestamp: new Date(Date.now() - 1000 * 60 * 60),
                user: 'System',
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
