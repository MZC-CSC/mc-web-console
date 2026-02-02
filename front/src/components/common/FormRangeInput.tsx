'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface FormRangeInputProps {
  label: string; // 예: "Memory (GB)"
  minValue: string | number;
  maxValue: string | number;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
  minPlaceholder?: string; // 기본값: "min"
  maxPlaceholder?: string; // 기본값: "max"
  required?: boolean;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
}

/**
 * Min/Max 범위 입력을 위한 FormRangeInput 컴포넌트
 * 한 줄에 라벨과 두 개의 NumberInput을 나란히 배치
 */
export function FormRangeInput({
  label,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  minPlaceholder = 'min',
  maxPlaceholder = 'max',
  required = false,
  error,
  helperText,
  disabled = false,
  className,
  min,
  max,
  step,
}: FormRangeInputProps) {
  const inputId = `range-${label.replace(/\s+/g, '-').toLowerCase()}`;
  const minInputId = `${inputId}-min`;
  const maxInputId = `${inputId}-max`;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-4 flex-nowrap">
        <Label
          htmlFor={minInputId}
          className={cn(
            'text-sm font-medium whitespace-nowrap flex-shrink-0 w-20 text-right',
            required ? "after:content-['*'] after:ml-0.5 after:text-destructive" : ''
          )}
        >
          {label}
        </Label>
        <div className="flex items-center gap-2 flex-nowrap">
          <Input
            id={minInputId}
            type="number"
            value={minValue}
            onChange={(e) => onMinChange(e.target.value)}
            placeholder={minPlaceholder}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            className={cn(error && 'border-destructive', 'w-16')}
            aria-label={`${label} - Minimum`}
          />
          <span className="text-muted-foreground flex-shrink-0">~</span>
          <Input
            id={maxInputId}
            type="number"
            value={maxValue}
            onChange={(e) => onMaxChange(e.target.value)}
            placeholder={maxPlaceholder}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            className={cn(error && 'border-destructive', 'w-16')}
            aria-label={`${label} - Maximum`}
          />
        </div>
      </div>
      {error && (
        <div className="flex items-center gap-1 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
      {helperText && !error && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}
