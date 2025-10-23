export * from './base-transport.js';
export { ResendTransport } from './resend/resend-transport.js';
export { SmtpTransport } from './smtp/smtp-transport.js';
export * from './types.js';

import type { BaseTransport } from './base-transport.js';
import { ResendTransport } from './resend/resend-transport.js';
import { SmtpTransport } from './smtp/smtp-transport.js';
import type { AnyTransportConfig } from './types.js';

export const createTransport = (config: AnyTransportConfig): BaseTransport => {
	switch (config.type) {
		case 'resend':
			return new ResendTransport(config);
		case 'smtp':
			return new SmtpTransport(config);
		default:
			throw new Error(
				`Unknown transport type: ${String((config as { type?: unknown }).type)}`
			);
	}
};
