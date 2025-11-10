import { actionCreatorFactory } from '@/shared/cqrs/action-creator';
import { ITemplateRepository } from './database/template.repository.port';

declare global {
	export interface Dependencies {
		templateRepository: ITemplateRepository;
	}
}

export const templatesActionCreator = actionCreatorFactory('templates');
