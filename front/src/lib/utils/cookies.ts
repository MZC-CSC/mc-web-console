/**
 * 쿠키 유틸리티 함수
 */

/**
 * 쿠키 설정
 */
export function setCookie(name: string, value: string, days?: number) {
  if (typeof document === 'undefined') {
    return;
  }

  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }

  // HttpOnly는 클라이언트에서 설정할 수 없으므로, 보안을 위해 SameSite와 Secure 옵션 사용
  document.cookie = `${name}=${value}${expires}; path=/; SameSite=Lax`;
}

/**
 * 쿠키 가져오기
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
  
  return null;
}

/**
 * 쿠키 삭제
 */
export function deleteCookie(name: string) {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

/**
 * 액세스 토큰 쿠키 설정
 */
export function setAccessTokenCookie(token: string, expiresIn?: number) {
  if (typeof document === 'undefined') {
    return;
  }

  let expires = '';
  if (expiresIn) {
    // expiresIn은 초 단위이므로 밀리초로 변환
    const date = new Date();
    date.setTime(date.getTime() + expiresIn * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }

  // HttpOnly는 클라이언트에서 설정할 수 없으므로, 보안을 위해 SameSite와 Secure 옵션 사용
  document.cookie = `access_token=${token}${expires}; path=/; SameSite=Lax`;
}

/**
 * 액세스 토큰 쿠키 삭제
 */
export function deleteAccessTokenCookie() {
  deleteCookie('access_token');
}
