// Layout components

export * from './block';
export * from './column';
export * from './columns';
export * from './container';
export * from './divider';
export * from './root';
export * from './spacer';

import type { ComponentDefinition } from '@requil/types/editor';
import { BlockDefinition } from './block';
import { ColumnDefinition } from './column';
import { ColumnsDefinition } from './columns';
import { ContainerDefinition } from './container';
import { DividerDefinition } from './divider';
// Aggregate all layout definitions
import { RootDefinition } from './root';
import { SpacerDefinition } from './spacer';

export const LAYOUT_COMPONENTS: Record<string, ComponentDefinition> = {
	Root: RootDefinition,
	Container: ContainerDefinition,
	Block: BlockDefinition,
	Columns: ColumnsDefinition,
	Column: ColumnDefinition,
	Spacer: SpacerDefinition,
	Divider: DividerDefinition,
};
