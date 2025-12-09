import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useWorkspaceStore } from '@/features/workspace';
import { authApi } from '../api/auth-api';
import { useAuthStore } from './auth-store';

vi.mock('../api/auth-api', () => ({
	authApi: {
		getSession: vi.fn(),
		login: vi.fn(),
		logout: vi.fn(),
		register: vi.fn(),
	},
}));

vi.mock('@/features/workspace', () => ({
	useWorkspaceStore: {
		getState: vi.fn(() => ({
			reset: vi.fn(),
		})),
	},
}));

describe('AuthStore', () => {
	beforeEach(() => {
		useAuthStore.setState({
			user: null,
			loading: true,
			initialized: false,
		});
		vi.clearAllMocks();
	});

	describe('initAuth', () => {
		it('should set user and initialized flag on successful session fetch', async () => {
			const mockUser = { id: '123', email: 'test@example.com' };
			vi.mocked(authApi.getSession).mockResolvedValue({
				user: mockUser,
			} as any);

			await useAuthStore.getState().initAuth();

			const state = useAuthStore.getState();
			expect(state.user).toEqual(mockUser);
			expect(state.loading).toBe(false);
			expect(state.initialized).toBe(true);
		});

		it('should clear user on session fetch error', async () => {
			vi.mocked(authApi.getSession).mockRejectedValue(
				new Error('Network error')
			);

			await useAuthStore.getState().initAuth();

			const state = useAuthStore.getState();
			expect(state.user).toBeNull();
			expect(state.loading).toBe(false);
			expect(state.initialized).toBe(true);
		});
	});

	describe('signIn', () => {
		it('should update user state after successful login', async () => {
			const mockUser = { id: '123', email: 'test@example.com' };
			vi.mocked(authApi.login).mockResolvedValue({ user: mockUser } as any);

			await useAuthStore.getState().signIn('test@example.com', 'password');

			const state = useAuthStore.getState();
			expect(state.user).toEqual(mockUser);
			expect(authApi.login).toHaveBeenCalledWith(
				'test@example.com',
				'password'
			);
		});
	});

	describe('signOut', () => {
		it('should clear user state and reset workspace store', async () => {
			useAuthStore.setState({ user: { id: '123' } as any });
			vi.mocked(authApi.logout).mockResolvedValue({} as any);

			const workspaceResetMock = vi.fn();
			vi.mocked(useWorkspaceStore.getState).mockReturnValue({
				reset: workspaceResetMock,
			} as any);

			await useAuthStore.getState().signOut();

			const state = useAuthStore.getState();
			expect(state.user).toBeNull();
			expect(authApi.logout).toHaveBeenCalled();
			expect(workspaceResetMock).toHaveBeenCalled();
		});

		it('should clear state even if api logout fails', async () => {
			useAuthStore.setState({ user: { id: '123' } as any });
			vi.mocked(authApi.logout).mockRejectedValue(new Error('Logout failed'));

			await useAuthStore.getState().signOut();

			expect(useAuthStore.getState().user).toBeNull();
		});
	});
});
