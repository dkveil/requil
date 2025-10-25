import Fastify, { type FastifyInstance } from 'fastify';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { validatorPlugin } from '../fastify-validator';

// Mock ValidationError since it's from @requil/utils/errors
vi.mock('@requil/utils/errors', () => ({
	ValidationError: class ValidationError extends Error {
		context: Record<string, unknown>;
		constructor(message: string, context?: Record<string, unknown>) {
			super(message);
			this.name = 'ValidationError';
			this.context = context || {};
		}
	},
}));

describe('fastify validator plugin', () => {
	let app: FastifyInstance;

	beforeEach(async () => {
		app = Fastify();
		await app.register(validatorPlugin);
	});

	describe('body validation', () => {
		it('should validate request body successfully', async () => {
			const schema = z.object({
				email: z.string().email(),
				name: z.string(),
			});

			app.post(
				'/test',
				{
					config: {
						validator: {
							body: schema,
						},
					},
				},
				async (request) => {
					return { success: true, data: request.body };
				}
			);

			const response = await app.inject({
				method: 'POST',
				url: '/test',
				payload: {
					email: 'user@example.com',
					name: 'John Doe',
				},
			});

			expect(response.statusCode).toBe(200);
			expect(response.json()).toMatchObject({
				success: true,
				data: {
					email: 'user@example.com',
					name: 'John Doe',
				},
			});
		});

		it('should reject invalid request body', async () => {
			const schema = z.object({
				email: z.string().email(),
			});

			app.post(
				'/test',
				{
					config: {
						validator: {
							body: schema,
						},
					},
				},
				async () => {
					return { success: true };
				}
			);

			const response = await app.inject({
				method: 'POST',
				url: '/test',
				payload: {
					email: 'invalid-email',
				},
			});

			expect(response.statusCode).toBe(500);
		});

		it('should handle missing required fields', async () => {
			const schema = z.object({
				email: z.string().email(),
				name: z.string(),
			});

			app.post(
				'/test',
				{
					config: {
						validator: {
							body: schema,
						},
					},
				},
				async () => {
					return { success: true };
				}
			);

			const response = await app.inject({
				method: 'POST',
				url: '/test',
				payload: {
					email: 'user@example.com',
				},
			});

			expect(response.statusCode).toBe(500);
		});
	});

	describe('querystring validation', () => {
		it('should validate query parameters successfully', async () => {
			const schema = z.object({
				page: z.coerce.number().min(1),
				limit: z.coerce.number().max(100),
			});

			app.get(
				'/test',
				{
					config: {
						validator: {
							querystring: schema,
						},
					},
				},
				async (request) => {
					return { success: true, query: request.query };
				}
			);

			const response = await app.inject({
				method: 'GET',
				url: '/test?page=1&limit=20',
			});

			expect(response.statusCode).toBe(200);
			expect(response.json()).toMatchObject({
				success: true,
				query: {
					page: 1,
					limit: 20,
				},
			});
		});

		it('should reject invalid query parameters', async () => {
			const schema = z.object({
				page: z.coerce.number().min(1),
			});

			app.get(
				'/test',
				{
					config: {
						validator: {
							querystring: schema,
						},
					},
				},
				async () => {
					return { success: true };
				}
			);

			const response = await app.inject({
				method: 'GET',
				url: '/test?page=0',
			});

			expect(response.statusCode).toBe(500);
		});
	});

	describe('params validation', () => {
		it('should validate route parameters successfully', async () => {
			const schema = z.object({
				id: z.string().uuid(),
			});

			app.get(
				'/test/:id',
				{
					config: {
						validator: {
							params: schema,
						},
					},
				},
				async (request) => {
					return { success: true, params: request.params };
				}
			);

			const validUuid = '123e4567-e89b-12d3-a456-426614174000';
			const response = await app.inject({
				method: 'GET',
				url: `/test/${validUuid}`,
			});

			expect(response.statusCode).toBe(200);
			expect(response.json()).toMatchObject({
				success: true,
				params: {
					id: validUuid,
				},
			});
		});

		it('should reject invalid route parameters', async () => {
			const schema = z.object({
				id: z.string().uuid(),
			});

			app.get(
				'/test/:id',
				{
					config: {
						validator: {
							params: schema,
						},
					},
				},
				async () => {
					return { success: true };
				}
			);

			const response = await app.inject({
				method: 'GET',
				url: '/test/invalid-uuid',
			});

			expect(response.statusCode).toBe(500);
		});
	});

	describe('headers validation', () => {
		it('should validate headers successfully', async () => {
			const schema = z.object({
				'x-api-key': z.string().min(1),
			});

			app.get(
				'/test',
				{
					config: {
						validator: {
							headers: schema.passthrough(),
						},
					},
				},
				async () => {
					return { success: true };
				}
			);

			const response = await app.inject({
				method: 'GET',
				url: '/test',
				headers: {
					'x-api-key': 'valid-api-key',
				},
			});

			expect(response.statusCode).toBe(200);
		});
	});

	describe('multiple validators', () => {
		it('should validate multiple parts of request', async () => {
			const bodySchema = z.object({
				email: z.string().email(),
			});

			const querySchema = z.object({
				verified: z.coerce.boolean(),
			});

			app.post(
				'/test',
				{
					config: {
						validator: {
							body: bodySchema,
							querystring: querySchema,
						},
					},
				},
				async (request) => {
					return {
						success: true,
						body: request.body,
						query: request.query,
					};
				}
			);

			const response = await app.inject({
				method: 'POST',
				url: '/test?verified=true',
				payload: {
					email: 'user@example.com',
				},
			});

			expect(response.statusCode).toBe(200);
			expect(response.json()).toMatchObject({
				success: true,
				body: { email: 'user@example.com' },
				query: { verified: true },
			});
		});
	});

	describe('routes without validation', () => {
		it('should handle routes without validator config', async () => {
			app.get('/test', async () => {
				return { success: true };
			});

			const response = await app.inject({
				method: 'GET',
				url: '/test',
			});

			expect(response.statusCode).toBe(200);
			expect(response.json()).toMatchObject({ success: true });
		});
	});

	describe('error context', () => {
		it('should include request path and method in validation error', async () => {
			const schema = z.object({
				email: z.string().email(),
			});

			app.post(
				'/api/users',
				{
					config: {
						validator: {
							body: schema,
						},
					},
				},
				async () => {
					return { success: true };
				}
			);

			const response = await app.inject({
				method: 'POST',
				url: '/api/users',
				payload: {
					email: 'invalid',
				},
			});

			expect(response.statusCode).toBe(500);
		});
	});
});
