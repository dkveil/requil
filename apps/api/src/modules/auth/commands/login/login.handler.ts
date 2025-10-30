import type { SupabaseClient } from '@supabase/supabase-js';
import type { LoginInput, LoginResponse } from './login.schema';

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
		throw new Error(`Login failed: ${error.message}`);
	}

	if (!data.session) {
		throw new Error('No session created');
	}

	return {
		accessToken: data.session.access_token,
		refreshToken: data.session.refresh_token,
		expiresIn: data.session.expires_in,
		user: {
			id: data.user.id,
			email: data.user.email!,
		},
	};
}
