import { ERROR_CODES, ErrorResponse, SuccessResponse } from '@requil/types';
import { ApiClientError, parseApiError } from '../api/error-handler';

type FetchOptions = RequestInit & {
	timeout?: number;
	accessToken?: string;
	refreshToken?: string;
};

function isError(error: unknown): error is Error {
	return error instanceof Error;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function fetchAPI<T>(
	endpoint: string,
	options: FetchOptions = {}
): Promise<SuccessResponse<T>> {
	const { timeout = 10000, headers: customHeaders, ...rest } = options;

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeout);

	const defaultHeaders: HeadersInit = {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	};

	const headers: HeadersInit = {
		...defaultHeaders,
		...customHeaders,
		credentials: 'include',
	};

	const config: RequestInit = {
		...rest,
		headers,
		signal: controller.signal,
	};

	const url = `${API_URL}${endpoint}`;

	try {
		const response = await fetch(url, config);

		clearTimeout(timeoutId);

		if (!response.ok) {
			const errorData: ErrorResponse = await response.json().catch(() => ({
				error: {
					message: 'Wystąpił nieoczekiwany błąd',
					code: ERROR_CODES.UNKNOWN_ERROR,
				},
			}));

			throw parseApiError(errorData, response.status);
		}

		return await response.json();
	} catch (err) {
		const error = isError(err) ? err : new Error('Unknown error');

		throw new ApiClientError(
			error.message,
			ERROR_CODES.INTERNAL_ERROR,
			500,
			undefined,
			undefined
		);
	}
}
