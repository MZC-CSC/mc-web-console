'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/common/Button';
import { CrudDetail } from './CrudDetail';
import { CrudActions } from './CrudActions';
import { Plus, RefreshCw } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { cn } from '@/lib/utils';

interface CrudPageTemplateProps<TData> {
  // 데이터
  data: TData[];
  columns: ColumnDef<TData>[];
  selectedItem: TData | null;
  onItemSelect: (item: TData | null) => void;

  // API
  onRefresh: () => void;
  isLoading?: boolean;

  // Actions
  onAdd?: () => void;
  onUpdate?: (item: TData) => void;
  onDelete?: (item: TData) => void;

  // Detail
  detailComponent?: React.ComponentType<{ item: TData; onUpdate?: () => void }>;

  // Customization
  title?: string;
  addButtonLabel?: string;
  emptyMessage?: string;
  hideAddButton?: boolean;
  hideDeleteButton?: boolean;
  hideRefreshButton?: boolean; // DataTable의 새로고침 버튼을 사용할 경우 true

  // Filter
  enableFiltering?: boolean;
  filterColumns?: string[];
}

export function CrudPageTemplate<TData>({
  data,
  columns,
  selectedItem,
  onItemSelect,
  onRefresh,
  isLoading = false,
  onAdd,
  onUpdate,
  onDelete,
  detailComponent: DetailComponent,
  title,
  addButtonLabel = '추가',
  emptyMessage = '데이터가 없습니다.',
  hideAddButton = false,
  hideDeleteButton = false,
  hideRefreshButton = false,
  enableFiltering = false,
  filterColumns = [],
}: CrudPageTemplateProps<TData>) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // selectedItem이 변경되면 Detail 자동 표시
  useEffect(() => {
    setIsDetailOpen(!!selectedItem);
  }, [selectedItem]);

  const handleRowClick = (item: TData) => {
    onItemSelect(item);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    onItemSelect(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        {title && <h1 className="text-2xl font-bold">{title}</h1>}
        <div className="flex gap-2">
          {!hideRefreshButton && (
            <Button variant="outline" onClick={onRefresh} disabled={isLoading}>
              <RefreshCw className={cn('mr-2 h-4 w-4', isLoading && 'animate-spin')} />
              새로고침
            </Button>
          )}
          {!hideAddButton && onAdd && (
            <Button onClick={onAdd}>
              <Plus className="mr-2 h-4 w-4" />
              {addButtonLabel}
            </Button>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="space-y-4">
        <DataTable
          data={data}
          columns={columns}
          onRefresh={onRefresh}
          isLoading={isLoading}
          onRowClick={handleRowClick}
          emptyMessage={emptyMessage}
          enableFiltering={enableFiltering}
          filterColumns={filterColumns}
          selectedItem={selectedItem}
          getRowId={(row) => {
            // MCIWorkload의 경우 id 필드 사용
            const rowObj = row as Record<string, any>;
            if ('id' in rowObj && typeof rowObj.id === 'string') {
              return rowObj.id;
            }
            return String(row);
          }}
        />
      </div>

      {/* Detail Section - Displayed below table */}
      {isDetailOpen && selectedItem && (
        <div className="space-y-4">
          <CrudDetail
            item={selectedItem}
            onClose={handleCloseDetail}
            detailComponent={DetailComponent}
          />
          {selectedItem && (
            <CrudActions
              item={selectedItem}
              onUpdate={onUpdate}
              onDelete={hideDeleteButton ? undefined : onDelete}
            />
          )}
        </div>
      )}
    </div>
  );
}
