export const API_ROUTES = {
	AUTH: {
		LOGIN: '/auth/login',
		REGISTER: '/auth/register',
		LOGOUT: '/auth/logout',
		REFRESH: '/auth/refresh',
		SESSION: '/auth/session',
		OAUTH: '/auth/oauth',
		OAUTH_CALLBACK: '/auth/oauth/callback',
		FORGOT_PASSWORD: '/auth/forgot-password',
		RESET_PASSWORD: '/auth/reset-password',
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
	TEMPLATE: {
		CREATE: '/template',
		LIST: '/template',
		GET: '/template/:id',
		UPDATE: '/template/:id',
		DELETE: '/template/:id',
	},
	ASSET: {
		UPLOAD: '/workspace/:workspaceId/asset',
		FIND: '/workspace/:workspaceId/asset',
		DELETE: '/workspace/:workspaceId/asset/:id',
	},
	API_KEY: {
		CREATE: '/v1/api-keys',
		LIST: '/v1/api-keys',
		REVOKE: '/v1/api-keys/:keyId',
	},
	SEND: {
		CREATE: '/v1/send',
	},
} as const;
