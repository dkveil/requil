import { generateAllStyles } from '@requil/email-engine';
import { BlockIR } from '@requil/types';

export function extractWrapperStyles(props: BlockIR['props']) {
	const shouldSetMinHeight = props.height === 'auto';

	const stylesToExtract = {
		maxWidth: props.maxWidth,
		margin: props.margin,
		width: props.width,
		height: props.height,
		minWidth: props.minWidth,
		minHeight: shouldSetMinHeight ? '100px' : props.height,
		maxHeight: props.maxHeight,
	};

	const styles = generateAllStyles(stylesToExtract);

	return styles;
}
