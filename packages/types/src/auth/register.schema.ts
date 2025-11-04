import { z } from 'zod';
import { userSchema } from './user.schema';

export const registerInputSchema = z.object({
	email: z.email(),
	password: z.string().min(8),
});

export const registerResponseSchema = z.object({
	user: userSchema,
	message: z.string(),
});

export type RegisterInput = z.infer<typeof registerInputSchema>;
export type RegisterResponse = z.infer<typeof registerResponseSchema>;
