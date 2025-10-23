export * from './base-transport';
export { ResendTransport } from './resend/resend-transport';
export { SmtpTransport } from './smtp/smtp-transport';
export * from './types';

import type { BaseTransport } from './base-transport';
import { ResendTransport } from './resend/resend-transport';
import { SmtpTransport } from './smtp/smtp-transport';
import type { AnyTransportConfig } from './types';

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
