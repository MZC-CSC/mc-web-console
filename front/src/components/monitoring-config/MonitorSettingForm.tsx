'use client';

import { Card } from '@/components/ui/card';
import { FormSelect } from '@/components/common/FormSelect';
import { MonitoringWorkload } from '@/types/monitoring';
import { useMonitoringWorkloads } from '@/hooks/api/useMonitoringConfig';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface MonitorSettingFormProps {
  selectedWorkload: string | null;
  onWorkloadChange: (workloadId: string | null) => void;
}

/**
 * Monitor Setting 폼 컴포넌트
 * Workload 선택 기능 제공
 */
export function MonitorSettingForm({
  selectedWorkload,
  onWorkloadChange,
}: MonitorSettingFormProps) {
  const { workloads, isLoading } = useMonitoringWorkloads();

  const workloadOptions = workloads.map((w) => ({
    value: w.id,
    label: w.name,
  }));

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Monitor Setting</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <FormSelect
            label="Workload"
            value={selectedWorkload || ''}
            onChange={(e) => onWorkloadChange(e.target.value || null)}
            options={workloadOptions}
            placeholder="Workload 선택"
            disabled={isLoading}
          />
          {isLoading && <LoadingSpinner size="sm" className="mt-2" />}
        </div>
      </div>
    </Card>
  );
}
