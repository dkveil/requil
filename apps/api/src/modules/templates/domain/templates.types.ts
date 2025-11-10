import type { NewTemplate, Template, Workspace } from '@requil/db';

export type TemplateId = Template['id'];
export type WorkspaceId = Workspace['id'];
export type UserId = string;

export type TemplateProps = Template;
export type CreateTemplateProps = Omit<
	NewTemplate,
	'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'createdAt' | 'updatedAt'
>;
