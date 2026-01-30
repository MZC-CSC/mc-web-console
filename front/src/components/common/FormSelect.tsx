import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface FormSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
  showDefaultOption?: boolean; // 기본 "Select" 옵션 표시 여부 (기본값: true)
  defaultOptionLabel?: string; // 기본 옵션 라벨 (기본값: 'Select')
}

// Select 컴포넌트는 빈 문자열을 허용하지 않으므로, 빈 값을 '__all__'로 변환
const ALL_VALUE = '__all__';

export function FormSelect({
  label,
  value,
  onChange,
  options,
  placeholder = '선택하세요',
  required = false,
  error,
  helperText,
  disabled = false,
  className,
  showDefaultOption = true, // 기본값: true
  defaultOptionLabel = 'Select', // 기본값: 'Select'
}: FormSelectProps) {
  // 빈 문자열을 '__all__'로 변환하여 Select에 전달
  const selectValue = value === '' ? ALL_VALUE : value;

  // Select에서 선택된 값을 받아서 빈 문자열로 변환하여 부모에 전달
  const handleValueChange = (newValue: string) => {
    onChange(newValue === ALL_VALUE ? '' : newValue);
  };

  // 옵션을 변환: 빈 값을 '__all__'로 변환
  const transformedOptions = options.map((option) => ({
    ...option,
    value: option.value === '' ? ALL_VALUE : option.value,
  }));

  // 기본 옵션이 이미 있는지 확인 (빈 값 옵션이 있는지)
  const hasEmptyOption = options.some((option) => option.value === '');

  // 기본 옵션 추가 (showDefaultOption이 true이고 빈 값 옵션이 없고 required가 아닌 경우)
  // required인 경우 기본 옵션을 표시하지 않음 (필수 선택이므로)
  const shouldShowDefaultOption = showDefaultOption && !hasEmptyOption && !required;

  const finalOptions = shouldShowDefaultOption
    ? [{ value: ALL_VALUE, label: defaultOptionLabel }, ...transformedOptions]
    : transformedOptions;

  return (
    <div className={cn('space-y-2', className)}>
      <Label className={required ? "after:content-['*'] after:ml-0.5 after:text-destructive" : ''}>
        {label}
      </Label>
      <Select value={selectValue} onValueChange={handleValueChange} disabled={disabled}>
        <SelectTrigger className={cn(error && 'border-destructive')}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {finalOptions
            .sort((a, b) => {
              // '__all__' 값을 맨 위로 정렬
              if (a.value === ALL_VALUE) return -1;
              if (b.value === ALL_VALUE) return 1;
              return 0;
            })
            .map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
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
