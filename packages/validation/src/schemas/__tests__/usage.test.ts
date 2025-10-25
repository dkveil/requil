import { describe, expect, it } from 'vitest';
import { usageQuerySchema, usageResponseSchema } from '../usage';

describe('usage schemas', () => {
	describe('usageQuerySchema', () => {
		it('should validate usage query', () => {
			const data = {
				startDate: '2025-01-01',
				endDate: '2025-01-31',
			};

			const result = usageQuerySchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should apply default values', () => {
			const data = {
				startDate: '2025-01-01',
				endDate: '2025-01-31',
			};

			const result = usageQuerySchema.parse(data);
			expect(result.granularity).toBe('day');
			expect(result.metric).toBe('all');
		});

		it('should validate with granularity', () => {
			const data = {
				startDate: '2025-01-01',
				endDate: '2025-01-31',
				granularity: 'week',
			};

			const result = usageQuerySchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should validate all granularity options', () => {
			const validGranularities = ['day', 'week', 'month'];

			for (const granularity of validGranularities) {
				const result = usageQuerySchema.safeParse({
					startDate: '2025-01-01',
					endDate: '2025-01-31',
					granularity,
				});
				expect(result.success).toBe(true);
			}
		});

		it('should validate all metric options', () => {
			const validMetrics = ['sends', 'renders', 'ai', 'all'];

			for (const metric of validMetrics) {
				const result = usageQuerySchema.safeParse({
					startDate: '2025-01-01',
					endDate: '2025-01-31',
					metric,
				});
				expect(result.success).toBe(true);
			}
		});

		it('should reject invalid date format', () => {
			const data = {
				startDate: '01/01/2025',
				endDate: '2025-01-31',
			};

			const result = usageQuerySchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should reject invalid granularity', () => {
			const data = {
				startDate: '2025-01-01',
				endDate: '2025-01-31',
				granularity: 'year',
			};

			const result = usageQuerySchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should require startDate', () => {
			const data = {
				endDate: '2025-01-31',
			};

			const result = usageQuerySchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should require endDate', () => {
			const data = {
				startDate: '2025-01-01',
			};

			const result = usageQuerySchema.safeParse(data);
			expect(result.success).toBe(false);
		});
	});

	describe('usageResponseSchema', () => {
		it('should validate usage response', () => {
			const data = {
				data: [
					{
						date: '2025-01-15',
						sends: 1500,
						renders: 2000,
						ai: 100,
					},
				],
				total: {
					sends: 45000,
					renders: 60000,
					ai: 3000,
				},
			};

			const result = usageResponseSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should validate with limits', () => {
			const data = {
				data: [],
				total: {
					sends: 0,
					renders: 0,
					ai: 0,
				},
				limits: {
					sends: 100000,
					renders: 200000,
					ai: 10000,
				},
			};

			const result = usageResponseSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should validate with percentUsed', () => {
			const data = {
				data: [],
				total: {
					sends: 45000,
					renders: 60000,
					ai: 3000,
				},
				limits: {
					sends: 100000,
					renders: 200000,
					ai: 10000,
				},
				percentUsed: {
					sends: 45,
					renders: 30,
					ai: 30,
				},
			};

			const result = usageResponseSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should reject negative values', () => {
			const data = {
				data: [
					{
						date: '2025-01-15',
						sends: -100,
						renders: 2000,
						ai: 100,
					},
				],
				total: {
					sends: 0,
					renders: 0,
					ai: 0,
				},
			};

			const result = usageResponseSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should reject percentUsed over 100', () => {
			const data = {
				data: [],
				total: {
					sends: 0,
					renders: 0,
					ai: 0,
				},
				percentUsed: {
					sends: 150,
					renders: 30,
					ai: 30,
				},
			};

			const result = usageResponseSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should validate empty data array', () => {
			const data = {
				data: [],
				total: {
					sends: 0,
					renders: 0,
					ai: 0,
				},
			};

			const result = usageResponseSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should validate multiple data points', () => {
			const data = {
				data: [
					{ date: '2025-01-01', sends: 100, renders: 150, ai: 10 },
					{ date: '2025-01-02', sends: 200, renders: 250, ai: 20 },
					{ date: '2025-01-03', sends: 300, renders: 350, ai: 30 },
				],
				total: {
					sends: 600,
					renders: 750,
					ai: 60,
				},
			};

			const result = usageResponseSchema.safeParse(data);
			expect(result.success).toBe(true);
		});
	});
});
