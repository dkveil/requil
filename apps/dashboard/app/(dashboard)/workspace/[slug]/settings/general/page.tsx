import { getTranslations } from 'next-intl/server';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { UpdateWorkspaceForm } from '@/features/settings';

type GeneralSettingsPageProps = {
	params: Promise<{
		slug: string;
	}>;
};

export default async function GeneralSettingsPage({
	params,
}: GeneralSettingsPageProps) {
	await params;
	const t = await getTranslations('settings.general.card');

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
