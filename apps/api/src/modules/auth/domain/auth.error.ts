import { ERROR_CODES } from '@requil/types';
import type { ErrorContext } from '@requil/utils';
import {
	AuthenticationError,
	ConflictError,
	RateLimitError,
	ValidationError,
} from '@requil/utils';
import type { AuthError } from '@supabase/supabase-js';

export class UserAlreadyExistsError extends ConflictError {
	constructor(email: string, context: ErrorContext = {}) {
		super(`User with email "${email}" already exists`, { ...context, email });
		Object.setPrototypeOf(this, UserAlreadyExistsError.prototype);
		this.name = ERROR_CODES.USER_ALREADY_EXISTS;
	}
}

export class WeakPasswordError extends ValidationError {
	constructor(message: string, context: ErrorContext = {}) {
		super(`Password is too weak: ${message}`, context);
		Object.setPrototypeOf(this, WeakPasswordError.prototype);
		this.name = ERROR_CODES.WEAK_PASSWORD;
	}
}

export class InvalidCredentialsError extends AuthenticationError {
	constructor(context: ErrorContext = {}) {
		super('Invalid email or password', context);
		Object.setPrototypeOf(this, InvalidCredentialsError.prototype);
		this.name = ERROR_CODES.INVALID_CREDENTIALS;
	}
}

export class EmailProviderDisabledError extends ValidationError {
	constructor(context: ErrorContext = {}) {
		super('Email provider is disabled', context);
		Object.setPrototypeOf(this, EmailProviderDisabledError.prototype);
		this.name = ERROR_CODES.EMAIL_PROVIDER_DISABLED;
	}
}

export class EmailRateLimitExceededError extends RateLimitError {
	constructor(email: string, context: ErrorContext = {}) {
		super(
			`Too many emails sent to "${email}". Please wait before trying again.`,
			300,
			{ ...context, email }
		);
		Object.setPrototypeOf(this, EmailRateLimitExceededError.prototype);
		this.name = ERROR_CODES.EMAIL_RATE_LIMIT_EXCEEDED;
	}
}

export class EmailNotConfirmedError extends AuthenticationError {
	constructor(context: ErrorContext = {}) {
		super('Email address is not confirmed', context);
		Object.setPrototypeOf(this, EmailNotConfirmedError.prototype);
		this.name = ERROR_CODES.EMAIL_NOT_CONFIRMED;
	}
}

export class PhoneNotConfirmedError extends AuthenticationError {
	constructor(context: ErrorContext = {}) {
		super('Phone number is not confirmed', context);
		Object.setPrototypeOf(this, PhoneNotConfirmedError.prototype);
		this.name = ERROR_CODES.PHONE_NOT_CONFIRMED;
	}
}

export class UserNotFoundError extends ValidationError {
	constructor(context: ErrorContext = {}) {
		super('User not found', context);
		Object.setPrototypeOf(this, UserNotFoundError.prototype);
		this.name = ERROR_CODES.USER_NOT_FOUND;
	}
}

export class SessionNotFoundError extends AuthenticationError {
	constructor(context: ErrorContext = {}) {
		super('Session not found', context);
		Object.setPrototypeOf(this, SessionNotFoundError.prototype);
		this.name = ERROR_CODES.SESSION_NOT_FOUND;
	}
}

export class SessionExpiredError extends AuthenticationError {
	constructor(context: ErrorContext = {}) {
		super('Session has expired', context);
		Object.setPrototypeOf(this, SessionExpiredError.prototype);
		this.name = ERROR_CODES.SESSION_EXPIRED;
	}
}

export class RefreshTokenNotFoundError extends AuthenticationError {
	constructor(context: ErrorContext = {}) {
		super('Refresh token not found', context);
		Object.setPrototypeOf(this, RefreshTokenNotFoundError.prototype);
		this.name = ERROR_CODES.REFRESH_TOKEN_NOT_FOUND;
	}
}

export class RefreshTokenAlreadyUsedError extends AuthenticationError {
	constructor(context: ErrorContext = {}) {
		super('Refresh token has already been used', context);
		Object.setPrototypeOf(this, RefreshTokenAlreadyUsedError.prototype);
		this.name = ERROR_CODES.REFRESH_TOKEN_ALREADY_USED;
	}
}

export class OtpExpiredError extends ValidationError {
	constructor(context: ErrorContext = {}) {
		super('OTP code has expired', context);
		Object.setPrototypeOf(this, OtpExpiredError.prototype);
		this.name = ERROR_CODES.OTP_EXPIRED;
	}
}

export class OtpDisabledError extends ValidationError {
	constructor(context: ErrorContext = {}) {
		super('OTP login is disabled', context);
		Object.setPrototypeOf(this, OtpDisabledError.prototype);
		this.name = ERROR_CODES.OTP_DISABLED;
	}
}

export class CaptchaFailedError extends ValidationError {
	constructor(context: ErrorContext = {}) {
		super('CAPTCHA verification failed', context);
		Object.setPrototypeOf(this, CaptchaFailedError.prototype);
		this.name = ERROR_CODES.CAPTCHA_FAILED;
	}
}

export class AnonymousProviderDisabledError extends ValidationError {
	constructor(context: ErrorContext = {}) {
		super('Anonymous sign-in is disabled', context);
		Object.setPrototypeOf(this, AnonymousProviderDisabledError.prototype);
		this.name = ERROR_CODES.ANONYMOUS_PROVIDER_DISABLED;
	}
}

export class PhoneProviderDisabledError extends ValidationError {
	constructor(context: ErrorContext = {}) {
		super('Phone authentication is disabled', context);
		Object.setPrototypeOf(this, PhoneProviderDisabledError.prototype);
		this.name = ERROR_CODES.PHONE_PROVIDER_DISABLED;
	}
}

export class ProviderDisabledError extends ValidationError {
	constructor(context: ErrorContext = {}) {
		super('This authentication provider is disabled', context);
		Object.setPrototypeOf(this, ProviderDisabledError.prototype);
		this.name = ERROR_CODES.PROVIDER_DISABLED;
	}
}

export class SignupDisabledError extends ValidationError {
	constructor(context: ErrorContext = {}) {
		super('Sign-ups are disabled', context);
		Object.setPrototypeOf(this, SignupDisabledError.prototype);
		this.name = ERROR_CODES.SIGNUP_DISABLED;
	}
}

export class UserBannedError extends AuthenticationError {
	constructor(context: ErrorContext = {}) {
		super('User account has been banned', context);
		Object.setPrototypeOf(this, UserBannedError.prototype);
		this.name = ERROR_CODES.USER_BANNED;
	}
}

export class ReauthenticationNeededError extends AuthenticationError {
	constructor(context: ErrorContext = {}) {
		super('Please reauthenticate to continue', context);
		Object.setPrototypeOf(this, ReauthenticationNeededError.prototype);
		this.name = ERROR_CODES.REAUTHENTICATION_NEEDED;
	}
}

export class SamePasswordError extends ValidationError {
	constructor(context: ErrorContext = {}) {
		super('New password must be different from current password', context);
		Object.setPrototypeOf(this, SamePasswordError.prototype);
		this.name = ERROR_CODES.SAME_PASSWORD;
	}
}

export function mapSupabaseAuthError(
	authError: AuthError,
	context: { email?: string } = {}
): Error {
	const errorMap: Record<string, () => Error> = {
		user_already_exists: () =>
			new UserAlreadyExistsError(context.email || 'unknown'),
		email_exists: () => new UserAlreadyExistsError(context.email || 'unknown'),
		weak_password: () => new WeakPasswordError(authError.message),
		email_provider_disabled: () => new EmailProviderDisabledError(),
		over_email_send_rate_limit: () =>
			new EmailRateLimitExceededError(context.email || 'unknown'),
		email_not_confirmed: () => new EmailNotConfirmedError(),
		phone_not_confirmed: () => new PhoneNotConfirmedError(),
		invalid_credentials: () => new InvalidCredentialsError(),
		user_not_found: () => new UserNotFoundError(),
		session_not_found: () => new SessionNotFoundError(),
		session_expired: () => new SessionExpiredError(),
		refresh_token_not_found: () => new RefreshTokenNotFoundError(),
		refresh_token_already_used: () => new RefreshTokenAlreadyUsedError(),
		otp_expired: () => new OtpExpiredError(),
		otp_disabled: () => new OtpDisabledError(),
		captcha_failed: () => new CaptchaFailedError(),
		anonymous_provider_disabled: () => new AnonymousProviderDisabledError(),
		phone_provider_disabled: () => new PhoneProviderDisabledError(),
		provider_disabled: () => new ProviderDisabledError(),
		signup_disabled: () => new SignupDisabledError(),
		user_banned: () => new UserBannedError(),
		reauthentication_needed: () => new ReauthenticationNeededError(),
		same_password: () => new SamePasswordError(),
	};

	const errorFactory = authError.code ? errorMap[authError.code] : undefined;

	return errorFactory
		? errorFactory()
		: new Error(`Authentication failed: ${authError.message}`);
}
