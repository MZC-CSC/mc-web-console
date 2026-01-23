import React from 'react';
import { QueryProvider } from '@/components/providers/QueryProvider';

/**
 * Auth Layout
 * 인증 레이아웃
 * 
 * Note: 리다이렉트 로직은 각 페이지에서 처리됩니다
 * Redirect logic is handled in each page component
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <div className="flex min-h-screen items-center justify-center bg-muted">
        {children}
      </div>
    </QueryProvider>
  );
}
