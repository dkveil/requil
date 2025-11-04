import { z } from 'zod';

export const paginatedQueryParamsSchema = z.object({
	page: z.number().int().positive().default(1),
	limit: z.number().int().positive().max(100).default(10),
	offset: z.number().int().nonnegative().optional(),
	orderBy: z
		.object({
			field: z.string(),
			direction: z.enum(['asc', 'desc']),
		})
		.optional(),
});

export type PaginatedQueryParams = z.infer<typeof paginatedQueryParamsSchema>;

export const paginationSchema = z.object({
	total: z.number().int().nonnegative(),
	page: z.number().int().positive(),
	limit: z.number().int().positive(),
	totalPages: z.number().int().nonnegative(),
});

export type Pagination = z.infer<typeof paginationSchema>;

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(
	dataSchema: T
) =>
	z.object({
		data: z.array(dataSchema),
		pagination: paginationSchema,
	});

export type Paginated<T> = {
	data: T[];
	pagination: Pagination;
};
