import type { RegisterInput, RegisterResponse } from '@requil/types/auth';
import type { SupabaseClient } from '@supabase/supabase-js';
import { mapSupabaseAuthError } from '@/modules/auth/domain/auth.error';

export async function registerHandler(
	input: RegisterInput,
	supabase: SupabaseClient
): Promise<RegisterResponse> {
	const { email, password } = input;

	const { data: authData, error: authError } = await supabase.auth.signUp({
		email,
		password,
		options: {
			emailRedirectTo: 'http://localhost:3000/auth/callback',
		},
	});

	if (authError) {
		throw mapSupabaseAuthError(authError, { email });
	}

	if (!authData.user) {
		throw new Error('User creation failed');
	}

	return {
		user: {
			id: authData.user.id,
			email: authData.user.email || '',
		},
		message: 'Registration successful. Please check your email to confirm.',
	};
}
