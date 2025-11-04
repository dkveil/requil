import { z } from 'zod';

export const loginSchema = z.object({
	email: z.email(),
	password: z.string(),
});

export const loginResponseSchema = z.object({
	accessToken: z.string(),
	refreshToken: z.string(),
	expiresIn: z.number(),
	user: z.object({
		id: z.uuid(),
		email: z.email(),
	}),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
