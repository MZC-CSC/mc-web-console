'use client';

import { VmInfo } from '@/types/mci-workloads';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface MCISubGroupListProps {
  vms: VmInfo[];
  selectedSubGroupId?: string | null;
  onSubGroupClick?: (subGroupId: string) => void;
  className?: string;
  /**
   * 한 줄에 표시할 SubGroup 개수 (기본값: 5)
   * 추후 설정으로 변경 가능하도록 prop으로 제공
   */
  itemsPerRow?: number;
}

/**
 * SubGroup 정보 인터페이스
 */
interface SubGroupInfo {
  subGroupId: string;
  vms: VmInfo[];
  vmCount: number;
  status: string; // 집계된 상태
  statusDisplay: string; // 표시용 상태 텍스트
}

/**
 * SubGroup List 컴포넌트
 * 
 * MCI에 속한 VM들을 SubGroup별로 그룹핑하여 표시합니다.
 * 
 * 표시 항목:
 * - SubGroup ID
 * - VM 개수
 * - SubGroup 상태 (VM 상태 집계)
 * - SubGroup에 속한 VM 목록 (확장 가능)
 */
export function MCISubGroupList({
  vms,
  selectedSubGroupId,
  onSubGroupClick,
  className,
  itemsPerRow = 5,
}: MCISubGroupListProps) {
  // VM을 SubGroup별로 그룹핑
  const subGroups = groupVmsBySubGroup(vms);

  if (subGroups.length === 0) {
    return (
      <div className={cn('text-center py-8 text-sm text-muted-foreground', className)}>
        SubGroup이 없습니다.
      </div>
    );
  }

  // itemsPerRow에 따라 그리드 컬럼 수 결정
  const gridColsClass = getGridColsClass(itemsPerRow);

  return (
    <div className={cn('grid gap-3', gridColsClass, className)}>
      {subGroups.map((subGroup) => (
        <SubGroupCard
          key={subGroup.subGroupId}
          subGroup={subGroup}
          isSelected={selectedSubGroupId === subGroup.subGroupId}
          onClick={() => onSubGroupClick?.(subGroup.subGroupId)}
        />
      ))}
    </div>
  );
}

/**
 * SubGroup 카드 컴포넌트
 */
interface SubGroupCardProps {
  subGroup: SubGroupInfo;
  isSelected?: boolean;
  onClick?: () => void;
}

function SubGroupCard({ subGroup, isSelected = false, onClick }: SubGroupCardProps) {
  const statusBadgeVariant = getSubGroupStatusBadgeVariant(subGroup.status);
  const statusCardClass = getSubGroupStatusCardClass(subGroup.status);

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  const handleCardClick = () => {
    onClick?.();
  };

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        statusCardClass,
        isSelected && 'ring-2 ring-primary border-primary',
        onClick && 'hover:border-primary'
      )}
      onClick={handleCardClick}
    >
      <div className="p-3 flex items-center gap-3">
        {/* 체크박스 */}
        <Checkbox
          checked={isSelected}
          onCheckedChange={handleCardClick}
          onClick={handleCheckboxClick}
          className="flex-shrink-0"
        />

        {/* SubGroup 정보 */}
        <div className="flex-1 min-w-0">
          {/* SubGroup ID 및 VM 개수 */}
          <div className="font-semibold text-base truncate">
            {subGroup.subGroupId || '(No SubGroup)'}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({subGroup.vmCount})
            </span>
          </div>

          {/* SubGroup 상태 Badge */}
          <div className="mt-2">
            <Badge variant={statusBadgeVariant} className="text-xs">
              {subGroup.statusDisplay}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * VM을 SubGroup별로 그룹핑
 */
function groupVmsBySubGroup(vms: VmInfo[]): SubGroupInfo[] {
  // subGroupId로 그룹핑
  const grouped = vms.reduce((acc, vm) => {
    const key = vm.subGroupId || '(No SubGroup)';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(vm);
    return acc;
  }, {} as Record<string, VmInfo[]>);

  // SubGroupInfo 배열로 변환
  return Object.entries(grouped).map(([subGroupId, vms]) => {
    const status = calculateSubGroupStatus(vms);
    return {
      subGroupId,
      vms,
      vmCount: vms.length,
      status,
      statusDisplay: getSubGroupStatusDisplay(status),
    };
  });
}

/**
 * SubGroup의 상태를 계산
 * VM 상태들을 종합하여 SubGroup의 전체 상태를 결정
 * 
 * 우선순위:
 * 1. 모든 VM이 running → "running"
 * 2. 일부 VM이 running → "partial_running"
 * 3. 모든 VM이 stopped/suspended → "stopped"
 * 4. 일부 VM이 terminated → "partial_terminated"
 * 5. 모든 VM이 terminated → "terminated"
 * 6. failed VM이 있으면 → "failed"
 */
function calculateSubGroupStatus(vms: VmInfo[]): string {
  if (!vms || vms.length === 0) {
    return 'undefined';
  }

  const statusCounts = vms.reduce((acc, vm) => {
    const status = (vm.status || 'undefined').toLowerCase();
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const total = vms.length;
  const runningCount = statusCounts['running'] || 0;
  const stoppedCount = (statusCounts['stopped'] || 0) + (statusCounts['suspended'] || 0);
  const terminatedCount = statusCounts['terminated'] || 0;
  const failedCount = statusCounts['failed'] || 0;

  // Failed가 있으면 failed
  if (failedCount > 0) {
    return 'failed';
  }

  // 모두 running
  if (runningCount === total) {
    return 'running';
  }

  // 모두 stopped/suspended
  if (stoppedCount === total) {
    return 'stopped';
  }

  // 모두 terminated
  if (terminatedCount === total) {
    return 'terminated';
  }

  // 일부 running
  if (runningCount > 0) {
    return 'partial_running';
  }

  // 일부 terminated
  if (terminatedCount > 0) {
    return 'partial_terminated';
  }

  return 'mixed';
}

/**
 * SubGroup 상태 표시 텍스트 변환
 */
function getSubGroupStatusDisplay(status: string): string {
  const statusMap: Record<string, string> = {
    'running': 'Running',
    'partial_running': 'Partial Running',
    'stopped': 'Stopped',
    'terminated': 'Terminated',
    'partial_terminated': 'Partial Terminated',
    'failed': 'Failed',
    'mixed': 'Mixed',
    'undefined': 'Unknown',
  };

  return statusMap[status] || status;
}

/**
 * SubGroup Status에 따른 Badge variant 결정
 */
function getSubGroupStatusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'running') {
    return 'default'; // green
  }
  if (status === 'partial_running') {
    return 'secondary'; // yellow
  }
  if (status === 'stopped' || status === 'partial_terminated') {
    return 'secondary'; // yellow
  }
  if (status === 'terminated') {
    return 'outline'; // gray
  }
  if (status === 'failed') {
    return 'destructive'; // red
  }

  return 'outline'; // default
}

/**
 * SubGroup Status에 따른 Card 배경색 클래스 결정
 */
function getSubGroupStatusCardClass(status: string): string {
  if (status === 'running') {
    return 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800';
  }
  if (status === 'partial_running') {
    return 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800';
  }
  if (status === 'stopped') {
    return 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800';
  }
  if (status === 'terminated') {
    return 'bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800';
  }
  if (status === 'failed') {
    return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800';
  }
  if (status === 'partial_terminated' || status === 'mixed') {
    return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800';
  }

  return '';
}

/**
 * itemsPerRow에 따른 Tailwind CSS 그리드 컬럼 클래스 반환
 * 
 * @param itemsPerRow 한 줄에 표시할 아이템 개수
 * @returns Tailwind CSS grid-cols-* 클래스
 */
function getGridColsClass(itemsPerRow: number): string {
  const gridColsMap: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    7: 'grid-cols-7',
    8: 'grid-cols-8',
  };

  // 기본값은 5개, 범위를 벗어나면 가장 가까운 값 사용
  if (itemsPerRow <= 1) {
    return gridColsMap[1];
  }
  if (itemsPerRow >= 8) {
    return gridColsMap[8];
  }

  return gridColsMap[itemsPerRow] || gridColsMap[5];
}
