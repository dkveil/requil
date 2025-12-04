import { generateAllStyles } from '@requil/email-engine';
import { BlockIR } from '@requil/types';

export function extractWrapperStyles(
	props: BlockIR['props'],
	hasChildren: boolean
) {
	const hasNoMinHeight = !props.minHeight || props.minHeight === 'auto';
	const isMinHeightTooSmall =
		typeof props.minHeight === 'string' &&
		props.minHeight.endsWith('px') &&
		Number(props.minHeight.replace('px', '')) < 30;
	const shouldSetMinHeight = hasNoMinHeight || isMinHeightTooSmall;

	const stylesToExtract = {
		fill: props.fill,
		maxWidth: props.maxWidth,
		margin: props.margin,
		padding: props.padding,
		width: props.width,
		minHeight: !hasChildren && shouldSetMinHeight ? '100px' : props.minHeight,
	};

	const styles = generateAllStyles(stylesToExtract);

	return styles;
}
