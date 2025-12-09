import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
	testDir: './e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: 'html',
	use: {
		baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5137',
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
		testIdAttribute: 'data-test-id',
	},

	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
	],

	webServer: {
		command: 'pnpm dev',
		url: 'http://localhost:5137',
		reuseExistingServer: true,
		timeout: 120 * 1000,
	},
});
