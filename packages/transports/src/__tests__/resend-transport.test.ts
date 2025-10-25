import { TransportError } from '@requil/utils/errors';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ResendTransport } from '../resend/resend-transport';
import type { ResendConfig, SendEmailRequest } from '../types';

vi.mock('resend', () => {
	const mockSend = vi.fn();
	const mockList = vi.fn();

	return {
		Resend: vi.fn().mockImplementation(() => ({
			emails: {
				send: mockSend,
			},
			apiKeys: {
				list: mockList,
			},
		})),
	};
});

describe('ResendTransport', () => {
	const config: ResendConfig = {
		type: 'resend',
		apiKey: 'test-api-key',
		traceId: 'test-trace-id',
	};

	let transport: ResendTransport;
	// biome-ignore lint/suspicious/noExplicitAny: Mock objects need flexible typing for tests
	let mockSend: any;
	// biome-ignore lint/suspicious/noExplicitAny: Mock objects need flexible typing for tests
	let mockList: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		transport = new ResendTransport(config);
		const { Resend } = await import('resend');
		const mockResendInstance = new Resend('test');
		mockSend = mockResendInstance.emails.send;
		mockList = mockResendInstance.apiKeys.list;
	});

	describe('send', () => {
		const emailRequest: SendEmailRequest = {
			from: { email: 'sender@example.com', name: 'Sender' },
			to: [
				{ email: 'recipient1@example.com', name: 'Recipient 1' },
				{ email: 'recipient2@example.com' },
			],
			subject: 'Test Subject',
			html: '<p>Test HTML</p>',
			plaintext: 'Test plaintext',
			traceId: 'test-trace',
		};

		it('sends email successfully', async () => {
			mockSend.mockResolvedValue({
				data: { id: 'resend-message-id-123' },
				error: null,
			});

			const result = await transport.send(emailRequest);

			expect(result).toEqual({
				messageId: 'resend-message-id-123',
				accepted: ['recipient1@example.com', 'recipient2@example.com'],
				transportMetadata: {
					provider: 'resend',
					resendId: 'resend-message-id-123',
				},
			});

			expect(mockSend).toHaveBeenCalledWith({
				from: 'Sender <sender@example.com>',
				to: ['Recipient 1 <recipient1@example.com>', 'recipient2@example.com'],
				subject: 'Test Subject',
				html: '<p>Test HTML</p>',
				text: 'Test plaintext',
				replyTo: undefined,
				headers: undefined,
				attachments: undefined,
				tags: undefined,
			});
		});

		it('sends email with full options', async () => {
			mockSend.mockResolvedValue({
				data: { id: 'resend-message-id-456' },
				error: null,
			});

			const fullRequest: SendEmailRequest = {
				...emailRequest,
				replyTo: { email: 'reply@example.com', name: 'Reply' },
				headers: { 'X-Custom': 'value' },
				attachments: [
					{
						filename: 'test.txt',
						content: Buffer.from('test content'),
						contentType: 'text/plain',
					},
				],
				tags: { campaign: 'test', environment: 'dev' },
			};

			await transport.send(fullRequest);

			expect(mockSend).toHaveBeenCalledWith({
				from: 'Sender <sender@example.com>',
				to: ['Recipient 1 <recipient1@example.com>', 'recipient2@example.com'],
				subject: 'Test Subject',
				html: '<p>Test HTML</p>',
				text: 'Test plaintext',
				replyTo: 'Reply <reply@example.com>',
				headers: { 'X-Custom': 'value' },
				attachments: [
					{
						filename: 'test.txt',
						content: Buffer.from('test content'),
					},
				],
				tags: [
					{ name: 'campaign', value: 'test' },
					{ name: 'environment', value: 'dev' },
				],
			});
		});

		it('throws TransportError when Resend returns error', async () => {
			mockSend.mockResolvedValue({
				data: null,
				error: { message: 'Invalid API key' },
			});

			await expect(transport.send(emailRequest)).rejects.toThrow(
				TransportError
			);
			await expect(transport.send(emailRequest)).rejects.toThrow(
				'Resend error: Invalid API key'
			);
		});

		it('throws TransportError with isTransient=false for Resend errors', async () => {
			mockSend.mockResolvedValue({
				data: null,
				error: { message: 'Rate limit exceeded' },
			});

			try {
				await transport.send(emailRequest);
				expect.fail('Should throw error');
			} catch (error) {
				expect(error).toBeInstanceOf(TransportError);
				expect((error as TransportError).isTransient).toBe(false);
				expect((error as TransportError).context).toMatchObject({
					traceId: 'test-trace-id',
					provider: 'resend',
				});
			}
		});

		it('throws TransportError with isTransient=true for unknown errors', async () => {
			mockSend.mockRejectedValue(new Error('Network timeout'));

			try {
				await transport.send(emailRequest);
				expect.fail('Should throw error');
			} catch (error) {
				expect(error).toBeInstanceOf(TransportError);
				expect((error as TransportError).isTransient).toBe(true);
				expect((error as TransportError).message).toBe('Network timeout');
			}
		});

		it('passes through TransportError without modification', async () => {
			const customError = new TransportError('Custom error', false, {
				custom: 'data',
			});
			mockSend.mockRejectedValue(customError);

			await expect(transport.send(emailRequest)).rejects.toThrow(customError);
		});

		it('handles missing messageId in response', async () => {
			mockSend.mockResolvedValue({
				data: null,
				error: null,
			});

			const result = await transport.send(emailRequest);
			expect(result.messageId).toBe('');
		});
	});

	describe('verify', () => {
		it('returns true when verification succeeds', async () => {
			mockList.mockResolvedValue({ data: [] });

			const result = await transport.verify();
			expect(result).toBe(true);
			expect(mockList).toHaveBeenCalled();
		});

		it('returns false when verification fails', async () => {
			mockList.mockRejectedValue(new Error('Unauthorized'));

			const result = await transport.verify();
			expect(result).toBe(false);
		});
	});
});
