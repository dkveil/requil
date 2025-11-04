import type {
	RefreshTokenInput,
	RefreshTokenResponse,
} from '@requil/types/auth';
import type { SupabaseClient } from '@supabase/supabase-js';
import { mapSupabaseAuthError } from '@/modules/auth/domain/auth.error';

export async function refreshTokenHandler(
	input: RefreshTokenInput,
	supabase: SupabaseClient
): Promise<RefreshTokenResponse> {
	const { refreshToken } = input;

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
}
