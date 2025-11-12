import { z } from 'zod';

export type Block = {
	id: string;
	type: string;
	name?: string;
	props: Record<string, unknown>;
	children?: Block[];
	slots?: Record<string, Block[]>;
};

export const BlockSchema: z.ZodType<Block> = z.lazy(() =>
	z.object({
		id: z.uuid(),
		type: z.string(),
		name: z.string().optional(),
		props: z.record(z.string(), z.unknown()),
		children: z.array(BlockSchema).optional(),
		slots: z.record(z.string(), z.array(BlockSchema)).optional(),
	})
);

export const DocumentSchema = z.object({
	version: z.string().default('1.0'),
	root: BlockSchema,
	metadata: z
		.object({
			title: z.string().optional(),
			description: z.string().optional(),
			createdAt: z.iso.datetime().optional(),
			updatedAt: z.iso.datetime().optional(),
		})
		.optional(),
});

export type Document = z.infer<typeof DocumentSchema>;
