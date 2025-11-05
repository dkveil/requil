const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
	info: (...args: unknown[]) => {
		if (isDevelopment) {
			console.log(...args);
		}
	},
	error: (...args: unknown[]) => {
		if (isDevelopment) {
			console.error(...args);
		}
	},
	warn: (...args: unknown[]) => {
		if (isDevelopment) {
			console.warn(...args);
		}
	},
	debug: (...args: unknown[]) => {
		if (isDevelopment) {
			console.debug(...args);
		}
	},
};
