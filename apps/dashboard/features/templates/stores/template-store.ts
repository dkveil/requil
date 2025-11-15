import type { TemplateItem, TemplateResponse } from '@requil/types/templates';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { templatesApi } from '../api/templates-api';

type TemplateState = {
	templates: TemplateItem[];
	currentTemplate: TemplateResponse | null;
	loading: boolean;
	error: string | null;
};

type TemplateActions = {
	loadTemplates: (workspaceId: string) => Promise<void>;
	loadTemplateById: (id: string, callback?: () => void) => Promise<void>;
	createTemplate: (data: {
		workspaceId: string;
		stableId: string;
		name: string;
		description?: string;
	}) => Promise<TemplateResponse>;
	deleteTemplate: (id: string) => Promise<void>;
	setCurrentTemplate: (template: TemplateResponse | null) => void;
	reset: () => void;
};

export const useTemplateStore = create<TemplateState & TemplateActions>()(
	devtools(
		(set, get) => ({
			templates: [],
			currentTemplate: null,
			loading: false,
			error: null,

			loadTemplates: async (workspaceId: string) => {
				set({ loading: true, error: null }, false, 'loadTemplates/start');

				try {
					const response = await templatesApi.findByWorkspace(workspaceId);

					set(
						{
							templates: response.templates,
							loading: false,
							error: null,
						},
						false,
						'loadTemplates/success'
					);
				} catch (error) {
					console.error('Failed to load templates', error);
					set(
						{
							templates: [],
							loading: false,
							error: 'Failed to load templates',
						},
						false,
						'loadTemplates/error'
					);
				}
			},

			loadTemplateById: async (id: string, callback?: () => void) => {
				set({ loading: true, error: null }, false, 'loadTemplateById/start');

				try {
					const template = await templatesApi.getById(id);

					set(
						{
							currentTemplate: template,
							loading: false,
							error: null,
						},
						false,
						'loadTemplateById/success'
					);

					callback?.();
				} catch (error) {
					console.error('Failed to load template', error);
					set(
						{
							currentTemplate: null,
							loading: false,
							error: 'Failed to load template',
						},
						false,
						'loadTemplateById/error'
					);
					throw error;
				}
			},

			createTemplate: async (data) => {
				set({ loading: true, error: null }, false, 'createTemplate/start');

				try {
					const template = await templatesApi.create(data);

					// Add to templates list
					const { templates } = get();
					set(
						{
							templates: [
								...templates,
								{
									id: template.id,
									workspaceId: template.workspaceId,
									stableId: template.stableId,
									name: template.name,
									description: template.description,
									createdBy: template.createdBy,
									createdAt: template.createdAt,
									updatedAt: template.updatedAt,
								},
							],
							loading: false,
							error: null,
						},
						false,
						'createTemplate/success'
					);

					return template;
				} catch (error) {
					console.error('Failed to create template', error);
					set(
						{
							loading: false,
							error: 'Failed to create template',
						},
						false,
						'createTemplate/error'
					);
					throw error;
				}
			},

			deleteTemplate: async (id: string) => {
				set({ loading: true, error: null }, false, 'deleteTemplate/start');

				try {
					await templatesApi.delete(id);

					// Remove from templates list
					const { templates } = get();
					set(
						{
							templates: templates.filter((t) => t.id !== id),
							currentTemplate:
								get().currentTemplate?.id === id ? null : get().currentTemplate,
							loading: false,
							error: null,
						},
						false,
						'deleteTemplate/success'
					);
				} catch (error) {
					console.error('Failed to delete template', error);
					set(
						{
							loading: false,
							error: 'Failed to delete template',
						},
						false,
						'deleteTemplate/error'
					);
					throw error;
				}
			},

			setCurrentTemplate: (template: TemplateResponse | null) => {
				set({ currentTemplate: template }, false, 'setCurrentTemplate');
			},

			reset: () => {
				set(
					{
						templates: [],
						currentTemplate: null,
						loading: false,
						error: null,
					},
					false,
					'reset'
				);
			},
		}),
		{ name: 'TemplateStore' }
	)
);
