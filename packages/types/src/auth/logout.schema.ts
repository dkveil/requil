import { z } from 'zod';

export const logoutResponseSchema = z.object({
	message: z.string(),
});

export type LogoutResponse = z.infer<typeof logoutResponseSchema>;
