'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MonitorMetric, MetricPlugin } from '@/types/monitoring';
import { useMonitorMetrics, useMetricPlugins } from '@/hooks/api/useMonitoringConfig';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MetricsTabProps {
  serverId: string;
}

/**
 * Metrics 탭 컴포넌트
 * Monitor Metrics 및 Metric Plugins 관리
 */
export function MetricsTab({ serverId }: MetricsTabProps) {
  const { monitorMetrics, isLoading: isMetricsLoading } = useMonitorMetrics(serverId);
  const { metricPlugins, isLoading: isPluginsLoading } = useMetricPlugins(serverId);

  const metricsColumns: ColumnDef<MonitorMetric>[] = [
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      id: 'measurement',
      accessorKey: 'measurement',
      header: 'Measurement',
      cell: ({ row }) => <div>{row.getValue('measurement') || '-'}</div>,
    },
    {
      id: 'field',
      accessorKey: 'field',
      header: 'Field',
      cell: ({ row }) => <div>{row.getValue('field') || '-'}</div>,
    },
    {
      id: 'enabled',
      accessorKey: 'enabled',
      header: 'Enabled',
      cell: ({ row }) => {
        const enabled = row.getValue('enabled') as boolean;
        return (
          <span
            className={`px-2 py-1 rounded text-xs ${
              enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}
          >
            {enabled ? 'Yes' : 'No'}
          </span>
        );
      },
    },
  ];

  const pluginsColumns: ColumnDef<MetricPlugin>[] = [
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      id: 'type',
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => <div>{row.getValue('type') || '-'}</div>,
    },
    {
      id: 'enabled',
      accessorKey: 'enabled',
      header: 'Enabled',
      cell: ({ row }) => {
        const enabled = row.getValue('enabled') as boolean;
        return (
          <span
            className={`px-2 py-1 rounded text-xs ${
              enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}
          >
            {enabled ? 'Yes' : 'No'}
          </span>
        );
      },
    },
  ];

  return (
    <Tabs defaultValue="metrics" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="metrics">Monitor Metrics</TabsTrigger>
        <TabsTrigger value="plugins">Metric Plugins</TabsTrigger>
      </TabsList>
      <TabsContent value="metrics" className="mt-4">
        {isMetricsLoading ? (
          <LoadingSpinner size="md" />
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  {metricsColumns.map((column) => (
                    <TableHead key={column.id}>
                      {typeof column.header === 'string' ? column.header : column.id}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {monitorMetrics.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={metricsColumns.length} className="text-center py-8 text-sm text-muted-foreground">
                      Monitor Metric이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  monitorMetrics.map((metric) => (
                    <TableRow key={metric.id}>
                      {metricsColumns.map((column) => {
                        const columnId = column.id as keyof MonitorMetric;
                        const value = metric[columnId];
                        const cell = column.cell && typeof column.cell === 'function'
                          ? column.cell({
                              row: {
                                getValue: (key: string) => metric[key as keyof MonitorMetric],
                                original: metric,
                              },
                            } as any)
                          : value;
                        return (
                          <TableCell key={column.id}>
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
        )}
      </TabsContent>
      <TabsContent value="plugins" className="mt-4">
        {isPluginsLoading ? (
          <LoadingSpinner size="md" />
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  {pluginsColumns.map((column) => (
                    <TableHead key={column.id}>
                      {typeof column.header === 'string' ? column.header : column.id}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {metricPlugins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={pluginsColumns.length} className="text-center py-8 text-sm text-muted-foreground">
                      Metric Plugin이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  metricPlugins.map((plugin) => (
                    <TableRow key={plugin.id}>
                      {pluginsColumns.map((column) => {
                        const columnId = column.id as keyof MetricPlugin;
                        const value = plugin[columnId];
                        const cell = column.cell && typeof column.cell === 'function'
                          ? column.cell({
                              row: {
                                getValue: (key: string) => plugin[key as keyof MetricPlugin],
                                original: plugin,
                              },
                            } as any)
                          : value;
                        return (
                          <TableCell key={column.id}>
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
        )}
      </TabsContent>
    </Tabs>
  );
}
