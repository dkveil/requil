import type { LoginInput, LoginResponse } from '@requil/types/auth';
import type { SupabaseClient } from '@supabase/supabase-js';
import { mapSupabaseAuthError } from '@/modules/auth/domain/auth.error';

export async function loginHandler(
	input: LoginInput,
	supabase: SupabaseClient
): Promise<LoginResponse> {
	const { email, password } = input;

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
}
