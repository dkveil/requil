import type {
	GetSessionResponse,
	LoginResponse,
	LogoutResponse,
	RefreshTokenResponse,
	RegisterResponse,
} from '@requil/types';
import { API_ROUTES } from '@requil/utils/api-routes';
import { fetchAPI } from '@/lib/api/client';

export const authApi = {
	async register(email: string, password: string): Promise<RegisterResponse> {
		const response = await fetchAPI<RegisterResponse>(
			API_ROUTES.AUTH.REGISTER,
			{
				method: 'POST',
				body: JSON.stringify({ email, password }),
			}
		);
		return response.data;
	},

	async login(email: string, password: string): Promise<LoginResponse> {
		const response = await fetchAPI<LoginResponse>(API_ROUTES.AUTH.LOGIN, {
			method: 'POST',
			body: JSON.stringify({ email, password }),
		});
		return response.data;
	},

	async logout(): Promise<LogoutResponse> {
		const response = await fetchAPI<LogoutResponse>(API_ROUTES.AUTH.LOGOUT, {
			method: 'POST',
		});
		return response.data;
	},

	async refresh(): Promise<RefreshTokenResponse> {
		const response = await fetchAPI<RefreshTokenResponse>(
			API_ROUTES.AUTH.REFRESH,
			{
				method: 'POST',
			}
		);
		return response.data;
	},

	async getSession(): Promise<GetSessionResponse> {
		const response = await fetchAPI<GetSessionResponse>(
			API_ROUTES.AUTH.SESSION,
			{
				method: 'GET',
			}
		);

		return response.data;
	},
};
