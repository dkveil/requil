'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '../stores/auth-store';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
	const initAuth = useAuthStore((state) => state.initAuth);
	const initialized = useAuthStore((state) => state.initialized);
	const pathname = usePathname();

	useEffect(() => {
		if (pathname.startsWith('/demo')) return;

		if (!initialized) {
			initAuth();
		}
	}, [initAuth, initialized, pathname]);

	return <>{children}</>;
}
