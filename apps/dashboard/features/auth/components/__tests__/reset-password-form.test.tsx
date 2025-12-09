import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '../../stores/auth-store';
import { ResetPasswordForm } from '../reset-password-form';

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

describe('ResetPasswordForm', () => {
	const mockResetPassword = vi.fn();
	const mockPush = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		// Setup default mocks
		vi.mocked(useRouter).mockReturnValue({
			push: mockPush,
		} as any);

		vi.mocked(useAuthStore).mockImplementation((selector) => {
			return selector({
				resetPassword: mockResetPassword,
				// Atrapy
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
				forgotPassword: vi.fn(),
			});
		});
	});

	it('renders reset password form correctly', () => {
		render(<ResetPasswordForm />);

		expect(screen.getByLabelText('password')).toBeDefined();
		expect(screen.getByLabelText('confirmPassword')).toBeDefined();
		expect(screen.getByRole('button', { name: 'submit' })).toBeDefined();
	});

	it('shows validation error when passwords do not match', async () => {
		render(<ResetPasswordForm />);

		fireEvent.input(screen.getByLabelText('password'), {
			target: { value: 'password123' },
		});
		fireEvent.input(screen.getByLabelText('confirmPassword'), {
			target: { value: 'password456' },
		});

		const submitButton = screen.getByRole('button', { name: 'submit' });
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith(
				'validationError',
				expect.any(Object)
			);
		});
	});

	it('calls resetPassword and redirects on successful submission', async () => {
		render(<ResetPasswordForm />);

		fireEvent.input(screen.getByLabelText('password'), {
			target: { value: 'password123' },
		});
		fireEvent.input(screen.getByLabelText('confirmPassword'), {
			target: { value: 'password123' },
		});

		fireEvent.click(screen.getByRole('button', { name: 'submit' }));

		await waitFor(() => {
			expect(mockResetPassword).toHaveBeenCalledWith('password123');
		});

		expect(toast.success).toHaveBeenCalledWith(
			'successTitle',
			expect.any(Object)
		);
		expect(mockPush).toHaveBeenCalledWith('/auth/login');
	});

	it('handles api error correctly', async () => {
		mockResetPassword.mockRejectedValueOnce(new Error('Network error'));
		render(<ResetPasswordForm />);

		fireEvent.input(screen.getByLabelText('password'), {
			target: { value: 'password123' },
		});
		fireEvent.input(screen.getByLabelText('confirmPassword'), {
			target: { value: 'password123' },
		});

		fireEvent.click(screen.getByRole('button', { name: 'submit' }));

		await waitFor(() => {
			expect(mockResetPassword).toHaveBeenCalled();
		});

		expect(toast.error).toHaveBeenCalledWith('failed', expect.any(Object));
		expect(mockPush).not.toHaveBeenCalled();
	});
});
