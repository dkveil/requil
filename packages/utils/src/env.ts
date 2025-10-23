import { z } from 'zod';

export const createEnvSchema = <T extends z.ZodRawShape>(schema: T) => {
	return z.object(schema);
};

export const validateEnv = <T extends z.ZodTypeAny>(
	schema: T,
	env: Record<string, string | undefined> = process.env
): z.infer<T> => {
	const result = schema.safeParse(env);

	if (!result.success) {
		const errors = result.error.flatten().fieldErrors;
		const errorMessage = Object.entries(errors)
			.map(([field, messages]) => {
				const messageList = messages as string[] | undefined;
				return `${field}: ${messageList?.join(', ') || 'validation failed'}`;
			})
			.join('\n');

		throw new Error(`Invalid environment variables:\n${errorMessage}`);
	}

	return result.data;
};

export const requiredString = (fieldName: string) =>
	z
		.string({
			message: `${fieldName} is required`,
		})
		.min(1, `${fieldName} cannot be empty`);

export const optionalString = () => z.string().optional();

export const requiredUrl = (fieldName: string) =>
	z
		.string({
			message: `${fieldName} is required`,
		})
		.url(`${fieldName} must be a valid URL`);

export const requiredPort = (fieldName: string) =>
	z.coerce
		.number({
			message: `${fieldName} is required`,
		})
		.int()
		.min(1)
		.max(65535, `${fieldName} must be a valid port number`);

export const nodeEnv = () =>
	z.enum(['development', 'production', 'test']).default('development');
