import type { RegisterInput, RegisterResponse } from '@requil/types/auth';
import type { SupabaseClient } from '@supabase/supabase-js';
import { mapSupabaseAuthError } from '@/modules/auth/domain/auth.error';

export async function registerHandler(
	input: RegisterInput,
	supabase: SupabaseClient,
	deps: Dependencies
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

	try {
		await deps.accountRepository.create(authData.user.id, 'free');
		deps.logger.info(
			{ userId: authData.user.id },
			'Account created with FREE plan'
		);
	} catch (error) {
		deps.logger.error(
			{ userId: authData.user.id, error },
			'Failed to create account during registration'
		);

		await supabase.auth.admin.deleteUser(authData.user.id);
		throw new Error('Registration failed. Please try again.');
	}

	return {
		user: {
			id: authData.user.id,
			email: authData.user.email || '',
		},
		message: 'Registration successful. Please check your email to confirm.',
	};
}
