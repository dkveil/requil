export const WORKSPACE_COOKIE = {
	NAME: 'requil_last_workspace_id',
	MAX_AGE: 60 * 60 * 24 * 365, // 1 year
	PATH: '/',
} as const;

export type CookieOptions = {
	maxAge?: number;
	path?: string;
	domain?: string;
	secure?: boolean;
	httpOnly?: boolean;
	sameSite?: 'lax' | 'strict' | 'none';
};

export function serializeCookie(
	name: string,
	value: string,
	options: CookieOptions = {}
): string {
	let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

	if (options.maxAge !== undefined) {
		cookie += `; Max-Age=${options.maxAge}`;
	}
	if (options.path) {
		cookie += `; Path=${options.path}`;
	}
	if (options.domain) {
		cookie += `; Domain=${options.domain}`;
	}
	if (options.secure) {
		cookie += '; Secure';
	}
	if (options.sameSite) {
		cookie += `; SameSite=${options.sameSite}`;
	}

	return cookie;
}

export function getCookieValue(name: string): string | null {
	if (typeof window === 'undefined') return null;

	try {
		const value = document.cookie
			.split('; ')
			.find((row) => row.startsWith(`${name}=`))
			?.split('=')[1];

		return value ? decodeURIComponent(value) : null;
	} catch {
		return null;
	}
}

export function setCookieValue(
	name: string,
	value: string,
	options: CookieOptions = {}
): void {
	if (typeof window === 'undefined') return;

	try {
		document.cookie = serializeCookie(name, value, options);
	} catch {
		// TODO: add logger
		return;
	}
}

export function deleteCookie(name: string, path = '/'): void {
	if (typeof window === 'undefined') return;

	try {
		document.cookie = serializeCookie(name, '', {
			maxAge: -1,
			path,
		});
	} catch {
		// TODO: add logger
		return;
	}
}
