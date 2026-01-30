import { test, expect } from '@playwright/test';

/**
 * Test to verify expired token handling on login page
 * Issue: Token refresh should not be attempted on login/logout pages
 */
test.describe('Login Page - Expired Token Handling', () => {
  test('should not attempt token refresh on login page load', async ({ page, context }) => {
    const apiCalls: string[] = [];

    // Intercept API calls
    page.on('request', request => {
      const url = request.url();
      if (url.includes('/api/')) {
        apiCalls.push(url);
      }
    });

    // Set expired auth state in localStorage
    await context.addInitScript(() => {
      localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          isAuthenticated: true,
          accessToken: 'expired-token',
          refreshTokenValue: 'expired-refresh-token',
          user: null,
        },
        version: 0,
      }));
    });

    // Visit login page
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Wait a bit to ensure no delayed API calls
    await page.waitForTimeout(2000);

    // Should NOT have called the refresh endpoint
    const refreshCalls = apiCalls.filter(url => url.includes('/api/auth/refresh'));
    expect(refreshCalls.length, 'Should not attempt token refresh on login page').toBe(0);

    // Verify login form is visible
    await expect(page.locator('form')).toBeVisible();
  });

  test('should clear expired auth state on login page load', async ({ page, context }) => {
    // Set expired auth state (authenticated but no cookie)
    await context.addInitScript(() => {
      localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          isAuthenticated: true,
          accessToken: 'expired-token',
          refreshTokenValue: 'expired-refresh-token',
          user: null,
        },
        version: 0,
      }));
    });

    // Visit login page
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    // Wait for auth state to be cleared
    await page.waitForTimeout(1000);

    // Check that auth state has been cleared
    const authStorage = await page.evaluate(() => {
      const storage = localStorage.getItem('auth-storage');
      return storage ? JSON.parse(storage) : null;
    });

    // Auth state should be cleared (either false or removed from localStorage)
    const isAuthenticated = authStorage?.state?.isAuthenticated;
    expect(isAuthenticated).not.toBe(true);
  });

  test('should not show token refresh errors in console', async ({ page, context }) => {
    const consoleErrors: string[] = [];

    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Set expired auth state
    await context.addInitScript(() => {
      localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          isAuthenticated: true,
          accessToken: 'expired-token',
          refreshTokenValue: 'expired-refresh-token',
          user: null,
        },
        version: 0,
      }));
    });

    // Visit login page
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Wait to ensure no delayed errors
    await page.waitForTimeout(2000);

    // Should not have token refresh errors
    const refreshErrors = consoleErrors.filter(error =>
      error.includes('Token refresh error') ||
      error.includes('token is invalid') ||
      error.includes('token is expired')
    );

    expect(refreshErrors.length, `Should not show token refresh errors. Found: ${refreshErrors.join(', ')}`).toBe(0);
  });
});
