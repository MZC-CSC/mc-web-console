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
  
  return token;
}

/**
 * JWT 토큰 만료 확인
 * Check if JWT token is expired
 * 
 * @param token JWT 토큰 문자열
 * @returns 토큰 만료 여부
 */
function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return true;
    }
    
    // Base64 URL-safe 디코딩
    let payload = parts[1];
    payload = payload.replace(/-/g, '+').replace(/_/g, '/');
    
    // Padding 추가
    switch (payload.length % 4) {
      case 2:
        payload += '==';
        break;
      case 3:
        payload += '=';
        break;
    }
    
    const decoded = Buffer.from(payload, 'base64').toString('utf-8');
    const claims = JSON.parse(decoded);
    
    const exp = claims.exp;
    if (!exp) {
      return true;
    }
    
    const now = Math.floor(Date.now() / 1000);
    return exp < now;
  } catch (error) {
    console.error('[Server] Failed to parse token:', error);
    return true;
  }
}

/**
 * 서버 사이드에서 토큰 갱신 시도
 * Attempt to refresh token on server side
 * Route Handler를 통해 쿠키 수정 (Server Component에서는 쿠키 수정 불가)
 * 
 * @param expiredToken 만료된 access token
 * @returns 새로운 access token 또는 null
 */
async function refreshTokenOnServer(expiredToken: string): Promise<string | null> {
  try {
    console.log('[Server] Attempting token refresh via Route Handler...');
    
    // Route Handler를 통해 refresh 처리 (쿠키 수정 가능)
    // Server Component에서 Route Handler를 호출할 때는 쿠키를 명시적으로 전달해야 함
    const cookieStore = await cookies();
    
    // 쿠키를 헤더 문자열로 변환
    const cookieHeader = Array.from(cookieStore.getAll())
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('; ');
    
    // 내부적으로 같은 서버이므로 절대 경로 사용
    const baseUrl = process.env.NEXT_PUBLIC_FRONT_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader, // 쿠키를 명시적으로 전달
      },
      cache: 'no-store', // 캐시 방지
    });
    
    if (!response.ok) {
      console.error('[Server] Token refresh failed:', response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    
    if (data.success && data.access_token) {
      // Route Handler에서 쿠키를 설정했으므로, 여기서는 새 토큰만 반환
      console.log('[Server] Token refresh successful via Route Handler');
      return data.access_token;
    }
    
    console.error('[Server] Token refresh response missing access_token');
    return null;
  } catch (error) {
    console.error('[Server] Token refresh error:', error);
    return null;
  }
}

/**
 * 서버 사이드에서 인증 상태 확인 및 자동 갱신
 * Check authentication status on server side with automatic refresh
 * Front-Buffalo 방식: 만료된 토큰으로도 refresh 시도 가능
 * 
 * @returns {Promise<boolean>} 인증 여부 / Authentication status
 */
export async function isAuthenticatedOnServer(): Promise<boolean> {
  const token = await getAccessTokenFromCookies();
  
  // 쿠키에 토큰이 없으면 인증되지 않음
  if (!token) {
    return false;
  }
  
  // JWT 토큰 만료 확인
  const expired = isTokenExpired(token);
  
  if (expired) {
    console.log('[Server] Access token expired, attempting refresh...');
    // 만료되었으면 refresh 시도
    const newToken = await refreshTokenOnServer(token);
    return !!newToken;
  }
  
  // 토큰이 유효하면 인증됨
  return true;
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
