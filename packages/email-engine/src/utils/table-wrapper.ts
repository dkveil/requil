import { generateInlineStyles } from './inline-styles';

type TableWrapperOptions = {
	width?: string;
	align?: 'left' | 'center' | 'right';
	backgroundColor?: string;
	padding?: string;
};

export function createTableWrapper(
	content: string,
	options: TableWrapperOptions
): string {
	const {
		width = '100%',
		align = 'center',
		backgroundColor,
		padding,
	} = options;

	const widthAttr = typeof width === 'number' ? width : width;
	const tableStyles: Record<string, string | number | undefined> = {
		...(backgroundColor && { backgroundColor }),
	};

	const tdStyles: Record<string, string | number | undefined> = {
		...(padding && {
			padding: typeof padding === 'number' ? `${padding}px` : padding,
		}),
	};

	const tableStyleString = generateInlineStyles(tableStyles);
	const tdStyleString = generateInlineStyles(tdStyles);

	return `
    <table width="${widthAttr}" cellpadding="0" cellspacing="0" border="0"${tableStyleString ? ` style="${tableStyleString}"` : ''}>
      <tr>
        <td${align !== 'left' ? ` align="${align}"` : ''}${tdStyleString ? ` style="${tdStyleString}"` : ''}>
          ${content}
        </td>
      </tr>
    </table>`.trim();
}
