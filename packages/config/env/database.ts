import { z } from 'zod';

export const databaseEnvSchema = z.object({
	DATABASE_URL: z.string(),
});

export type DatabaseEnv = z.infer<typeof databaseEnvSchema>;
