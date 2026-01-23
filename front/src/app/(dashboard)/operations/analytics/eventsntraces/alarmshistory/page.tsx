'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CrudPageTemplate } from '@/components/templates/CrudPageTemplate';
import { Alarm, AlarmDetail } from '@/types/alarms';
import { useAlarms, useAlarmDetail } from '@/hooks/api/useAlarms';
import { AlarmDetailCard } from '@/components/alarms/AlarmDetailCard';

/**
 * Alarms History 페이지
 */
export default function AlarmsHistoryPage() {
  const [selectedAlarm, setSelectedAlarm] = useState<Alarm | null>(null);

  const { alarms, isLoading, refetch } = useAlarms();
  const { alarmDetail, isLoading: isDetailLoading } = useAlarmDetail(
    selectedAlarm?.seq || null
  );

  // 테이블 컬럼 정의
  const columns: ColumnDef<Alarm>[] = [
    {
      accessorKey: 'seq',
      header: 'Seq',
      cell: ({ row }) => <div className="font-medium">{row.getValue('seq')}</div>,
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'measurement',
      header: 'Measurement',
      cell: ({ row }) => <div>{row.getValue('measurement') || '-'}</div>,
    },
    {
      accessorKey: 'field',
      header: 'Field',
      cell: ({ row }) => <div>{row.getValue('field') || '-'}</div>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const statusColors: Record<string, string> = {
          active: 'bg-green-100 text-green-800',
          inactive: 'bg-gray-100 text-gray-800',
        };
        return (
          <span
            className={`px-2 py-1 rounded text-xs ${
              statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: 'create_at',
      header: 'Create At',
      cell: ({ row }) => {
        const date = row.getValue('create_at') as string;
        return <div>{date ? new Date(date).toLocaleString() : '-'}</div>;
      },
    },
    {
      accessorKey: 'crit',
      header: 'Crit',
      cell: ({ row }) => <div>{row.getValue('crit') || 0}</div>,
    },
    {
      accessorKey: 'warn',
      header: 'Warn',
      cell: ({ row }) => <div>{row.getValue('warn') || 0}</div>,
    },
    {
      accessorKey: 'info',
      header: 'Info',
      cell: ({ row }) => <div>{row.getValue('info') || 0}</div>,
    },
  ];

  return (
    <>
      <CrudPageTemplate
        data={alarms}
        columns={columns}
        selectedItem={selectedAlarm}
        onItemSelect={setSelectedAlarm}
        onRefresh={refetch}
        isLoading={isLoading}
        detailComponent={(props) => (
          <AlarmDetailCard
            alarm={alarmDetail || (props.item as unknown as AlarmDetail)}
            isLoading={isDetailLoading}
          />
        )}
        title="Alarms History"
        emptyMessage="Alarm이 없습니다."
        hideAddButton
        hideDeleteButton
      />
    </>
  );
}
