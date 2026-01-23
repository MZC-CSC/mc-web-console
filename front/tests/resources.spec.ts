import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  id: 'mcmp',
  password: 'mcmp_password',
};

/**
 * Resources 화면 테스트
 * WorkspaceSelector와 ProjectSelector가 정상 작동하는지 확인
 */
test.describe('Resources 화면 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 처리
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    const userIdInput = page.locator('input[type="text"], input[placeholder*="사용자 ID"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const loginButton = page.locator('button:has-text("로그인"), button[type="submit"]').first();
    
    if (await userIdInput.isVisible()) {
      await userIdInput.fill(TEST_USER.id);
      await passwordInput.fill(TEST_USER.password);
      await loginButton.click();
      await page.waitForURL('**/dashboard**', { timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(1000);
    }
  });

  const resourcesPages = [
    { name: 'Server Specs', path: '/resources/specs' },
    { name: 'Images', path: '/resources/images' },
    { name: 'My Images', path: '/resources/my-images' },
    { name: 'Networks', path: '/resources/networks' },
    { name: 'Security Groups', path: '/resources/security' },
    { name: 'Disks', path: '/resources/disks' },
    { name: 'SSH Keys', path: '/resources/ssh-keys' },
  ];

  for (const pageInfo of resourcesPages) {
    test(`${pageInfo.name} 화면 - WorkspaceSelector와 ProjectSelector 표시 확인`, async ({ page }) => {
      await page.goto(`${BASE_URL}${pageInfo.path}`);
      await page.waitForLoadState('networkidle');
      
      // Label을 통해 WorkspaceSelector 확인 (Label 컴포넌트가 "Workspace" 텍스트 포함)
      const workspaceLabel = page.locator('label:has-text("Workspace")');
      await expect(workspaceLabel).toBeVisible({ timeout: 10000 });
      
      // Label을 통해 ProjectSelector 확인
      const projectLabel = page.locator('label:has-text("Project")');
      await expect(projectLabel).toBeVisible({ timeout: 10000 });
      
      // 페이지 제목 확인
      const pageTitle = page.locator(`h1:has-text("${pageInfo.name}")`);
      await expect(pageTitle).toBeVisible({ timeout: 5000 });
    });

    test(`${pageInfo.name} 화면 - 테이블 또는 빈 메시지 표시 확인`, async ({ page }) => {
      await page.goto(`${BASE_URL}${pageInfo.path}`);
      await page.waitForLoadState('networkidle');
      
      // 테이블 또는 빈 메시지가 표시되는지 확인
      const table = page.locator('table').first();
      const emptyMessage = page.locator('text=/없습니다|No data|Empty/').first();
      
      const hasTable = await table.isVisible().catch(() => false);
      const hasEmptyMessage = await emptyMessage.isVisible().catch(() => false);
      
      expect(hasTable || hasEmptyMessage).toBeTruthy();
    });
  }

  test('Networks 화면 - 전체 플로우 테스트', async ({ page }) => {
    await page.goto(`${BASE_URL}/resources/networks`);
    await page.waitForLoadState('networkidle');
    
    // WorkspaceSelector Label 확인
    const workspaceLabel = page.locator('label:has-text("Workspace")');
    await expect(workspaceLabel).toBeVisible({ timeout: 10000 });
    
    // ProjectSelector Label 확인
    const projectLabel = page.locator('label:has-text("Project")');
    await expect(projectLabel).toBeVisible({ timeout: 10000 });
    
    // SelectTrigger 확인 (실제 select 버튼)
    const selectTriggers = page.locator('[role="combobox"]');
    await expect(selectTriggers.first()).toBeVisible();
    
    // 새로고침 버튼 확인
    const refreshButton = page.locator('button:has-text("새로고침")');
    await expect(refreshButton).toBeVisible();
    
    // 추가 버튼 확인
    const addButton = page.locator('button:has-text("Network 추가")');
    await expect(addButton).toBeVisible();
    
    // 페이지 제목 확인
    await expect(page.locator('h1:has-text("Networks")')).toBeVisible();
  });
});
