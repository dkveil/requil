/**
 * Converts accessibility-related properties to MJML attributes
 * Handles: htmlTag, ariaLabel
 */
export function convertAccessibilityProps(
	props: Record<string, unknown>
): string[] {
	const attrs: string[] = [];

	// Note: MJML doesn't support htmlTag or ariaLabel directly
	// These are handled in the canvas but not in email output

	return attrs;
}
