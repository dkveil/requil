import { z } from 'zod';

export const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
	z.object({
		success: z.literal(true),
		status: z.number(),
		data: dataSchema,
	});

export type SuccessResponse<T> = {
	success: true;
	status: number;
	data: T;
};
