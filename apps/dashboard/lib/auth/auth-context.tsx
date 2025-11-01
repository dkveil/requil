'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { tokenStorage } from '@/lib/auth/token-storage';

type User = {
	id: string;
	email: string;
};

type AuthContextType = {
	user: User | null;
	loading: boolean;
	signIn: (email: string, password: string) => Promise<void>;
	signUp: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
	refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const initAuth = async () => {
			try {
				const token = tokenStorage.getAccessToken();
				if (!token) {
					setLoading(false);
					return;
				}

				const { user: sessionUser } = await apiClient.auth.getSession(token);
				setUser(sessionUser);
			} catch {
				tokenStorage.clearTokens();
				setUser(null);
			} finally {
				setLoading(false);
			}
		};

		initAuth();
	}, []);

	const signIn = async (email: string, password: string) => {
		const response = await apiClient.auth.login(email, password);
		tokenStorage.setTokens(response.accessToken, response.refreshToken);
		setUser(response.user);
	};

	const signUp = async (email: string, password: string) => {
		await apiClient.auth.register(email, password);
	};

	const signOut = async () => {
		const token = tokenStorage.getAccessToken();
		if (token) {
			try {
				await apiClient.auth.logout(token);
			} catch {
				// Ignore logout errors
			}
		}
		tokenStorage.clearTokens();
		setUser(null);
	};

	const refreshSession = async () => {
		const refreshToken = tokenStorage.getRefreshToken();
		if (!refreshToken) {
			throw new Error('No refresh token available');
		}

		const response = await apiClient.auth.refresh(refreshToken);
		tokenStorage.setTokens(response.accessToken, response.refreshToken);

		const { user: sessionUser } = await apiClient.auth.getSession(
			response.accessToken
		);
		setUser(sessionUser);
	};

	return (
		<AuthContext.Provider
			value={{ user, loading, signIn, signUp, signOut, refreshSession }}
		>
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
