import { describe, expect, it } from 'vitest';
import {
	attachmentSchema,
	fromSchema,
	recipientSchema,
	sendBatchRequestSchema,
	sendRequestSchema,
	templateRefSchema,
} from '../send';

describe('send schemas', () => {
	describe('recipientSchema', () => {
		it('should validate email string', () => {
			const result = recipientSchema.safeParse('user@example.com');
			expect(result.success).toBe(true);
		});

		it('should validate recipient object', () => {
			const data = {
				email: 'user@example.com',
				name: 'John Doe',
				variables: { firstName: 'John' },
			};

			const result = recipientSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should reject invalid email', () => {
			const result = recipientSchema.safeParse('invalid-email');
			expect(result.success).toBe(false);
		});
	});

	describe('fromSchema', () => {
		it('should validate email string', () => {
			const result = fromSchema.safeParse('sender@example.com');
			expect(result.success).toBe(true);
		});

		it('should validate from object', () => {
			const data = {
				email: 'sender@example.com',
				name: 'Company Name',
			};

			const result = fromSchema.safeParse(data);
			expect(result.success).toBe(true);
		});
	});

	describe('attachmentSchema', () => {
		it('should validate attachment with required fields', () => {
			const data = {
				filename: 'document.pdf',
				content: 'base64-encoded-content',
			};

			const result = attachmentSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should apply default disposition', () => {
			const data = {
				filename: 'document.pdf',
				content: 'base64-encoded-content',
			};

			const result = attachmentSchema.parse(data);
			expect(result.disposition).toBe('attachment');
		});

		it('should validate inline disposition', () => {
			const data = {
				filename: 'image.png',
				content: 'base64-encoded-content',
				disposition: 'inline',
			};

			const result = attachmentSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should require filename', () => {
			const data = {
				content: 'base64-encoded-content',
			};

			const result = attachmentSchema.safeParse(data);
			expect(result.success).toBe(false);
		});
	});

	describe('templateRefSchema', () => {
		it('should validate with stableId', () => {
			const data = {
				stableId: 'welcome-email',
				variables: { firstName: 'John' },
			};

			const result = templateRefSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should validate with snapshotId', () => {
			const data = {
				snapshotId: '123e4567-e89b-12d3-a456-426614174000',
			};

			const result = templateRefSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should reject without stableId or snapshotId', () => {
			const data = {
				variables: { firstName: 'John' },
			};

			const result = templateRefSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should validate with both stableId and snapshotId', () => {
			const data = {
				stableId: 'welcome-email',
				snapshotId: '123e4567-e89b-12d3-a456-426614174000',
			};

			const result = templateRefSchema.safeParse(data);
			expect(result.success).toBe(true);
		});
	});

	describe('sendRequestSchema', () => {
		it('should validate template-based send', () => {
			const data = {
				from: 'sender@example.com',
				to: ['recipient@example.com'],
				template: {
					stableId: 'welcome-email',
					variables: { firstName: 'John' },
				},
			};

			const result = sendRequestSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should validate raw HTML send', () => {
			const data = {
				from: 'sender@example.com',
				to: ['recipient@example.com'],
				subject: 'Test Email',
				html: '<h1>Hello World</h1>',
			};

			const result = sendRequestSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should reject without template or html+subject', () => {
			const data = {
				from: 'sender@example.com',
				to: ['recipient@example.com'],
			};

			const result = sendRequestSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should reject subject when using template', () => {
			const data = {
				from: 'sender@example.com',
				to: ['recipient@example.com'],
				template: { stableId: 'welcome-email' },
				subject: 'Override Subject',
			};

			const result = sendRequestSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should require at least one recipient', () => {
			const data = {
				from: 'sender@example.com',
				to: [],
				subject: 'Test',
				html: '<p>Test</p>',
			};

			const result = sendRequestSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should enforce maximum recipients', () => {
			const data = {
				from: 'sender@example.com',
				to: Array(51).fill('user@example.com'),
				subject: 'Test',
				html: '<p>Test</p>',
			};

			const result = sendRequestSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should validate with all optional fields', () => {
			const data = {
				from: { email: 'sender@example.com', name: 'Sender' },
				to: ['recipient@example.com'],
				replyTo: 'reply@example.com',
				cc: ['cc@example.com'],
				bcc: ['bcc@example.com'],
				subject: 'Test Email',
				html: '<h1>Hello</h1>',
				plaintext: 'Hello',
				variables: { key: 'value' },
				attachments: [{ filename: 'doc.pdf', content: 'content' }],
				headers: { 'X-Custom': 'value' },
				transportId: '123e4567-e89b-12d3-a456-426614174000',
				tags: ['marketing'],
				metadata: { campaign: 'summer' },
				idempotencyKey: 'unique-key-123',
				scheduledAt: '2025-12-31T23:59:59Z',
			};

			const result = sendRequestSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should enforce subject line length', () => {
			const data = {
				from: 'sender@example.com',
				to: ['recipient@example.com'],
				subject: 'a'.repeat(1000),
				html: '<p>Test</p>',
			};

			const result = sendRequestSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should validate idempotency key format', () => {
			const data = {
				from: 'sender@example.com',
				to: ['recipient@example.com'],
				subject: 'Test',
				html: '<p>Test</p>',
				idempotencyKey: 'invalid key with spaces',
			};

			const result = sendRequestSchema.safeParse(data);
			expect(result.success).toBe(false);
		});
	});

	describe('sendBatchRequestSchema', () => {
		it('should validate batch send', () => {
			const data = {
				from: 'sender@example.com',
				template: { stableId: 'welcome-email' },
				recipients: [
					{ email: 'user1@example.com', variables: { name: 'User 1' } },
					{ email: 'user2@example.com', variables: { name: 'User 2' } },
				],
			};

			const result = sendBatchRequestSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should require at least one recipient', () => {
			const data = {
				from: 'sender@example.com',
				template: { stableId: 'welcome-email' },
				recipients: [],
			};

			const result = sendBatchRequestSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should enforce maximum recipients', () => {
			const data = {
				from: 'sender@example.com',
				template: { stableId: 'welcome-email' },
				recipients: Array(1001)
					.fill(null)
					.map((_, i) => ({ email: `user${i}@example.com` })),
			};

			const result = sendBatchRequestSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should require template for batch send', () => {
			const data = {
				from: 'sender@example.com',
				recipients: [{ email: 'user@example.com' }],
			};

			const result = sendBatchRequestSchema.safeParse(data);
			expect(result.success).toBe(false);
		});
	});
});
