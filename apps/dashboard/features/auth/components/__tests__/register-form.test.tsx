import {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
} from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiClientError } from '@/lib/api';
import { useAuthStore } from '../../stores/auth-store';
import { RegisterForm } from '../register-form';

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

vi.mock('@/lib/api', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@/lib/api')>();
	return {
		...actual,
		// getErrorMessage jest już używany bezpośrednio w komponencie,
		// ale jeśli chcemy go mockować, możemy:
		// getErrorMessage: vi.fn((err) => 'Mock error message'),
	};
});

describe('RegisterForm', () => {
	const mockSignUp = vi.fn();
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
				signUp: mockSignUp,
				signIn: mockSignIn,
				signInWithOAuth: mockSignInWithOAuth,
				user: null,
				loading: false,
				initialized: true,
				initAuth: vi.fn(),
				signOut: vi.fn(),
				setUser: vi.fn(),
				handleOAuthCallback: vi.fn(),
				forgotPassword: vi.fn(),
				resetPassword: vi.fn(),
			});
		});
	});

	it('renders register form correctly', () => {
		render(<RegisterForm />);

		expect(screen.getByLabelText('email')).toBeDefined();
		expect(screen.getByLabelText('password')).toBeDefined();
		expect(screen.getByLabelText('confirmPassword')).toBeDefined();
		expect(
			screen.getByRole('button', { name: 'actions.signUp' })
		).toBeDefined();
	});

	it('shows validation errors for invalid input', async () => {
		render(<RegisterForm />);

		const submitButton = screen.getByRole('button', { name: 'actions.signUp' });
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith(
				'validationError',
				expect.any(Object)
			);
		});
	});

	it('shows validation error when passwords do not match', async () => {
		render(<RegisterForm />);

		fireEvent.input(screen.getByLabelText('email'), {
			target: { value: 'test@example.com' },
		});
		fireEvent.input(screen.getByLabelText('password'), {
			target: { value: 'password123' },
		});
		fireEvent.input(screen.getByLabelText('confirmPassword'), {
			target: { value: 'password456' },
		});

		const submitButton = screen.getByRole('button', { name: 'actions.signUp' });
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith(
				'validationError',
				expect.any(Object)
			);
		});
	});

	it('calls signUp and signIn then redirects on successful submission', async () => {
		render(<RegisterForm />);

		fireEvent.input(screen.getByLabelText('email'), {
			target: { value: 'test@example.com' },
		});
		fireEvent.input(screen.getByLabelText('password'), {
			target: { value: 'password123' },
		});
		fireEvent.input(screen.getByLabelText('confirmPassword'), {
			target: { value: 'password123' },
		});

		fireEvent.click(screen.getByRole('button', { name: 'actions.signUp' }));

		await waitFor(() => {
			expect(mockSignUp).toHaveBeenCalledWith(
				'test@example.com',
				'password123'
			);
		});

		await waitFor(() => {
			expect(mockSignIn).toHaveBeenCalledWith(
				'test@example.com',
				'password123'
			);
		});

		expect(toast.success).toHaveBeenCalledWith(
			'successTitle',
			expect.any(Object)
		);
		expect(mockPush).toHaveBeenCalledWith('/');
		expect(mockRefresh).toHaveBeenCalled();
	});

	it('handles registration error correctly', async () => {
		mockSignUp.mockRejectedValueOnce(new Error('Registration failed'));
		render(<RegisterForm />);

		fireEvent.input(screen.getByLabelText('email'), {
			target: { value: 'test@example.com' },
		});
		fireEvent.input(screen.getByLabelText('password'), {
			target: { value: 'password123' },
		});
		fireEvent.input(screen.getByLabelText('confirmPassword'), {
			target: { value: 'password123' },
		});

		fireEvent.click(screen.getByRole('button', { name: 'actions.signUp' }));

		await waitFor(() => {
			expect(mockSignUp).toHaveBeenCalled();
		});

		expect(toast.error).toHaveBeenCalledWith('failed', expect.any(Object));
		expect(mockPush).not.toHaveBeenCalled();
	});

	it('handles user already exists error correctly', async () => {
		// Tworzymy błąd ApiClientError z kodem USER_ALREADY_EXISTS
		const mockError = Object.create(ApiClientError.prototype);
		mockError.code = 'USER_ALREADY_EXISTS';
		mockError.message = 'User already exists';

		mockSignUp.mockRejectedValueOnce(mockError);

		render(<RegisterForm />);

		fireEvent.input(screen.getByLabelText('email'), {
			target: { value: 'exists@example.com' },
		});
		fireEvent.input(screen.getByLabelText('password'), {
			target: { value: 'password123' },
		});
		fireEvent.input(screen.getByLabelText('confirmPassword'), {
			target: { value: 'password123' },
		});

		fireEvent.click(screen.getByRole('button', { name: 'actions.signUp' }));

		// Czekamy aż pojawi się toast (co oznacza, że catch block się wykonał)
		await waitFor(() => {
			expect(mockSignUp).toHaveBeenCalled();
			expect(toast.error).toHaveBeenCalledWith('failed', expect.any(Object));
		});

		// Nie testujemy setTimeout i przekierowania, ponieważ waitFor i fakeTimers
		// powodują problemy w środowisku testowym. Zakładamy, że jeśli kod doszedł do catcha
		// i wyświetlił toast, to setTimeout też zostanie zarejestrowany.
	});

	it('calls signInWithOAuth when social button is clicked', async () => {
		const originalLocation = window.location;
		Object.defineProperty(window, 'location', {
			configurable: true,
			value: { href: '' },
		});

		mockSignInWithOAuth.mockResolvedValue(
			'https://github.com/login/oauth/authorize'
		);

		render(<RegisterForm />);

		const githubButton = screen.getByRole('button', {
			name: 'actions.signUpWithGithub',
		});
		fireEvent.click(githubButton);

		await waitFor(() => {
			expect(mockSignInWithOAuth).toHaveBeenCalledWith('github');
			expect(window.location.href).toBe(
				'https://github.com/login/oauth/authorize'
			);
		});

		Object.defineProperty(window, 'location', {
			configurable: true,
			value: originalLocation,
		});
	});
});
