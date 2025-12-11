'use client';

import { NextIntlClientProvider } from 'next-intl';
import { AuthInitializer } from '@/features/auth/providers/auth-init';
import { QueryProvider } from '@/lib/providers/query-provider';
import { ThemeProvider } from '@/lib/providers/theme-provider';

type ProviderProps = {
	children: React.ReactNode;
	locale?: string;
	messages?: Record<string, unknown>;
};

const providers: React.ComponentType<ProviderProps>[] = [
	ThemeProvider,
	QueryProvider,
	AuthInitializer,
];

export function Providers({ children, locale, messages }: ProviderProps) {
	return (
		<NextIntlClientProvider
			locale={locale}
			messages={messages}
			timeZone='Europe/Warsaw'
		>
			{providers.reduceRight(
				(acc, Provider, index) => (
					<Provider key={index.toString()}>{acc}</Provider>
				),
				children
			)}
		</NextIntlClientProvider>
	);
}
