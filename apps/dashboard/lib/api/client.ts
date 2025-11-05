import { ERROR_CODES, ErrorResponse, SuccessResponse } from '@requil/types';
import { ApiClientError, parseApiError } from './error';

export type FetchOptions = RequestInit & {
	timeout?: number;
	accessToken?: string;
	refreshToken?: string;
};

function isError(error: unknown): error is Error {
	return error instanceof Error;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function fetchAPI<T>(
	endpoint: string,
	options: FetchOptions = {}
): Promise<SuccessResponse<T>> {
	const { timeout = 10000, headers: customHeaders, ...rest } = options;

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeout);

	const defaultHeaders: HeadersInit = {
		Accept: 'application/json',
	};

	if (rest.body) {
		defaultHeaders['Content-Type'] = 'application/json';
	}

	const headers: HeadersInit = {
		...defaultHeaders,
		...customHeaders,
	};

	const config: RequestInit = {
		...rest,
		headers,
		signal: controller.signal,
		credentials: 'include',
	};

	const url = `${API_URL}${endpoint}`;

	try {
		const response = await fetch(url, config);

		clearTimeout(timeoutId);

		const responseData = await response.json();

		if (!response.ok) {
			const errorData: ErrorResponse = responseData as ErrorResponse;
			throw parseApiError(errorData, response.status);
		}

		return responseData as SuccessResponse<T>;
	} catch (err) {
		clearTimeout(timeoutId);

		if (err instanceof ApiClientError) {
			throw err;
		}

		const error = isError(err) ? err : new Error('Unknown error');

		throw new ApiClientError(error.message, ERROR_CODES.INTERNAL_ERROR, 500);
	}
}
