import type { ComponentDefinition } from '@requil/types/editor';
import {
	ContainerDefinition,
	RootDefinition,
	SectionDefinition,
} from '../components/blocks/layout';

export const LAYOUT_COMPONENTS: Record<string, ComponentDefinition> = {
	Root: RootDefinition,
	Container: ContainerDefinition,
	Section: SectionDefinition,
};
