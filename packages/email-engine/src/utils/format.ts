/**
 * Format a value for MJML attributes
 */
export function formatValue(value: unknown): string {
	if (value === null || value === undefined) return '';
	if (typeof value === 'boolean') return value ? 'true' : 'false';
	if (typeof value === 'number') return `${value}px`;
	if (typeof value === 'string') return value;
	if (typeof value === 'object') return '';
	return String(value);
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}
