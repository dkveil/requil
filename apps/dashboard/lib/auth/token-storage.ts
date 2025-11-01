const ACCESS_TOKEN_KEY = 'requil_access_token';
const REFRESH_TOKEN_KEY = 'requil_refresh_token';

export const tokenStorage = {
	getAccessToken(): string | null {
		if (typeof window === 'undefined') return null;
		return localStorage.getItem(ACCESS_TOKEN_KEY);
	},

	getRefreshToken(): string | null {
		if (typeof window === 'undefined') return null;
		return localStorage.getItem(REFRESH_TOKEN_KEY);
	},

	setTokens(accessToken: string, refreshToken: string): void {
		if (typeof window === 'undefined') return;
		localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
		localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
	},

	clearTokens(): void {
		if (typeof window === 'undefined') return;
		localStorage.removeItem(ACCESS_TOKEN_KEY);
		localStorage.removeItem(REFRESH_TOKEN_KEY);
	},
};

