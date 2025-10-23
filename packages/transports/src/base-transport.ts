import type {
	SendEmailRequest,
	SendEmailResponse,
	TransportConfig,
} from './types';

export abstract class BaseTransport {
	protected config: TransportConfig;

	constructor(config: TransportConfig) {
		this.config = config;
	}

	abstract send(request: SendEmailRequest): Promise<SendEmailResponse>;

	abstract verify(): Promise<boolean>;

	protected formatEmail(address: { email: string; name?: string }): string {
		return address.name ? `${address.name} <${address.email}>` : address.email;
	}
}
