import { apiKeyScopes, apiKeys, db } from '@requil/db';
import { ERROR_CODES } from '@requil/types';
import bcryptjs from 'bcryptjs';
import { eq, sql } from 'drizzle-orm';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import jwt from 'jsonwebtoken';
import { env } from '@/config';
import { sendError } from '@/shared/app/response-wrapper';

const { verify } = jwt;

export type DualAuthOptions = {
	requireScope?: string;
};

async function dualAuthPlugin(fastify: FastifyInstance) {
	fastify.decorate(
		'authenticateApiOrSession',
		async (
			request: FastifyRequest,
			reply: FastifyReply,
			options?: DualAuthOptions
		) => {
			const authHeader = request.headers.authorization;
			const sessionToken = request.cookies.requil_access_token;

			if (authHeader?.startsWith('Bearer ')) {
				const apiKey = authHeader.substring(7);

				if (!apiKey.startsWith('rql_')) {
					return sendError(
						reply,
						{
							code: ERROR_CODES.AUTHENTICATION_ERROR,
							message: 'Invalid API key format',
						},
						401
					);
				}

				const keyPrefix = apiKey.substring(0, 12);

				const [keyRecord] = await db
					.select({
						id: apiKeys.id,
						workspaceId: apiKeys.workspaceId,
						keyHash: apiKeys.keyHash,
						revokedAt: apiKeys.revokedAt,
						expiresAt: apiKeys.expiresAt,
						scopes: sql<string[]>`array_agg(${apiKeyScopes.scope})`,
					})
					.from(apiKeys)
					.leftJoin(apiKeyScopes, eq(apiKeys.id, apiKeyScopes.apiKeyId))
					.where(eq(apiKeys.keyPrefix, keyPrefix))
					.groupBy(
						apiKeys.id,
						apiKeys.workspaceId,
						apiKeys.keyHash,
						apiKeys.revokedAt,
						apiKeys.expiresAt
					)
					.limit(1);

				if (!keyRecord) {
					return sendError(
						reply,
						{
							code: ERROR_CODES.AUTHENTICATION_ERROR,
							message: 'Invalid API key',
						},
						401
					);
				}

				if (keyRecord.revokedAt) {
					return sendError(
						reply,
						{
							code: ERROR_CODES.AUTHENTICATION_ERROR,
							message: 'API key has been revoked',
						},
						401
					);
				}

				if (
					keyRecord.expiresAt &&
					new Date(keyRecord.expiresAt) <= new Date()
				) {
					return sendError(
						reply,
						{
							code: ERROR_CODES.AUTHENTICATION_ERROR,
							message: 'API key has expired',
						},
						401
					);
				}

				const isValidKey = bcryptjs.compareSync(apiKey, keyRecord.keyHash);

				if (!isValidKey) {
					return sendError(
						reply,
						{
							code: ERROR_CODES.AUTHENTICATION_ERROR,
							message: 'Invalid API key',
						},
						401
					);
				}

				if (options?.requireScope) {
					const hasScope = keyRecord.scopes?.includes(options.requireScope);

					if (!hasScope) {
						return sendError(
							reply,
							{
								code: ERROR_CODES.AUTHORIZATION_ERROR,
								message: `API key missing required scope: ${options.requireScope}`,
							},
							403
						);
					}
				}

				request.apiKey = {
					id: keyRecord.id,
					workspaceId: keyRecord.workspaceId,
					scopes: keyRecord.scopes || [],
				};

				request.workspaceId = keyRecord.workspaceId;
				request.authMethod = 'api_key';

				await db
					.update(apiKeys)
					.set({ lastUsedAt: new Date().toISOString() })
					.where(eq(apiKeys.id, keyRecord.id));

				return;
			}

			if (sessionToken) {
				try {
					const decoded = verify(sessionToken, env.supabase.jwtSecret) as {
						sub: string;
						email: string;
						role?: string;
					};

					request.supabaseUser = {
						id: decoded.sub,
						email: decoded.email,
						role: decoded.role,
					};

					request.authMethod = 'session';

					const workspaceId = request.headers['x-workspace-id'] as string;

					if (workspaceId) {
						request.workspaceId = workspaceId;
					}

					return;
				} catch (error) {
					fastify.log.error(error, 'Session authentication failed');
					return sendError(
						reply,
						{
							code: ERROR_CODES.AUTHENTICATION_ERROR,
							message: 'Invalid or expired session',
						},
						401
					);
				}
			}

			return sendError(
				reply,
				{
					code: ERROR_CODES.AUTHENTICATION_ERROR,
					message: 'Authentication required (API key or session)',
				},
				401
			);
		}
	);
}

declare module 'fastify' {
	interface FastifyInstance {
		authenticateApiOrSession: (
			request: FastifyRequest,
			reply: FastifyReply,
			options?: DualAuthOptions
		) => Promise<void>;
	}

	interface FastifyRequest {
		apiKey?: {
			id: string;
			workspaceId: string;
			scopes: string[];
		};
		authMethod?: 'api_key' | 'session';
	}
}

export default fp(dualAuthPlugin, {
	name: 'dual-auth',
});
