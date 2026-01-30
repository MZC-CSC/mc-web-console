'use client';

import { VmInfo } from '@/types/mci-workloads';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MCIVMListProps {
  vms: VmInfo[];
  onVmClick?: (vm: VmInfo) => void;
  className?: string;
}

/**
 * VM List 컴포넌트
 * 
 * MCI에 속한 모든 VM 목록을 그리드 레이아웃으로 표시합니다.
 * 
 * 표시 항목:
 * - VM Name
 * - VM Status (Badge)
 * - VM ID
 */
export function MCIVMList({ vms, onVmClick, className }: MCIVMListProps) {
  if (!vms || vms.length === 0) {
    return (
      <div className={cn('text-center py-8 text-sm text-muted-foreground', className)}>
        VM이 없습니다.
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3', className)}>
      {vms.map((vm) => (
        <VMCard key={vm.id} vm={vm} onClick={() => onVmClick?.(vm)} />
      ))}
    </div>
  );
}

/**
 * VM 카드 컴포넌트
 */
interface VMCardProps {
  vm: VmInfo;
  onClick?: () => void;
}

function VMCard({ vm, onClick }: VMCardProps) {
  const status = vm.status || 'undefined';
  const statusDisplay = getVmStatusDisplay(status);
  const statusBadgeVariant = getVmStatusBadgeVariant(status);
  const statusCardClass = getVmStatusCardClass(status);

  return (
    <Card
      className={cn(
        'p-3 cursor-pointer transition-all hover:shadow-md',
        statusCardClass,
        onClick && 'hover:border-primary'
      )}
      onClick={onClick}
    >
      <div className="space-y-2">
        {/* VM Name */}
        <div className="font-medium text-sm truncate" title={vm.name || vm.id}>
          {vm.name || vm.id}
        </div>

        {/* VM ID */}
        {vm.name && vm.id !== vm.name && (
          <div className="text-xs text-muted-foreground truncate" title={vm.id}>
            {vm.id}
          </div>
        )}

        {/* VM Status */}
        <div className="flex items-center justify-between">
          <Badge variant={statusBadgeVariant} className="text-xs">
            {statusDisplay}
          </Badge>
          {vm.subGroupId && (
            <span className="text-xs text-muted-foreground" title={`SubGroup: ${vm.subGroupId}`}>
              {vm.subGroupId}
            </span>
          )}
        </div>

        {/* 추가 정보 (선택 사항) */}
        {(vm.publicIP || vm.privateIP) && (
          <div className="text-xs text-muted-foreground space-y-1">
            {vm.publicIP && (
              <div className="truncate" title={`Public IP: ${vm.publicIP}`}>
                📍 {vm.publicIP}
              </div>
            )}
            {vm.privateIP && (
              <div className="truncate" title={`Private IP: ${vm.privateIP}`}>
                🔒 {vm.privateIP}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

/**
 * VM Status 표시 텍스트 변환
 * API의 status를 사용자 친화적인 텍스트로 변환
 */
function getVmStatusDisplay(status: string): string {
  const statusLower = status.toLowerCase();
  
  const statusMap: Record<string, string> = {
    'running': 'Running',
    'stopped': 'Stopped',
    'stopping': 'Stopping',
    'suspended': 'Suspended',
    'suspending': 'Suspending',
    'resuming': 'Resuming',
    'terminated': 'Terminated',
    'terminating': 'Terminating',
    'failed': 'Failed',
    'creating': 'Creating',
    'rebooting': 'Rebooting',
    'undefined': 'Unknown',
  };

  return statusMap[statusLower] || status;
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

/**
 * VM Status에 따른 Card 배경색 클래스 결정
 * 참조 HTML의 vmStatusClass와 유사한 스타일 적용
 */
function getVmStatusCardClass(status: string): string {
  const statusLower = status.toLowerCase();
  
  if (statusLower === 'running') {
    return 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800';
  }
  if (statusLower === 'suspended' || statusLower === 'stopped') {
    return 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800';
  }
  if (statusLower === 'terminated') {
    return 'bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800';
  }
  if (statusLower === 'failed') {
    return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800';
  }
  if (statusLower === 'creating' || statusLower === 'resuming' || statusLower === 'rebooting') {
    return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800';
  }

  return '';
}
