import { expect, test } from '@playwright/test';

test.describe('Dashboard E2E Example', () => {
	test('should load the homepage', async ({ page }) => {
		await page.goto('/');
		await expect(page);
	});
});
