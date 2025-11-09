import type { GetOAuthUrlInput, GetOAuthUrlResponse } from '@requil/types/auth';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function getOAuthUrlHandler(
	input: GetOAuthUrlInput,
	supabase: SupabaseClient
): Promise<GetOAuthUrlResponse> {
	const { provider, redirectUrl = 'http://localhost:54321' } = input;

	const { data, error } = await supabase.auth.signInWithOAuth({
		provider,
		options: {
			redirectTo: redirectUrl,
			skipBrowserRedirect: true,
		},
	});

	if (error) {
		throw new Error(error.message);
	}

	if (!data.url) {
		throw new Error('OAuth URL not generated');
	}

	return {
		url: data.url,
		provider,
	};
}
