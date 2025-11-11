import type { Block, Document } from '@requil/types/editor';
import { nanoid } from 'nanoid';
import { componentRegistry } from '../registry/component-registry';

export function createBlock(
	type: string,
	overrideProps?: Record<string, unknown>
): Block | null {
	const definition = componentRegistry.get(type);
	if (!definition) {
		console.error(`Component type "${type}" not found in registry`);
		return null;
	}

	const block: Block = {
		id: nanoid(),
		type,
		props: {
			...definition.defaultProps,
			...overrideProps,
		},
	};

	if (definition.minChildren && definition.minChildren > 0) {
		block.children = [];

		if (type === 'Columns') {
			const columnCount = (block.props.columnCount as number) || 2;
			const columnWidth = `${100 / columnCount}%`;

			for (let i = 0; i < columnCount; i++) {
				const column = createBlock('Column', { width: columnWidth });
				if (column) block.children.push(column);
			}
		}
	}

	return block;
}

export function createDefaultDocument(): Document {
	const rootBlock = createBlock('Root') || {
		id: nanoid(),
		type: 'Root',
		props: {
			backgroundColor: '#F4F4F5',
		},
		children: [],
	};

	return {
		version: '1.0',
		root: rootBlock,
		metadata: {
			title: 'Untitled Template',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		},
	};
}
