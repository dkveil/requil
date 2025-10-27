import fp from 'fastify-plugin';

export default fp(async (fastify) => {
	fastify.decorate('someSupport', () => 'hugs');
});

declare module 'fastify' {
	export interface FastifyInstance {
		someSupport(): string;
	}
}
