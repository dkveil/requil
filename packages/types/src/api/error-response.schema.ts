import { z } from 'zod';

export const errorResponseSchema = z.object({
	error: z.object({
		message: z.string(),
		code: z.string(),
		traceId: z.string().optional(),
		context: z.record(z.string(), z.unknown()).optional(),
	}),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;
