import { z } from 'zod';

export const resetPasswordInputSchema = z.object({
	password: z.string().min(8),
});

export const resetPasswordResponseSchema = z.object({
	message: z.string(),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordInputSchema>;
export type ResetPasswordResponse = z.infer<typeof resetPasswordResponseSchema>;
