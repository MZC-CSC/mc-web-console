'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyValueList } from '@/components/common/KeyValueList';
import { Info, Server, Package, Code } from 'lucide-react';

/**
 * Operation About 페이지
 *
 * 시스템 정보 및 버전 정보 표시
 */

export default function OperationAboutPage() {
  const systemInfo = [
    { label: 'Platform Name', value: 'Multi-Cloud Web Console' },
    { label: 'Version', value: 'v1.0.0' },
    { label: 'Build Date', value: '2026-01-26' },
    { label: 'Environment', value: 'Production' },
    { label: 'Region', value: 'Korea' },
  ];

  const backendServices = [
    { label: 'mc-iam-manager', value: 'v0.8.25', type: 'text' as const },
    { label: 'mc-infra-manager', value: 'v0.8.25', type: 'text' as const },
    { label: 'mc-application-manager', value: 'v0.8.25', type: 'text' as const },
    { label: 'mc-observability', value: 'v0.8.25', type: 'text' as const },
    { label: 'mc-data-manager', value: 'v0.8.25', type: 'text' as const },
    { label: 'mc-workflow-manager', value: 'v0.8.25', type: 'text' as const },
    { label: 'mc-cost-optimizer', value: 'v0.8.25', type: 'text' as const },
  ];

  const techStack = [
    { label: 'Frontend', value: 'Next.js 16.1.2, React 19', type: 'text' as const },
    { label: 'UI Framework', value: 'Tailwind CSS v4, shadcn/ui', type: 'text' as const },
    { label: 'State Management', value: 'React Query, Zustand', type: 'text' as const },
    { label: 'Charts', value: 'Recharts', type: 'text' as const },
    { label: 'Icons', value: 'Lucide React', type: 'text' as const },
  ];

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Operation About</h1>
        <p className="text-muted-foreground mt-2">
          시스템 정보 및 버전 정보
        </p>
      </div>

      {/* 시스템 정보 카드 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              <CardTitle>시스템 정보</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <KeyValueList items={systemInfo} orientation="vertical" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-purple-600" />
              <CardTitle>기술 스택</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <KeyValueList items={techStack} orientation="vertical" />
          </CardContent>
        </Card>
      </div>

      {/* 백엔드 서비스 버전 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            <CardTitle>Backend Services</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <KeyValueList items={backendServices} orientation="vertical" />
        </CardContent>
      </Card>

      {/* 라이선스 정보 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            <CardTitle>License</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">
              <strong>M-CMP (Multi-Cloud Management Platform)</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              Apache License 2.0
            </p>
            <p className="text-sm text-muted-foreground">
              Copyright © 2024 Cloud-Barista Community
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              이 소프트웨어는 Apache License 2.0에 따라 배포됩니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
