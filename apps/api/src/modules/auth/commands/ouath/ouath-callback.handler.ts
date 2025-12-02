import type { LoginResponse, OAuthCallbackInput } from '@requil/types/auth';
import { mapSupabaseAuthError } from '@/modules/auth/domain/auth.error';
import type { Action } from '@/shared/cqrs/bus.types';
import { authActionCreator } from '../..';

export const oauthCallbackAction =
	authActionCreator<OAuthCallbackInput>('OAUTH_CALLBACK');

export default function oauthCallbackHandler({
	commandBus,
	supabase,
	accountRepository,
	logger,
}: Dependencies) {
	const handler = async (
		action: Action<OAuthCallbackInput>
	): Promise<LoginResponse> => {
		logger.info('Processing OAuth callback');

		const { code } = action.payload;

		const { data, error } = await supabase.auth.exchangeCodeForSession(code);

		if (error) {
			throw mapSupabaseAuthError(error);
		}

		if (!(data.session && data.user)) {
			throw new Error('No session or user found');
		}

		const { session, user } = data;

		const accountExists = await accountRepository.exists(user.id);

		if (!accountExists) {
			try {
				await accountRepository.create(user.id, 'free');
				logger.info(
					{ userId: user.id, provider: user.app_metadata.provider },
					'Account created for OAuth user'
				);
			} catch (error) {
				logger.error(
					{ userId: user.id, error },
					'Failed to create account during OAuth'
				);

				await supabase.auth.admin.deleteUser(user.id);
				throw new Error('OAuth registration failed. Please try again.');
			}
		}

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
		commandBus.register(oauthCallbackAction.type, handler);
	};

	return {
		handler,
		init,
	};
}
