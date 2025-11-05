import path from 'node:path';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
	turbopack: {
		root: path.join(__dirname, '../../'),
	},
	path: {
		to: {
			i18n: path.join(__dirname, 'i18n.ts'),
		},
	},
};

export default withNextIntl(nextConfig);
