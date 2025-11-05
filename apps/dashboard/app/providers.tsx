'use client';

import { AuthProvider } from '@/features/auth/providers/auth-provider';
import { ThemeProvider } from '@/lib/providers/theme-provider';

type ProviderProps = { children: React.ReactNode };

const providers: React.ComponentType<ProviderProps>[] = [
	AuthProvider,
	ThemeProvider,
];

export function Providers({ children }: ProviderProps) {
	return providers.reduceRight(
		(acc, Provider, index) => <Provider key={index.toString()}>{acc}</Provider>,
		children
	);
}
