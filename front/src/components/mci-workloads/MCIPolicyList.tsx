'use client';

import { useState, useEffect } from 'react';
import { Plus, ChevronDown, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/common/DataTable';
import { useMCIPolicy } from '@/hooks/api/useMCIWorkloads';
import { MciPolicyInfo, Policy } from '@/types/mci-policy';
import { ColumnDef } from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import { toastError } from '@/lib/utils/toast';
import { AppError } from '@/types/error';
import { MCIPolicyCreateModal } from './MCIPolicyCreateModal';

interface MCIPolicyListProps {
  mciId: string;
  mciName?: string;
  nsId: string;
  className?: string;
}

/**
 * Policy 테이블 데이터 타입
 */
interface PolicyTableData {
  id: string;
  mciName: string;
  mciId: string;
  subGroupSize: string;
  condition: string;
  period: string;
  action: string;
  policy: Policy;
}

/**
 * MCI Policy List 컴포넌트
 * 
 * MCI에 정의된 Scale Policy 목록을 테이블로 표시합니다.
 * 
 * 표시 항목:
 * - MCI Name
 * - MCI ID
 * - SubGroupSize
 * - Condition
 * - Period(s)
 * - Action
 */
export function MCIPolicyList({ mciId, mciName, nsId, className }: MCIPolicyListProps) {
  const { policyInfo, isLoading, error, refetch } = useMCIPolicy(nsId, mciId);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [hasShownErrorToast, setHasShownErrorToast] = useState(false);

  // 에러 발생 시 Toast로 표시 (한 번만 표시)
  useEffect(() => {
    if (error) {
      // AppError인 경우 statusCode 사용
      let errorStatus: number | undefined;
      let errorMessage = 'Policy 정보를 불러오는 중 오류가 발생했습니다.';
      
      if (error instanceof AppError) {
        errorStatus = error.statusCode;
        errorMessage = error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
        // Error 객체에서 statusCode나 status 추출 시도
        if ('statusCode' in error) {
          errorStatus = (error as any).statusCode;
        } else if ('status' in error) {
          errorStatus = (error as any).status;
        }
      } else if (typeof error === 'object' && error !== null) {
        // 일반 객체인 경우
        if ('statusCode' in error) {
          errorStatus = (error as any).statusCode;
        }
        if ('status' in error) {
          errorStatus = (error as any).status ?? errorStatus;
        }
        if ('message' in error && typeof (error as any).message === 'string') {
          errorMessage = (error as any).message;
        }
      }

      // 404는 Policy가 없는 정상 케이스이므로 Toast 표시하지 않음
      if (errorStatus !== 404 && !hasShownErrorToast) {
        console.log('[MCIPolicyList] Showing error toast:', {
          errorStatus,
          errorMessage,
          isAppError: error instanceof AppError,
          errorType: error?.constructor?.name,
        });
        toastError('Policy 조회 실패', errorMessage);
        setHasShownErrorToast(true);
      }
    } else {
      // 에러가 해결되면 Toast 플래그 리셋
      setHasShownErrorToast(false);
    }
  }, [error, hasShownErrorToast]);

  // Policy 데이터를 테이블 형식으로 변환
  const tableData: PolicyTableData[] = policyInfo?.policy?.map((policy, index) => {
    const condition = policy.autoCondition
      ? `${policy.autoCondition.metric || 'N/A'} ${policy.autoCondition.operator || ''} ${policy.autoCondition.operand || ''}`
      : 'N/A';
    const period = policy.autoCondition?.evaluationPeriod || 'N/A';
    const action = policy.autoAction?.actionType || 'N/A';
    const subGroupSize = policy.autoAction?.subGroupDynamicReq?.subGroupSize || 'N/A';

    return {
      id: `${mciId}-policy-${index}`,
      mciName: policyInfo?.Name || mciName || mciId,
      mciId,
      subGroupSize,
      condition,
      period,
      action,
      policy,
    };
  }) || [];

  // 테이블 컬럼 정의
  const columns: ColumnDef<PolicyTableData>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
          className="rounded border-gray-300"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(e.target.checked)}
          className="rounded border-gray-300"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'mciName',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 p-0 hover:bg-transparent"
          >
            MCI Name
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: 'mciId',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 p-0 hover:bg-transparent"
          >
            MCI ID
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: 'subGroupSize',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 p-0 hover:bg-transparent"
          >
            SubGroupSize
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: 'condition',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 p-0 hover:bg-transparent"
          >
            Condition
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate" title={row.original.condition}>
          {row.original.condition}
        </div>
      ),
    },
    {
      accessorKey: 'period',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 p-0 hover:bg-transparent"
          >
            Period(s)
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: 'action',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 p-0 hover:bg-transparent"
          >
            Action
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const action = row.original.action;
        return (
          <Badge variant={action === 'ScaleOut' ? 'default' : 'secondary'}>
            {action}
          </Badge>
        );
      },
    },
  ];

  // 에러 상태 확인 (404는 정상 케이스로 처리)
  const errorStatus = error ? ((error as any)?.statusCode || (error as any)?.status) : null;
  const isNotFoundError = errorStatus === 404;
  const hasError = error && !isNotFoundError;

  // 테이블에 전달할 데이터 (에러가 있어도 빈 배열 전달하여 테이블은 항상 표시)
  const tableDataToShow = hasError ? [] : tableData;

  return (
    <div className={cn('space-y-4', className)}>
      {/* 헤더 및 액션 버튼 - 항상 표시 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Scale Policy List</h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Filter className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Policy
          </Button>
        </div>
      </div>

      {/* Policy 테이블 - 항상 표시 (데이터가 없어도 빈 테이블 표시) */}
      <DataTable
        data={tableDataToShow}
        columns={columns}
        onRefresh={refetch}
        isLoading={isLoading}
        emptyMessage="정의된 Policy가 없습니다."
        getRowId={(row) => row.id}
      />

      {/* Policy 생성 모달 - 항상 렌더링 */}
      <MCIPolicyCreateModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mciId={mciId}
        mciName={mciName || mciId}
        nsId={nsId}
        onSuccess={() => {
          setCreateModalOpen(false);
          refetch();
        }}
      />
    </div>
  );
}
