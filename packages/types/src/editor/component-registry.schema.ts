import { z } from 'zod';

export const ComponentCategorySchema = z.enum([
	'layout',
	'content',
	'media',
	'logic',
	'data',
]);
export type ComponentCategory = z.infer<typeof ComponentCategorySchema>;

export const SlotDefinitionSchema = z.object({
	accepts: z.array(z.string()),
	min: z.number().min(0).optional(),
	max: z.number().min(1).optional(),
	defaultContent: z.array(z.string()).optional(),
});

export type SlotDefinition = z.infer<typeof SlotDefinitionSchema>;

export const BaseInspectorFieldSchema = z.object({
	key: z.string(),
	label: z.string(),
	type: z.enum([
		'text',
		'number',
		'color',
		'select',
		'htmlTag',
		'iconSelect',
		'toggle',
		'slider',
		'spacing',
		'padding',
		'margin',
		'radius',
		'border',
		'size',
		'image',
		'textarea',
		'group',
		'array',
	]),
	defaultValue: z.unknown().optional(),
	options: z
		.array(
			z.object({
				label: z.string(),
				value: z.unknown(),
				icon: z.string().optional(),
				disabled: z.boolean().optional(),
			})
		)
		.optional(),
	min: z.number().optional(),
	max: z.number().optional(),
	step: z.number().optional(),
	placeholder: z.string().optional(),
	description: z.string().optional(),
	group: z.string().optional(),
	rows: z.number().optional(),

	condition: z
		.object({
			field: z.string(),
			operator: z.enum(['eq', 'notEq', 'truthy', 'falsy']),
			value: z.unknown(),
		})
		.optional(),
	isCollapsible: z.boolean().optional(),
	isExpanded: z.boolean().optional(),
	isAddable: z.boolean().optional(),
	emptyLabel: z.string().optional(),
});

export const InspectorFieldSchema: z.ZodType<
	z.infer<typeof BaseInspectorFieldSchema> & {
		children?: z.infer<typeof BaseInspectorFieldSchema>[];
	}
> = BaseInspectorFieldSchema.extend({
	children: z.array(z.lazy(() => InspectorFieldSchema)).optional(),
});

export const InspectorConfigSchema = z.object({
	groups: z
		.array(
			z.object({
				id: z.string(),
				label: z.string(),
				icon: z.string().optional(),
				fields: z.array(z.string()),
			})
		)
		.optional(),
	fields: z.array(InspectorFieldSchema),
});

export type InspectorField = z.infer<typeof InspectorFieldSchema>;
export type InspectorFieldWithChildren = InspectorField & {
	children?: InspectorField[];
};
export type InspectorConfig = z.infer<typeof InspectorConfigSchema>;
export type InspectorGroup = NonNullable<InspectorConfig['groups']>[number];

export const ComponentDefinitionSchema = z.object({
	type: z.string(),
	category: ComponentCategorySchema,
	name: z.string(),
	description: z.string().optional(),
	icon: z.string().optional(),

	allowedChildren: z.array(z.string()).optional(),
	allowedParents: z.array(z.string()).optional(),
	minChildren: z.number().optional(),
	maxChildren: z.number().optional(),

	slots: z.record(z.string(), SlotDefinitionSchema).optional(),

	propsSchema: z.record(z.string(), z.unknown()),
	defaultProps: z.record(z.string(), z.unknown()).optional(),

	inspectorConfig: InspectorConfigSchema.optional(),

	canHaveText: z.boolean().optional(),
	isVoid: z.boolean().optional(),
	isHidden: z.boolean().optional(),

	mjmlTag: z.string().optional(),
	mjmlAttributes: z.record(z.string(), z.unknown()).optional(),
});

export type ComponentDefinition = z.infer<typeof ComponentDefinitionSchema>;

export const ComponentRegistrySchema = z.record(
	z.string(),
	ComponentDefinitionSchema
);
export type ComponentRegistry = z.infer<typeof ComponentRegistrySchema>;
