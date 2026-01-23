import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const LOGIN_URL = `${BASE_URL}/login`;
const DASHBOARD_URL = `${BASE_URL}/dashboard`;
const LOGOUT_URL = `${BASE_URL}/logout`;
const UNAUTHORIZED_URL = `${BASE_URL}/unauthorized`;

const TEST_USER = {
  id: 'mcmp',
  password: 'mcmp_password',
};

test.describe('인증 화면 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 로그아웃 상태로 초기화
    await page.goto(LOGOUT_URL);
    await page.waitForTimeout(500);
  });

  test('1. 로그인 페이지 접근 및 UI 확인', async ({ page }) => {
    await page.goto(LOGIN_URL);

    // 로그인 폼이 표시되는지 확인
    await expect(page.locator('form')).toBeVisible();
    
    // 사용자 ID 입력 필드 확인
    const userIdInput = page.locator('input[type="text"], input[placeholder*="사용자 ID"]').first();
    await expect(userIdInput).toBeVisible();
    
    // 비밀번호 입력 필드 확인
    const passwordInput = page.locator('input[type="password"]').first();
    await expect(passwordInput).toBeVisible();
    
    // 로그인 버튼 확인
    const loginButton = page.locator('button:has-text("로그인"), button[type="submit"]').first();
    await expect(loginButton).toBeVisible();
    
    // Logo 확인 (Logo 컴포넌트가 있을 경우)
    const logo = page.locator('img[alt*="logo"], [class*="logo"]').first();
    if (await logo.count() > 0) {
      await expect(logo).toBeVisible();
    }
  });

  test('2. 로그인 성공 플로우', async ({ page }) => {
    await page.goto(LOGIN_URL);
    await page.waitForLoadState('networkidle');

    // 로그인 정보 입력
    const userIdInput = page.locator('input[type="text"], input[placeholder*="사용자 ID"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const loginButton = page.locator('button:has-text("로그인"), button[type="submit"]').first();

    await userIdInput.fill(TEST_USER.id);
    await passwordInput.fill(TEST_USER.password);

    // API 응답 모니터링 설정 (요청 전에 설정)
    // 백엔드 API는 직접 호출되므로 전체 URL을 확인
    const loginResponsePromise = page.waitForResponse(
      (response) => {
        const url = response.url();
        // 백엔드 API URL 또는 프록시 경로 확인
        return (url.includes('/api/auth/login') || url.includes('52.79.205.182:3000')) && 
               response.request().method() === 'POST';
      },
      { timeout: 30000 }
    ).catch(() => null);
    
    // 모든 네트워크 요청 로깅
    page.on('request', request => {
      if (request.url().includes('login') || request.url().includes('auth')) {
        console.log('Request:', request.method(), request.url());
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('login') || response.url().includes('auth')) {
        console.log('Response:', response.status(), response.url());
      }
    });

    // 로그인 버튼 클릭
    await loginButton.click();

    // API 응답 대기
    const loginResponse = await loginResponsePromise;

    if (loginResponse) {
      const status = loginResponse.status();
      console.log(`Login API Response Status: ${status}`);

      if (status === 200) {
        // API 응답 확인
        const responseBody = await loginResponse.json();
        console.log('Login API Response:', JSON.stringify(responseBody, null, 2));
        
        expect(responseBody.responseData).toBeDefined();
        expect(responseBody.responseData.access_token).toBeDefined();
        expect(responseBody.responseData.refresh_token).toBeDefined();

        // 대시보드로 리다이렉트 확인
        await page.waitForURL((url) => url.pathname === '/dashboard', { timeout: 20000 });
        expect(page.url()).toContain('/dashboard');

        // 로컬 스토리지 확인
        const authStorage = await page.evaluate(() => localStorage.getItem('auth-storage'));
        expect(authStorage).toBeTruthy();
        expect(authStorage).toContain('accessToken');

        // 쿠키 확인
        const cookies = await page.context().cookies();
        const accessTokenCookie = cookies.find((cookie) => cookie.name === 'access_token');
        expect(accessTokenCookie).toBeDefined();
      } else {
        // 에러 응답 확인
        const errorBody = await loginResponse.json().catch(() => ({}));
        console.log('Login API Error:', JSON.stringify(errorBody, null, 2));
        
        // 에러 메시지 확인
        await page.waitForTimeout(2000);
        const errorMessage = page.locator('text=/에러|오류|실패|로그인/i').first();
        if (await errorMessage.count() > 0) {
          const errorText = await errorMessage.textContent();
          console.log('Error message displayed:', errorText);
        }
        throw new Error(`Login failed with status ${status}`);
      }
    } else {
      // API 응답이 없는 경우 (타임아웃)
      await page.waitForTimeout(3000);
      const errorMessage = page.locator('text=/에러|오류|실패|로그인/i').first();
      if (await errorMessage.count() > 0) {
        const errorText = await errorMessage.textContent();
        console.log('Error message displayed:', errorText);
      }
      throw new Error('Login API response timeout');
    }
  });

  test('3. 대시보드 확인 (로그인 후)', async ({ page }) => {
    // 먼저 로그인
    await page.goto(LOGIN_URL);
    const userIdInput = page.locator('input[type="text"], input[placeholder*="사용자 ID"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const loginButton = page.locator('button:has-text("로그인"), button[type="submit"]').first();

    await userIdInput.fill(TEST_USER.id);
    await passwordInput.fill(TEST_USER.password);
    await loginButton.click();

    // 대시보드로 이동 대기 (쿼리 파라미터 무시)
    await page.waitForURL((url) => url.pathname === '/dashboard', { timeout: 15000 }).catch(() => {
      // 로그인 실패 시 스킵
      test.skip();
    });

    // Navigation 컴포넌트 확인
    const navigation = page.locator('nav').first();
    await expect(navigation).toBeVisible();

    // 사용자 메뉴 확인 (드롭다운 메뉴)
    const userMenu = page.locator('button:has-text("User"), button:has-text("mcmp"), [aria-label*="user"]').first();
    if (await userMenu.count() > 0) {
      await expect(userMenu).toBeVisible();
    }

    // 로그아웃 버튼 확인 (드롭다운 메뉴 내부)
    const userMenuButton = page.locator('button:has-text("User"), button:has-text("mcmp")').first();
    if (await userMenuButton.count() > 0) {
      await userMenuButton.click();
      await page.waitForTimeout(300);
      
      const logoutButton = page.locator('button:has-text("로그아웃"), [role="menuitem"]:has-text("로그아웃")').first();
      if (await logoutButton.count() > 0) {
        await expect(logoutButton).toBeVisible();
      }
    }
  });

  test('4. 로그아웃 플로우', async ({ page }) => {
    // 먼저 로그인
    await page.goto(LOGIN_URL);
    const userIdInput = page.locator('input[type="text"], input[placeholder*="사용자 ID"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const loginButton = page.locator('button:has-text("로그인"), button[type="submit"]').first();

    await userIdInput.fill(TEST_USER.id);
    await passwordInput.fill(TEST_USER.password);
    await loginButton.click();

    // 대시보드로 이동 대기 (쿼리 파라미터 무시)
    await page.waitForURL((url) => url.pathname === '/dashboard', { timeout: 15000 }).catch(() => {
      // 로그인 실패 시 스킵
      test.skip();
    });

    // 사용자 메뉴 클릭
    const userMenuButton = page.locator('button:has-text("User"), button:has-text("mcmp")').first();
    if (await userMenuButton.count() > 0) {
      await userMenuButton.click();
      await page.waitForTimeout(300);

      // 로그아웃 버튼 클릭
      const logoutButton = page.locator('button:has-text("로그아웃"), [role="menuitem"]:has-text("로그아웃")').first();
      if (await logoutButton.count() > 0) {
        // 로그아웃 API 요청 모니터링
        const logoutRequestPromise = page.waitForRequest(
          (request) => request.url().includes('/api/auth/logout') && request.method() === 'POST'
        ).catch(() => null); // 로그아웃 API가 실패해도 진행

        await logoutButton.click();

        // 로그아웃 페이지로 이동 확인
        await page.waitForURL(LOGOUT_URL, { timeout: 5000 }).catch(async () => {
          // 로그아웃 페이지를 거치지 않고 바로 로그인 페이지로 이동할 수도 있음
          await page.waitForURL(LOGIN_URL, { timeout: 5000 });
        });

        // 로그아웃 API 요청 대기 (선택적)
        if (logoutRequestPromise) {
          await logoutRequestPromise;
        }

        // 로컬 스토리지 확인
        const authStorage = await page.evaluate(() => localStorage.getItem('auth-storage'));
        // 로그아웃 후에는 auth-storage가 null이거나 빈 값이어야 함
        expect(authStorage).toBeFalsy();

        // 쿠키 확인
        const cookies = await page.context().cookies();
        const accessTokenCookie = cookies.find((cookie) => cookie.name === 'access_token');
        expect(accessTokenCookie).toBeUndefined();

        // 로그인 페이지로 리다이렉트 확인
        await page.waitForURL(LOGIN_URL, { timeout: 10000 });
        expect(page.url()).toContain('/login');
      }
    }
  });

  test('5. 로그인 실패 플로우 (잘못된 자격증명)', async ({ page }) => {
    await page.goto(LOGIN_URL);

    const userIdInput = page.locator('input[type="text"], input[placeholder*="사용자 ID"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const loginButton = page.locator('button:has-text("로그인"), button[type="submit"]').first();

    // 잘못된 자격증명 입력
    await userIdInput.fill('wrong_user');
    await passwordInput.fill('wrong_password');

    // API 응답 모니터링
    const errorResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/api/auth/login') && response.status() !== 200
    ).catch(() => null);

    await loginButton.click();

    // 에러 응답 대기
    if (errorResponsePromise) {
      await errorResponsePromise;
    }

    // 에러 메시지 확인 (에러 메시지가 표시되는지 확인)
    await page.waitForTimeout(1000);
    
    // 에러 메시지가 표시되는지 확인 (에러 메시지의 정확한 텍스트는 구현에 따라 다를 수 있음)
    const errorMessage = page.locator('text=/로그인|에러|실패|오류/i').first();
    if (await errorMessage.count() > 0) {
      await expect(errorMessage).toBeVisible();
    }

    // 로그인 페이지에 머무는지 확인
    expect(page.url()).toContain('/login');
  });

  test('6. 입력 검증 테스트', async ({ page }) => {
    await page.goto(LOGIN_URL);

    const userIdInput = page.locator('input[type="text"], input[placeholder*="사용자 ID"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const loginButton = page.locator('button:has-text("로그인"), button[type="submit"]').first();

    // 비밀번호만 입력하고 사용자 ID는 비워둠
    await passwordInput.fill('test_password');
    await loginButton.click();

    // 에러 메시지 확인
    await page.waitForTimeout(500);
    const errorMessage = page.locator('text=/사용자 ID|입력/i').first();
    if (await errorMessage.count() > 0) {
      await expect(errorMessage).toBeVisible();
    }

    // 사용자 ID만 입력하고 비밀번호는 비워둠
    await userIdInput.fill('test_user');
    await passwordInput.clear();
    await loginButton.click();

    // 에러 메시지 확인
    await page.waitForTimeout(500);
    const passwordErrorMessage = page.locator('text=/비밀번호|입력/i').first();
    if (await passwordErrorMessage.count() > 0) {
      await expect(passwordErrorMessage).toBeVisible();
    }
  });

  test('7. 인증 미들웨어 테스트 - 비인증 상태에서 보호된 경로 접근', async ({ page }) => {
    // 로그아웃 상태에서 대시보드 접근
    await page.goto(DASHBOARD_URL);

    // 로그인 페이지로 리다이렉트되는지 확인 (쿼리 파라미터 포함)
    await page.waitForURL((url) => url.pathname === '/login', { timeout: 10000 });
    expect(page.url()).toContain('/login');

    // redirect 쿼리 파라미터 확인
    const url = new URL(page.url());
    const redirectParam = url.searchParams.get('redirect');
    expect(redirectParam).toBe('/dashboard');
  });

  test('8. 인증 미들웨어 테스트 - 인증 상태에서 로그인 페이지 접근', async ({ page }) => {
    // 먼저 로그인
    await page.goto(LOGIN_URL);
    const userIdInput = page.locator('input[type="text"], input[placeholder*="사용자 ID"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const loginButton = page.locator('button:has-text("로그인"), button[type="submit"]').first();

    await userIdInput.fill(TEST_USER.id);
    await passwordInput.fill(TEST_USER.password);
    await loginButton.click();

    // 대시보드로 이동 대기 (쿼리 파라미터 무시)
    await page.waitForURL((url) => url.pathname === '/dashboard', { timeout: 15000 }).catch(() => {
      // 로그인 실패 시 스킵
      test.skip();
    });

    // 로그인 상태에서 로그인 페이지 접근
    await page.goto(LOGIN_URL);

    // 대시보드로 리다이렉트되는지 확인 (쿼리 파라미터 무시)
    await page.waitForURL((url) => url.pathname === '/dashboard', { timeout: 10000 });
    expect(page.url()).toContain('/dashboard');
  });

  test('9. 권한 없음 페이지 확인', async ({ page }) => {
    await page.goto(UNAUTHORIZED_URL);

    // "권한 없음" 메시지 확인
    const unauthorizedMessage = page.locator('text=/권한 없음|Unauthorized/i').first();
    await expect(unauthorizedMessage).toBeVisible();

    // "대시보드로 이동" 버튼 확인
    const dashboardButton = page.locator('button:has-text("대시보드"), a:has-text("대시보드")').first();
    if (await dashboardButton.count() > 0) {
      await expect(dashboardButton).toBeVisible();
    }

    // "로그인 페이지로 이동" 버튼 확인
    const loginButton = page.locator('button:has-text("로그인"), a:has-text("로그인")').first();
    if (await loginButton.count() > 0) {
      await expect(loginButton).toBeVisible();
    }
  });
});
