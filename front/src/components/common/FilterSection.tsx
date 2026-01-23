'use client';

import { Button } from './Button';
import { FormInput } from './FormInput';
import { FormSelect } from './FormSelect';
import { X, Filter } from 'lucide-react';
import { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface FilterField {
  id: string;
  label: string;
  type: 'text' | 'select';
  options?: { value: string; label: string }[];
}

interface FilterSectionProps {
  fields: FilterField[];
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
  onReset: () => void;
  className?: string;
}

export function FilterSection({
  fields,
  values,
  onChange,
  onReset,
  className,
}: FilterSectionProps) {
  const [open, setOpen] = useState(false);

  const handleFieldChange = (fieldId: string, value: string) => {
    onChange({ ...values, [fieldId]: value });
  };

  const hasActiveFilters = Object.values(values).some((v) => v !== '');

  return (
    <Collapsible open={open} onOpenChange={setOpen} className={className}>
      <div className="flex items-center justify-between">
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            필터
            {hasActiveFilters && (
              <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {Object.values(values).filter((v) => v !== '').length}
              </span>
            )}
          </Button>
        </CollapsibleTrigger>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X className="mr-2 h-4 w-4" />
            초기화
          </Button>
        )}
      </div>
      <CollapsibleContent className="mt-4 space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {fields.map((field) => {
            if (field.type === 'text') {
              return (
                <FormInput
                  key={field.id}
                  label={field.label}
                  value={values[field.id] || ''}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                />
              );
            } else if (field.type === 'select' && field.options) {
              return (
                <FormSelect
                  key={field.id}
                  label={field.label}
                  value={values[field.id] || ''}
                  onChange={(value) => handleFieldChange(field.id, value)}
                  options={field.options}
                  placeholder={`${field.label} 선택`}
                />
              );
            }
            return null;
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
