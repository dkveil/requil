export const getNestedValue = (obj: Record<string, any>, path: string): any => {
	return path.split('.').reduce((current, key) => current?.[key], obj);
};

export const isFieldVisible = (
	field: { condition?: { field: string; operator: string; value?: unknown } },
	blockProps: Record<string, any>
): boolean => {
	if (!field.condition) return true;

	const { field: conditionField, operator, value } = field.condition;
	const fieldValue = getNestedValue(blockProps, conditionField);

	switch (operator) {
		case 'eq':
			return fieldValue === value;
		case 'notEq':
			return fieldValue !== value;
		case 'truthy':
			return !!fieldValue;
		case 'falsy':
			return !fieldValue;
		default:
			return true;
	}
};
