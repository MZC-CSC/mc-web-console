'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { Activity, Users, Server, HardDrive } from 'lucide-react';

/**
 * Dashboard Demo 페이지
 *
 * 대시보드 데모 및 테스트
 * - 통계 카드
 * - 차트 예제
 * - 실시간 데이터 시뮬레이션
 */

interface Stats {
  totalVMs: number;
  activeUsers: number;
  cpuUsage: number;
  memoryUsage: number;
}

export default function DashboardDemoPage() {
  const [stats, setStats] = useState<Stats>({
    totalVMs: 45,
    activeUsers: 12,
    cpuUsage: 65,
    memoryUsage: 72,
  });

  // 실시간 데이터 시뮬레이션
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        totalVMs: prev.totalVMs + Math.floor(Math.random() * 3) - 1,
        activeUsers: Math.max(1, prev.activeUsers + Math.floor(Math.random() * 3) - 1),
        cpuUsage: Math.max(10, Math.min(100, prev.cpuUsage + Math.floor(Math.random() * 10) - 5)),
        memoryUsage: Math.max(10, Math.min(100, prev.memoryUsage + Math.floor(Math.random() * 10) - 5)),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Demo</h1>
          <Badge variant="secondary">DEMO</Badge>
        </div>
        <p className="text-muted-foreground mt-2">
          실시간 대시보드 데모 및 테스트 페이지
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total VMs</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVMs}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last hour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Online now
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cpuUsage}%</div>
            <div className="mt-2 h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${stats.cpuUsage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.memoryUsage}%</div>
            <div className="mt-2 h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${stats.memoryUsage}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 활동 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { time: '2 minutes ago', action: 'VM created', details: 'web-server-01' },
              { time: '5 minutes ago', action: 'User logged in', details: 'admin@example.com' },
              { time: '10 minutes ago', action: 'Workflow executed', details: 'backup-workflow' },
              { time: '15 minutes ago', action: 'Alarm triggered', details: 'high-cpu-usage' },
              { time: '20 minutes ago', action: 'VM deleted', details: 'test-server-05' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div>
                  <div className="font-medium text-sm">{activity.action}</div>
                  <div className="text-xs text-muted-foreground">{activity.details}</div>
                </div>
                <div className="text-xs text-muted-foreground">{activity.time}</div>
              </div>
            ))}
          </div>
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
              <strong>실시간 업데이트:</strong> 통계 데이터는 2초마다 자동으로 업데이트됩니다.
            </p>
            <p>
              <strong>데이터:</strong> 모든 데이터는 시뮬레이션된 Mock 데이터입니다.
            </p>
            <p>
              <strong>목적:</strong> UI/UX 테스트 및 데모 용도로 사용됩니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
