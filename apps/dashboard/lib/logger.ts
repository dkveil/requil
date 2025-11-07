import pino from 'pino';

const isEdgeRuntime = process.env.NEXT_RUNTIME === 'edge';
const isProduction = process.env.NODE_ENV === 'production';

const transport = !(isEdgeRuntime || isProduction)
	? {
			target: 'pino-pretty',
			options: {
				colorize: true,
				ignore: 'pid,hostname',
				translateTime: 'SYS:standard',
			},
		}
	: undefined;
const formatters = {
	level: (label: string) => ({ level: label.toUpperCase() }),
};

const logger = pino({
	level: process.env.LOG_LEVEL || 'info',
	timestamp: pino.stdTimeFunctions.isoTime,
	transport,
	formatters,
});

export default logger;
