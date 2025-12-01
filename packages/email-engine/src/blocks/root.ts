import type { BlockIR } from '@requil/types';
import { generateStylesStyles } from '../attributes';
import { createTableWrapper, generateInlineStyles } from '../utils';

export function renderRoot(block: BlockIR, childrenHtml: string): string {
	const styles = generateStylesStyles(block.props);
	const bodyStyles = {
		margin: '0',
		padding: '0',
		fontFamily: 'Arial, sans-serif',
		...styles,
	};

	const bodyStyleString = generateInlineStyles(bodyStyles);

	const outerTable = createTableWrapper(childrenHtml, {
		width: '100%',
		align: 'center',
		backgroundColor: styles.backgroundColor as string | undefined,
		padding: '20px',
	});

	return `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<style type="text/css">
		@media only screen and (max-width: 600px) {
			.mobile-stack {
				display: block !important;
				width: 100% !important;
			}
			.mobile-hide {
				display: none !important;
			}
			.mobile-full-width {
				width: 100% !important;
				max-width: 100% !important;
			}
			.mobile-padding {
				padding: 10px !important;
			}
		}
	</style>
</head>
<body${bodyStyleString ? ` style="${bodyStyleString}"` : ''}>
	${outerTable}
</body>
</html>`.trim();
}
