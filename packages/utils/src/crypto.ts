import { createHash, randomBytes } from 'node:crypto';
import * as argon2 from 'argon2';

const API_KEY_REGEX = /^rql_[A-Za-z0-9_-]{43}$/;

export const generateRandomToken = (bytes = 32): string => {
	return randomBytes(bytes).toString('base64url');
};

export const hashToken = (token: string): string => {
	return createHash('sha256').update(token).digest('base64url');
};

export const hashApiKey = async (key: string): Promise<string> => {
	return argon2.hash(key, {
		type: argon2.argon2id,
		memoryCost: 65536,
		timeCost: 3,
		parallelism: 4,
	});
};

export const verifyApiKey = async (
	hash: string,
	key: string
): Promise<boolean> => {
	try {
		return await argon2.verify(hash, key);
	} catch {
		return false;
	}
};

export const generateApiKey = async (): Promise<{
	key: string;
	prefix: string;
	hash: string;
}> => {
	const prefix = 'rql';
	const secret = generateRandomToken(32);
	const key = `${prefix}_${secret}`;
	const hash = await hashApiKey(key);

	const keyPrefixLength = 12;
	const displayPrefix = key.substring(0, keyPrefixLength);

	return { key, prefix: displayPrefix, hash };
};

export const verifyApiKeyFormat = (key: string): boolean => {
	return API_KEY_REGEX.test(key);
};

export const hashString = (input: string): string => {
	return createHash('sha256').update(input).digest('hex');
};

export const generateNonce = (): string => {
	return randomBytes(16).toString('hex');
};

export const createHmacSignature = (
	payload: string,
	secret: string
): string => {
	return createHash('sha256')
		.update(payload + secret)
		.digest('hex');
};

export const verifyHmacSignature = (
	payload: string,
	signature: string,
	secret: string,
	maxAge?: number
): boolean => {
	const expectedSignature = createHmacSignature(payload, secret);
	const signatureValid = signature === expectedSignature;

	if (!signatureValid) {
		return false;
	}

	if (maxAge) {
		try {
			const parsed = JSON.parse(payload);
			const timestamp = parsed.timestamp;
			if (!timestamp) return false;

			const age = Date.now() - timestamp;
			return age <= maxAge;
		} catch {
			return false;
		}
	}

	return true;
};
