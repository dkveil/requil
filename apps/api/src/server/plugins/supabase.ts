import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { env } from '@/config';

declare module 'fastify' {
	interface FastifyInstance {
		supabase: SupabaseClient;
	}

	interface FastifyRequest {
		supabaseUser?: {
			id: string;
			email: string;
			role?: string;
		};
		workspaceId?: string;
		workspaceRole?: 'owner' | 'member';
	}
}

async function supabasePlugin(fastify: FastifyInstance) {
	const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	});

	fastify.decorate('supabase', supabase);
}

export default fp(supabasePlugin, {
	name: 'supabase',
});
