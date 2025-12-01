import type { BlockIR } from '@requil/types';

export interface LinkAttributes {
	href?: string;
	target?: '_blank' | '_self';
	rel?: string;
}

export function generateLinkAttributes(
	props: BlockIR['props']
): LinkAttributes | undefined {
	const linkTo = props.linkTo;

	if (!linkTo || typeof linkTo !== 'object') {
		return undefined;
	}

	const link = linkTo as {
		href?: string;
		target?: boolean;
	};

	if (!link.href) {
		return undefined;
	}

	return {
		href: link.href,
		target: link.target ? '_blank' : '_self',
		rel: link.target ? 'noopener noreferrer' : undefined,
	};
}
