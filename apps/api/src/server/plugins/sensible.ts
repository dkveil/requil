import sensible, { FastifySensibleOptions } from '@fastify/sensible';
import fp from 'fastify-plugin';

export default fp<FastifySensibleOptions>(async (fastify) => {
	fastify.register(sensible);
});
