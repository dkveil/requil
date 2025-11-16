/**
 * Converts link-related properties to MJML attributes
 * Handles: linkTo (href, target)
 */
export function convertLinkProps(props: Record<string, unknown>): string[] {
	const attrs: string[] = [];

	if (props.linkTo && typeof props.linkTo === 'object') {
		const linkTo = props.linkTo as { href?: string; target?: boolean };
		if (linkTo.href) {
			attrs.push(`href="${linkTo.href}"`);
		}
		if (linkTo.target) {
			attrs.push(`target="_blank"`);
		}
	}

	return attrs;
}
