'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CloudInfoCard } from '@/components/operation/CloudInfoCard';
import { ChartWidget } from '@/components/charts/ChartWidget';
import { Server, HardDrive, Network, RefreshCw } from 'lucide-react';
import { useCloudDashboard } from '@/hooks/api/useCloudDashboard';
import { Button } from '@/components/common/Button';

/**
 * Cloud Dashboard 페이지
 *
 * CSP별 클라우드 리소스 통계 및 차트
 * - CSP별 통계 카드 (연결된 Credentials 기반)
 * - Cloud별 리소스 통계 차트
 * - API: MCIAM_LIST_CREDENTIALS 사용
 *
 * NOTE: 현재는 CSP 연결 정보만 실제 API로 조회
 * TODO: Backend에 CSP별 리소스 통계 API 추가 필요 (VMs, Storage, Networks 등)
 */

export default function CloudDashboardPage() {
  const { cloudStats, isLoading, refetch } = useCloudDashboard();

  // Mock 리소스 데이터 (실제 API 추가 전까지 임시 사용)
  // TODO: Backend API 추가 후 제거
  const mockResourcesByProvider: Record<string, { vms: number; storage: number; networks: number }> = {
    AWS: { vms: 15, storage: 250, networks: 8 },
    GCP: { vms: 10, storage: 180, networks: 5 },
    AZURE: { vms: 5, storage: 100, networks: 3 },
    ALIBABA: { vms: 3, storage: 80, networks: 2 },
  };

  // CSP별 Mock 리소스 데이터 병합
  const enrichedCloudStats = cloudStats.map((cloud) => ({
    ...cloud,
    resources: mockResourcesByProvider[cloud.provider] || { vms: 0, storage: 0, networks: 0 },
  }));

  // 차트 데이터 생성
  const cloudResourcesData = enrichedCloudStats.map((cloud) => ({
    name: cloud.provider,
    VMs: cloud.resources.vms,
    Storage: cloud.resources.storage,
    Networks: cloud.resources.networks,
  }));

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cloud Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            클라우드 서비스 프로바이더별 리소스 현황
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          새로고침
        </Button>
      </div>

      {/* CSP별 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-3">
        {isLoading ? (
          <div className="col-span-3 text-center py-8 text-muted-foreground">
            로딩 중...
          </div>
        ) : enrichedCloudStats.length === 0 ? (
          <div className="col-span-3 text-center py-8 text-muted-foreground">
            연결된 CSP가 없습니다.
          </div>
        ) : (
          enrichedCloudStats.map((cloud) => (
            <CloudInfoCard
              key={cloud.provider}
              provider={cloud.provider}
              region={cloud.region}
              status={cloud.status}
            />
          ))
        )}
      </div>

      {/* Cloud별 리소스 통계 차트 */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartWidget
          title="CSP별 VM 분포"
          type="pie"
          data={cloudResourcesData.map((d) => ({
            name: d.name,
            value: d.VMs,
          }))}
          height={300}
        />
        <ChartWidget
          title="CSP별 리소스 현황"
          type="bar"
          data={cloudResourcesData}
          height={300}
          dataKey="VMs"
        />
      </div>

      {/* 상세 리소스 정보 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-blue-600" />
              <CardTitle>Total VMs</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {enrichedCloudStats.reduce((sum, cloud) => sum + cloud.resources.vms, 0)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              전체 Virtual Machines (Mock)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-green-600" />
              <CardTitle>Total Storage</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {enrichedCloudStats.reduce((sum, cloud) => sum + cloud.resources.storage, 0)} GB
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              전체 스토리지 용량 (Mock)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-purple-600" />
              <CardTitle>Total Networks</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {enrichedCloudStats.reduce((sum, cloud) => sum + cloud.resources.networks, 0)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              전체 네트워크 (Mock)
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
