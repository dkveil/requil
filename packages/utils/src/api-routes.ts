export const API_ROUTES = {
	AUTH: {
		LOGIN: '/auth/login',
		REGISTER: '/auth/register',
		LOGOUT: '/auth/logout',
		REFRESH: '/auth/refresh',
		SESSION: '/auth/session',
		OAUTH: '/auth/oauth',
		OAUTH_CALLBACK: '/auth/oauth/callback',
	},
	WORKSPACE: {
		CREATE: '/workspace',
		LIST: '/workspace',
		GET: '/workspace/:id',
		UPDATE: '/workspace/:id',
		DELETE: '/workspace/:id',
	},
	ACCOUNT: {
		GET: '/account',
	},
} as const;
