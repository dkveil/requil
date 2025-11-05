'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../stores/auth-store';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
	const initAuth = useAuthStore((state) => state.initAuth);
	const initialized = useAuthStore((state) => state.initialized);

	useEffect(() => {
		if (!initialized) {
			initAuth();
		}
	}, [initAuth, initialized]);

	return <>{children}</>;
}
