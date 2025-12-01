type InlineStyles = Record<string, string | number | undefined>;
export function generateInlineStyles(styles: InlineStyles): string {
	return Object.entries(styles)
		.filter(([_, value]) => value !== undefined && value !== null)
		.map(([key, value]) => {
			const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();

			const cssValue = typeof value === 'number' ? `${value}px` : value;

			return `${cssKey}: ${cssValue}`;
		})
		.join('; ');
}
