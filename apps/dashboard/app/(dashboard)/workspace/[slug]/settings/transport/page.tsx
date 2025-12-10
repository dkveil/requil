import { getTranslations } from 'next-intl/server';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { TransportConfig } from '@/features/settings/components/transport-config';

type TransportSettingsPageProps = {
	params: Promise<{
		slug: string;
	}>;
};

export default async function TransportSettingsPage({
	params,
}: TransportSettingsPageProps) {
	if (process.env.NODE_ENV === 'development') {
		await new Promise((resolve) => setTimeout(resolve, 1000));
	}

	await params;
	const t = await getTranslations('settings.transport.card');

	return (
		<div className='flex flex-col gap-6'>
			<Card>
				<CardHeader>
					<CardTitle>{t('title')}</CardTitle>
					<CardDescription>{t('description')}</CardDescription>
				</CardHeader>
				<CardContent>
					<TransportConfig />
				</CardContent>
			</Card>
		</div>
	);
}
