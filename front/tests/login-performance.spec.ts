import { test, expect } from '@playwright/test';

/**
 * Test to verify the LoginPage performance measurement error is fixed
 * Issue: "Failed to execute 'measure' on 'Performance': 'LoginPage' cannot have a negative time stamp"
 */
test.describe('Login Page Performance', () => {
  test('should not throw performance measurement errors when loading login page', async ({ page }) => {
    const consoleErrors: string[] = [];

    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Capture page errors
    const pageErrors: Error[] = [];
    page.on('pageerror', error => {
      pageErrors.push(error);
    });

    // Visit the login page
    await page.goto('/login');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Check for specific performance measurement error
    const performanceError = consoleErrors.find(error =>
      error.includes('Failed to execute \'measure\' on \'Performance\'') &&
      error.includes('LoginPage')
    );

    const performancePageError = pageErrors.find(error =>
      error.message.includes('Failed to execute \'measure\' on \'Performance\'') &&
      error.message.includes('LoginPage')
    );

    // Assert no performance errors occurred
    expect(performanceError, 'No console performance measurement errors').toBeUndefined();
    expect(performancePageError, 'No page performance measurement errors').toBeUndefined();

    // Verify login page loaded correctly
    await expect(page.locator('form')).toBeVisible();
  });

  test('should render login form without React errors', async ({ page }) => {
    const reactErrors: string[] = [];

    // Capture React-specific errors
    page.on('console', msg => {
      if (msg.type() === 'error' && (
        msg.text().includes('React') ||
        msg.text().includes('react-server-dom') ||
        msg.text().includes('negative time stamp')
      )) {
        reactErrors.push(msg.text());
      }
    });

    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    // Wait a bit for any delayed errors
    await page.waitForTimeout(2000);

    // Should have no React errors
    expect(reactErrors.length, `Found ${reactErrors.length} React errors: ${reactErrors.join(', ')}`).toBe(0);
  });
});
