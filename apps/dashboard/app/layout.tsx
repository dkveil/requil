import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { getLocale, getMessages } from 'next-intl/server';
import { Toaster } from '@/components/ui/sonner';
import { Providers } from './providers';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'Requil - Email Engine',
	description: 'API-first engine for transactional and campaign emails',
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const locale = await getLocale();
	const messages = await getMessages();

	return (
		<html
			lang={locale}
			suppressHydrationWarning
		>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<Providers
					locale={locale}
					messages={messages}
				>
					<main>{children}</main>
				</Providers>
				<Toaster />
			</body>
		</html>
	);
}
