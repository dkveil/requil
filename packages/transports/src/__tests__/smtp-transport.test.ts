import { TransportError } from '@requil/utils/errors';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SmtpTransport } from '../smtp/smtp-transport';
import type { SendEmailRequest, SmtpConfig } from '../types';

const mockSendMail = vi.fn();
const mockVerify = vi.fn();

vi.mock('nodemailer', () => ({
	default: {
		createTransport: vi.fn(() => ({
			sendMail: mockSendMail,
			verify: mockVerify,
		})),
	},
}));

describe('SmtpTransport', () => {
	const config: SmtpConfig = {
		type: 'smtp',
		host: 'smtp.example.com',
		port: 587,
		secure: false,
		auth: {
			user: 'test@example.com',
			pass: 'password123',
		},
		traceId: 'test-trace-id',
	};

	let transport: SmtpTransport;

	beforeEach(() => {
		vi.clearAllMocks();
		transport = new SmtpTransport(config);
	});

	describe('constructor', () => {
		it('creates transporter with correct configuration', async () => {
			const nodemailer = await import('nodemailer');
			expect(nodemailer.default.createTransport).toHaveBeenCalledWith({
				host: 'smtp.example.com',
				port: 587,
				secure: false,
				auth: {
					user: 'test@example.com',
					pass: 'password123',
				},
			});
		});
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
			mockSendMail.mockResolvedValue({
				messageId: '<smtp-message-id@example.com>',
				accepted: ['recipient1@example.com', 'recipient2@example.com'],
				rejected: [],
				response: '250 Message accepted',
			});

			const result = await transport.send(emailRequest);

			expect(result).toEqual({
				messageId: '<smtp-message-id@example.com>',
				accepted: ['recipient1@example.com', 'recipient2@example.com'],
				rejected: [],
				transportMetadata: {
					provider: 'smtp',
					response: '250 Message accepted',
				},
			});

			expect(mockSendMail).toHaveBeenCalledWith({
				from: 'Sender <sender@example.com>',
				to: 'Recipient 1 <recipient1@example.com>, recipient2@example.com',
				subject: 'Test Subject',
				html: '<p>Test HTML</p>',
				text: 'Test plaintext',
				replyTo: undefined,
				headers: undefined,
				attachments: undefined,
			});
		});

		it('sends email with full options', async () => {
			mockSendMail.mockResolvedValue({
				messageId: '<smtp-message-id@example.com>',
				accepted: ['recipient1@example.com'],
				rejected: [],
				response: '250 OK',
			});

			const fullRequest: SendEmailRequest = {
				...emailRequest,
				replyTo: { email: 'reply@example.com', name: 'Reply' },
				headers: { 'X-Custom': 'value' },
				attachments: [
					{
						filename: 'test.pdf',
						content: Buffer.from('pdf content'),
						contentType: 'application/pdf',
					},
				],
			};

			await transport.send(fullRequest);

			expect(mockSendMail).toHaveBeenCalledWith({
				from: 'Sender <sender@example.com>',
				to: 'Recipient 1 <recipient1@example.com>, recipient2@example.com',
				subject: 'Test Subject',
				html: '<p>Test HTML</p>',
				text: 'Test plaintext',
				replyTo: 'Reply <reply@example.com>',
				headers: { 'X-Custom': 'value' },
				attachments: [
					{
						filename: 'test.pdf',
						content: Buffer.from('pdf content'),
						contentType: 'application/pdf',
					},
				],
			});
		});

		it('handles rejected emails', async () => {
			mockSendMail.mockResolvedValue({
				messageId: '<smtp-message-id@example.com>',
				accepted: ['recipient1@example.com'],
				rejected: ['invalid@example.com'],
				response: '250 Partial success',
			});

			const result = await transport.send(emailRequest);

			expect(result.rejected).toEqual([
				{ email: 'invalid@example.com', reason: 'Rejected by SMTP server' },
			]);
		});

		it('throws TransportError with isTransient=true for timeout errors', async () => {
			mockSendMail.mockRejectedValue(new Error('Connection timeout'));

			try {
				await transport.send(emailRequest);
				expect.fail('Should throw error');
			} catch (error) {
				expect(error).toBeInstanceOf(TransportError);
				expect((error as TransportError).isTransient).toBe(true);
				expect((error as TransportError).message).toBe('Connection timeout');
				expect((error as TransportError).context).toMatchObject({
					traceId: 'test-trace-id',
					provider: 'smtp',
				});
			}
		});

		it('throws TransportError with isTransient=true for ECONNREFUSED', async () => {
			mockSendMail.mockRejectedValue(new Error('connect ECONNREFUSED'));

			try {
				await transport.send(emailRequest);
				expect.fail('Should throw error');
			} catch (error) {
				expect(error).toBeInstanceOf(TransportError);
				expect((error as TransportError).isTransient).toBe(true);
			}
		});

		it('throws TransportError with isTransient=true for ETIMEDOUT', async () => {
			mockSendMail.mockRejectedValue(new Error('Connection ETIMEDOUT'));

			try {
				await transport.send(emailRequest);
				expect.fail('Should throw error');
			} catch (error) {
				expect(error).toBeInstanceOf(TransportError);
				expect((error as TransportError).isTransient).toBe(true);
			}
		});

		it('throws TransportError with isTransient=false for other errors', async () => {
			mockSendMail.mockRejectedValue(new Error('Invalid credentials'));

			try {
				await transport.send(emailRequest);
				expect.fail('Should throw error');
			} catch (error) {
				expect(error).toBeInstanceOf(TransportError);
				expect((error as TransportError).isTransient).toBe(false);
				expect((error as TransportError).message).toBe('Invalid credentials');
			}
		});

		it('handles unknown errors', async () => {
			mockSendMail.mockRejectedValue('String error');

			try {
				await transport.send(emailRequest);
				expect.fail('Should throw error');
			} catch (error) {
				expect(error).toBeInstanceOf(TransportError);
				expect((error as TransportError).message).toBe('Unknown SMTP error');
			}
		});
	});

	describe('verify', () => {
		it('returns true when verification succeeds', async () => {
			mockVerify.mockResolvedValue(true);

			const result = await transport.verify();
			expect(result).toBe(true);
			expect(mockVerify).toHaveBeenCalled();
		});

		it('returns false when verification fails', async () => {
			mockVerify.mockRejectedValue(new Error('Connection failed'));

			const result = await transport.verify();
			expect(result).toBe(false);
		});
	});
});
