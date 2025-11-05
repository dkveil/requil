import type { User } from '@requil/types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { authApi } from '../api/auth-api';

type AuthState = {
	user: User | null;
	loading: boolean;
	initialized: boolean;
};

type AuthActions = {
	initAuth: () => Promise<void>;
	signIn: (email: string, password: string) => Promise<void>;
	signUp: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
	setUser: (user: User | null) => void;
};

export const useAuthStore = create<AuthState & AuthActions>()(
	devtools(
		(set) => ({
			user: null,
			loading: true,
			initialized: false,

			initAuth: async () => {
				try {
					const { user } = await authApi.getSession();
					set({ user, loading: false, initialized: true }, false, 'initAuth');
				} catch {
					set(
						{ user: null, loading: false, initialized: true },
						false,
						'initAuth/error'
					);
				}
			},

			signIn: async (email: string, password: string) => {
				const response = await authApi.login(email, password);
				set({ user: response.user }, false, 'signIn');
			},

			signUp: async (email: string, password: string) => {
				await authApi.register(email, password);
			},

			signOut: async () => {
				try {
					await authApi.logout();
				} catch {
					// Ignore logout errors
				}
				set({ user: null }, false, 'signOut');
			},

			setUser: (user: User | null) => {
				set({ user }, false, 'setUser');
			},
		}),
		{ name: 'AuthStore' }
	)
);
