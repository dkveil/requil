import { ComponentDefinition } from '@requil/types';
import {
	DividerDefinition,
	HeadingDefinition,
	ImageDefinition,
	LinkDefinition,
	TextDefinition,
} from '../components/blocks/content';

export const CONTENT_COMPONENTS: Record<string, ComponentDefinition> = {
	Heading: HeadingDefinition,
	Text: TextDefinition,
	Link: LinkDefinition,
	Image: ImageDefinition,
	Divider: DividerDefinition,
};
