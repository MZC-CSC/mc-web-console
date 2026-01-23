import { redirect } from 'next/navigation';
import { isAuthenticatedOnServer } from '@/lib/utils/serverCookies';
import { ROUTES } from '@/constants/routes';

/**
 * Root page with redirect logic
 * 루트 페이지 (리다이렉트 로직 포함)
 * 
 * - 인증된 경우: 대시보드로 리다이렉트
 * - 인증되지 않은 경우: 로그인 페이지로 리다이렉트
 * 
 * - If authenticated: redirect to dashboard
 * - If not authenticated: redirect to login page
 */
export default async function Home() {
  const authenticated = await isAuthenticatedOnServer();
  
  if (authenticated) {
    // 인증된 경우 대시보드로 리다이렉트
    // Redirect to dashboard if authenticated
    redirect(ROUTES.DASHBOARD);
  } else {
    // 인증되지 않은 경우 로그인 페이지로 리다이렉트
    // Redirect to login page if not authenticated
    redirect(ROUTES.LOGIN);
  }
}
