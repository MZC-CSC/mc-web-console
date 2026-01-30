'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
  Settings2,
  Download,
  Trash2,
  Edit,
  MoreHorizontal,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

/**
 * DataTableAdvanced 컴포넌트
 *
 * 고급 기능이 추가된 DataTable
 * - Row 선택 (체크박스)
 * - 벌크 액션
 * - 컬럼 가시성 토글
 * - CSV/Excel 내보내기
 * - 컬럼 필터링
 *
 * @example
 * <DataTableAdvanced
 *   data={users}
 *   columns={userColumns}
 *   enableRowSelection
 *   bulkActions={[
 *     { label: '삭제', onClick: handleBulkDelete, variant: 'destructive', icon: Trash2 },
 *     { label: '수정', onClick: handleBulkEdit, icon: Edit },
 *   ]}
 *   enableColumnVisibility
 *   enableExport
 * />
 */

export interface BulkAction<TData = any> {
  label: string;
  onClick: (selectedRows: TData[]) => void;
  variant?: 'default' | 'destructive';
  icon?: React.ComponentType<{ className?: string }>;
}

export interface DataTableAdvancedProps<TData> {
  /** 데이터 */
  data: TData[];

  /** 컬럼 정의 */
  columns: ColumnDef<TData>[];

  /** 새로고침 핸들러 */
  onRefresh?: () => void;

  /** 로딩 상태 */
  isLoading?: boolean;

  /** 행 클릭 핸들러 */
  onRowClick?: (item: TData) => void;

  /** 빈 데이터 메시지 */
  emptyMessage?: string;

  /** 컬럼 필터링 활성화 */
  enableFiltering?: boolean;

  /** 필터 대상 컬럼 */
  filterColumns?: string[];

  /** Row 선택 활성화 */
  enableRowSelection?: boolean;

  /** 벌크 액션 */
  bulkActions?: BulkAction<TData>[];

  /** 컬럼 가시성 토글 활성화 */
  enableColumnVisibility?: boolean;

  /** 내보내기 활성화 */
  enableExport?: boolean;

  /** 내보내기 파일명 */
  exportFilename?: string;

  /** 페이지 크기 옵션 */
  pageSizeOptions?: number[];

  /** 초기 페이지 크기 */
  initialPageSize?: number;
}

export function DataTableAdvanced<TData>({
  data,
  columns,
  onRefresh,
  isLoading = false,
  onRowClick,
  emptyMessage = '데이터가 없습니다.',
  enableFiltering = false,
  filterColumns = [],
  enableRowSelection = false,
  bulkActions = [],
  enableColumnVisibility = false,
  enableExport = false,
  exportFilename = 'export',
  pageSizeOptions = [10, 20, 50, 100],
  initialPageSize = 10,
}: DataTableAdvancedProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Row 선택을 위한 컬럼 추가
  const columnsWithSelection = useMemo(() => {
    if (!enableRowSelection) return columns;

    const selectionColumn: ColumnDef<TData> = {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="전체 선택"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="행 선택"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    };

    return [selectionColumn, ...columns];
  }, [columns, enableRowSelection]);

  const table = useReactTable({
    data,
    columns: columnsWithSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: initialPageSize,
      },
    },
  });

  const handleClearFilters = () => {
    setColumnFilters([]);
  };

  const hasActiveFilters = columnFilters.length > 0;
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  // CSV 내보내기
  const handleExportCSV = () => {
    const headers = columns
      .filter((col) => 'accessorKey' in col)
      .map((col) => {
        if (typeof col.header === 'string') return col.header;
        if ('accessorKey' in col) return String(col.accessorKey);
        return '';
      });

    const rows = table.getFilteredRowModel().rows.map((row) => {
      return columns
        .filter((col) => 'accessorKey' in col)
        .map((col) => {
          if ('accessorKey' in col) {
            const value = row.getValue(col.accessorKey as string);
            return value !== null && value !== undefined ? String(value) : '';
          }
          return '';
        });
    });

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${exportFilename}-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          {/* 필터 초기화 */}
          {enableFiltering && hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              <X className="mr-1 h-3 w-3" />
              필터 초기화
            </Button>
          )}

          {/* 벌크 액션 */}
          {enableRowSelection && selectedCount > 0 && bulkActions.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedCount}개 선택됨
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4 mr-1" />
                    일괄 작업
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {bulkActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <DropdownMenuItem
                        key={index}
                        onClick={() => {
                          const selectedData = selectedRows.map((row) => row.original);
                          action.onClick(selectedData);
                        }}
                        className={cn(
                          action.variant === 'destructive' && 'text-destructive'
                        )}
                      >
                        {Icon && <Icon className="mr-2 h-4 w-4" />}
                        {action.label}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* 내보내기 */}
          {enableExport && (
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="mr-1 h-4 w-4" />
              CSV
            </Button>
          )}

          {/* 컬럼 가시성 */}
          {enableColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings2 className="mr-1 h-4 w-4" />
                  컬럼
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    const columnDef = columns.find((col) => {
                      if ('accessorKey' in col) {
                        return col.accessorKey === column.id;
                      }
                      return col.id === column.id;
                    });

                    const label =
                      columnDef && typeof columnDef.header === 'string'
                        ? columnDef.header
                        : column.id;

                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {label}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* 새로고침 */}
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
              <RefreshCw className={cn('mr-1 h-4 w-4', isLoading && 'animate-spin')} />
              새로고침
            </Button>
          )}
        </div>
      </div>

      {/* Filter Section */}
      {enableFiltering && filterColumns.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {filterColumns.map((columnId) => {
            const column = table.getColumn(columnId);
            if (!column) return null;

            const columnDef = columns.find((col) => {
              if ('accessorKey' in col) {
                return col.accessorKey === columnId;
              }
              return false;
            });

            const headerLabel =
              columnDef && typeof columnDef.header === 'string'
                ? columnDef.header
                : columnId;

            return (
              <div key={columnId} className="space-y-1">
                <label className="text-xs text-muted-foreground">{headerLabel}</label>
                <Input
                  placeholder={`${headerLabel} 검색...`}
                  value={(column.getFilterValue() as string) ?? ''}
                  onChange={(e) => column.setFilterValue(e.target.value)}
                  className="h-8"
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className={cn(
                    onRowClick && 'cursor-pointer',
                    row.getIsSelected() && 'bg-accent'
                  )}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columnsWithSelection.length}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            총 {table.getFilteredRowModel().rows.length}개 항목
            {selectedCount > 0 && ` (${selectedCount}개 선택)`}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">페이지당</span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
              className="h-8 w-[70px] rounded-md border border-input bg-background px-2 text-sm"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
