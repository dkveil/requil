import type { InspectorField, InspectorGroup } from '@requil/types';

type JSONSchemaProperty = {
	type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
	enum?: readonly string[];
	minimum?: number;
	maximum?: number;
	default: unknown;
	placeholder?: string;
};

export type FieldConfig = {
	schema: JSONSchemaProperty;
	field: Omit<
		InspectorField,
		'defaultValue' | 'description' | 'group' | 'rows'
	> & {
		isAddable?: boolean;
		emptyLabel?: string;
		defaultExpanded?: boolean;
	};
};

type FieldGroupConfig<T extends string = string> = {
	id: string;
	label: string;
	icon?: string;
	fields: Record<T, FieldConfig>;
};

type GeneratedFieldGroup = {
	schema: Record<string, JSONSchemaProperty>;
	defaults: Record<string, unknown>;
	inspectorGroup: InspectorGroup;
	inspectorFields: InspectorField[];
};

export function createFieldGroup<T extends string>(
	config: FieldGroupConfig<T>
): GeneratedFieldGroup {
	const schema: Record<string, JSONSchemaProperty> = {};
	const defaults: Record<string, unknown> = {};
	const inspectorFields: InspectorField[] = [];
	const fieldKeys: string[] = [];

	for (const [key, fieldConfig] of Object.entries(config.fields) as [
		string,
		FieldConfig,
	][]) {
		schema[key] = fieldConfig.schema;
		defaults[key] = fieldConfig.schema.default;

		inspectorFields.push(fieldConfig.field as InspectorField);
		fieldKeys.push(key);
	}

	return {
		schema,
		defaults,
		inspectorGroup: {
			id: config.id,
			label: config.label,
			...(config.icon && { icon: config.icon }),
			fields: fieldKeys,
		},
		inspectorFields,
	};
}

export function mergeFieldGroups(
	...groups: GeneratedFieldGroup[]
): GeneratedFieldGroup {
	return groups.reduce(
		(acc, group) => ({
			schema: { ...acc.schema, ...group.schema },
			defaults: { ...acc.defaults, ...group.defaults },
			inspectorGroup: {
				id: 'merged',
				label: 'Merged',
				fields: [...acc.inspectorGroup.fields, ...group.inspectorGroup.fields],
			},
			inspectorFields: [...acc.inspectorFields, ...group.inspectorFields],
		}),
		{
			schema: {},
			defaults: {},
			inspectorGroup: { id: 'merged', label: 'Merged', fields: [] },
			inspectorFields: [],
		}
	);
}
