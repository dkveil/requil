import { z } from 'zod';
import { userSchema } from './user.schema';

export const getSessionResponseSchema = z.object({
	user: userSchema,
});

export type GetSessionResponse = z.infer<typeof getSessionResponseSchema>;
