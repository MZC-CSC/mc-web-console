'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { FormSelect } from '@/components/common/FormSelect';
import { FormInput } from '@/components/common/FormInput';
import { Button } from '@/components/common/Button';
import { Workload, Server } from '@/types/logs';
import { useWorkloads } from '@/hooks/api/useLogs';
import { useServers } from '@/hooks/api/useLogs';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface LogMonitorFormProps {
  selectedWorkload: string | null;
  selectedServer: string | null;
  keyword: string;
  onWorkloadChange: (workloadId: string | null) => void;
  onServerChange: (serverId: string | null) => void;
  onKeywordChange: (keyword: string) => void;
  onSearch: () => void;
}

/**
 * Log Monitor 폼 컴포넌트
 * Workload, Server 선택 및 Keyword 검색 기능 제공
 */
export function LogMonitorForm({
  selectedWorkload,
  selectedServer,
  keyword,
  onWorkloadChange,
  onServerChange,
  onKeywordChange,
  onSearch,
}: LogMonitorFormProps) {
  const { workloads, isLoading: isWorkloadsLoading } = useWorkloads();
  const { servers, isLoading: isServersLoading } = useServers(selectedWorkload);

  useEffect(() => {
    // Workload 변경 시 Server 초기화
    if (!selectedWorkload) {
      onServerChange(null);
    }
  }, [selectedWorkload, onServerChange]);

  const workloadOptions = workloads.map((w) => ({
    value: w.id,
    label: w.name,
  }));

  const serverOptions = servers.map((s) => ({
    value: s.id,
    label: s.name,
  }));

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Log Monitor</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <FormSelect
            label="Workload"
            value={selectedWorkload || ''}
            onChange={(e) => onWorkloadChange(e.target.value || null)}
            options={workloadOptions}
            placeholder="Workload 선택"
            disabled={isWorkloadsLoading}
          />
          {isWorkloadsLoading && <LoadingSpinner size="sm" className="mt-2" />}
        </div>

        <div>
          <FormSelect
            label="Server"
            value={selectedServer || ''}
            onChange={(e) => onServerChange(e.target.value || null)}
            options={serverOptions}
            placeholder="Server 선택"
            disabled={!selectedWorkload || isServersLoading}
          />
          {isServersLoading && <LoadingSpinner size="sm" className="mt-2" />}
        </div>

        <div>
          <FormInput
            label="Keyword"
            type="text"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            placeholder="Keyword 입력"
          />
        </div>

        <div className="flex items-end">
          <Button
            onClick={onSearch}
            disabled={!selectedWorkload || !selectedServer}
            className="w-full"
          >
            Search
          </Button>
        </div>
      </div>
    </Card>
  );
}
