'use client';

import { FormInput } from '@/components/common/FormInput';
import { FormRangeInput } from '@/components/common/FormRangeInput';
import { FormSelect } from '@/components/common/FormSelect';
import type { AcceleratorConfig } from '@/types/mci-workloads';

interface AcceleratorConfigFormProps {
  value: AcceleratorConfig;
  onChange: (config: AcceleratorConfig) => void;
}

/**
 * Accelerator Config Form 컴포넌트
 * GPU Type, Model, Count, Memory 설정
 */
export function AcceleratorConfigForm({ value, onChange }: AcceleratorConfigFormProps) {
  const handleChange = (field: keyof AcceleratorConfig, newValue: string) => {
    onChange({ ...value, [field]: newValue });
  };

  return (
    <div className="space-y-4">
      {/* Type */}
      <div>
        <FormSelect
          label="Type"
          value={value.type || ''}
          onChange={(newValue) => handleChange('type', newValue)}
          options={[
            { value: 'gpu', label: 'GPU' },
          ]}
        />
      </div>

      {/* Model */}
      <div>
        <FormInput
          label="Model"
          type="text"
          value={value.model || ''}
          onChange={(e) => handleChange('model', e.target.value)}
          placeholder="Ex: A100"
        />
      </div>

      {/* Count (Min/Max) */}
      <FormRangeInput
        label="Count"
        minValue={value.countMin || ''}
        maxValue={value.countMax || ''}
        onMinChange={(val) => handleChange('countMin', val)}
        onMaxChange={(val) => handleChange('countMax', val)}
      />

      {/* Memory (GB) (Min/Max) */}
      <FormRangeInput
        label="Memory (GB)"
        minValue={value.memoryMin || ''}
        maxValue={value.memoryMax || ''}
        onMinChange={(val) => handleChange('memoryMin', val)}
        onMaxChange={(val) => handleChange('memoryMax', val)}
      />
    </div>
  );
}
