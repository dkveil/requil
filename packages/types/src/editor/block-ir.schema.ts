import { z } from 'zod';

export type BlockIR = {
	id: string;
	type: string;
	name?: string;
	props: Record<string, unknown>;
	children?: BlockIR[];
	slots?: Record<string, BlockIR[]>;
};

export const BlockSchema: z.ZodType<BlockIR> = z.lazy(() =>
	z.object({
		id: z.uuid(),
		type: z.string(),
		name: z.string().optional(),
		props: z.record(z.string(), z.unknown()),
		children: z.array(BlockSchema).optional(),
		slots: z.record(z.string(), z.array(BlockSchema)).optional(),
	})
);

export const VariableSchema = z.object({
	id: z.string(),
	name: z.string(),
	label: z.string().optional(),
	defaultValue: z.string().optional(),
});

export type Variable = z.infer<typeof VariableSchema>;

export const DocumentSchema = z.object({
	version: z.string().default('1.0'),
	root: BlockSchema,
	variables: z.array(VariableSchema).default([]),
	metadata: z
		.object({
			title: z.string().optional(),
			description: z.string().optional(),
			subject: z.string().optional(),
			preheader: z.string().optional(),
			senderName: z.string().optional(),
			senderEmail: z.string().optional(),
			replyToEmail: z.string().optional(),
			useReplyTo: z.boolean().optional(),
			createdAt: z.iso.datetime().optional(),
			updatedAt: z.iso.datetime().optional(),
		})
		.optional(),
});

export type Document = z.infer<typeof DocumentSchema>;
