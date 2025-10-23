import { describe, expect, it } from 'vitest';
import { BaseTransport } from '../base-transport.js';
import type {
	SendEmailRequest,
	SendEmailResponse,
	TransportConfig,
} from '../types.js';

class TestTransport extends BaseTransport {
	async send(request: SendEmailRequest): Promise<SendEmailResponse> {
		return {
			messageId: 'test-message-id',
			accepted: request.to.map((addr) => addr.email),
		};
	}

	async verify(): Promise<boolean> {
		return true;
	}

	public testFormatEmail(address: { email: string; name?: string }): string {
		return this.formatEmail(address);
	}
}

describe('BaseTransport', () => {
	const config: TransportConfig = {
		type: 'resend',
		traceId: 'test-trace-id',
	};

	describe('formatEmail', () => {
		it('formats email with name', () => {
			const transport = new TestTransport(config);
			const result = transport.testFormatEmail({
				email: 'test@example.com',
				name: 'Test User',
			});
			expect(result).toBe('Test User <test@example.com>');
		});

		it('formats email without name', () => {
			const transport = new TestTransport(config);
			const result = transport.testFormatEmail({
				email: 'test@example.com',
			});
			expect(result).toBe('test@example.com');
		});

		it('formats email with empty name', () => {
			const transport = new TestTransport(config);
			const result = transport.testFormatEmail({
				email: 'test@example.com',
				name: '',
			});
			expect(result).toBe('test@example.com');
		});
	});

	describe('constructor', () => {
		it('stores configuration', () => {
			const transport = new TestTransport(config);
			expect(transport['config']).toEqual(config);
		});
	});
});
