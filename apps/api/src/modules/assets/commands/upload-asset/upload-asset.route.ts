import {
	errorResponseSchema,
	successResponseSchema,
	uploadAssetResponseSchema,
} from '@requil/types';
import { API_ROUTES } from '@requil/utils/api-routes';
import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { sendSuccess } from '@/shared/app/response-wrapper';
import { AssetValidationError } from '../../domain/asset.error';
import { uploadAssetAction } from './upload-asset.handler';

const uploadAssetRoute: FastifyPluginAsync = async (fastify) => {
	await fastify.register(import('@fastify/multipart'), {
		limits: {
			fileSize: 10 * 1024 * 1024,
		},
	});

	fastify.withTypeProvider<ZodTypeProvider>().route({
		method: 'POST',
		url: API_ROUTES.ASSET.UPLOAD,
		schema: {
			response: {
				201: successResponseSchema(uploadAssetResponseSchema),
				400: errorResponseSchema,
				401: errorResponseSchema,
				403: errorResponseSchema,
				413: errorResponseSchema,
			},
			tags: ['assets'],
		},
		onRequest: [fastify.authenticate],
		handler: async (request, reply) => {
			const userId = request.supabaseUser?.id;

			const data = await request.file();

			if (!data) {
				throw new AssetValidationError('File is required');
			}

			const workspaceId = data.fields.workspaceId as any;
			const type = data.fields.type as any;
			const alt = data.fields.alt as any;

			if (!workspaceId?.value || typeof workspaceId.value !== 'string') {
				throw new AssetValidationError('workspaceId is required');
			}

			if (!type?.value || (type.value !== 'image' && type.value !== 'font')) {
				throw new AssetValidationError('type must be "image" or "font"');
			}

			const buffer = await data.toBuffer();

			const result = await fastify.commandBus.execute(
				uploadAssetAction(
					{
						workspaceId: workspaceId.value,
						type: type.value,
						alt: alt?.value,
						file: {
							filename: data.filename,
							mimetype: data.mimetype,
							buffer,
						},
					},
					{ userId }
				)
			);

			return sendSuccess(reply, result, 201);
		},
	});
};

export default uploadAssetRoute;
