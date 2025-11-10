import type {
	ComponentCategory,
	ComponentDefinition,
} from '@requil/types/editor';
import { LAYOUT_COMPONENTS } from './layout-components';

// import { CONTENT_COMPONENTS } from './content-components'; // Future
// import { MEDIA_COMPONENTS } from './media-components'; // Future

class ComponentRegistryManager {
	private registry: Map<string, ComponentDefinition> = new Map();

	constructor() {
		this.registerComponents(LAYOUT_COMPONENTS);
	}

	registerComponents(components: Record<string, ComponentDefinition>) {
		Object.values(components).forEach((def) => {
			this.registry.set(def.type, def);
		});
	}

	register(definition: ComponentDefinition) {
		this.registry.set(definition.type, definition);
	}

	get(type: string): ComponentDefinition | undefined {
		return this.registry.get(type);
	}

	getByCategory(category: ComponentCategory): ComponentDefinition[] {
		return Array.from(this.registry.values()).filter(
			(def) => def.category === category && !def.isHidden
		);
	}

	getAll(): ComponentDefinition[] {
		return Array.from(this.registry.values()).filter((def) => !def.isHidden);
	}

	canHaveChild(parentType: string, childType: string): boolean {
		const parent = this.get(parentType);
		const child = this.get(childType);

		if (!(parent && child)) return false;

		if (parent.allowedChildren && !parent.allowedChildren.includes(childType)) {
			return false;
		}

		if (child.allowedParents && !child.allowedParents.includes(parentType)) {
			return false;
		}

		return true;
	}

	canAddChild(parentType: string, currentChildrenCount: number): boolean {
		const parent = this.get(parentType);
		if (!parent) return false;

		if (
			parent.maxChildren !== undefined &&
			currentChildrenCount >= parent.maxChildren
		) {
			return false;
		}

		return true;
	}

	validateProps(type: string, props: Record<string, unknown>): boolean {
		const component = this.get(type);
		if (!component) return false;

		// TODO: Validate against propsSchema using ajv or zod
		return true;
	}
}

export const componentRegistry = new ComponentRegistryManager();
