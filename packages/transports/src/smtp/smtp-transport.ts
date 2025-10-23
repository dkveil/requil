import { TransportError } from '@requil/utils/errors';
import type { Transporter } from 'nodemailer';
import nodemailer from 'nodemailer';
import { BaseTransport } from '../base-transport';
import type { SendEmailRequest, SendEmailResponse, SmtpConfig } from '../types';

export class SmtpTransport extends BaseTransport {
	private transporter: Transporter;

	constructor(config: SmtpConfig) {
		super(config);
		this.transporter = nodemailer.createTransport({
			host: config.host,
			port: config.port,
			secure: config.secure,
			auth: config.auth,
		});
	}

	async send(request: SendEmailRequest): Promise<SendEmailResponse> {
		try {
			const info = await this.transporter.sendMail({
				from: this.formatEmail(request.from),
				to: request.to.map((addr) => this.formatEmail(addr)).join(', '),
				subject: request.subject,
				html: request.html,
				text: request.plaintext,
				replyTo: request.replyTo
					? this.formatEmail(request.replyTo)
					: undefined,
				headers: request.headers,
				attachments: request.attachments,
			});

			return {
				messageId: info.messageId,
				accepted: info.accepted as string[],
				rejected: info.rejected?.map((email: string) => ({
					email: String(email),
					reason: 'Rejected by SMTP server',
				})),
				transportMetadata: {
					provider: 'smtp',
					response: info.response,
				},
			};
		} catch (error) {
			const isTransient =
				error instanceof Error &&
				(error.message.includes('timeout') ||
					error.message.includes('ECONNREFUSED') ||
					error.message.includes('ETIMEDOUT'));

			throw new TransportError(
				error instanceof Error ? error.message : 'Unknown SMTP error',
				isTransient,
				{
					traceId: this.config.traceId,
					provider: 'smtp',
					originalError: error,
				}
			);
		}
	}

	async verify(): Promise<boolean> {
		try {
			await this.transporter.verify();
			return true;
		} catch {
			return false;
		}
	}
}
