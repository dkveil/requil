import { z } from 'zod';

export const getSessionResponseSchema = z.object({
	user: z.object({
		id: z.string().uuid(),
		email: z.string().email(),
	}),
});

export type GetSessionResponse = z.infer<typeof getSessionResponseSchema>;

