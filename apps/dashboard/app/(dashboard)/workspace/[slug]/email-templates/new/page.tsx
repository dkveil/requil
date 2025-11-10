import { getTranslations } from 'next-intl/server';
import { CreateTemplateForm } from '@/features/templates';

type Props = {
	params: Promise<{ slug: string }>;
};

export default async function CreateEmailTemplatePage({ params }: Props) {
	const { slug } = await params;
	const t = await getTranslations('templates.create');

	const translations = {
		title: t('title'),
		description: t('description'),
		nameLabel: t('nameLabel'),
		namePlaceholder: t('namePlaceholder'),
		nameDescription: t('nameDescription'),
		stableIdLabel: t('stableIdLabel'),
		stableIdPlaceholder: t('stableIdPlaceholder'),
		stableIdDescription: t('stableIdDescription'),
		descriptionLabel: t('descriptionLabel'),
		descriptionPlaceholder: t('descriptionPlaceholder'),
		descriptionDescription: t('descriptionDescription'),
		cancel: t('cancel'),
		create: t('create'),
		creating: t('creating'),
		successTitle: t('successTitle'),
		successDescription: t('successDescription'),
		errorTitle: t('errorTitle'),
		errorDescription: t('errorDescription'),
	};

	return (
		<CreateTemplateForm
			workspaceSlug={slug}
			translations={translations}
		/>
	);
}
