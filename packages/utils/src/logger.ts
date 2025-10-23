import { nanoid } from 'nanoid';
import pino from 'pino';

export type TraceId = string;

export const createTraceId = (): TraceId => nanoid(21);

const isDevelopment = process.env.NODE_ENV !== 'production';

export const logger = pino({
	level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
	transport: isDevelopment
		? {
				target: 'pino-pretty',
				options: {
					colorize: true,
					translateTime: 'HH:MM:ss',
					ignore: 'pid,hostname',
				},
			}
		: undefined,
	base: {
		env: process.env.NODE_ENV || 'development',
	},
	formatters: {
		level: (label: string) => {
			return { level: label };
		},
	},
});

export const createChildLogger = (traceId: TraceId) => {
	return logger.child({ traceId });
};

export type Logger = typeof logger;
