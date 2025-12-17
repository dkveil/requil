import { existsSync, readdirSync } from 'node:fs';

// Helper to read directories ignoring dotfiles
const getDirectories = (source) =>
	existsSync(source)
		? readdirSync(source, { withFileTypes: true })
				.filter(
					(dirent) => dirent.isDirectory() && !dirent.name.startsWith('.')
				)
				.map((dirent) => dirent.name)
		: [];

const apps = getDirectories('apps');
const packages = getDirectories('packages');

// Internal modules from API (domain scopes)
const apiModules = getDirectories('apps/api/src/modules');

// Manual scopes that don't map to directories
const manualScopes = [
	'monorepo',
	'config', // global config if not referring to @requil/config
	'typescript',
	'scripts',
	'e2e',
	'testing',
	'deploy',
	'docker',
	'ci',
	'deps',
	'lint',
	'biome',
	'cursor',
	'docs',
	'release',
	// Project specific
	'ai-plan',
	'stack',
	'prd',
	'rules',
	'license',
	'access', // Legacy/Specific domain
];

const scopes = [
	...new Set([...apps, ...packages, ...apiModules, ...manualScopes]),
];

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
		'scope-enum': [2, 'always', scopes],
		// Angular convention allows empty scope (e.g. "fix: global fix")
		'scope-empty': [0],
		// Angular convention requires lowercase subject
		'subject-case': [2, 'always', 'lower-case'],
		'subject-empty': [2, 'never'],
		'subject-full-stop': [2, 'never', '.'],
		'header-max-length': [2, 'always', 100],
		'body-leading-blank': [2, 'always'],
		'footer-leading-blank': [2, 'always'],
	},
};
