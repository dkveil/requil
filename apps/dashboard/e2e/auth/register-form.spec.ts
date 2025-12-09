import { expect, test } from '@playwright/test';
import {
	supabaseTestHelper,
	type TestUser,
} from '../fixtures/supabase.fixture';
import { RegisterPage } from '../page-objects/register.page';

const URL_REGEX = {
	REGISTER: /\/auth\/register/,
	LOGIN: /\/auth\/login/,
	HOME: /^(?!.*\/auth)/,
};

const TEXT_REGEX = {
	SIGNING_UP: /registering|signing up/i,
	SUCCESS: /success/i,
	EMAIL: /email/i,
	PASSWORD: /^password$/i,
	CONFIRM: /confirm/i,
	HAS_TEXT: /.+/,
};

const generateTestEmail = () => {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(7);
	return `e2e-test-${timestamp}-${random}@requil-test.dev`;
};

const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || 'TestPassword123!';

test.describe('RegisterForm E2E', () => {
	let registerPage: RegisterPage;
	const testUsers: TestUser[] = [];

	test.beforeEach(async ({ page }) => {
		registerPage = new RegisterPage(page);
		await registerPage.navigate();
		await expect(page).toHaveURL(URL_REGEX.REGISTER);
	});

	test.afterAll(async () => {
		await supabaseTestHelper.cleanupTrackedUsers();

		for (const user of testUsers) {
			if (user.userId) {
				await supabaseTestHelper.deleteUserById(user.userId);
			}
			await supabaseTestHelper.deleteUserByEmail(user.email);
		}
	});

	test.describe('Rendering and structure', () => {
		test('displays all form elements', async () => {
			await expect(registerPage.form).toBeVisible();
			await expect(registerPage.title).toBeVisible();
			await expect(registerPage.emailInput).toBeVisible();
			await expect(registerPage.passwordInput).toBeVisible();
			await expect(registerPage.confirmPasswordInput).toBeVisible();
			await expect(registerPage.submitButton).toBeVisible();
			await expect(registerPage.githubButton).toBeVisible();
			await expect(registerPage.googleButton).toBeVisible();
			await expect(registerPage.loginLink).toBeVisible();
		});

		test('all fields are enabled and interactive', async () => {
			await expect(registerPage.emailInput).toBeEnabled();
			await expect(registerPage.passwordInput).toBeEnabled();
			await expect(registerPage.confirmPasswordInput).toBeEnabled();
			await expect(registerPage.submitButton).toBeEnabled();
			await expect(registerPage.githubButton).toBeEnabled();
			await expect(registerPage.googleButton).toBeEnabled();
		});
	});

	test.describe('Form validation', () => {
		test('shows validation error for empty fields', async () => {
			await registerPage.submit();
			await registerPage.waitForValidationError();
		});

		test('shows error for invalid email format', async () => {
			await registerPage.fillEmail('invalid-email');
			await registerPage.fillPassword(TEST_PASSWORD);
			await registerPage.fillConfirmPassword(TEST_PASSWORD);
			await registerPage.submit();
			await registerPage.waitForValidationError();
		});

		test('shows error for short password', async () => {
			await registerPage.fillEmail('test@example.com');
			await registerPage.fillPassword('short');
			await registerPage.fillConfirmPassword('short');
			await registerPage.submit();
			await registerPage.waitForValidationError();
		});

		test('shows error when passwords do not match', async () => {
			await registerPage.fillEmail('test@example.com');
			await registerPage.fillPassword(TEST_PASSWORD);
			await registerPage.fillConfirmPassword('DifferentPassword123!');
			await registerPage.submit();
			await registerPage.waitForValidationError();
		});

		test('accepts valid registration data', async () => {
			await registerPage.fillEmail('test@example.com');
			await registerPage.fillPassword(TEST_PASSWORD);
			await registerPage.fillConfirmPassword(TEST_PASSWORD);

			const emailValue = await registerPage.getEmailValue();
			expect(emailValue).toBe('test@example.com');
		});
	});

	test.describe('User registration flow', () => {
		test('successfully registers a new user', async ({ page }) => {
			const testEmail = generateTestEmail();
			const testUser: TestUser = { email: testEmail, password: TEST_PASSWORD };
			testUsers.push(testUser);
			supabaseTestHelper.trackUser(testEmail);

			await registerPage.register(testEmail, TEST_PASSWORD);

			await registerPage.waitForSuccessToast();

			await page.waitForTimeout(2000);

			const user = await supabaseTestHelper.getUserByEmail(testEmail);
			expect(user).toBeTruthy();
			expect(user?.email).toBe(testEmail);

			if (user) {
				testUser.userId = user.id;
			}
		});

		test('shows error when registering with existing email', async () => {
			const testEmail = generateTestEmail();
			supabaseTestHelper.trackUser(testEmail);
			testUsers.push({ email: testEmail, password: TEST_PASSWORD });

			await registerPage.register(testEmail, TEST_PASSWORD);
			await registerPage.waitForSuccessToast();

			await registerPage.navigate();

			await registerPage.register(testEmail, TEST_PASSWORD);
			await registerPage.waitForErrorToast();
		});

		test('displays loading state during registration', async () => {
			const testEmail = generateTestEmail();
			supabaseTestHelper.trackUser(testEmail);
			testUsers.push({ email: testEmail, password: TEST_PASSWORD });

			await registerPage.fillRegisterForm(testEmail, TEST_PASSWORD);
			await registerPage.submit();

			await expect(registerPage.submitButton).toContainText(
				TEXT_REGEX.SIGNING_UP
			);
			await expect(registerPage.submitButton).toBeDisabled();
		});

		test('disables all fields during registration', async () => {
			const testEmail = generateTestEmail();
			supabaseTestHelper.trackUser(testEmail);
			testUsers.push({ email: testEmail, password: TEST_PASSWORD });

			await registerPage.fillRegisterForm(testEmail, TEST_PASSWORD);
			await registerPage.submit();

			await expect(registerPage.emailInput).toBeDisabled();
			await expect(registerPage.passwordInput).toBeDisabled();
			await expect(registerPage.confirmPasswordInput).toBeDisabled();
			await expect(registerPage.githubButton).toBeDisabled();
			await expect(registerPage.googleButton).toBeDisabled();
		});
	});

	test.describe('Navigation', () => {
		test('redirects to login page', async ({ page }) => {
			await registerPage.clickLoginLink();
			await expect(page).toHaveURL(URL_REGEX.LOGIN);
		});

		test('login link has correct href', async () => {
			await expect(registerPage.loginLink).toHaveAttribute(
				'href',
				URL_REGEX.LOGIN
			);
		});
	});

	test.describe('Keyboard interactions', () => {
		test('allows Tab navigation between fields', async ({ page }) => {
			await registerPage.emailInput.focus();
			await expect(registerPage.emailInput).toBeFocused();

			await page.keyboard.press('Tab');
			await expect(registerPage.passwordInput).toBeFocused();

			await page.keyboard.press('Tab');
			await expect(registerPage.confirmPasswordInput).toBeFocused();
		});

		test('submits form via Enter in confirm password field', async () => {
			await registerPage.fillEmail('test@example.com');
			await registerPage.fillPassword(TEST_PASSWORD);
			await registerPage.confirmPasswordInput.fill(TEST_PASSWORD);
			await registerPage.confirmPasswordInput.press('Enter');

			await expect(registerPage.submitButton).toContainText(
				TEXT_REGEX.SIGNING_UP
			);
		});
	});

	test.describe('Accessibility (a11y)', () => {
		test('all fields have labels', async ({ page }) => {
			const emailLabel = page.getByText(TEXT_REGEX.EMAIL).first();
			const passwordLabel = page.getByText(TEXT_REGEX.PASSWORD).first();
			const confirmLabel = page.getByText(TEXT_REGEX.CONFIRM).first();

			await expect(emailLabel).toBeVisible();
			await expect(passwordLabel).toBeVisible();
			await expect(confirmLabel).toBeVisible();
		});

		test('buttons have accessible text', async () => {
			await expect(registerPage.submitButton).toContainText(
				TEXT_REGEX.HAS_TEXT
			);
			await expect(registerPage.githubButton).toContainText(
				TEXT_REGEX.HAS_TEXT
			);
			await expect(registerPage.googleButton).toContainText(
				TEXT_REGEX.HAS_TEXT
			);
		});

		test('OAuth button icons have aria-hidden', async () => {
			const githubSvg = registerPage.githubButton.locator('svg').first();
			await expect(githubSvg).toHaveAttribute('aria-hidden', 'true');

			const googleSvg = registerPage.googleButton.locator('svg').first();
			await expect(googleSvg).toHaveAttribute('aria-hidden', 'true');
		});
	});

	test.describe('Responsiveness', () => {
		test('form is visible on mobile (375x667)', async ({ page }) => {
			await page.setViewportSize({ width: 375, height: 667 });
			await expect(registerPage.form).toBeVisible();
			await expect(registerPage.emailInput).toBeVisible();
			await expect(registerPage.passwordInput).toBeVisible();
			await expect(registerPage.confirmPasswordInput).toBeVisible();
		});

		test('form is visible on tablet (768x1024)', async ({ page }) => {
			await page.setViewportSize({ width: 768, height: 1024 });
			await expect(registerPage.form).toBeVisible();
			await expect(registerPage.emailInput).toBeVisible();
		});

		test('form is visible on desktop (1920x1080)', async ({ page }) => {
			await page.setViewportSize({ width: 1920, height: 1080 });
			await expect(registerPage.form).toBeVisible();
		});
	});

	test.describe('Edge Cases', () => {
		test('handles very long email', async () => {
			const longEmail = `${'a'.repeat(100)}@example.com`;
			await registerPage.fillEmail(longEmail);
			await registerPage.fillPassword(TEST_PASSWORD);
			await registerPage.fillConfirmPassword(TEST_PASSWORD);

			const emailValue = await registerPage.getEmailValue();
			expect(emailValue).toBe(longEmail);
		});

		test('handles special characters in password', async () => {
			const specialPassword = 'P@ssw0rd!#$%^&*()123';
			await registerPage.fillEmail('test@example.com');
			await registerPage.fillPassword(specialPassword);
			await registerPage.fillConfirmPassword(specialPassword);

			const passwordValue = await registerPage.getPasswordValue();
			expect(passwordValue).toBe(specialPassword);
		});

		test('clears form after successful registration and navigation', async ({
			page,
		}) => {
			const testEmail = generateTestEmail();
			supabaseTestHelper.trackUser(testEmail);
			testUsers.push({ email: testEmail, password: TEST_PASSWORD });

			await registerPage.register(testEmail, TEST_PASSWORD);
			await registerPage.waitForSuccessToast();

			await page.waitForTimeout(1000);
			await registerPage.navigate();

			const emailValue = await registerPage.getEmailValue();
			expect(emailValue).toBe('');
		});
	});

	test.describe('Password security', () => {
		test('password fields mask input', async () => {
			await expect(registerPage.passwordInput).toHaveAttribute(
				'type',
				'password'
			);
			await expect(registerPage.confirmPasswordInput).toHaveAttribute(
				'type',
				'password'
			);
		});

		test('requires minimum password length', async () => {
			await registerPage.fillEmail('test@example.com');
			await registerPage.fillPassword('short');
			await registerPage.fillConfirmPassword('short');
			await registerPage.submit();
			await registerPage.waitForValidationError();
		});
	});
});
