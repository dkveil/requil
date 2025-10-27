import {
	BUILDER_ELEMENT_NAMES,
	type BuilderElement,
	type BuilderElementType,
	isValidBuilderElement,
} from '@requil/db';

export type ValidationError = {
	code: string;
	message: string;
	path: string;
	received?: unknown;
	expected?: unknown;
};

export type ValidationResult = {
	ok: boolean;
	errors: ValidationError[];
	warnings: string[];
};

const REQUIRED_PROPERTIES: Record<string, string[]> = {
	'content:button': ['text', 'href'],
	'content:heading': ['content', 'level'],
	'content:paragraph': ['content'],
	'content:text': ['content'],
	'media:image': ['src', 'alt'],
};

function validateBasicStructure(
	element: unknown,
	path: string,
	errors: ValidationError[]
): element is Record<string, unknown> {
	if (!element || typeof element !== 'object') {
		errors.push({
			code: 'INVALID_BUILDER_STRUCTURE',
			message: 'Element must be an object',
			path,
			received: typeof element,
			expected: 'object',
		});
		return false;
	}
	return true;
}

function validateTypeField(
	el: Record<string, unknown>,
	path: string,
	errors: ValidationError[]
): el is Record<string, unknown> & { type: string } {
	if (!el.type || typeof el.type !== 'string') {
		errors.push({
			code: 'INVALID_BUILDER_STRUCTURE',
			message: "Missing required field 'type'",
			path,
			received: el,
		});
		return false;
	}
	return true;
}

function validateNameField(
	el: Record<string, unknown>,
	path: string,
	errors: ValidationError[]
): el is Record<string, unknown> & { name: string } {
	if (!el.name || typeof el.name !== 'string') {
		errors.push({
			code: 'INVALID_BUILDER_STRUCTURE',
			message: "Missing required field 'name'",
			path,
			received: el,
		});
		return false;
	}
	return true;
}

function validatePropertiesField(
	el: Record<string, unknown>,
	path: string,
	errors: ValidationError[]
): boolean {
	if (!el.properties || typeof el.properties !== 'object') {
		errors.push({
			code: 'INVALID_BUILDER_STRUCTURE',
			message: "Missing required field 'properties'",
			path,
			received: el,
		});
		return false;
	}
	return true;
}

function validateElementType(
	type: BuilderElementType,
	name: string,
	path: string,
	errors: ValidationError[]
): boolean {
	if (!isValidBuilderElement(type, name)) {
		errors.push({
			code: 'UNKNOWN_BUILDER_ELEMENT',
			message: `Unknown element name '${name}' for type '${type}'`,
			path: `${path}.name`,
			received: { type, name },
			expected: BUILDER_ELEMENT_NAMES[type] || [],
		});
		return false;
	}
	return true;
}

function validateRequiredProperties(
	type: string,
	name: string,
	properties: Record<string, unknown>,
	path: string,
	errors: ValidationError[]
): void {
	const requiredKey = `${type}:${name}`;
	const requiredProps = REQUIRED_PROPERTIES[requiredKey];

	if (!requiredProps) return;

	const receivedProps = Object.keys(properties);

	for (const reqProp of requiredProps) {
		if (!(reqProp in properties) || properties[reqProp] === undefined) {
			errors.push({
				code: 'MISSING_REQUIRED_PROPERTY',
				message: `${type}:${name} element missing required property '${reqProp}'`,
				path: `${path}.properties`,
				received: receivedProps,
				expected: requiredProps,
			});
		}
	}
}

function validateChildren(
	children: unknown,
	path: string,
	errors: ValidationError[]
): void {
	if (!Array.isArray(children)) return;

	for (let i = 0; i < children.length; i++) {
		validateElement(children[i], `${path}.children[${i}]`, errors);
	}
}

function validateElement(
	element: unknown,
	path: string,
	errors: ValidationError[]
): void {
	if (!validateBasicStructure(element, path, errors)) return;

	const el = element;

	if (!validateTypeField(el, path, errors)) return;
	if (!validateNameField(el, path, errors)) return;
	if (!validatePropertiesField(el, path, errors)) return;

	const type = el.type as BuilderElementType;
	const name = el.name as string;
	const properties = el.properties as Record<string, unknown>;

	if (!validateElementType(type, name, path, errors)) return;

	validateRequiredProperties(type, name, properties, path, errors);

	if (el.children) {
		validateChildren(el.children, path, errors);
	}
}

export function validateBuilderStructure(structure: unknown): ValidationResult {
	const errors: ValidationError[] = [];
	const warnings: string[] = [];

	if (!structure) {
		errors.push({
			code: 'INVALID_BUILDER_STRUCTURE',
			message: 'Builder structure is required',
			path: 'root',
			received: structure,
		});
		return { ok: false, errors, warnings };
	}

	validateElement(structure, 'root', errors);

	return {
		ok: errors.length === 0,
		errors,
		warnings,
	};
}

export function extractVariables(element: BuilderElement): Set<string> {
	const variables = new Set<string>();
	const variableRegex = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;

	const extractFromString = (str: string) => {
		let match = variableRegex.exec(str);
		while (match !== null) {
			const variableName = match[1];
			if (variableName) {
				variables.add(variableName);
			}
			match = variableRegex.exec(str);
		}
	};

	const traverse = (el: BuilderElement) => {
		if (el.properties && typeof el.properties === 'object') {
			for (const value of Object.values(el.properties)) {
				if (typeof value === 'string') {
					extractFromString(value);
				}
			}
		}

		if (el.children) {
			for (const child of el.children) {
				traverse(child);
			}
		}
	};

	traverse(element);
	return variables;
}
