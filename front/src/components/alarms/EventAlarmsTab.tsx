'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EventAlarm } from '@/types/alarms';
import { useEventAlarms } from '@/hooks/api/useAlarms';
import { EventInfoCard } from './EventInfoCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface EventAlarmsTabProps {
  policySeq: number;
}

/**
 * Event & Alarms 탭 컴포넌트
 */
export function EventAlarmsTab({ policySeq }: EventAlarmsTabProps) {
  const [selectedEvent, setSelectedEvent] = useState<EventAlarm | null>(null);
  const { eventAlarms, isLoading } = useEventAlarms(policySeq);

  const columns: ColumnDef<EventAlarm>[] = [
    {
      accessorKey: 'occurTime',
      header: 'Occur Time',
      cell: ({ row }) => {
        const date = row.getValue('occurTime') as string;
        return <div>{date ? new Date(date).toLocaleString() : '-'}</div>;
      },
    },
    {
      accessorKey: 'metric',
      header: 'Metric',
      cell: ({ row }) => <div>{row.getValue('metric') || '-'}</div>,
    },
    {
      accessorKey: 'hostname',
      header: 'Hostname',
      cell: ({ row }) => <div>{row.getValue('hostname') || '-'}</div>,
    },
    {
      accessorKey: 'level',
      header: 'Level',
      cell: ({ row }) => {
        const level = row.getValue('level') as string;
        const levelColors: Record<string, string> = {
          crit: 'bg-red-100 text-red-800',
          warn: 'bg-yellow-100 text-yellow-800',
          info: 'bg-blue-100 text-blue-800',
        };
        return (
          <span
            className={`px-2 py-1 rounded text-xs ${
              levelColors[level.toLowerCase()] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {level}
          </span>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => {
        const date = row.getValue('createdAt') as string;
        return <div>{date ? new Date(date).toLocaleString() : '-'}</div>;
      },
    },
  ];

  if (isLoading) {
    return <LoadingSpinner size="md" />;
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.id || (column.accessorKey as string)}>
                  {typeof column.header === 'string' ? column.header : column.id}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {eventAlarms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-sm text-muted-foreground">
                  Event & Alarm이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              eventAlarms.map((eventAlarm, idx) => (
                <TableRow
                  key={`${eventAlarm.policySeq}-${idx}`}
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => setSelectedEvent(eventAlarm)}
                >
                  {columns.map((column) => {
                    const accessorKey = column.accessorKey as keyof EventAlarm;
                    const value = eventAlarm[accessorKey];
                    const cell = column.cell
                      ? column.cell({
                          row: {
                            getValue: (key: string) => eventAlarm[key as keyof EventAlarm],
                            original: eventAlarm,
                          },
                        } as any)
                      : value;
                    return (
                      <TableCell key={column.id || (accessorKey as string)}>
                        {cell}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedEvent && (
        <EventInfoCard event={selectedEvent} />
      )}
    </div>
  );
}
