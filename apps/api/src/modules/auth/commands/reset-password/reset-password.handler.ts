import type {
	ResetPasswordInput,
	ResetPasswordResponse,
} from '@requil/types/auth';
import { mapSupabaseAuthError } from '@/modules/auth/domain/auth.error';
import type { Action } from '@/shared/cqrs/bus.types';
import { authActionCreator } from '../..';

export const resetPasswordAction =
	authActionCreator<ResetPasswordInput>('RESET_PASSWORD');

export default function resetPasswordHandler({
	commandBus,
	supabase,
	logger,
}: Dependencies) {
	const handler = async (
		action: Action<ResetPasswordInput>
	): Promise<ResetPasswordResponse> => {
		const { password } = action.payload;

		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			throw new Error('User not authenticated or recovery session expired');
		}

		logger.info({ userId: user.id }, 'Resetting password');

		const { error } = await supabase.auth.updateUser({
			password,
		});

		if (error) {
			logger.error({ userId: user.id, error }, 'Failed to reset password');
			throw mapSupabaseAuthError(error);
		}

		logger.info({ userId: user.id }, 'Password reset successful');

		return {
			message: 'Password has been reset successfully',
		};
	};

	const init = async () => {
		commandBus.register(resetPasswordAction.type, handler);
	};

	return {
		handler,
		init,
	};
}
