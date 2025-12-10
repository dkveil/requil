'use client';

import { useTranslations } from 'next-intl';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { TransportConfig } from '@/features/settings/components/transport-config';

type TransportSettingsPageProps = {
	params: {
		slug: string;
	};
};

export default function TransportSettingsPage({
	params,
}: TransportSettingsPageProps) {
	const t = useTranslations('settings.transport.card');

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
