import type { SupabaseClient } from '@supabase/supabase-js';
import type { RegisterInput, RegisterResponse } from './register.schema';

export async function registerHandler(
	input: RegisterInput,
	supabase: SupabaseClient
): Promise<RegisterResponse> {
	const { email, password } = input;

	const { data: authUser, error: authError } =
		await supabase.auth.admin.createUser({
			email,
			password,
			email_confirm: false,
		});

	if (authError) {
		throw new Error(`Registration failed: ${authError.message}`);
	}

	if (!authUser.user) {
		throw new Error('User creation failed');
	}

	return {
		user: {
			id: authUser.user.id,
			email: authUser.user.email!,
		},
		message: 'Registration successful. Please check your email to confirm.',
	};
}
