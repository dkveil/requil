import type {
	ForgotPasswordInput,
	ForgotPasswordResponse,
} from '@requil/types/auth';
import { env } from '@/config';
import { mapSupabaseAuthError } from '@/modules/auth/domain/auth.error';
import type { Action } from '@/shared/cqrs/bus.types';
import { authActionCreator } from '../..';

export const forgotPasswordAction =
	authActionCreator<ForgotPasswordInput>('FORGOT_PASSWORD');

export default function forgotPasswordHandler({
	commandBus,
	supabase,
	logger,
}: Dependencies) {
	const handler = async (
		action: Action<ForgotPasswordInput>
	): Promise<ForgotPasswordResponse> => {
		const { email } = action.payload;

		logger.info({ email }, 'Password reset requested');

		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${env.frontendUrl}/auth/reset-password`,
		});

		if (error) {
			logger.error({ email, error }, 'Failed to send password reset email');
			throw mapSupabaseAuthError(error, { email });
		}

		return {
			message:
				'If an account exists for this email, you will receive a password reset link.',
		};
	};

	const init = async () => {
		commandBus.register(forgotPasswordAction.type, handler);
	};

	return {
		handler,
		init,
	};
}
