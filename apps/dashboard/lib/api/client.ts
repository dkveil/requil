import type {
	GetSessionResponse,
	LoginResponse,
	LogoutResponse,
	RefreshTokenResponse,
	RegisterResponse,
} from '@requil/types';
import { fetchAPI } from '../handlers/fetch';

export const apiClient = {
	auth: {
		async register(email: string, password: string): Promise<RegisterResponse> {
			const response = await fetchAPI<RegisterResponse>('/api/auth/register', {
				method: 'POST',
				body: JSON.stringify({ email, password }),
			});
			return response.data;
		},

		async login(email: string, password: string): Promise<LoginResponse> {
			const response = await fetchAPI<LoginResponse>('/api/auth/login', {
				method: 'POST',
				body: JSON.stringify({ email, password }),
			});
			return response.data;
		},

		async logout(): Promise<LogoutResponse> {
			const response = await fetchAPI<LogoutResponse>('/api/auth/logout', {
				method: 'POST',
			});
			return response.data;
		},

		async refresh(): Promise<RefreshTokenResponse> {
			const response = await fetchAPI<RefreshTokenResponse>(
				'/api/auth/refresh',
				{
					method: 'POST',
				}
			);
			return response.data;
		},

		async getSession(): Promise<GetSessionResponse> {
			const response = await fetchAPI<GetSessionResponse>('/api/auth/session', {
				method: 'GET',
			});
			return response.data;
		},
	},
};

export { ApiClientError } from './error-handler';
