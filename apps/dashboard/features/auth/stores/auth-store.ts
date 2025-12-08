import type { OAuthProvider, User } from '@requil/types';
import { DASHBOARD_ROUTES } from '@requil/utils/dashboard-routes';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useWorkspaceStore } from '@/features/workspace';
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
	signInWithOAuth: (provider: OAuthProvider) => Promise<string>;
	handleOAuthCallback: (code: string) => Promise<void>;
	forgotPassword: (email: string) => Promise<void>;
	resetPassword: (password: string) => Promise<void>;
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

				useWorkspaceStore.getState().reset();

				set({ user: null }, false, 'signOut');
			},

			setUser: (user: User | null) => {
				set({ user }, false, 'setUser');
			},

			signInWithOAuth: async (provider: OAuthProvider): Promise<string> => {
				const currentUrl = window.location.origin;
				const callbackUrl = `${currentUrl}${DASHBOARD_ROUTES.AUTH.OAUTH_CALLBACK}`;

				const { url } = await authApi.getOAuthUrl(provider, callbackUrl);

				return url;
			},

			handleOAuthCallback: async (code: string): Promise<void> => {
				const response = await authApi.handleOAuthCallback(code);
				set({ user: response.user }, false, 'oauthCallback');
			},

			forgotPassword: async (email: string) => {
				await authApi.forgotPassword(email);
			},

			resetPassword: async (password: string) => {
				await authApi.resetPassword(password);
			},
		}),
		{ name: 'AuthStore' }
	)
);
