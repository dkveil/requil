import { getTranslations } from 'next-intl/server';
import { TemplatesList } from '@/features/templates';

type Props = {
	params: Promise<{ slug: string }>;
};

export default async function EmailTemplatesPage({ params }: Props) {
	const { slug } = await params;
	const t = await getTranslations('templates');

	const translations = {
		title: t('title'),
		description: t('description'),
		newTemplate: t('newTemplate'),
		noTemplatesYet: t('noTemplatesYet'),
		noTemplatesDescription: t('noTemplatesDescription'),
		createTemplate: t('createTemplate'),
		updated: t('updated'),
	};

	return (
		<TemplatesList
			workspaceSlug={slug}
			translations={translations}
		/>
	);
}
