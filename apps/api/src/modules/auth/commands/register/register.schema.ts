import { z } from 'zod';

export const registerSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
});

export const registerResponseSchema = z.object({
	user: z.object({
		id: z.string().uuid(),
		email: z.string().email(),
	}),
	message: z.string(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type RegisterResponse = z.infer<typeof registerResponseSchema>;
