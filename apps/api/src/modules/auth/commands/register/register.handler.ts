import type { RegisterInput, RegisterResponse } from '@requil/types/auth';
import { env } from '@/config';
import { mapSupabaseAuthError } from '@/modules/auth/domain/auth.error';
import type { Action } from '@/shared/cqrs/bus.types';
import { authActionCreator } from '../..';

export const registerAction = authActionCreator<RegisterInput>('REGISTER');

export default function registerHandler({
	commandBus,
	supabase,
	accountRepository,
	logger,
}: Dependencies) {
	const handler = async (
		action: Action<RegisterInput>
	): Promise<RegisterResponse> => {
		logger.info({ email: action.payload.email }, 'User registering');

		const { email, password } = action.payload;

		const { data: authData, error: authError } = await supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: `${env.frontendUrl}/auth/callback`,
			},
		});

		if (authError) {
			throw mapSupabaseAuthError(authError, { email });
		}

		if (!authData.user) {
			throw new Error('User creation failed');
		}

		try {
			await accountRepository.create(authData.user.id, 'free');
			logger.info(
				{ userId: authData.user.id },
				'Account created with FREE plan'
			);
		} catch (error) {
			logger.error(
				{ userId: authData.user.id, error },
				'Failed to create account during registration'
			);

			await supabase.auth.admin.deleteUser(authData.user.id);
			throw new Error('Registration failed. Please try again.');
		}

		return {
			user: {
				id: authData.user.id,
				email: authData.user.email || '',
			},
			message: 'Registration successful. Please check your email to confirm.',
		};
	};

	const init = async () => {
		commandBus.register(registerAction.type, handler);
	};

	return {
		handler,
		init,
	};
}
