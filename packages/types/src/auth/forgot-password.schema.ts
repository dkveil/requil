import { z } from 'zod';

export const forgotPasswordInputSchema = z.object({
	email: z.string().email(),
});

export const forgotPasswordResponseSchema = z.object({
	message: z.string(),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordInputSchema>;
export type ForgotPasswordResponse = z.infer<
	typeof forgotPasswordResponseSchema
>;
