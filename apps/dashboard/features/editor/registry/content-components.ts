import { ComponentDefinition } from '@requil/types';
import {
	DividerDefinition,
	HeadingDefinition,
	TextDefinition,
} from '../components/blocks/content';

export const CONTENT_COMPONENTS: Record<string, ComponentDefinition> = {
	Heading: HeadingDefinition,
	Text: TextDefinition,
	Divider: DividerDefinition,
};
