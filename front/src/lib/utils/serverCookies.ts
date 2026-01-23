import { cookies } from 'next/headers';

/**
 * 서버 사이드에서 액세스 토큰 쿠키 가져오기
 * Get access token cookie on server side
 * front-buffalo의 IsTokenExistMiddleware와 동일한 로직 구현
 * 
 * @returns {Promise<string | null>} 액세스 토큰 또는 null / Access token or null
 */
export async function getAccessTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  
  // front-buffalo는 "Authorization" 쿠키를 사용하지만,
  // Next.js front는 "access_token" 쿠키를 사용
  const tokenCookie = cookieStore.get('access_token');
  
  // 쿠키가 없으면 null 반환
  if (!tokenCookie) {
    return null;
  }
  
  const token = tokenCookie.value;
  
  // front-buffalo middleware.go와 동일한 검증 로직
  // 쿠키 값이 비어있거나 "undefined"인지 확인
  if (!token || token === '' || token === 'undefined') {
    return null;
  }
  
  // 쿠키 만료 시간 확인
  // Next.js cookies() API는 expires 정보를 제공하지 않으므로,
  // JWT 토큰 자체의 만료 시간을 확인해야 함
  // 하지만 여기서는 쿠키 존재 여부만 확인하고,
  // 실제 토큰 만료는 클라이언트 사이드에서 처리
  
  return token;
}

/**
 * 서버 사이드에서 인증 상태 확인
 * Check authentication status on server side
 * front-buffalo의 IsTokenExistMiddleware와 동일한 로직 구현
 * 
 * @returns {Promise<boolean>} 인증 여부 / Authentication status
 */
export async function isAuthenticatedOnServer(): Promise<boolean> {
  const token = await getAccessTokenFromCookies();
  return !!token;
}

/**
 * 쿠키 검증 결과 타입
 * Cookie validation result type
 */
export type CookieValidationResult = {
  isValid: boolean;
  error?: 'cookieNotFound' | 'cookieEmpty' | 'cookieUndefined' | 'cookieExpired';
};

/**
 * 쿠키 검증 (front-buffalo middleware.go와 동일한 로직)
 * Validate cookie (same logic as front-buffalo middleware.go)
 * 
 * @returns {Promise<CookieValidationResult>} 검증 결과 / Validation result
 */
export async function validateAccessTokenCookie(): Promise<CookieValidationResult> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('access_token');
  
  // 쿠키가 없음
  if (!tokenCookie) {
    return {
      isValid: false,
      error: 'cookieNotFound',
    };
  }
  
  const token = tokenCookie.value;
  
  // 쿠키 값이 비어있음
  if (!token || token === '') {
    return {
      isValid: false,
      error: 'cookieEmpty',
    };
  }
  
  // 쿠키 값이 "undefined"
  if (token === 'undefined') {
    return {
      isValid: false,
      error: 'cookieUndefined',
    };
  }
  
  // 쿠키 만료 시간 확인
  // Next.js cookies() API는 expires 정보를 직접 제공하지 않지만,
  // 쿠키가 존재하면 유효한 것으로 간주
  // 실제 만료는 JWT 토큰 자체의 exp 클레임으로 확인해야 함
  
  return {
    isValid: true,
  };
}
