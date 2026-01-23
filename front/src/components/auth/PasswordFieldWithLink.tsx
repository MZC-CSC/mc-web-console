'use client';

import { Input } from '@/components/ui/input';
import { AuthLink } from './AuthLink';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordFieldWithLinkProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onForgotPasswordClick?: () => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  forgotPasswordLinkText?: string;
  className?: string;
  autoComplete?: string;
  required?: boolean;
}

/**
 * 비밀번호 입력 필드와 "I forgot password" 링크를 조합한 컴포넌트
 * 
 * @param value - 비밀번호 입력값
 * @param onChange - 입력값 변경 핸들러
 * @param onKeyDown - 키보드 이벤트 핸들러 (선택)
 * @param onForgotPasswordClick - "I forgot password" 링크 클릭 핸들러 (선택)
 * @param placeholder - 플레이스홀더 텍스트
 * @param disabled - 비활성화 여부
 * @param error - 에러 메시지
 * @param forgotPasswordLinkText - "I forgot password" 링크 텍스트
 * @param className - 추가 CSS 클래스
 * @param autoComplete - 자동완성 속성
 * @param required - 필수 입력 여부
 */
export function PasswordFieldWithLink({
  value,
  onChange,
  onKeyDown,
  onForgotPasswordClick,
  placeholder = '비밀번호를 입력하세요',
  disabled = false,
  error,
  forgotPasswordLinkText = 'I forgot password',
  className,
  autoComplete = 'current-password',
  required = true,
}: PasswordFieldWithLinkProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between items-center">
        <Label
          htmlFor="password"
          className={cn(
            'text-sm font-medium',
            required && "after:content-['*'] after:ml-0.5 after:text-destructive"
          )}
        >
          비밀번호
        </Label>
        {onForgotPasswordClick && (
          <AuthLink
            variant="forgot"
            onClick={onForgotPasswordClick}
          >
            {forgotPasswordLinkText}
          </AuthLink>
        )}
      </div>
      <div className="space-y-2">
        <Input
          id="password"
          type="password"
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          required={required}
          className={cn(error && 'border-destructive')}
        />
        {error && (
          <div className="flex items-center gap-1 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
