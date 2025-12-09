import type { Page } from '@playwright/test';

/**
 * Base Page Object Model class
 * Provides common functionality for all page objects
 */
export class BasePage {
	constructor(protected page: Page) {}

	async goto(path: string) {
		await this.page.goto(path);
	}

	async waitForURL(pattern: string | RegExp) {
		await this.page.waitForURL(pattern);
	}

	async getTitle() {
		return this.page.title();
	}

	async screenshot(name: string) {
		await this.page.screenshot({ path: `screenshots/${name}.png` });
	}
}
