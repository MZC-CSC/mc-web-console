'use client';

import { useState } from 'react';
import { VmInfo } from '@/types/mci-workloads';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataGridItem } from '@/components/ui/DataGridItem';
import { X, Terminal as TerminalIcon } from 'lucide-react';
import { MCIVMDetailTabs } from './MCIVMDetailTabs';
import { TerminalModal } from './TerminalModal';
import Image from 'next/image';

interface MCIVMDetailProps {
  /**
   * 선택된 VM 정보
   */
  vm: VmInfo;
  /**
   * Namespace ID
   */
  nsId: string;
  /**
   * MCI ID
   */
  mciId: string;
  /**
   * 닫기 버튼 클릭 핸들러
   */
  onClose: () => void;
}

/**
 * VM 상세정보 컴포넌트
 *
 * 구조:
 * - Header: VM 이름, Remote CMD/Install SW/Close 버튼
 * - VM 기본 정보 Grid (3 columns)
 * - MCIVMDetailTabs (Detail/Connection 탭)
 *
 * 표시 항목:
 * - Operating System
 * - Spec (vCPU, Memory, Disk)
 * - Network (Public IP, Private IP)
 * - Provider/Region
 * - Status
 *
 * @example
 * ```tsx
 * {selectedVm && (
 *   <MCIVMDetail
 *     vm={selectedVm}
 *     onClose={() => setSelectedVm(null)}
 *   />
 * )}
 * ```
 */
export function MCIVMDetail({ vm, nsId, mciId, onClose }: MCIVMDetailProps) {
  const [terminalOpen, setTerminalOpen] = useState(false);

  if (!vm) return null;

  // VM 상태 Badge variant 결정
  const statusBadgeVariant = getVmStatusBadgeVariant(vm.status || 'undefined');

  return (
    <>
      <Card className="mt-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <span>Server Info: {vm.name || vm.id}</span>
            <Badge variant={statusBadgeVariant} className="text-xs">
              {vm.status || 'Unknown'}
            </Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Install SW
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* VM 기본 정보 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <DataGridItem
            title="Operating System"
            content={vm.imageId || vm.image?.name || '-'}
          />
          <DataGridItem
            title="vCPU"
            content={vm.vcpuCount ? `${vm.vcpuCount} vCPU` : '-'}
          />
          <DataGridItem
            title="Memory"
            content={vm.memoryGiB ? `${vm.memoryGiB} GB` : '-'}
          />
          <DataGridItem
            title="Disk"
            content={vm.rootDiskSize ? `${vm.rootDiskSize} GB` : '-'}
          />
          <DataGridItem
            title="Public IP"
            content={
              <div className="flex items-center gap-2">
                <span>{vm.publicIP || '-'}</span>
                {vm.publicIP && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTerminalOpen(true)}
                  >
                    <TerminalIcon className="h-4 w-4 mr-1" />
                    Terminal
                  </Button>
                )}
              </div>
            }
          />
          <DataGridItem
            title="Private IP"
            content={vm.privateIP || '-'}
          />
          <DataGridItem
            title="Provider"
            content={
              <div className="flex items-center gap-2">
                <Image
                  src={getProviderImagePath(vm.connectionConfig?.providerName || vm.connectionName)}
                  alt={vm.connectionConfig?.providerName || vm.connectionName || 'Provider'}
                  width={20}
                  height={20}
                  className="object-contain"
                />
                <span>{vm.connectionConfig?.providerName || vm.connectionName || '-'}</span>
              </div>
            }
          />
          <DataGridItem
            title="Region"
            content={vm.region?.region || '-'}
          />
          <DataGridItem
            title="SubGroup"
            content={vm.subGroupId || '-'}
          />
        </div>

        {/* 탭 섹션 */}
        <div className="border-t pt-6">
          <MCIVMDetailTabs vm={vm} />
        </div>
      </CardContent>
    </Card>

      {/* Terminal Modal */}
      <TerminalModal
        open={terminalOpen}
        onOpenChange={setTerminalOpen}
        nsId={nsId}
        mciId={mciId}
        subGroupId={vm.subGroupId}
        vmId={vm.id}
        vmName={vm.name || vm.id}
      />
    </>
  );
}

/**
 * Provider 이미지 경로 반환
 * 지원되는 provider: alibaba, aws, azure, gcp, ncpvpc, tencent
 * 기본: mcmp.png
 */
function getProviderImagePath(providerName: string | undefined): string {
  if (!providerName || providerName === '-') {
    return '/images/providers/mcmp.png';
  }

  const normalizedProvider = providerName.toLowerCase();
  const availableProviders = ['alibaba', 'aws', 'azure', 'gcp', 'ncpvpc', 'tencent'];

  if (availableProviders.includes(normalizedProvider)) {
    return `/images/providers/${normalizedProvider}.png`;
  }

  return '/images/providers/mcmp.png';
}

/**
 * VM Status에 따른 Badge variant 결정
 */
function getVmStatusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const statusLower = status.toLowerCase();

  if (statusLower === 'running') {
    return 'default'; // green
  }
  if (statusLower === 'suspended' || statusLower === 'stopped' || statusLower === 'stopping') {
    return 'secondary'; // yellow
  }
  if (statusLower === 'terminated' || statusLower === 'terminating') {
    return 'outline'; // gray
  }
  if (statusLower === 'failed') {
    return 'destructive'; // red
  }
  if (statusLower === 'creating' || statusLower === 'resuming' || statusLower === 'rebooting') {
    return 'secondary'; // yellow (in progress)
  }

  return 'outline'; // default
}
