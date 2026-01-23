'use client';

import { DataTable } from '@/components/common/DataTable';
import { ColumnDef } from '@tanstack/react-table';

interface CrudTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  onRowClick?: (item: TData) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function CrudTable<TData>({
  data,
  columns,
  onRowClick,
  onRefresh,
  isLoading = false,
  emptyMessage = '데이터가 없습니다.',
}: CrudTableProps<TData>) {
  return (
    <DataTable
      data={data}
      columns={columns}
      onRefresh={onRefresh}
      isLoading={isLoading}
      onRowClick={onRowClick}
      emptyMessage={emptyMessage}
    />
  );
}
