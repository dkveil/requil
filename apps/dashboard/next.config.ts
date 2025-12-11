import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
	logging: {
		fetches: {
			fullUrl: true,
		},
	},
	serverExternalPackages: ['pino', 'pino-pretty', 'html-to-text'],
};

export default withNextIntl(nextConfig);
