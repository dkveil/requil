import type { LoginInput, LoginResponse } from '@requil/types/auth';
import { mapSupabaseAuthError } from '@/modules/auth/domain/auth.error';
import type { Action } from '@/shared/cqrs/bus.types';
import { authActionCreator } from '../..';

export const loginAction = authActionCreator('LOGIN');

export default function loginHandler({ commandBus, supabase }: Dependencies) {
	const handler = async (
		action: Action<LoginInput>
	): Promise<LoginResponse> => {
		const { email, password } = action.payload;

		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			throw mapSupabaseAuthError(error, { email });
		}

		if (!data.session) {
			throw new Error('No session created');
		}

		const { session, user } = data;

		return {
			accessToken: session.access_token,
			refreshToken: session.refresh_token,
			expiresIn: session.expires_in,
			user: {
				id: user.id,
				email: user.email || '',
			},
		};
	};

	const init = async () => {
		commandBus.register(loginAction.type, handler);
	};

	return {
		init,
		handler,
	};
}
