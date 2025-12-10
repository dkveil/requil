'use client';

import { useTranslations } from 'next-intl';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { UpdateWorkspaceForm } from '@/features/settings';

type GeneralSettingsPageProps = {
	params: {
		slug: string;
	};
};

export default function GeneralSettingsPage({
	params,
}: GeneralSettingsPageProps) {
	const t = useTranslations('settings.general.card');

	return (
		<div className='flex flex-col gap-6'>
			<Card>
				<CardHeader>
					<CardTitle>{t('title')}</CardTitle>
					<CardDescription>{t('description')}</CardDescription>
				</CardHeader>
				<CardContent>
					<UpdateWorkspaceForm />
				</CardContent>
			</Card>
		</div>
	);
}
