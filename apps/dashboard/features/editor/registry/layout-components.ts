import type { ComponentDefinition } from '@requil/types/editor';
import {
	ContainerDefinition,
	RootDefinition,
} from '../components/blocks/layout';

export const LAYOUT_COMPONENTS: Record<string, ComponentDefinition> = {
	Root: RootDefinition,
	Container: ContainerDefinition,
};
