import type { SupabaseClient } from '@supabase/supabase-js';
import type { LogoutResponse } from './logout.schema';

export async function logoutHandler(
	accessToken: string,
	supabase: SupabaseClient
): Promise<LogoutResponse> {
	const { error } = await supabase.auth.admin.signOut(accessToken);

	if (error) {
		throw new Error(`Logout failed: ${error.message}`);
	}

	return {
		success: true,
		message: 'Successfully logged out',
	};
}


