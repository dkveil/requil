import { z } from 'zod';

export const oauthProviderSchema = z.enum(['github', 'google']);

export const getOAuthUrlInputSchema = z.object({
	provider: oauthProviderSchema,
	redirectUrl: z.string(),
});

export const getOAuthUrlResponseSchema = z.object({
	url: z.string(),
	provider: oauthProviderSchema,
});

export const oauthCallbackInputSchema = z.object({
	code: z.string(),
});

export type OAuthProvider = z.infer<typeof oauthProviderSchema>;
export type GetOAuthUrlInput = z.infer<typeof getOAuthUrlInputSchema>;
export type GetOAuthUrlResponse = z.infer<typeof getOAuthUrlResponseSchema>;
export type OAuthCallbackInput = z.infer<typeof oauthCallbackInputSchema>;
