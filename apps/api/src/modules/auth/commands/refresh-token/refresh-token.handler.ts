import type { SupabaseClient } from '@supabase/supabase-js';
import type {
	RefreshTokenInput,
	RefreshTokenResponse,
} from './refresh-token.schema';

export async function refreshTokenHandler(
	input: RefreshTokenInput,
	supabase: SupabaseClient
): Promise<RefreshTokenResponse> {
	const { refreshToken } = input;

	const { data, error } = await supabase.auth.refreshSession({
		refresh_token: refreshToken,
	});

	if (error || !data.session) {
		throw new Error(`Token refresh failed: ${error?.message}`);
	}

	return {
		accessToken: data.session.access_token,
		refreshToken: data.session.refresh_token,
		expiresIn: data.session.expires_in,
	};
}


