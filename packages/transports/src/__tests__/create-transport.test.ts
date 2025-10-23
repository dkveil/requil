import { describe, expect, it } from 'vitest';
import { createTransport } from '../index';
import { ResendTransport } from '../resend/resend-transport';
import { SmtpTransport } from '../smtp/smtp-transport';
import type { ResendConfig, SmtpConfig } from '../types';

describe('createTransport', () => {
	describe('resend', () => {
		it('creates ResendTransport instance', () => {
			const config: ResendConfig = {
				type: 'resend',
				apiKey: 'test-api-key',
			};

			const transport = createTransport(config);

			expect(transport).toBeInstanceOf(ResendTransport);
		});

		it('passes configuration to ResendTransport', () => {
			const config: ResendConfig = {
				type: 'resend',
				apiKey: 'test-api-key',
				traceId: 'test-trace',
			};

			const transport = createTransport(config);

			expect(transport['config']).toEqual(config);
		});
	});

	describe('smtp', () => {
		it('creates SmtpTransport instance', () => {
			const config: SmtpConfig = {
				type: 'smtp',
				host: 'smtp.example.com',
				port: 587,
				secure: false,
				auth: {
					user: 'test@example.com',
					pass: 'password123',
				},
			};

			const transport = createTransport(config);

			expect(transport).toBeInstanceOf(SmtpTransport);
		});

		it('passes configuration to SmtpTransport', () => {
			const config: SmtpConfig = {
				type: 'smtp',
				host: 'smtp.example.com',
				port: 587,
				secure: true,
				auth: {
					user: 'test@example.com',
					pass: 'password123',
				},
				traceId: 'test-trace',
			};

			const transport = createTransport(config);

			expect(transport['config']).toEqual(config);
		});
	});

	describe('unknown type', () => {
		it('throws error for unknown transport type', () => {
			const config = {
				type: 'unknown-type',
			} as unknown as ResendConfig;

			expect(() => createTransport(config)).toThrow(
				'Unknown transport type: unknown-type'
			);
		});

		it('throws error for missing type', () => {
			const config = {} as unknown as ResendConfig;

			expect(() => createTransport(config)).toThrow(
				'Unknown transport type: undefined'
			);
		});
	});
});
