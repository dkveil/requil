import { ComponentDefinition } from '@requil/types';
import {
	DividerDefinition,
	HeadingDefinition,
} from '../components/blocks/content';

export const CONTENT_COMPONENTS: Record<string, ComponentDefinition> = {
	Heading: HeadingDefinition,
	Divider: DividerDefinition,
};
