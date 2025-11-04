import type { LogoutResponse } from '@requil/types/auth';
import type { SupabaseClient } from '@supabase/supabase-js';
import { mapSupabaseAuthError } from '@/modules/auth/domain/auth.error';

export async function logoutHandler(
	accessToken: string,
	supabase: SupabaseClient
): Promise<LogoutResponse> {
	const { error } = await supabase.auth.admin.signOut(accessToken);

	if (error) {
		throw mapSupabaseAuthError(error);
	}

	return {
		message: 'Successfully logged out',
	};
}
