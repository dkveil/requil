import type {
	ErrorResponse,
	GetSessionResponse,
	LoginResponse,
	LogoutResponse,
	RefreshTokenResponse,
	RegisterResponse,
} from '@requil/types';
import { parseApiError } from './error-handler';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

type FetchOptions = Omit<RequestInit, 'headers'> & {
	headers?: Record<string, string>;
};

async function fetchAPI<T>(
	endpoint: string,
	options: FetchOptions = {}
): Promise<T> {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...options.headers,
	};

	const response = await fetch(`${API_URL}${endpoint}`, {
		...options,
		headers,
		credentials: 'include',
	});

	if (!response.ok) {
		const errorData: ErrorResponse = await response.json().catch(() => ({
			error: {
				message: 'Wystąpił nieoczekiwany błąd',
				code: 'UNKNOWN_ERROR',
			},
		}));

		throw parseApiError(errorData, response.status);
	}

	return response.json();
}

export const apiClient = {
	auth: {
		async register(email: string, password: string): Promise<RegisterResponse> {
			return fetchAPI<RegisterResponse>('/api/auth/register', {
				method: 'POST',
				body: JSON.stringify({ email, password }),
			});
		},

		async login(email: string, password: string): Promise<LoginResponse> {
			return fetchAPI<LoginResponse>('/api/auth/login', {
				method: 'POST',
				body: JSON.stringify({ email, password }),
			});
		},

		async logout(): Promise<LogoutResponse> {
			return fetchAPI<LogoutResponse>('/api/auth/logout', {
				method: 'POST',
			});
		},

		async refresh(): Promise<RefreshTokenResponse> {
			return fetchAPI<RefreshTokenResponse>('/api/auth/refresh', {
				method: 'POST',
			});
		},

		async getSession(): Promise<GetSessionResponse> {
			return fetchAPI<GetSessionResponse>('/api/auth/session', {
				method: 'GET',
			});
		},
	},
};

export { ApiClientError } from './error-handler';
