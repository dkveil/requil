import type {
	RefreshTokenInput,
	RefreshTokenResponse,
} from '@requil/types/auth';
import { mapSupabaseAuthError } from '@/modules/auth/domain/auth.error';
import type { Action } from '@/shared/cqrs/bus.types';
import { authActionCreator } from '../..';

export const refreshTokenAction =
	authActionCreator<RefreshTokenInput>('REFRESH_TOKEN');

export default function refreshTokenHandler({
	commandBus,
	supabase,
	logger,
}: Dependencies) {
	const handler = async (
		action: Action<RefreshTokenInput>
	): Promise<RefreshTokenResponse> => {
		logger.info('Refreshing token');

		const { refreshToken } = action.payload;

		const { data, error } = await supabase.auth.refreshSession({
			refresh_token: refreshToken,
		});

		if (error) {
			throw mapSupabaseAuthError(error);
		}

		if (!data.session) {
			throw new Error('No session created during token refresh');
		}

		return {
			accessToken: data.session.access_token,
			refreshToken: data.session.refresh_token,
			expiresIn: data.session.expires_in,
		};
	};

	const init = async () => {
		commandBus.register(refreshTokenAction.type, handler);
	};

	return {
		handler,
		init,
	};
}
