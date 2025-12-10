import { getTranslations } from 'next-intl/server';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { DevelopersSettingsClient } from '@/features/settings/components/developers-settings-client';

type DevelopersSettingsPageProps = {
	params: Promise<{
		slug: string;
	}>;
};

export default async function DevelopersSettingsPage({
	params,
}: DevelopersSettingsPageProps) {
	await params;
	const tApiKeys = await getTranslations('settings.developers.apiKeys');
	const tWebhooks = await getTranslations('settings.developers.webhooks');

	return (
		<div className='flex flex-col gap-6'>
			<Card>
				<CardHeader>
					<DevelopersSettingsClient
						apiKeysTitle={tApiKeys('card.title')}
						apiKeysDescription={tApiKeys('card.description')}
						createButtonLabel={tApiKeys('create.button')}
					/>
				</CardHeader>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>{tWebhooks('card.title')}</CardTitle>
					<CardDescription>{tWebhooks('card.description')}</CardDescription>
				</CardHeader>
				<CardContent>
					<p className='text-sm text-muted-foreground'>Coming soon...</p>
				</CardContent>
			</Card>
		</div>
	);
}
