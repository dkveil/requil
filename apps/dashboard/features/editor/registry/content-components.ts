import { ComponentDefinition } from '@requil/types';
import {
	DividerDefinition,
	HeadingDefinition,
	LinkDefinition,
	TextDefinition,
} from '../components/blocks/content';

export const CONTENT_COMPONENTS: Record<string, ComponentDefinition> = {
	Heading: HeadingDefinition,
	Text: TextDefinition,
	Link: LinkDefinition,
	Divider: DividerDefinition,
};
