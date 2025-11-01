const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

type FetchOptions = RequestInit & {
	token?: string;
};

async function fetchAPI<T>(
	endpoint: string,
	options: FetchOptions = {}
): Promise<T> {
	const { token, ...fetchOptions } = options;

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
	};

	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	const response = await fetch(`${API_URL}${endpoint}`, {
		...fetchOptions,
		headers,
		credentials: 'include',
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({
			message: 'An error occurred',
		}));
		throw new Error(error.message || `HTTP ${response.status}`);
	}

	return response.json();
}

export const apiClient = {
	auth: {
		async register(email: string, password: string) {
			return fetchAPI<{
				user: { id: string; email: string };
				message: string;
			}>('/api/auth/register', {
				method: 'POST',
				body: JSON.stringify({ email, password }),
			});
		},

		async login(email: string, password: string) {
			return fetchAPI<{
				accessToken: string;
				refreshToken: string;
				expiresIn: number;
				user: { id: string; email: string };
			}>('/api/auth/login', {
				method: 'POST',
				body: JSON.stringify({ email, password }),
			});
		},

		async logout(token: string) {
			return fetchAPI<{ success: boolean; message: string }>(
				'/api/auth/logout',
				{
					method: 'POST',
					token,
				}
			);
		},

		async refresh(refreshToken: string) {
			return fetchAPI<{
				accessToken: string;
				refreshToken: string;
				expiresIn: number;
			}>('/api/auth/refresh', {
				method: 'POST',
				body: JSON.stringify({ refreshToken }),
			});
		},

		async getSession(token: string) {
			return fetchAPI<{
				user: { id: string; email: string };
			}>('/api/auth/session', {
				method: 'GET',
				token,
			});
		},
	},
};

