'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { ApiKeysTable } from '@/features/settings/components/api-keys-table';
import { CreateApiKeyDialog } from '@/features/settings/components/create-api-key-dialog';

type DevelopersSettingsPageProps = {
	params: {
		slug: string;
	};
};

export default function DevelopersSettingsPage({
	params,
}: DevelopersSettingsPageProps) {
	const tApiKeys = useTranslations('settings.developers.apiKeys');
	const tWebhooks = useTranslations('settings.developers.webhooks');
	const [createDialogOpen, setCreateDialogOpen] = useState(false);

	return (
		<div className='flex flex-col gap-6'>
			<Card>
				<CardHeader>
					<div className='flex items-center justify-between'>
						<div>
							<CardTitle>{tApiKeys('card.title')}</CardTitle>
							<CardDescription>{tApiKeys('card.description')}</CardDescription>
						</div>
						<Button onClick={() => setCreateDialogOpen(true)}>
							<Plus className='mr-2 size-4' />
							{tApiKeys('create.button')}
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<ApiKeysTable />
				</CardContent>
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

			<CreateApiKeyDialog
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
			/>
		</div>
	);
}
