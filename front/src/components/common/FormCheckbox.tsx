import { Checkbox as UICheckbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormCheckboxProps {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function FormCheckbox({
  label,
  checked,
  onCheckedChange,
  disabled = false,
  className,
}: FormCheckboxProps) {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <UICheckbox
        id={label}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
      <Label
        htmlFor={label}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
      </Label>
    </div>
  );
}
