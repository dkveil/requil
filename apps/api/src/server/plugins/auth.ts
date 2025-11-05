import { db, workspaceMembers } from '@requil/db';
import { ERROR_CODES } from '@requil/types';
import { and, eq } from 'drizzle-orm';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { verify } from 'jsonwebtoken';
import { env } from '@/config';
import { sendError } from '@/shared/app/response-wrapper';

export type AuthOptions = {
	requireWorkspace?: boolean;
	requireRole?: 'owner' | 'member';
};

async function authPlugin(fastify: FastifyInstance) {
	fastify.decorate(
		'authenticate',
		async (request: FastifyRequest, reply: FastifyReply) => {
			try {
				const token = request.cookies.requil_access_token;

				if (!token) {
					return sendError(
						reply,
						{
							code: ERROR_CODES.AUTHENTICATION_ERROR,
							message: 'Missing authentication token',
						},
						401
					);
				}

				const decoded = verify(token, env.supabase.jwtSecret) as {
					sub: string;
					email: string;
					role?: string;
				};

				request.supabaseUser = {
					id: decoded.sub,
					email: decoded.email,
					role: decoded.role,
				};
			} catch (error) {
				fastify.log.error(error, 'Authentication failed');
				return sendError(
					reply,
					{
						code: ERROR_CODES.AUTHENTICATION_ERROR,
						message: 'Invalid or expired token',
					},
					401
				);
			}
		}
	);

	fastify.decorate(
		'requireWorkspace',
		async (request: FastifyRequest, reply: FastifyReply) => {
			if (!request.supabaseUser) {
				return sendError(
					reply,
					{
						code: ERROR_CODES.AUTHENTICATION_ERROR,
						message: 'Authentication required',
					},
					401
				);
			}

			const workspaceId = request.headers['x-workspace-id'] as string;

			if (!workspaceId) {
				return sendError(
					reply,
					{
						code: ERROR_CODES.VALIDATION_ERROR,
						message: 'x-workspace-id header is required',
					},
					400
				);
			}

			const membership = await db
				.select()
				.from(workspaceMembers)
				.where(
					and(
						eq(workspaceMembers.workspaceId, workspaceId),
						eq(workspaceMembers.userId, request.supabaseUser.id)
					)
				)
				.limit(1);

			if (!(membership.length && membership[0]?.acceptedAt)) {
				return sendError(
					reply,
					{
						code: ERROR_CODES.AUTHORIZATION_ERROR,
						message: 'Access denied to this workspace',
					},
					403
				);
			}

			request.workspaceId = workspaceId;
			request.workspaceRole = membership[0].role;
		}
	);

	fastify.decorate(
		'requireOwner',
		async (request: FastifyRequest, reply: FastifyReply) => {
			if (!request.workspaceRole) {
				return sendError(
					reply,
					{
						code: ERROR_CODES.AUTHORIZATION_ERROR,
						message: 'Workspace context required',
					},
					403
				);
			}

			if (request.workspaceRole !== 'owner') {
				return sendError(
					reply,
					{
						code: ERROR_CODES.AUTHORIZATION_ERROR,
						message: 'Owner role required',
					},
					403
				);
			}
		}
	);
}

declare module 'fastify' {
	interface FastifyInstance {
		authenticate: (
			request: FastifyRequest,
			reply: FastifyReply
		) => Promise<void>;
		requireWorkspace: (
			request: FastifyRequest,
			reply: FastifyReply
		) => Promise<void>;
		requireOwner: (
			request: FastifyRequest,
			reply: FastifyReply
		) => Promise<void>;
	}
}

export default fp(authPlugin, {
	name: 'auth',
});
