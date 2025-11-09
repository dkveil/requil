export const DASHBOARD_ROUTES = {
	HOME: '/',
	AUTH: {
		LOGIN: '/auth/login',
		REGISTER: '/auth/register',
		FORGOT_PASSWORD: '/auth/forgot-password',
		OAUTH_CALLBACK: '/auth/oauth/callback',
	},
	WELCOME: '/welcome',
	WORKSPACE: {
		HOME: (slug: string) => `/workspace/${slug}`,
		TEMPLATES: (slug: string) => `/workspace/${slug}/templates`,
		ANALYTICS: {
			EVENTS: (slug: string) => `/workspace/${slug}/analytics/events`,
		},
		SETTINGS: {
			TRANSPORTS: (slug: string) => `/workspace/${slug}/settings/transports`,
			API_KEYS: (slug: string) => `/workspace/${slug}/settings/api-keys`,
			BILLING: (slug: string) => `/workspace/${slug}/settings/billing`,
		},
	},
} as const;
