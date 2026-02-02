import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface FormInputProps {
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  horizontal?: boolean; // 가로 배치 여부 (기본값: false)
}

export function FormInput({
  label,
  type = 'text',
  value,
  onChange,
  onKeyDown,
  placeholder,
  autoComplete,
  required = false,
  error,
  helperText,
  disabled = false,
  readOnly = false,
  className,
  horizontal = false, // 기본값: false (세로 배치)
}: FormInputProps) {
  return (
    <div className={cn(horizontal ? 'flex items-center gap-4 flex-nowrap' : 'space-y-2', className)}>
      <Label
        htmlFor={label}
        className={cn(
          'text-sm font-medium',
          required ? "after:content-['*'] after:ml-0.5 after:text-destructive" : '',
          horizontal ? 'whitespace-nowrap flex-shrink-0 w-20 text-right' : ''
        )}
      >
        {label}
      </Label>
      <div className={cn(horizontal ? 'w-40' : '', 'space-y-2')}>
        <Input
          id={label}
          type={type}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          className={cn(error && 'border-destructive')}
        />
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
    </div>
  );
}
