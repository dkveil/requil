'use client';

import type { User } from '@requil/types';
import { createContext, useEffect, useState } from 'react';
import { authApi } from '../api/auth-api';

type AuthContextType = {
	user: User | null;
	loading: boolean;
	signIn: (email: string, password: string) => Promise<void>;
	signUp: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(
	undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const initAuth = async () => {
			try {
				const { user: sessionUser } = await authApi.getSession();
				setUser(sessionUser);
			} catch {
				setUser(null);
			} finally {
				setLoading(false);
			}
		};

		initAuth();
	}, []);

	const signIn = async (email: string, password: string) => {
		const response = await authApi.login(email, password);
		setUser(response.user);
	};

	const signUp = async (email: string, password: string) => {
		await authApi.register(email, password);
	};

	const signOut = async () => {
		try {
			await authApi.logout();
		} catch {
			// Ignore logout errors
		}
		setUser(null);
	};

	return (
		<AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
			{children}
		</AuthContext.Provider>
	);
}
