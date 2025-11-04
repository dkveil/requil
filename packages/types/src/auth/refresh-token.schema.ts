import { z } from 'zod';

export const refreshTokenSchema = z.object({
	refreshToken: z.string(),
});

export const refreshTokenResponseSchema = z.object({
	accessToken: z.string(),
	refreshToken: z.string(),
	expiresIn: z.number(),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type RefreshTokenResponse = z.infer<typeof refreshTokenResponseSchema>;
