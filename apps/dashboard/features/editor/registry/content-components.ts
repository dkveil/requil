import { ComponentDefinition } from '@requil/types';

// Re-export from new structure for backwards compatibility
export {
	ButtonDefinition,
	HeadingDefinition,
	ImageDefinition,
	TextDefinition,
} from '../components/content';

import {
	ButtonDefinition,
	HeadingDefinition,
	ImageDefinition,
	TextDefinition,
} from '../components/content';

export const CONTENT_COMPONENTS: Record<string, ComponentDefinition> = {
	Text: TextDefinition,
	Heading: HeadingDefinition,
	Button: ButtonDefinition,
	Image: ImageDefinition,
};
