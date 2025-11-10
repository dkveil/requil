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
		EMAIL_TEMPLATES: (slug: string) => `/workspace/${slug}/email-templates`,
		NEW_EMAIL_TEMPLATE: (slug: string) =>
			`/workspace/${slug}/email-templates/new`,
		EMAIL_TEMPLATE: (slug: string, id: string) =>
			`/workspace/${slug}/email-templates/${id}`,
		EMAIL_TEMPLATE_EDITOR: (slug: string, id: string) =>
			`/workspace/${slug}/email-templates/${id}/edit`,
		ANALYTICS: {
			EVENTS: (slug: string) => `/workspace/${slug}/analytics/events`,
		},
		SETTINGS: {
			TRANSPORTS: (slug: string) => `/workspace/${slug}/settings/transports`,
			API_KEYS: (slug: string) => `/workspace/${slug}/settings/api-keys`,
			BILLING: (slug: string) => `/workspace/${slug}/settings/billing`,
		},
	},
	ACCOUNT: {
		SETTINGS: '/account/settings',
	},
} as const;
