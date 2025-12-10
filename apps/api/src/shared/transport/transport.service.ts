import type { BaseTransport } from '@requil/transports';
import { createTransport } from '@requil/transports';
import { env } from '@/config';

export default function transportService() {
	const defaultTransport = createTransport({
		type: 'resend',
		apiKey: env.email.resendApiKey,
	});

	const getTransport = (
		transportType: 'default' | 'resend' | 'smtp'
	): BaseTransport => {
		if (transportType === 'default') {
			return defaultTransport;
		}

		throw new Error(`Transport type ${transportType} not yet implemented`);
	};

	return {
		defaultTransport,
		getTransport,
	};
}

declare global {
	export interface Dependencies {
		transportService: ReturnType<typeof transportService>;
	}
}
