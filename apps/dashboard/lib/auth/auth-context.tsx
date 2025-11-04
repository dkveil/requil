'use client';

import type { User } from '@requil/types';
import { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';

type AuthContextType = {
	user: User | null;
	loading: boolean;
	signIn: (email: string, password: string) => Promise<void>;
	signUp: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const initAuth = async () => {
			try {
				const { user: sessionUser } = await apiClient.auth.getSession();
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
		const response = await apiClient.auth.login(email, password);
		setUser(response.user);
	};

	const signUp = async (email: string, password: string) => {
		await apiClient.auth.register(email, password);
	};

	const signOut = async () => {
		try {
			await apiClient.auth.logout();
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

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};
