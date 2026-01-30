/**
 * Refresh Token 실패 진단 스크립트
 * 브라우저 콘솔(F12)에 붙여넣기하여 실행하세요
 */

console.log('=== REFRESH TOKEN 실패 진단 ===\n');

// 1. localStorage 확인
const authStorage = localStorage.getItem('auth-storage');
if (authStorage) {
  const parsed = JSON.parse(authStorage);
  const refreshToken = parsed?.state?.refreshTokenValue;

  console.log('📦 localStorage 상태:');
  console.log('- isAuthenticated:', parsed?.state?.isAuthenticated);
  console.log('- hasAccessToken:', !!parsed?.state?.accessToken);
  console.log('- hasRefreshToken:', !!refreshToken);

  if (refreshToken) {
    // JWT 디코딩
    try {
      const parts = refreshToken.split('.');
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = new Date(payload.exp * 1000);
      const issuedAt = new Date(payload.iat * 1000);

      console.log('\n🔑 Refresh Token 정보:');
      console.log('- 발급 시간:', issuedAt.toLocaleString());
      console.log('- 만료 시간:', expiresAt.toLocaleString());
      console.log('- 현재 시간:', new Date().toLocaleString());
      console.log('- 남은 시간:', Math.floor((payload.exp - now) / 60), '분');
      console.log('- 만료 여부:', payload.exp < now ? '❌ 만료됨' : '✅ 유효함');
      console.log('- Token Type:', payload.typ);
      console.log('- Session State:', payload.session_state);
    } catch (e) {
      console.error('❌ JWT 디코딩 실패:', e);
    }
  }
}

// 2. 쿠키 확인
const cookies = document.cookie;
console.log('\n🍪 쿠키 상태:');
console.log('- access_token 존재:', cookies.includes('access_token=') ? '✅' : '❌');

// 3. Refresh 테스트
console.log('\n🧪 Refresh Token 테스트 시작...');

const testRefresh = async () => {
  const authData = JSON.parse(localStorage.getItem('auth-storage'));
  const refreshToken = authData?.state?.refreshTokenValue;

  if (!refreshToken) {
    console.error('❌ Refresh Token이 없습니다!');
    return;
  }

  try {
    console.log('📤 Refresh 요청 전송 중...');
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operationId: 'Webloginrefresh',
        request: {
          refresh_token: refreshToken,
        },
      }),
    });

    console.log('📥 응답 상태:', response.status, response.statusText);

    const data = await response.json();
    console.log('📥 응답 데이터:', data);

    if (response.ok && data.responseData) {
      console.log('✅ Refresh 성공!');
      console.log('- 새 Access Token:', data.responseData.access_token?.substring(0, 50) + '...');
      console.log('- 새 Refresh Token:', data.responseData.refresh_token?.substring(0, 50) + '...');
      console.log('- 만료 시간:', data.responseData.expires_in, '초');
    } else {
      console.error('❌ Refresh 실패!');
      console.error('- Error Code:', data.errorCode);
      console.error('- Error Message:', data.errorMessage);
      console.error('- Error Detail:', data.errorDetail);
    }
  } catch (error) {
    console.error('❌ Refresh 요청 실패:', error);
  }
};

testRefresh();

console.log('\n=== 진단 완료 ===');
console.log('\n💡 다음 정보를 확인하세요:');
console.log('1. Refresh Token이 만료되었는지');
console.log('2. 서버 응답 상태 코드 (200, 400, 401 등)');
console.log('3. 서버 응답 메시지');
console.log('4. Network 탭에서 /api/auth/refresh 요청 상세 확인');
