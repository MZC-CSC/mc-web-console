// components/users/UsersTableFilters.tsx

'use client';

import { useState } from 'react';
import { FormSelect } from '@/components/common/FormSelect';
import { FormInput } from '@/components/common/FormInput';
import { Button } from '@/components/common/Button';
import type { Filter, FilterField, FilterType } from '@/types/users';

interface UsersTableFiltersProps {
  onFilterChange: (filter: Filter | undefined) => void;
}

export function UsersTableFilters({ onFilterChange }: UsersTableFiltersProps) {
  const [field, setField] = useState<FilterField>('name');
  const [type, setType] = useState<FilterType>('like');
  const [value, setValue] = useState('');

  const handleApply = () => {
    if (!value.trim()) {
      onFilterChange(undefined);
      return;
    }

    onFilterChange({
      field,
      type,
      value: value.trim(),
    });
  };

  const handleReset = () => {
    setField('name');
    setType('like');
    setValue('');
    onFilterChange(undefined);
  };

  return (
    <div className="flex items-center gap-2">
      <FormSelect
        label=""
        value={field}
        onChange={(v) => setField(v as FilterField)}
        options={[
          { value: 'id', label: 'ID' },
          { value: 'name', label: 'Name' },
          { value: 'email', label: 'Email' },
        ]}
        className="w-32"
      />
      <FormSelect
        label=""
        value={type}
        onChange={(v) => setType(v as FilterType)}
        options={[
          { value: 'like', label: 'Contains' },
          { value: '=', label: 'Equals' },
          { value: '!=', label: 'Not Equals' },
        ]}
        className="w-32"
      />
      <FormInput
        label=""
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Filter value..."
        className="w-64"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleApply();
          }
        }}
      />
      <Button onClick={handleApply}>Apply</Button>
      <Button variant="outline" onClick={handleReset}>
        Reset
      </Button>
    </div>
  );
}
