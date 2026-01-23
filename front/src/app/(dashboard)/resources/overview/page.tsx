'use client';

import { useCloudResourcesOverview } from '@/hooks/api/useCloudResourcesOverview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { cn } from '@/lib/utils';

/**
 * Cloud Resources Overview 페이지
 */
export default function CloudResourcesOverviewPage() {
  const { overview, isLoading, refetch } = useCloudResourcesOverview();

  const stats = [
    { label: 'VNet', value: overview.vnet || 0, key: 'vnet' },
    { label: 'VM', value: overview.vm || 0, key: 'vm' },
    { label: 'Disk', value: overview.disk || 0, key: 'disk' },
    { label: 'Image', value: overview.image || 0, key: 'image' },
    { label: 'Security Group', value: overview.securityGroup || 0, key: 'securityGroup' },
    { label: 'SSH Key', value: overview.sshKey || 0, key: 'sshKey' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cloud Resources Overview</h1>
        <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={cn('mr-2 h-4 w-4', isLoading && 'animate-spin')} />
          새로고침
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.key}>
            <CardHeader>
              <CardTitle className="text-lg">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Info */}
      {Object.keys(overview).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>상세 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm overflow-auto">{JSON.stringify(overview, null, 2)}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
