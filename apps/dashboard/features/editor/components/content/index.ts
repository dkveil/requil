// Content components

export * from './button';
export * from './heading';
export * from './image';
export * from './social-icons';
export * from './text';

import type { ComponentDefinition } from '@requil/types/editor';
import { ButtonDefinition } from './button';
import { HeadingDefinition } from './heading';
import { ImageDefinition } from './image';
import { socialIconsDefinition } from './social-icons';
// Aggregate all content definitions
import { TextDefinition } from './text';

export const CONTENT_COMPONENTS: Record<string, ComponentDefinition> = {
	Text: TextDefinition,
	Heading: HeadingDefinition,
	Button: ButtonDefinition,
	Image: ImageDefinition,
	SocialIcons: socialIconsDefinition,
};
