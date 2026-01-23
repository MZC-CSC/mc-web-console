import React from 'react';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { Navigation } from '@/components/layout/Navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { AlertProvider } from '@/components/common/AlertProvider';
import { LoadingProvider } from '@/components/common/LoadingProvider';
import { Toaster } from '@/components/common/Toaster';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { isAuthenticatedOnServer } from '@/lib/utils/serverCookies';
import { ROUTES } from '@/constants/routes';

/**
 * Dashboard Layout with Server Guard
 * 대시보드 레이아웃 (서버 가드 포함)
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = await isAuthenticatedOnServer();
  
  if (!authenticated) {
    // 현재 경로를 쿼리 파라미터로 저장하여 로그인 후 리다이렉트 가능하도록
    // Store current path as query parameter for redirect after login
    const headersList = await headers();
    const pathname = headersList.get('x-pathname') || headersList.get('referer') || '/dashboard';
    const redirectPath = pathname.startsWith('http') 
      ? new URL(pathname).pathname 
      : pathname;
    
    redirect(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(redirectPath)}`);
  }

  return (
    <QueryProvider>
      <AlertProvider>
        <LoadingProvider>
          <div className="flex min-h-screen flex-col">
            <Navigation />
            <div className="flex flex-1">
              {/* 데스크톱 사이드바 (모바일에서는 숨김) */}
              <Sidebar className="hidden md:block" />
              <main className="flex-1 p-6">
                <Breadcrumb className="mb-4" />
                {children}
              </main>
            </div>
            <Footer />
          </div>
          <Toaster />
        </LoadingProvider>
      </AlertProvider>
    </QueryProvider>
  );
}
