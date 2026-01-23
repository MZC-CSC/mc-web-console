import { redirect } from 'next/navigation';
import { isAuthenticatedOnServer } from '@/lib/utils/serverCookies';
import { ROUTES } from '@/constants/routes';
import { LoginPageClient } from './LoginPageClient';

/**
 * 로그인 페이지 (서버 컴포넌트)
 * Login page (server component)
 */
export default async function LoginPage() {
  const authenticated = await isAuthenticatedOnServer();
  
  // 이미 인증된 경우 대시보드로 리다이렉트
  // Redirect to dashboard if already authenticated
  if (authenticated) {
    redirect(ROUTES.DASHBOARD);
  }

  return <LoginPageClient />;
}

// 기존 클라이언트 컴포넌트 코드는 LoginPageClient.tsx로 이동
// Original client component code moved to LoginPageClient.tsx
