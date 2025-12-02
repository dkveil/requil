import type { GetOAuthUrlInput, GetOAuthUrlResponse } from '@requil/types/auth';
import type { Action } from '@/shared/cqrs/bus.types';
import { authActionCreator } from '../..';

export const getOAuthUrlAction =
	authActionCreator<GetOAuthUrlInput>('GET_OAUTH_URL');

export default function getOAuthUrlHandler({
	commandBus,
	supabase,
	logger,
}: Dependencies) {
	const handler = async (
		action: Action<GetOAuthUrlInput>
	): Promise<GetOAuthUrlResponse> => {
		logger.info({ provider: action.payload.provider }, 'Getting OAuth URL');

		const { provider, redirectUrl = 'http://localhost:54321' } = action.payload;

		const { data, error } = await supabase.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo: redirectUrl,
				skipBrowserRedirect: true,
			},
		});

		if (error) {
			throw new Error(error.message);
		}

		if (!data.url) {
			throw new Error('OAuth URL not generated');
		}

		return {
			url: data.url,
			provider,
		};
	};

	const init = async () => {
		commandBus.register(getOAuthUrlAction.type, handler);
	};

	return {
		handler,
		init,
	};
}
