'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMCIDetail } from '@/hooks/api/useMCIWorkloads';
import { MCIDetailTabs, MCIDetailTab } from './MCIDetailTabs';
import { MciInfo, MCIWorkload } from '@/types/mci-workloads';
import { Terminal, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProviderLogo } from '@/components/providers/ProviderLogo';

interface MCIDetailInfoProps {
  mciId: string;
  nsId: string;
  onTerminalClick?: () => void;
  /**
   * 선택된 MCI 정보 (선택 사항)
   * 이 prop이 제공되면 별도 API 호출 없이 이 데이터를 사용합니다.
   * GetAllMci API가 MciInfo[]를 반환하므로, 선택된 item은 이미 모든 정보를 포함하고 있습니다.
   */
  selectedMciData?: MciInfo | MCIWorkload;
}

/**
 * MCI 상세 정보 컴포넌트
 * 
 * 데이터 소스 우선순위:
 * 1. selectedMciData prop (선택된 item 정보) - 우선 사용, API 호출 생략
 * 2. useMCIDetail Hook (API 호출) - selectedMciData가 없을 때만 사용
 * 
 * 표시 항목:
 * - Name: {mci.name} / {mci.id}
 * - Status: 상태 배지 (예: "Suspended:8 (R:0/8)")
 * - Provider 이미지: 사용되는 provider들의 로고 표시
 * - Description: MCI 설명
 */
export function MCIDetailInfo({ mciId, nsId, onTerminalClick, selectedMciData }: MCIDetailInfoProps) {
  // selectedMciData에 필요한 정보가 있는지 확인
  // vm 배열이 있으면 상세 정보가 충분하다고 판단 (MciInfo 타입)
  const hasFullData = selectedMciData && 'vm' in selectedMciData && Array.isArray((selectedMciData as any).vm);
  
  // selectedMciData가 있고 필요한 정보가 충분하면 API 호출 생략
  const { mciDetail: apiMciDetail, isLoading, error } = useMCIDetail(
    hasFullData ? undefined : nsId, // 필요한 정보가 있으면 API 호출 안 함
    hasFullData ? undefined : mciId
  );
  
  // 최종 사용할 데이터: selectedMciData 우선, 없으면 API 호출 결과
  const mciDetail = (hasFullData ? selectedMciData : apiMciDetail) as MciInfo | undefined;
  
  const [activeTab, setActiveTab] = useState<MCIDetailTab>('default');

  // selectedMciData가 있으면 로딩 상태 표시 안 함
  if (!hasFullData && isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>MCI Info</CardTitle>
            <Button variant="outline" size="sm" disabled>
              <Terminal className="mr-2 h-4 w-4" />
              Terminal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">MCI 정보를 불러오는 중...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // selectedMciData가 있으면 에러 무시 (API 호출이 실패해도 선택된 데이터 사용)
  if (!hasFullData && error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>MCI Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-destructive">
            MCI 정보를 불러오는 중 오류가 발생했습니다.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!mciDetail) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>MCI Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            MCI 정보를 불러올 수 없습니다.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Provider 목록 추출 (VM의 connectionConfig에서)
  const providers = getProvidersFromMci(mciDetail);

  // Status 표시 텍스트 생성
  const statusText = getStatusText(mciDetail);

  // Status 배지 색상 결정
  const statusBadgeVariant = getStatusBadgeVariant(mciDetail.status);

  // Name과 ID 값 (안전하게 추출)
  const mciName = mciDetail.name || 'N/A';
  const mciDetailId = mciDetail.id || 'N/A';
  const mciDescription = mciDetail.description || '';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            MCI Info{' '}
            <span className="text-info font-normal">[{mciName}]</span>
          </CardTitle>
          {onTerminalClick && (
            <Button variant="outline" size="sm" onClick={onTerminalClick}>
              <Terminal className="mr-2 h-4 w-4" />
              Terminal
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Name - 항상 표시 */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-sm font-medium text-muted-foreground">Name</div>
            <div className="col-span-3 text-sm">
              {mciName} / {mciDetailId}
            </div>
          </div>

          {/* Status - 항상 표시 */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-sm font-medium text-muted-foreground">Status</div>
            <div className="col-span-3">
              <Badge variant={statusBadgeVariant} className="text-xs">
                {statusText}
              </Badge>
            </div>
          </div>

          {/* Provider Images - 항상 표시 (없으면 안내 메시지) */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-sm font-medium text-muted-foreground">Provider</div>
            <div className="col-span-3 flex flex-wrap gap-2">
              {providers.length > 0 ? (
                providers.map((provider) => (
                  <ProviderLogo
                    key={provider}
                    provider={provider || 'mcmp'}
                    size={48}
                    className="object-contain"
                  />
                ))
              ) : (
                <span className="text-sm text-muted-foreground">Provider 정보가 없습니다.</span>
              )}
            </div>
          </div>

          {/* Description - 항상 표시 (없으면 안내 메시지) */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-sm font-medium text-muted-foreground">Description</div>
            <div className="col-span-3 text-sm">
              {mciDescription || <span className="text-muted-foreground">설명이 없습니다.</span>}
            </div>
          </div>
        </div>

        {/* Tab Section */}
        <div className="mt-6 pt-6 border-t">
          <MCIDetailTabs
            mciDetail={mciDetail}
            mciId={mciId}
            nsId={nsId}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * MCI에서 사용되는 Provider 목록 추출
 * VM의 connectionConfig.providerName에서 추출
 */
function getProvidersFromMci(mciDetail: any): string[] {
  if (!mciDetail.vm || !Array.isArray(mciDetail.vm)) {
    return [];
  }

  const providerSet = new Set<string>();
  
  mciDetail.vm.forEach((vm: any) => {
    const providerName = vm.connectionConfig?.providerName || vm.connectionName;
    if (providerName) {
      providerSet.add(providerName.toLowerCase());
    }
  });

  return Array.from(providerSet);
}

/**
 * Status 표시 텍스트 생성
 * 예: "Suspended:8 (R:0/8)"
 */
function getStatusText(mciDetail: any): string {
  const status = mciDetail.status || 'undefined';
  const statusCount = mciDetail.statusCount;

  if (!statusCount) {
    return status;
  }

  // 상태별 카운트 추출
  const running = statusCount.countRunning || 0;
  const suspended = statusCount.countSuspended || 0;
  const stopped = statusCount.countStopped || 0;
  const terminated = statusCount.countTerminated || 0;
  const failed = statusCount.countFailed || 0;
  const total = statusCount.countTotal || 0;

  // 주요 상태에 따라 표시
  if (status.toLowerCase() === 'suspended' || suspended > 0) {
    return `Suspended:${suspended} (R:${running}/${total})`;
  }
  if (status.toLowerCase() === 'stopped' || stopped > 0) {
    return `Stopped:${stopped} (R:${running}/${total})`;
  }
  if (status.toLowerCase() === 'running' || running > 0) {
    return `Running:${running} (Total:${total})`;
  }
  if (status.toLowerCase() === 'terminated' || terminated > 0) {
    return `Terminated:${terminated} (Total:${total})`;
  }
  if (status.toLowerCase() === 'failed' || failed > 0) {
    return `Failed:${failed} (Total:${total})`;
  }

  return `${status} (Total:${total})`;
}

/**
 * Status에 따른 Badge variant 결정
 */
function getStatusBadgeVariant(status?: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (!status) {
    return 'default';
  }

  const statusLower = status.toLowerCase();
  
  if (statusLower === 'running') {
    return 'default'; // green
  }
  if (statusLower === 'suspended' || statusLower === 'stopped') {
    return 'secondary'; // yellow
  }
  if (statusLower === 'terminated') {
    return 'outline'; // gray
  }
  if (statusLower === 'failed') {
    return 'destructive'; // red
  }

  return 'default';
}
