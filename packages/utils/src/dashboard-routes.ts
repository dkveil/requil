export const DASHBOARD_ROUTES = {
	HOME: '/',
	AUTH: {
		LOGIN: '/auth/login',
		REGISTER: '/auth/register',
		FORGOT_PASSWORD: '/auth/forgot-password',
	},
	WELCOME: '/welcome',
	WORKSPACE: {
		CURRENT: (slug: string) => `/workspace/${slug}`,
	},
} as const;
