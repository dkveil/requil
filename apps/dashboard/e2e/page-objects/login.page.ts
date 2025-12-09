import type { Locator, Page } from '@playwright/test';
import { BasePage } from '../fixtures/pages/base.page';

const SUCCESS_TOAST_REGEX = /success/i;
const ERROR_TOAST_REGEX = /failed/i;
const VALIDATION_ERROR_REGEX = /validation error/i;

export class LoginPage extends BasePage {
	readonly form: Locator;
	readonly title: Locator;
	readonly emailInput: Locator;
	readonly passwordInput: Locator;
	readonly submitButton: Locator;
	readonly forgotPasswordLink: Locator;
	readonly githubButton: Locator;
	readonly googleButton: Locator;
	readonly registerLink: Locator;
	readonly registerPrompt: Locator;

	constructor(page: Page) {
		super(page);
		this.form = page.getByTestId('login-form');
		this.title = page.getByTestId('login-title');
		this.emailInput = page.getByTestId('login-email-input');
		this.passwordInput = page.getByTestId('login-password-input');
		this.submitButton = page.getByTestId('login-submit-button');
		this.forgotPasswordLink = page.getByTestId('login-forgot-password-link');
		this.githubButton = page.getByTestId('login-github-button');
		this.googleButton = page.getByTestId('login-google-button');
		this.registerLink = page.getByTestId('login-register-link');
		this.registerPrompt = page.getByTestId('login-register-prompt');
	}

	async navigate() {
		await this.goto('/auth/login');
	}

	async fillEmail(email: string) {
		await this.emailInput.fill(email);
	}

	async fillPassword(password: string) {
		await this.passwordInput.fill(password);
	}

	async fillLoginForm(email: string, password: string) {
		await this.fillEmail(email);
		await this.fillPassword(password);
	}

	async submit() {
		await this.submitButton.click();
	}

	async login(email: string, password: string) {
		await this.fillLoginForm(email, password);
		await this.submit();
	}

	async clickGithubLogin() {
		await this.githubButton.click();
	}

	async clickGoogleLogin() {
		await this.googleButton.click();
	}

	async clickForgotPassword() {
		await this.forgotPasswordLink.click();
	}

	async clickRegister() {
		await this.registerLink.click();
	}

	async isSubmitButtonDisabled() {
		return await this.submitButton.isDisabled();
	}

	async isEmailInputDisabled() {
		return await this.emailInput.isDisabled();
	}

	async isPasswordInputDisabled() {
		return await this.passwordInput.isDisabled();
	}

	async getEmailValue() {
		return await this.emailInput.inputValue();
	}

	async getPasswordValue() {
		return await this.passwordInput.inputValue();
	}

	async waitForSuccessToast() {
		await this.page
			.getByText(SUCCESS_TOAST_REGEX)
			.waitFor({ state: 'visible' });
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
