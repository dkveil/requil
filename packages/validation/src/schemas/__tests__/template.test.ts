import { describe, expect, it } from 'vitest';
import {
	createTemplateSchema,
	publishTemplateSchema,
	templateQuerySchema,
	updateTemplateSchema,
	validateTemplateSchema,
} from '../template';

describe('template schemas', () => {
	describe('createTemplateSchema', () => {
		it('should validate template with required fields', () => {
			const data = {
				stableId: 'welcome-email',
				name: 'Welcome Email',
				document: { root: { type: 'Root', id: '1', props: {} } },
				subjectLines: ['Welcome to our platform!'],
			};

			const result = createTemplateSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should validate stableId format', () => {
			const data = {
				stableId: 'invalid_id',
				name: 'Test',
				document: {},
				subjectLines: ['Subject'],
			};

			const result = createTemplateSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should accept valid stableId with hyphens', () => {
			const data = {
				stableId: 'welcome-email-2025',
				name: 'Test',
				document: {},
				subjectLines: ['Subject'],
			};

			const result = createTemplateSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should validate with variables schema', () => {
			const data = {
				stableId: 'welcome-email',
				name: 'Welcome Email',
				document: {},
				variablesSchema: {
					type: 'object',
					properties: {
						firstName: { type: 'string', default: 'Friend' },
					},
				},
				subjectLines: ['Welcome {{firstName}}!'],
			};

			const result = createTemplateSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should require at least one subject line', () => {
			const data = {
				stableId: 'test',
				name: 'Test',
				document: {},
				subjectLines: [],
			};

			const result = createTemplateSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should enforce maximum subject lines', () => {
			const data = {
				stableId: 'test',
				name: 'Test',
				document: {},
				subjectLines: Array(6).fill('Subject'),
			};

			const result = createTemplateSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should enforce subject line length', () => {
			const data = {
				stableId: 'test',
				name: 'Test',
				document: {},
				subjectLines: ['a'.repeat(1000)],
			};

			const result = createTemplateSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should validate with all optional fields', () => {
			const data = {
				stableId: 'newsletter',
				name: 'Monthly Newsletter',
				description: 'Our monthly newsletter template',
				document: {},
				variablesSchema: {
					type: 'object',
					properties: {},
				},
				subjectLines: ['Newsletter - {{month}}'],
				preheader: 'Check out this month updates',
				tags: ['newsletter', 'monthly'],
			};

			const result = createTemplateSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should enforce maximum tags', () => {
			const data = {
				stableId: 'test',
				name: 'Test',
				document: {},
				subjectLines: ['Subject'],
				tags: Array(11).fill('tag'),
			};

			const result = createTemplateSchema.safeParse(data);
			expect(result.success).toBe(false);
		});
	});

	describe('updateTemplateSchema', () => {
		it('should validate partial updates', () => {
			const data = {
				name: 'Updated Template Name',
			};

			const result = updateTemplateSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should reject empty updates', () => {
			const data = {};

			const result = updateTemplateSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should not allow updating stableId', () => {
			const data = {
				stableId: 'new-id',
				name: 'Updated',
			};

			const result = updateTemplateSchema.safeParse(data);
			expect(result.success).toBe(true);
			expect(result.data).not.toHaveProperty('stableId');
		});

		it('should validate document update', () => {
			const data = {
				document: { root: {} },
			};

			const result = updateTemplateSchema.safeParse(data);
			expect(result.success).toBe(true);
		});
	});

	describe('validateTemplateSchema', () => {
		it('should validate template validation request', () => {
			const data = {
				document: {},
				variables: { name: 'John' },
			};

			const result = validateTemplateSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should apply default values', () => {
			const data = {
				document: {},
			};

			const result = validateTemplateSchema.parse(data);
			expect(result.mode).toBe('strict');
			expect(result.checkGuardrails).toBe(true);
		});

		it('should validate with variables schema', () => {
			const data = {
				document: {},
				variablesSchema: {
					type: 'object',
					properties: {
						name: { type: 'string' },
					},
				},
				variables: { name: 'John' },
			};

			const result = validateTemplateSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should validate with permissive mode', () => {
			const data = {
				document: {},
				mode: 'permissive',
			};

			const result = validateTemplateSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should validate with guardrails disabled', () => {
			const data = {
				document: {},
				checkGuardrails: false,
			};

			const result = validateTemplateSchema.safeParse(data);
			expect(result.success).toBe(true);
		});
	});

	describe('publishTemplateSchema', () => {
		it('should validate publish request', () => {
			const data = {
				publishedBy: '123e4567-e89b-12d3-a456-426614174000',
			};

			const result = publishTemplateSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should validate with notes', () => {
			const data = {
				publishedBy: '123e4567-e89b-12d3-a456-426614174000',
				notes: 'Fixed typo in greeting',
			};

			const result = publishTemplateSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should require valid UUID for publishedBy', () => {
			const data = {
				publishedBy: 'invalid-uuid',
			};

			const result = publishTemplateSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should enforce notes length', () => {
			const data = {
				publishedBy: '123e4567-e89b-12d3-a456-426614174000',
				notes: 'a'.repeat(1001),
			};

			const result = publishTemplateSchema.safeParse(data);
			expect(result.success).toBe(false);
		});
	});

	describe('templateQuerySchema', () => {
		it('should use default values', () => {
			const data = {};

			const result = templateQuerySchema.parse(data);
			expect(result.page).toBe(1);
			expect(result.limit).toBe(20);
			expect(result.sortBy).toBe('updatedAt');
			expect(result.sortOrder).toBe('desc');
		});

		it('should coerce query parameters', () => {
			const data = {
				page: '3',
				limit: '50',
			};

			const result = templateQuerySchema.parse(data);
			expect(result.page).toBe(3);
			expect(result.limit).toBe(50);
		});

		it('should validate search parameter', () => {
			const data = {
				search: 'welcome',
			};

			const result = templateQuerySchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should validate tags filter', () => {
			const data = {
				tags: ['newsletter', 'promotional'],
			};

			const result = templateQuerySchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should validate sortBy options', () => {
			const validSortBy = ['createdAt', 'updatedAt', 'name'];

			for (const sortBy of validSortBy) {
				const result = templateQuerySchema.safeParse({ sortBy });
				expect(result.success).toBe(true);
			}
		});
	});
});
