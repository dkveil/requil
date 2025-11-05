export const API_ROUTES = {
	AUTH: {
		LOGIN: '/auth/login',
		REGISTER: '/auth/register',
		LOGOUT: '/auth/logout',
		REFRESH: '/auth/refresh',
		SESSION: '/auth/session',
	},
	WORKSPACE: {
		CREATE: '/workspace',
		LIST: '/workspace',
		GET: '/workspace/:id',
		UPDATE: '/workspace/:id',
		DELETE: '/workspace/:id',
	},
} as const;
