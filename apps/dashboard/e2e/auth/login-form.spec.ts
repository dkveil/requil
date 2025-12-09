import { expect, test } from '@playwright/test';
import { TEST_USER } from '../fixtures/test-data';
import { LoginPage } from '../page-objects/login.page';

const URL_REGEX = {
	LOGIN: /\/auth\/login/,
	NOT_LOGIN: /^(?!.*\/auth\/login)/,
	FORGOT_PASSWORD: /\/auth\/forgot-password/,
	REGISTER: /\/auth\/register/,
	GITHUB_OAUTH: /github\.com|supabase/,
	GOOGLE_OAUTH: /google\.com|supabase/,
};

const TEXT_REGEX = {
	SIGNING_IN: /signing in/i,
	SUCCESS: /success/i,
	EMAIL: /email/i,
	PASSWORD: /password/i,
};

const ACCESSIBILITY_REGEX = {
	EMAIL_LABEL: /email/i,
	PASSWORD_LABEL: /password/i,
	HAS_TEXT: /.+/,
};

test.describe('LoginForm E2E', () => {
	let loginPage: LoginPage;

	test.beforeEach(async ({ page }) => {
		loginPage = new LoginPage(page);
		await loginPage.navigate();
		await expect(page).toHaveURL(URL_REGEX.LOGIN);
	});

	test.describe('Rendering and structure', () => {
		test('displays all form elements', async () => {
			await expect(loginPage.form).toBeVisible();
			await expect(loginPage.title).toBeVisible();
			await expect(loginPage.emailInput).toBeVisible();
			await expect(loginPage.passwordInput).toBeVisible();
			await expect(loginPage.submitButton).toBeVisible();
			await expect(loginPage.githubButton).toBeVisible();
			await expect(loginPage.googleButton).toBeVisible();
			await expect(loginPage.forgotPasswordLink).toBeVisible();
			await expect(loginPage.registerLink).toBeVisible();
		});

		test('all fields are enabled and interactive', async () => {
			await expect(loginPage.emailInput).toBeEnabled();
			await expect(loginPage.passwordInput).toBeEnabled();
			await expect(loginPage.submitButton).toBeEnabled();
			await expect(loginPage.githubButton).toBeEnabled();
			await expect(loginPage.googleButton).toBeEnabled();
		});
	});

	test.describe('Form validation', () => {
		test('shows validation error for empty fields', async () => {
			await loginPage.submit();
			await loginPage.waitForValidationError();
		});

		test('shows error for invalid email format', async () => {
			await loginPage.fillEmail('invalid-email');
			await loginPage.fillPassword('password123');
			await loginPage.submit();
			await loginPage.waitForValidationError();
		});

		test('shows error for empty password', async () => {
			await loginPage.fillEmail('test@example.com');
			await loginPage.submit();
			await loginPage.waitForValidationError();
		});

		test('accepts valid data format', async () => {
			await loginPage.fillEmail('test@example.com');
			await loginPage.fillPassword('password123');

			const emailValue = await loginPage.getEmailValue();
			expect(emailValue).toBe('test@example.com');
		});
	});

	test.describe('Email/Password login', () => {
		test('successfully logs in user with valid credentials', async ({
			page,
		}) => {
			await loginPage.login(TEST_USER.email, TEST_USER.password);
			await loginPage.waitForSuccessToast();
			await expect(page).toHaveURL(URL_REGEX.NOT_LOGIN);
		});

		test('shows error for invalid credentials', async ({ page }) => {
			await loginPage.login('wrong@example.com', 'WrongPassword123!');
			await loginPage.waitForErrorToast();
			await expect(page).toHaveURL(URL_REGEX.LOGIN);
		});

		test('displays loading state during submit', async () => {
			await loginPage.fillLoginForm('test@example.com', 'password123');
			await loginPage.submit();

			await expect(loginPage.submitButton).toContainText(TEXT_REGEX.SIGNING_IN);
			await expect(loginPage.submitButton).toBeDisabled();
		});

		test('disables all fields during submit', async () => {
			await loginPage.fillLoginForm('test@example.com', 'password123');
			await loginPage.submit();

			await expect(loginPage.emailInput).toBeDisabled();
			await expect(loginPage.passwordInput).toBeDisabled();
			await expect(loginPage.githubButton).toBeDisabled();
			await expect(loginPage.googleButton).toBeDisabled();
		});
	});

	test.describe('OAuth Flow', () => {
		test('redirects to GitHub OAuth on click', async ({ context }) => {
			const pagePromise = context.waitForEvent('page');
			await loginPage.clickGithubLogin();

			const newPage = await pagePromise;
			await expect(newPage).toHaveURL(URL_REGEX.GITHUB_OAUTH);
		});

		test('redirects to Google OAuth on click', async ({ context }) => {
			const pagePromise = context.waitForEvent('page');
			await loginPage.clickGoogleLogin();

			const newPage = await pagePromise;
			await expect(newPage).toHaveURL(URL_REGEX.GOOGLE_OAUTH);
		});
	});

	test.describe('Navigation', () => {
		test('redirects to forgot password page', async ({ page }) => {
			await loginPage.clickForgotPassword();
			await expect(page).toHaveURL(URL_REGEX.FORGOT_PASSWORD);
		});

		test('redirects to registration page', async ({ page }) => {
			await loginPage.clickRegister();
			await expect(page).toHaveURL(URL_REGEX.REGISTER);
		});

		test('forgot password link has correct href', async () => {
			await expect(loginPage.forgotPasswordLink).toHaveAttribute(
				'href',
				URL_REGEX.FORGOT_PASSWORD
			);
		});

		test('register link has correct href', async () => {
			await expect(loginPage.registerLink).toHaveAttribute(
				'href',
				URL_REGEX.REGISTER
			);
		});
	});

	test.describe('Keyboard interactions', () => {
		test('allows Tab navigation between fields', async ({ page }) => {
			await loginPage.emailInput.focus();
			await expect(loginPage.emailInput).toBeFocused();

			await page.keyboard.press('Tab');
			await expect(loginPage.forgotPasswordLink).toBeFocused();

			await page.keyboard.press('Tab');
			await expect(loginPage.passwordInput).toBeFocused();
		});

		test('submits form via Enter in password field', async () => {
			await loginPage.fillEmail('test@example.com');
			await loginPage.fillPassword('password123');
			await loginPage.passwordInput.press('Enter');

			await expect(loginPage.submitButton).toContainText(TEXT_REGEX.SIGNING_IN);
		});

		test('does not submit form via Enter in email field (changes focus)', async ({
			page,
		}) => {
			await loginPage.fillEmail('test@example.com');
			await loginPage.emailInput.press('Enter');

			await page.waitForTimeout(500);
			await expect(loginPage.submitButton).toBeEnabled();
			await expect(loginPage.submitButton).not.toContainText(
				TEXT_REGEX.SIGNING_IN
			);
		});
	});

	test.describe('Persistence and state', () => {
		test('preserves email after login error', async () => {
			const testEmail = 'wrong@example.com';
			await loginPage.login(testEmail, 'WrongPassword123!');
			await loginPage.waitForErrorToast();

			const emailValue = await loginPage.getEmailValue();
			expect(emailValue).toBe(testEmail);
		});

		test('clears form after page refresh', async ({ page }) => {
			await loginPage.fillEmail('test@example.com');
			await page.reload();

			const emailValue = await loginPage.getEmailValue();
			expect(emailValue).toBe('');
		});
	});

	test.describe('Accessibility (a11y)', () => {
		test('all fields have labels', async ({ page }) => {
			const emailLabel = page
				.getByText(ACCESSIBILITY_REGEX.EMAIL_LABEL)
				.first();
			const passwordLabel = page
				.getByText(ACCESSIBILITY_REGEX.PASSWORD_LABEL)
				.first();

			await expect(emailLabel).toBeVisible();
			await expect(passwordLabel).toBeVisible();
		});

		test('buttons have accessible names', async () => {
			await expect(loginPage.submitButton).toContainText(
				ACCESSIBILITY_REGEX.HAS_TEXT
			);
			await expect(loginPage.githubButton).toContainText(
				ACCESSIBILITY_REGEX.HAS_TEXT
			);
			await expect(loginPage.googleButton).toContainText(
				ACCESSIBILITY_REGEX.HAS_TEXT
			);
		});

		test('links have accessible names', async () => {
			await expect(loginPage.forgotPasswordLink).toContainText(
				ACCESSIBILITY_REGEX.HAS_TEXT
			);
			await expect(loginPage.registerLink).toContainText(
				ACCESSIBILITY_REGEX.HAS_TEXT
			);
		});

		test('OAuth button icons have aria-hidden', async () => {
			const githubSvg = loginPage.githubButton.locator('svg').first();
			await expect(githubSvg).toHaveAttribute('aria-hidden', 'true');

			const googleSvg = loginPage.googleButton.locator('svg').first();
			await expect(googleSvg).toHaveAttribute('aria-hidden', 'true');
		});
	});

	test.describe('Responsiveness', () => {
		test('form is visible on mobile (375x667)', async ({ page }) => {
			await page.setViewportSize({ width: 375, height: 667 });
			await expect(loginPage.form).toBeVisible();
			await expect(loginPage.emailInput).toBeVisible();
			await expect(loginPage.passwordInput).toBeVisible();
			await expect(loginPage.submitButton).toBeVisible();
		});

		test('form is visible on tablet (768x1024)', async ({ page }) => {
			await page.setViewportSize({ width: 768, height: 1024 });
			await expect(loginPage.form).toBeVisible();
			await expect(loginPage.emailInput).toBeVisible();
			await expect(loginPage.passwordInput).toBeVisible();
		});

		test('form is visible on desktop (1920x1080)', async ({ page }) => {
			await page.setViewportSize({ width: 1920, height: 1080 });
			await expect(loginPage.form).toBeVisible();
			await expect(loginPage.emailInput).toBeVisible();
			await expect(loginPage.passwordInput).toBeVisible();
		});
	});

	test.describe('Edge Cases', () => {
		test('handles very long email', async () => {
			const longEmail = `${'a'.repeat(100)}@example.com`;
			await loginPage.fillEmail(longEmail);
			await loginPage.fillPassword('password123');

			const emailValue = await loginPage.getEmailValue();
			expect(emailValue).toBe(longEmail);
		});

		test('handles special characters in password', async () => {
			const specialPassword = 'P@ssw0rd!#$%^&*()';
			await loginPage.fillEmail('test@example.com');
			await loginPage.fillPassword(specialPassword);

			const passwordValue = await loginPage.getPasswordValue();
			expect(passwordValue).toBe(specialPassword);
		});

		test('handles multiple rapid submits', async () => {
			await loginPage.fillLoginForm('test@example.com', 'password123');

			await loginPage.submitButton.click();
			await loginPage.submitButton.click({ force: true });
			await loginPage.submitButton.click({ force: true });

			const isDisabled = await loginPage.isSubmitButtonDisabled();
			expect(isDisabled).toBe(true);
		});

		test('handles spaces in email (trim)', async () => {
			await loginPage.fillEmail('  test@example.com  ');
			await loginPage.fillPassword('password123');
			await loginPage.submit();

			await loginPage.waitForValidationError();
		});
	});
});
