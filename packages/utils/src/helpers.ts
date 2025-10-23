const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const sleep = (ms: number): Promise<void> => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};

export const calculateBackoff = (
	attempt: number,
	initialDelay: number,
	maxDelay: number,
	multiplier: number
): number => {
	const delay = initialDelay * multiplier ** (attempt - 1);
	return Math.min(delay, maxDelay);
};

export const isEmail = (email: string): boolean => {
	return EMAIL_REGEX.test(email);
};

export const normalizeEmail = (email: string): string => {
	return email.toLowerCase().trim();
};

export const truncate = (str: string, maxLength: number): string => {
	if (str.length <= maxLength) return str;
	return `${str.slice(0, maxLength - 3)}...`;
};

export const chunk = <T>(array: T[], size: number): T[][] => {
	const chunks: T[][] = [];
	for (let i = 0; i < array.length; i += size) {
		chunks.push(array.slice(i, i + size));
	}
	return chunks;
};

export const omit = <T extends Record<string, unknown>, K extends keyof T>(
	obj: T,
	keys: K[]
): Omit<T, K> => {
	const result = { ...obj };
	for (const key of keys) {
		delete result[key];
	}
	return result;
};

export const pick = <T extends Record<string, unknown>, K extends keyof T>(
	obj: T,
	keys: K[]
): Pick<T, K> => {
	const result = {} as Pick<T, K>;
	for (const key of keys) {
		if (key in obj) {
			result[key] = obj[key];
		}
	}
	return result;
};

export const safeJsonParse = <T = unknown>(
	json: string,
	fallback?: T
): T | undefined => {
	try {
		return JSON.parse(json) as T;
	} catch {
		return fallback;
	}
};
