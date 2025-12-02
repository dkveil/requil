import type { LogoutResponse } from '@requil/types/auth';
import { mapSupabaseAuthError } from '@/modules/auth/domain/auth.error';
import type { Action } from '@/shared/cqrs/bus.types';
import { authActionCreator } from '../..';

export interface LogoutInput {
	accessToken: string;
}

export const logoutAction = authActionCreator<LogoutInput>('LOGOUT');

export default function logoutHandler({
	commandBus,
	supabase,
	logger,
}: Dependencies) {
	const handler = async (
		action: Action<LogoutInput>
	): Promise<LogoutResponse> => {
		logger.info('User logging out');

		const { error } = await supabase.auth.admin.signOut(
			action.payload.accessToken
		);

		if (error) {
			throw mapSupabaseAuthError(error);
		}

		return {
			message: 'Successfully logged out',
		};
	};

	const init = async () => {
		commandBus.register(logoutAction.type, handler);
	};

	return {
		handler,
		init,
	};
}
