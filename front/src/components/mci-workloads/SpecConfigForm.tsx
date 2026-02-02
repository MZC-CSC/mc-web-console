'use client';

import { FormRangeInput } from '@/components/common/FormRangeInput';
import { FormSelect } from '@/components/common/FormSelect';
import type { SpecConfig } from '@/types/mci-workloads';
import { ARCHITECTURE_OPTIONS } from '@/lib/utils/recommendationUtils';

interface SpecConfigFormProps {
  value: SpecConfig;
  onChange: (config: SpecConfig) => void;
}

/**
 * Spec Config Form 컴포넌트
 * Memory, vCPU, Cost, Architecture 설정
 */
export function SpecConfigForm({ value, onChange }: SpecConfigFormProps) {
  const handleChange = (field: keyof SpecConfig, newValue: string) => {
    onChange({ ...value, [field]: newValue });
  };

  return (
    <div className="space-y-4">
      {/* 첫 번째 줄: Memory, vCPU, Cost */}
      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          {/* Memory (GB) */}
          <FormRangeInput
            label="Memory (GB)"
            minValue={value.memoryMin || ''}
            maxValue={value.memoryMax || ''}
            onMinChange={(val) => handleChange('memoryMin', val)}
            onMaxChange={(val) => handleChange('memoryMax', val)}
          />
        </div>

        <div className="flex-1 min-w-0">
          {/* vCPU */}
          <FormRangeInput
            label="vCPU"
            minValue={value.cpuMin || ''}
            maxValue={value.cpuMax || ''}
            onMinChange={(val) => handleChange('cpuMin', val)}
            onMaxChange={(val) => handleChange('cpuMax', val)}
          />
        </div>

        <div className="flex-1 min-w-0">
          {/* Cost (Hour) */}
          <FormRangeInput
            label="Cost (Hour)"
            minValue={value.costMin || ''}
            maxValue={value.costMax || ''}
            onMinChange={(val) => handleChange('costMin', val)}
            onMaxChange={(val) => handleChange('costMax', val)}
          />
        </div>
      </div>

      {/* 두 번째 줄: Architecture, 빈 공간, 빈 공간 */}
      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          {/* Architecture */}
          <FormSelect
            label="Architecture"
            value={value.architecture || ''}
            onChange={(newValue) => handleChange('architecture', newValue)}
            options={ARCHITECTURE_OPTIONS}
            horizontal
          />
        </div>

        <div className="flex-1 min-w-0"></div>

        <div className="flex-1 min-w-0"></div>
      </div>
    </div>
  );
}
