'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Phase 2 Components
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';
import { ActivityFeed, Activity } from '@/components/dashboard/ActivityFeed';
import { QuickActions, QuickAction } from '@/components/common/QuickActions';
import { CloudInfoCard } from '@/components/operation/CloudInfoCard';
import { ServiceStatusCard } from '@/components/operation/ServiceStatusCard';
import { MetricCard } from '@/components/monitoring/MetricCard';
import { IFrameWrapper } from '@/components/common/IFrameWrapper';

// Phase 4 Components
import { ChartWidget } from '@/components/charts/ChartWidget';
import { ResourceUsageChart, ResourceMetric } from '@/components/operation/ResourceUsageChart';
import { AlertRuleEditor, AlertRule } from '@/components/monitoring/AlertRuleEditor';
import { LogViewer, LogEntry } from '@/components/monitoring/LogViewer';

// Icons
import {
  Activity as ActivityIcon,
  Plus,
  Settings,
  FileText,
  Cpu,
  Server,
  TrendingUp,
} from 'lucide-react';

/**
 * 컴포넌트 테스트 페이지
 *
 * Phase 2 + Phase 4에서 구현된 모든 컴포넌트를 테스트
 */
export default function TestComponentsPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">컴포넌트 테스트</h1>
        <p className="text-muted-foreground">
          Phase 2 + Phase 4에서 구현된 컴포넌트 동작 확인
        </p>
      </div>

      <Tabs defaultValue="phase2" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="phase2">Phase 2 (7개)</TabsTrigger>
          <TabsTrigger value="phase4">Phase 4 (4개)</TabsTrigger>
        </TabsList>

        {/* Phase 2 Components */}
        <TabsContent value="phase2" className="space-y-8">
          <Phase2Tests />
        </TabsContent>

        {/* Phase 4 Components */}
        <TabsContent value="phase4" className="space-y-8">
          <Phase4Tests />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Phase 2 컴포넌트 테스트
 */
function Phase2Tests() {
  // Sample data
  const activities: Activity[] = [
    {
      id: '1',
      type: 'success',
      message: 'VM 인스턴스 생성 완료',
      description: 'web-server-01',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      user: '홍길동',
    },
    {
      id: '2',
      type: 'error',
      message: '네트워크 연결 실패',
      description: '타임아웃 발생',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      user: '김철수',
    },
    {
      id: '3',
      type: 'warning',
      message: 'CPU 사용률 높음',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      resource: 'db-server-01',
    },
    {
      id: '4',
      type: 'info',
      message: '백업 완료',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
  ];

  const quickActions: QuickAction[] = [
    {
      id: '1',
      label: 'VM 생성',
      icon: Plus,
      onClick: () => alert('VM 생성'),
      description: '새 가상머신 생성',
      badge: 'New',
    },
    {
      id: '2',
      label: '설정',
      icon: Settings,
      onClick: () => alert('설정'),
    },
    {
      id: '3',
      label: '리포트',
      icon: FileText,
      onClick: () => alert('리포트'),
      disabled: true,
    },
  ];

  return (
    <>
      {/* DashboardWidget + ActivityFeed */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. DashboardWidget + ActivityFeed</h2>
        <div className="grid grid-cols-2 gap-4">
          <DashboardWidget
            title="최근 활동"
            description="최근 24시간"
            icon={ActivityIcon}
          >
            <ActivityFeed activities={activities} maxItems={5} />
          </DashboardWidget>

          <DashboardWidget
            title="로딩 상태"
            isLoading
          >
            <div>Loading...</div>
          </DashboardWidget>
        </div>
      </section>

      {/* QuickActions */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. QuickActions</h2>
        <Card>
          <CardHeader>
            <CardTitle>빠른 액션</CardTitle>
          </CardHeader>
          <CardContent>
            <QuickActions actions={quickActions} columns={3} />
          </CardContent>
        </Card>
      </section>

      {/* CloudInfoCard */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. CloudInfoCard</h2>
        <div className="grid grid-cols-3 gap-4">
          <CloudInfoCard
            provider="AWS"
            region="ap-northeast-2"
            status="connected"
            resourceCount={15}
            metadata={[
              { label: 'Account ID', value: '123456789' },
              { label: 'VPC', value: 'vpc-abc123' },
            ]}
          />
          <CloudInfoCard
            provider="Azure"
            region="Korea Central"
            status="error"
            resourceCount={0}
          />
          <CloudInfoCard
            provider="GCP"
            region="asia-northeast3"
            status="connecting"
          />
        </div>
      </section>

      {/* ServiceStatusCard */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">4. ServiceStatusCard</h2>
        <div className="grid grid-cols-3 gap-4">
          <ServiceStatusCard
            name="Web Server"
            description="Nginx 웹 서버"
            status="running"
            uptime="99.9%"
            responseTime="45ms"
            requestCount={1250000}
          />
          <ServiceStatusCard
            name="Database"
            status="stopped"
            uptime="0%"
          />
          <ServiceStatusCard
            name="Cache Server"
            status="error"
            uptime="85.2%"
            metrics={[
              { label: 'Hit Rate', value: '92%' },
              { label: 'Memory', value: '4.2GB' },
            ]}
          />
        </div>
      </section>

      {/* MetricCard */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">5. MetricCard</h2>
        <div className="grid grid-cols-3 gap-4">
          <MetricCard
            title="CPU 사용률"
            value={75.5}
            unit="%"
            icon={Cpu}
            trend={{ value: 5.2, direction: 'up', description: '지난 1시간' }}
            threshold={{ warning: 70, critical: 90 }}
          />
          <MetricCard
            title="메모리 사용량"
            value={8.2}
            unit="GB"
            trend={{ value: -0.3, direction: 'down', description: '지난 1시간' }}
          />
          <MetricCard
            title="활성 사용자"
            value={1523}
            icon={Server}
            trend={{ value: 0, direction: 'stable' }}
          />
        </div>
      </section>

      {/* IFrameWrapper */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">6. IFrameWrapper</h2>
        <IFrameWrapper
          src="https://example.com"
          title="Example Website"
          height="400px"
        />
      </section>
    </>
  );
}

/**
 * Phase 4 컴포넌트 테스트
 */
function Phase4Tests() {
  const [alertRule, setAlertRule] = useState<AlertRule | null>(null);

  // Chart sample data
  const lineChartData = [
    { month: 'Jan', sales: 4000, revenue: 2400 },
    { month: 'Feb', sales: 3000, revenue: 1398 },
    { month: 'Mar', sales: 2000, revenue: 9800 },
    { month: 'Apr', sales: 2780, revenue: 3908 },
    { month: 'May', sales: 1890, revenue: 4800 },
    { month: 'Jun', sales: 2390, revenue: 3800 },
  ];

  const pieChartData = [
    { name: 'AWS', value: 400 },
    { name: 'Azure', value: 300 },
    { name: 'GCP', value: 200 },
    { name: 'On-Premise', value: 100 },
  ];

  // ResourceUsageChart sample data
  const now = Date.now();
  const generateMetricData = (baseValue: number, variance: number) => {
    return Array.from({ length: 60 }, (_, i) => ({
      timestamp: new Date(now - (59 - i) * 60 * 1000),
      value: baseValue + Math.random() * variance - variance / 2,
    }));
  };

  const resourceMetrics: ResourceMetric[] = [
    {
      type: 'cpu',
      label: 'CPU 사용률',
      data: generateMetricData(60, 20),
      unit: '%',
      threshold: { warning: 70, critical: 90 },
    },
    {
      type: 'memory',
      label: '메모리 사용률',
      data: generateMetricData(50, 15),
      unit: '%',
      threshold: { warning: 80, critical: 95 },
    },
  ];

  // LogViewer sample data
  const sampleLogs: LogEntry[] = Array.from({ length: 100 }, (_, i) => ({
    id: `log-${i}`,
    timestamp: new Date(now - i * 1000),
    level: (['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'] as const)[Math.floor(Math.random() * 5)],
    message: `Sample log message ${i}: ${['User logged in', 'Request processed', 'Cache miss', 'Database query executed', 'Error occurred'][Math.floor(Math.random() * 5)]}`,
    source: ['web-server', 'api-server', 'db-server'][Math.floor(Math.random() * 3)],
  }));

  return (
    <>
      {/* ChartWidget */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. ChartWidget</h2>
        <div className="grid grid-cols-2 gap-4">
          <ChartWidget
            type="line"
            data={lineChartData}
            series={[
              { dataKey: 'sales', name: '판매량', color: '#3b82f6' },
              { dataKey: 'revenue', name: '수익', color: '#22c55e' },
            ]}
            title="월별 매출 현황"
            xAxisKey="month"
            height={300}
          />

          <ChartWidget
            type="bar"
            data={lineChartData}
            dataKey="sales"
            title="월별 판매량 (Bar)"
            xAxisKey="month"
            height={300}
          />

          <ChartWidget
            type="area"
            data={lineChartData}
            series={[
              { dataKey: 'sales', name: '판매량', color: '#3b82f6' },
              { dataKey: 'revenue', name: '수익', color: '#22c55e' },
            ]}
            title="월별 매출 (Area)"
            xAxisKey="month"
            height={300}
          />

          <ChartWidget
            type="pie"
            data={pieChartData}
            dataKey="value"
            title="클라우드 분포 (Pie)"
            xAxisKey="name"
            height={300}
          />
        </div>
      </section>

      {/* ResourceUsageChart */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. ResourceUsageChart</h2>
        <ResourceUsageChart
          metrics={resourceMetrics}
          title="리소스 사용량 모니터링"
          timeRange={60}
          showTimeRangeSelector
          enableMetricToggle
          showThresholds
          height={400}
        />
      </section>

      {/* AlertRuleEditor */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. AlertRuleEditor</h2>
        {alertRule ? (
          <Card>
            <CardHeader>
              <CardTitle>저장된 규칙</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-auto">
                {JSON.stringify(alertRule, null, 2)}
              </pre>
            </CardContent>
          </Card>
        ) : (
          <AlertRuleEditor
            mode="create"
            onSave={(rule) => {
              console.log('Saved rule:', rule);
              setAlertRule(rule);
              alert('알람 규칙이 저장되었습니다!');
            }}
            onCancel={() => alert('취소되었습니다')}
          />
        )}
      </section>

      {/* LogViewer */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">4. LogViewer</h2>
        <LogViewer
          logs={sampleLogs}
          showLevelFilter
          enableSearch
          enableDownload
          height={500}
          onLogClick={(log) => console.log('Clicked log:', log)}
        />
      </section>
    </>
  );
}
