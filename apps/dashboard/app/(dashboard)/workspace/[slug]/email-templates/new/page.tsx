import { getTranslations } from 'next-intl/server';
import { CreateTemplateForm } from '@/features/templates';

type Props = {
	params: Promise<{ slug: string }>;
};

export default async function CreateEmailTemplatePage({ params }: Props) {
	const { slug } = await params;
	const t = await getTranslations('templates.create');

	const translations = {
		backToTemplates: t('backToTemplates'),
		title: t('title'),
		description: t('description'),
		detailsTitle: t('detailsTitle'),
		detailsDescription: t('detailsDescription'),
		nameLabel: t('nameLabel'),
		namePlaceholder: t('namePlaceholder'),
		nameDescription: t('nameDescription'),
		stableIdLabel: t('stableIdLabel'),
		stableIdPlaceholder: t('stableIdPlaceholder'),
		stableIdDescription: t('stableIdDescription'),
		descriptionLabel: t('descriptionLabel'),
		descriptionPlaceholder: t('descriptionPlaceholder'),
		descriptionDescription: t('descriptionDescription'),
		sourceTitle: t('sourceTitle'),
		sourceDescription: t('sourceDescription'),
		sourceBlankTitle: t('sourceBlankTitle'),
		sourceBlankDescription: t('sourceBlankDescription'),
		sourceAiTitle: t('sourceAiTitle'),
		sourceAiDescription: t('sourceAiDescription'),
		sourceAiTooltip: t('sourceAiTooltip'),
		sourceGalleryTitle: t('sourceGalleryTitle'),
		sourceGalleryDescription: t('sourceGalleryDescription'),
		sourceGalleryTooltip: t('sourceGalleryTooltip'),
		cancel: t('cancel'),
		create: t('create'),
		creating: t('creating'),
		successTitle: t('successTitle'),
		successDescription: t('successDescription'),
		errorTitle: t('errorTitle'),
		errorDescription: t('errorDescription'),
		errorStableIdTaken: t('errorStableIdTaken'),
	};

	return (
		<CreateTemplateForm
			workspaceSlug={slug}
			translations={translations}
		/>
	);
}
