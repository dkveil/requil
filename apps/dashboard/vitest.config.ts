import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./test/setup.ts'],
		exclude: ['**/node_modules/**', '**/e2e/**', '**/.next/**'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: [
				'node_modules/**',
				'.next/**',
				'**/*.config.ts',
				'**/types.ts',
				'**/*.test.ts',
				'**/*.test.tsx',
				'test/**',
			],
		},
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './'),
		},
	},
});
