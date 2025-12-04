import { generateAllStyles } from '@requil/email-engine';
import { BlockIR } from '@requil/types';

export function extractWrapperStyles(props: BlockIR['props']) {
	const stylesToExtract = {
		maxWidth: props.maxWidth,
		margin: props.margin,
		width: props.width,
		height: props.height,
		minWidth: props.minWidth,
		minHeight: props.minHeight,
		maxHeight: props.maxHeight,
	};

	const styles = generateAllStyles(stylesToExtract);

	return styles;
}
