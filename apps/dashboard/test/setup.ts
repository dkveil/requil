import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
	cleanup();
});

vi.mock('next/navigation', () => ({
	useRouter: () => ({
		push: vi.fn(),
		replace: vi.fn(),
		prefetch: vi.fn(),
		back: vi.fn(),
		pathname: '/',
		query: {},
	}),
	usePathname: () => '/',
	useSearchParams: () => new URLSearchParams(),
	useParams: () => ({}),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
	useLocale: () => 'en',
}));

// Mock next-themes
vi.mock('next-themes', () => ({
	useTheme: () => ({
		theme: 'light',
		setTheme: vi.fn(),
		systemTheme: 'light',
	}),
	ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));
