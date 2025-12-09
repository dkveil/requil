import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '../../stores/auth-store';
import { ForgotPasswordForm } from '../forgot-password-form';

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

describe('ForgotPasswordForm', () => {
	const mockForgotPassword = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		// Setup default mocks
		vi.mocked(useAuthStore).mockImplementation((selector) => {
			return selector({
				forgotPassword: mockForgotPassword,
				// Atrapy dla pozostałych pól AuthState & AuthActions
				signIn: vi.fn(),
				signUp: vi.fn(),
				signInWithOAuth: vi.fn(),
				user: null,
				loading: false,
				initialized: true,
				initAuth: vi.fn(),
				signOut: vi.fn(),
				setUser: vi.fn(),
				handleOAuthCallback: vi.fn(),
				resetPassword: vi.fn(),
			});
		});
	});

	it('renders forgot password form correctly', () => {
		render(<ForgotPasswordForm />);

		expect(screen.getByLabelText('email')).toBeDefined();
		expect(screen.getByRole('button', { name: 'submit' })).toBeDefined();
		expect(screen.getByText('backToLogin')).toBeDefined();
	});

	it('shows validation error for invalid email', async () => {
		render(<ForgotPasswordForm />);

		const submitButton = screen.getByRole('button', { name: 'submit' });
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith(
				'validationError',
				expect.any(Object)
			);
		});
	});

	it('calls forgotPassword on successful submission', async () => {
		render(<ForgotPasswordForm />);

		fireEvent.input(screen.getByLabelText('email'), {
			target: { value: 'test@example.com' },
		});

		fireEvent.click(screen.getByRole('button', { name: 'submit' }));

		await waitFor(() => {
			expect(mockForgotPassword).toHaveBeenCalledWith('test@example.com');
		});

		expect(toast.success).toHaveBeenCalledWith(
			'successTitle',
			expect.any(Object)
		);
	});

	it('handles api error correctly', async () => {
		mockForgotPassword.mockRejectedValueOnce(new Error('Network error'));
		render(<ForgotPasswordForm />);

		fireEvent.input(screen.getByLabelText('email'), {
			target: { value: 'test@example.com' },
		});

		fireEvent.click(screen.getByRole('button', { name: 'submit' }));

		await waitFor(() => {
			expect(mockForgotPassword).toHaveBeenCalled();
		});

		expect(toast.error).toHaveBeenCalledWith('failed', expect.any(Object));
	});
});
