import type { ComponentDefinition } from '@requil/types/editor';

// Re-export from new structure for backwards compatibility
export {
	BlockDefinition,
	ColumnDefinition,
	ColumnsDefinition,
	ContainerDefinition,
	DividerDefinition,
	RootDefinition,
	SpacerDefinition,
} from '../components/layout';

import {
	BlockDefinition,
	ColumnDefinition,
	ColumnsDefinition,
	ContainerDefinition,
	DividerDefinition,
	RootDefinition,
	SpacerDefinition,
} from '../components/layout';

export const LAYOUT_COMPONENTS: Record<string, ComponentDefinition> = {
	Root: RootDefinition,
	Container: ContainerDefinition,
	Block: BlockDefinition,
	Columns: ColumnsDefinition,
	Column: ColumnDefinition,
	Spacer: SpacerDefinition,
	Divider: DividerDefinition,
};
