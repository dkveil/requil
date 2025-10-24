import { z } from 'zod';

/**
 * @example
 * {
 *   "startDate": "2025-01-01",
 *   "endDate": "2025-01-31",
 *   "granularity": "day"
 * }
 */
export const usageQuerySchema = z.object({
	startDate: z.string().date(),
	endDate: z.string().date(),
	granularity: z.enum(['day', 'week', 'month']).optional().default('day'),
	metric: z.enum(['sends', 'renders', 'ai', 'all']).optional().default('all'),
});

/**
 * @example
 * {
 *   "data": [
 *     {
 *       "date": "2025-01-15",
 *       "sends": 1500,
 *       "renders": 2000,
 *       "ai": 100
 *     }
 *   ],
 *   "total": {
 *     "sends": 45000,
 *     "renders": 60000,
 *     "ai": 3000
 *   },
 *   "limits": {
 *     "sends": 100000,
 *     "renders": 200000,
 *     "ai": 10000
 *   }
 * }
 */
export const usageResponseSchema = z.object({
	data: z.array(
		z.object({
			date: z.string().date(),
			sends: z.number().min(0),
			renders: z.number().min(0),
			ai: z.number().min(0),
		})
	),
	total: z.object({
		sends: z.number().min(0),
		renders: z.number().min(0),
		ai: z.number().min(0),
	}),
	limits: z
		.object({
			sends: z.number().min(0),
			renders: z.number().min(0),
			ai: z.number().min(0),
		})
		.optional(),
	percentUsed: z
		.object({
			sends: z.number().min(0).max(100),
			renders: z.number().min(0).max(100),
			ai: z.number().min(0).max(100),
		})
		.optional(),
});

export type UsageQuery = z.infer<typeof usageQuerySchema>;
export type UsageResponse = z.infer<typeof usageResponseSchema>;
