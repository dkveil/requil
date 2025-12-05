const VARIABLE_REGEX = /\{\{(\w+)\}\}/g;

export function replaceVariables(
	text: string,
	variables: Record<string, string>
): string {
	return text.replace(VARIABLE_REGEX, (match, name) => {
		return variables[name] ?? match;
	});
}
