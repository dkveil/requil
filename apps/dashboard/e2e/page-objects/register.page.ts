import type { Locator, Page } from '@playwright/test';
import { BasePage } from '../fixtures/pages/base.page';

const SUCCESS_TOAST_REGEX = /success/i;
const ERROR_TOAST_REGEX = /failed/i;
const VALIDATION_ERROR_REGEX = /validation error/i;

export class RegisterPage extends BasePage {
	readonly form: Locator;
	readonly title: Locator;
	readonly emailInput: Locator;
	readonly passwordInput: Locator;
	readonly confirmPasswordInput: Locator;
	readonly submitButton: Locator;
	readonly githubButton: Locator;
	readonly googleButton: Locator;
	readonly loginLink: Locator;
	readonly loginPrompt: Locator;

	constructor(page: Page) {
		super(page);
		this.form = page.getByTestId('register-form');
		this.title = page.getByTestId('register-title');
		this.emailInput = page.getByTestId('register-email-input');
		this.passwordInput = page.getByTestId('register-password-input');
		this.confirmPasswordInput = page.getByTestId(
			'register-confirm-password-input'
		);
		this.submitButton = page.getByTestId('register-submit-button');
		this.githubButton = page.getByTestId('register-github-button');
		this.googleButton = page.getByTestId('register-google-button');
		this.loginLink = page.getByTestId('register-login-link');
		this.loginPrompt = page.getByTestId('register-login-prompt');
	}

	async navigate() {
		await this.goto('/auth/register');
		await this.page.waitForLoadState('networkidle');
	}

	async fillEmail(email: string) {
		await this.emailInput.fill(email);
	}

	async fillPassword(password: string) {
		await this.passwordInput.fill(password);
	}

	async fillConfirmPassword(password: string) {
		await this.confirmPasswordInput.fill(password);
	}

	async fillRegisterForm(
		email: string,
		password: string,
		confirmPassword?: string
	) {
		await this.fillEmail(email);
		await this.fillPassword(password);
		await this.fillConfirmPassword(confirmPassword || password);
	}

	async submit() {
		await this.submitButton.click();
	}

	async register(email: string, password: string, confirmPassword?: string) {
		await this.fillRegisterForm(email, password, confirmPassword);
		await this.submit();
	}

	async clickGithubRegister() {
		await this.githubButton.click();
	}

	async clickGoogleRegister() {
		await this.googleButton.click();
	}

	async clickLoginLink() {
		await this.loginLink.click();
	}

	async isSubmitButtonDisabled() {
		return await this.submitButton.isDisabled();
	}

	async getEmailValue() {
		return await this.emailInput.inputValue();
	}

	async getPasswordValue() {
		return await this.passwordInput.inputValue();
	}

	async getConfirmPasswordValue() {
		return await this.confirmPasswordInput.inputValue();
	}

	async waitForSuccessToast() {
		await this.page.getByText(SUCCESS_TOAST_REGEX).waitFor({ state: 'visible' });
	}

	async waitForErrorToast() {
		await this.page.getByText(ERROR_TOAST_REGEX).waitFor({ state: 'visible' });
	}

	async waitForValidationError() {
		await this.page
			.getByText(VALIDATION_ERROR_REGEX)
			.waitFor({ state: 'visible' });
	}
}

