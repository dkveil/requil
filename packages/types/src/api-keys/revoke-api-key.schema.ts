import { z } from 'zod';

export const revokeApiKeyParamsSchema = z.object({
	keyId: z.uuid('Invalid key ID'),
});

export type RevokeApiKeyParams = z.infer<typeof revokeApiKeyParamsSchema>;
