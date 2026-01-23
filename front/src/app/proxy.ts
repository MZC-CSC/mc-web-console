import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Proxy function for Next.js 16
 * Handles routing concerns like rewrites, redirects, and headers
 * 인증 로직은 Server Layout Guards로 이동됨
 * Authentication logic has been moved to Server Layout Guards
 * 
 * @param {NextRequest} request - Next.js request object
 * @returns {NextResponse} Next.js response object
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 정적 파일 및 API 라우트는 통과
  // Pass through static files and API routes
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next();
  }

  // 기타 경로는 기본적으로 통과 (인증은 Layout에서 처리)
  // Other paths pass through by default (authentication handled in Layout)
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
