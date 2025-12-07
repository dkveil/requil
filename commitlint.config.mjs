export default {
	extends: ['@commitlint/config-conventional'],
	rules: {
		'type-enum': [
			2,
			'always',
			[
				'feat', // New feature
				'fix', // Bug fix
				'docs', // Documentation only
				'style', // Code style (formatting, semicolons, etc)
				'refactor', // Code refactoring
				'perf', // Performance improvement
				'test', // Adding or updating tests
				'build', // Build system or dependencies
				'ci', // CI/CD changes
				'chore', // Other changes (tooling, configs)
				'revert', // Revert previous commit
				'i18n', // Internationalization
			],
		],
		'scope-enum': [
			2,
			'always',
			[
				'app',
				// Apps
				'api',
				'dashboard',
				'website',
				// Modules
				'access',
				'auth',
				'workspace',
				'billing',
				'templates',
				'editor',
				// Packages
				'email-engine',
				'transports',
				'validation',
				'webhooks',
				'ratelimit',
				'db',
				'types',
				'ui',
				'utils',
				'config',
				'typescript',
				// Infrastructure
				'docker',
				'ci',
				'deps',
				'lint',
				'biome',
				// Meta
				'monorepo',
				'cursor',
				//documents
				'ai-plan',
				'prd',
			],
		],
		'scope-empty': [1, 'never'],
		'subject-case': [0],
		'subject-empty': [2, 'never'],
		'subject-full-stop': [2, 'never', '.'],
		'header-max-length': [2, 'always', 100],
		'body-leading-blank': [2, 'always'],
		'footer-leading-blank': [2, 'always'],
	},
};
