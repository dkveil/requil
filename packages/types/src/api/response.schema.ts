import { z } from 'zod';

export const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
	z.object({
		data: dataSchema,
	});

export type SuccessResponse<T> = {
	data: T;
};
