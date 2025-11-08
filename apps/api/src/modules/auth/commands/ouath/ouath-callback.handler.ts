import type { OAuthCallbackInput } from '@requil/types/auth';
import type { SupabaseClient } from '@supabase/supabase-js';
import { mapSupabaseAuthError } from '@/modules/auth/domain/auth.error';

export async function oauthCallbackHandler(
	input: OAuthCallbackInput,
	supabase: SupabaseClient,
	deps: Dependencies
) {
	const { code } = input;

	const { data, error } = await supabase.auth.exchangeCodeForSession(code);

	if (error) {
		throw mapSupabaseAuthError(error);
	}

	if (!(data.session && data.user)) {
		throw new Error('No session or user found');
	}

	const { session, user } = data;

	const accountExists = await deps.accountRepository.exists(user.id);

	if (!accountExists) {
		try {
			await deps.accountRepository.create(user.id, 'free');
			deps.logger.info(
				{ userId: user.id, provider: user.app_metadata.provider },
				'Account created for OAuth user'
			);
		} catch (error) {
			deps.logger.error(
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
}
