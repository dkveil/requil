import type { RenderOptions } from '@testing-library/react';
import { render as rtlRender } from '@testing-library/react';
import type { ReactElement } from 'react';

export function render(ui: ReactElement, options?: RenderOptions) {
	return rtlRender(ui, {
		...options,
	});
}

export * from '@testing-library/react';
export { render as default };
