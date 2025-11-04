import { db, workspaceMembers } from '@requil/db';
import { and, eq } from 'drizzle-orm';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { verify } from 'jsonwebtoken';
import { env } from '@/config';

export type AuthOptions = {
	requireWorkspace?: boolean;
	requireRole?: 'owner' | 'member';
};

async function authPlugin(fastify: FastifyInstance) {
	fastify.decorate(
		'authenticate',
		async (request: FastifyRequest, reply: FastifyReply) => {
			try {
				const authHeader = request.headers.authorization;

				if (!authHeader?.startsWith('Bearer ')) {
					return reply.code(401).send({
						error: {
							code: 'AUTHENTICATION_ERROR',
							message: 'Missing or invalid authorization header',
						},
					});
				}

				const token = authHeader.substring(7);

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
				return reply.code(401).send({
					error: {
						code: 'AUTHENTICATION_ERROR',
						message: 'Invalid or expired token',
					},
				});
			}
		}
	);

	fastify.decorate(
		'requireWorkspace',
		async (request: FastifyRequest, reply: FastifyReply) => {
			if (!request.supabaseUser) {
				return reply.code(401).send({
					error: {
						code: 'AUTHENTICATION_ERROR',
						message: 'Authentication required',
					},
				});
			}

			const workspaceId = request.headers['x-workspace-id'] as string;

			if (!workspaceId) {
				return reply.code(400).send({
					error: {
						code: 'VALIDATION_ERROR',
						message: 'x-workspace-id header is required',
					},
				});
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
				return reply.code(403).send({
					error: {
						code: 'AUTHORIZATION_ERROR',
						message: 'Access denied to this workspace',
					},
				});
			}

			request.workspaceId = workspaceId;
			request.workspaceRole = membership[0].role;
		}
	);

	fastify.decorate(
		'requireOwner',
		async (request: FastifyRequest, reply: FastifyReply) => {
			if (!request.workspaceRole) {
				return reply.code(403).send({
					error: {
						code: 'AUTHORIZATION_ERROR',
						message: 'Workspace context required',
					},
				});
			}

			if (request.workspaceRole !== 'owner') {
				return reply.code(403).send({
					error: {
						code: 'AUTHORIZATION_ERROR',
						message: 'Owner role required',
					},
				});
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
