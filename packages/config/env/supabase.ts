import { z } from 'zod';

export const supabaseEnvSchema = z.object({
	SUPABASE_URL: z.string(),
	SUPABASE_ANON_KEY: z.string(),
	SUPABASE_SERVICE_ROLE_KEY: z.string(),
	SUPABASE_JWT_SECRET: z.string(),
});

export type SupabaseEnv = z.infer<typeof supabaseEnvSchema>;
