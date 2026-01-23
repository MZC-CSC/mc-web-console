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
import { ChevronLeft, ChevronRight, RefreshCw, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  onRefresh?: () => void;
  isLoading?: boolean;
  onRowClick?: (item: TData) => void;
  emptyMessage?: string;
  // 필터 기능
  enableFiltering?: boolean;
  filterColumns?: string[]; // 필터를 적용할 컬럼 키 목록
}

export function DataTable<TData>({
  data,
  columns,
  onRefresh,
  isLoading = false,
  onRowClick,
  emptyMessage = '데이터가 없습니다.',
  enableFiltering = false,
  filterColumns = [],
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  const handleClearFilters = () => {
    setColumnFilters([]);
  };

  const hasActiveFilters = columnFilters.length > 0;

  return (
    <div className="space-y-4">
      {/* Filter Section */}
      {enableFiltering && filterColumns.length > 0 && (
        <div className="flex gap-2 items-end">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
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
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={handleClearFilters} className="h-8">
              <X className="mr-1 h-3 w-3" />
              초기화
            </Button>
          )}
        </div>
      )}

      {/* Refresh Button */}
      {onRefresh && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={cn('mr-2 h-4 w-4', isLoading && 'animate-spin')} />
            새로고침
          </Button>
        </div>
      )}

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
                  className={cn(onRowClick && 'cursor-pointer hover:bg-accent')}
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
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          총 {table.getFilteredRowModel().rows.length}개 항목
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
