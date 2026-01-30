/**
 * Refresh Token 문제 진단 스크립트
 * 브라우저 콘솔에서 실행하세요
 */

console.log('=== REFRESH TOKEN 진단 시작 ===\n');

// 1. localStorage 확인
const authStorage = localStorage.getItem('auth-storage');
if (!authStorage) {
  console.error('❌ auth-storage가 없습니다. 로그인이 필요합니다.');
} else {
  console.log('✅ auth-storage 존재');
  try {
    const parsed = JSON.parse(authStorage);
    console.log('📦 localStorage 구조:', {
      hasState: !!parsed?.state,
      stateKeys: Object.keys(parsed?.state || {}),
      version: parsed?.version,
      isAuthenticated: parsed?.state?.isAuthenticated,
    });

    // 2. Refresh Token 검증
    const refreshToken = parsed?.state?.refreshTokenValue;
    if (!refreshToken) {
      console.error('❌ Refresh Token이 없습니다!');
    } else {
      const segments = refreshToken.split('.');
      console.log('🔑 Refresh Token 정보:', {
        존재: '✅',
        타입: typeof refreshToken,
        길이: refreshToken.length,
        세그먼트수: segments.length,
        올바른형식: segments.length === 3 ? '✅' : '❌',
        공백포함: /\s/.test(refreshToken) ? '❌ 공백 있음!' : '✅',
        Bearer접두사: refreshToken.startsWith('Bearer ') ? '❌ Bearer 있음!' : '✅',
        미리보기: refreshToken.substring(0, 30) + '...' + refreshToken.substring(refreshToken.length - 10),
      });

      if (segments.length !== 3) {
        console.error('❌ JWT 형식이 올바르지 않습니다! (3개 세그먼트 필요)');
      }
    }

    // 3. Access Token 검증
    const accessToken = parsed?.state?.accessToken;
    if (accessToken) {
      const accessSegments = accessToken.split('.');
      console.log('🎫 Access Token 정보:', {
        존재: '✅',
        길이: accessToken.length,
        세그먼트수: accessSegments.length,
        올바른형식: accessSegments.length === 3 ? '✅' : '❌',
      });
    }
  } catch (e) {
    console.error('❌ localStorage 파싱 실패:', e);
  }
}

// 4. 쿠키 확인
const cookies = document.cookie;
const hasAccessTokenCookie = cookies.includes('access_token=');
console.log('🍪 쿠키 정보:', {
  전체쿠키: cookies,
  access_token존재: hasAccessTokenCookie ? '✅' : '❌',
});

// 5. useAuth 쿠키 체크 로직 시뮬레이션
if (!hasAccessTokenCookie && authStorage) {
  const parsed = JSON.parse(authStorage);
  if (parsed?.state?.isAuthenticated) {
    console.warn('⚠️  WARNING: localStorage에는 인증 상태가 있지만 쿠키가 없습니다!');
    console.warn('⚠️  이 경우 useAuth.ts:229에서 자동 로그아웃됩니다!');
    console.warn('⚠️  이것이 10분 후 문제의 원인일 수 있습니다.');
  }
}

console.log('\n=== 진단 완료 ===');
console.log('\n📋 다음 단계:');
console.log('1. 위 정보를 확인하세요');
console.log('2. 토큰 만료를 강제로 트리거하려면:');
console.log('   const authData = JSON.parse(localStorage.getItem("auth-storage"));');
console.log('   authData.state.accessToken = "expired_token";');
console.log('   localStorage.setItem("auth-storage", JSON.stringify(authData));');
console.log('3. 그 후 페이지를 이동하거나 새로고침하세요');
console.log('4. 콘솔에서 [Token Refresh] 로그를 확인하세요');
