import { successResponseSchema } from '@requil/types';
import { errorResponseSchema } from '@requil/types/api';
import { loginResponseSchema, loginSchema } from '@requil/types/auth';
import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { sendSuccess } from '@/shared/app/response-wrapper';
import { loginHandler } from './login.handler';

const loginRoute: FastifyPluginAsync = async (fastify) => {
	fastify.withTypeProvider<ZodTypeProvider>().route({
		method: 'POST',
		url: '/auth/login',
		schema: {
			body: loginSchema,
			response: {
				200: successResponseSchema(loginResponseSchema),
				400: errorResponseSchema,
				401: errorResponseSchema,
				429: errorResponseSchema,
			},
			tags: ['auth'],
		},
		handler: async (request, reply) => {
			const result = await loginHandler(request.body, fastify.supabase);

			reply
				.setCookie('requil_access_token', result.accessToken, {
					httpOnly: true,
					secure: process.env.NODE_ENV === 'production',
					sameSite: 'lax',
					path: '/',
					maxAge: result.expiresIn,
				})
				.setCookie('requil_refresh_token', result.refreshToken, {
					httpOnly: true,
					secure: process.env.NODE_ENV === 'production',
					sameSite: 'lax',
					path: '/',
					maxAge: 60 * 60 * 24 * 7,
				});

			return sendSuccess(reply, result);
		},
	});
};

export default loginRoute;
