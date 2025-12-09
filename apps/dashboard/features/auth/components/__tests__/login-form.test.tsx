import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '../../stores/auth-store';
import { LoginForm } from '../login-form';

// Mockowanie zależności
vi.mock('next/navigation', () => ({
	useRouter: vi.fn(),
}));

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
	useLocale: () => 'en',
}));

vi.mock('../../stores/auth-store', () => ({
	useAuthStore: vi.fn(),
}));

vi.mock('sonner', () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

describe('LoginForm', () => {
	const mockSignIn = vi.fn();
	const mockSignInWithOAuth = vi.fn();
	const mockPush = vi.fn();
	const mockRefresh = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		// Setup default mocks
		vi.mocked(useRouter).mockReturnValue({
			push: mockPush,
			refresh: mockRefresh,
		} as any);

		vi.mocked(useAuthStore).mockImplementation((selector) => {
			return selector({
				signIn: mockSignIn,
				signInWithOAuth: mockSignInWithOAuth,
				user: null,
				loading: false,
				initialized: true,
				initAuth: vi.fn(),
				signUp: vi.fn(),
				signOut: vi.fn(),
				setUser: vi.fn(),
				handleOAuthCallback: vi.fn(),
				forgotPassword: vi.fn(),
				resetPassword: vi.fn(),
			});
		});
	});

	it('renders login form correctly', () => {
		render(<LoginForm />);

		expect(screen.getByLabelText('email')).toBeDefined();
		expect(screen.getByLabelText('password')).toBeDefined();
		expect(
			screen.getByRole('button', { name: 'actions.signIn' })
		).toBeDefined();
	});

	it('shows validation errors for invalid input', async () => {
		render(<LoginForm />);

		const submitButton = screen.getByRole('button', { name: 'actions.signIn' });
		fireEvent.click(submitButton);

		await waitFor(() => {
			// Sprawdzamy czy toast błędu walidacji się pojawił (mockujemy toast.error w onSubmit/onError)
			expect(toast.error).toHaveBeenCalledWith(
				'validationError',
				expect.any(Object)
			);
		});
	});

	it('calls signIn and redirects on successful submission', async () => {
		render(<LoginForm />);

		fireEvent.input(screen.getByLabelText('email'), {
			target: { value: 'test@example.com' },
		});
		fireEvent.input(screen.getByLabelText('password'), {
			target: { value: 'password123' },
		});

		fireEvent.click(screen.getByRole('button', { name: 'actions.signIn' }));

		await waitFor(() => {
			expect(mockSignIn).toHaveBeenCalledWith(
				'test@example.com',
				'password123'
			);
		});

		expect(toast.success).toHaveBeenCalledWith('title', expect.any(Object));
		expect(mockPush).toHaveBeenCalledWith('/');
		expect(mockRefresh).toHaveBeenCalled();
	});

	it('handles login error correctly', async () => {
		mockSignIn.mockRejectedValueOnce(new Error('Invalid credentials'));
		render(<LoginForm />);

		fireEvent.input(screen.getByLabelText('email'), {
			target: { value: 'test@example.com' },
		});
		fireEvent.input(screen.getByLabelText('password'), {
			target: { value: 'password123' },
		});

		fireEvent.click(screen.getByRole('button', { name: 'actions.signIn' }));

		await waitFor(() => {
			expect(mockSignIn).toHaveBeenCalled();
		});

		expect(toast.error).toHaveBeenCalledWith('failed', expect.any(Object));
		expect(mockPush).not.toHaveBeenCalled();
	});

	it('calls signInWithOAuth when social button is clicked', async () => {
		// Mock window.location
		const originalLocation = window.location;
		Object.defineProperty(window, 'location', {
			configurable: true,
			value: { href: '' },
		});

		mockSignInWithOAuth.mockResolvedValue(
			'https://github.com/login/oauth/authorize'
		);

		render(<LoginForm />);

		const githubButton = screen.getByRole('button', {
			name: 'actions.loginWithGithub',
		});
		fireEvent.click(githubButton);

		await waitFor(() => {
			expect(mockSignInWithOAuth).toHaveBeenCalledWith('github');
			expect(window.location.href).toBe(
				'https://github.com/login/oauth/authorize'
			);
		});

		// Cleanup
		Object.defineProperty(window, 'location', {
			configurable: true,
			value: originalLocation,
		});
	});
});
