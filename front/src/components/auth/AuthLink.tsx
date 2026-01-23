'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface AuthLinkProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'forgot' | 'register';
  className?: string;
}

/**
 * 인증 관련 링크 컴포넌트
 * 인증 페이지에서 사용하는 링크의 공통 스타일과 동작을 정의합니다.
 * 
 * @param href - 링크 URL (선택)
 * @param onClick - 클릭 이벤트 핸들러 (선택)
 * @param children - 링크 텍스트
 * @param variant - 링크 스타일 변형 (default, forgot, register)
 * @param className - 추가 CSS 클래스
 */
export function AuthLink({
  href,
  onClick,
  children,
  variant = 'default',
  className,
}: AuthLinkProps) {
  const baseStyles = 'text-primary hover:underline transition-colors';
  
  const variantStyles = {
    default: '',
    forgot: 'text-xs',
    register: 'text-center',
  };

  const combinedClassName = cn(
    baseStyles,
    variantStyles[variant],
    className
  );

  // onClick이 있으면 button으로, href가 있으면 Link로 렌더링
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={combinedClassName}
        aria-label={typeof children === 'string' ? children : 'Link'}
      >
        {children}
      </button>
    );
  }

  if (href) {
    return (
      <Link
        href={href}
        className={combinedClassName}
        aria-label={typeof children === 'string' ? children : 'Link'}
      >
        {children}
      </Link>
    );
  }

  // href와 onClick이 모두 없으면 span으로 렌더링 (placeholder)
  return (
    <span className={combinedClassName}>
      {children}
    </span>
  );
}
