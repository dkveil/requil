export function escapeHtml(text: string): string {
	const htmlEscapeMap: Record<string, string> = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;',
	};

	return text.replace(
		/[&<>"']/g,
		(char) => htmlEscapeMap[char as keyof typeof htmlEscapeMap] || char
	);
}
