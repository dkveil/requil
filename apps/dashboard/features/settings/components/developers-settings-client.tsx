'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { ApiKeysTable } from './api-keys-table';
import { CreateApiKeyDialog } from './create-api-key-dialog';

type DevelopersSettingsClientProps = {
	apiKeysTitle: string;
	apiKeysDescription: string;
	createButtonLabel: string;
};

export function DevelopersSettingsClient({
	apiKeysTitle,
	apiKeysDescription,
	createButtonLabel,
}: DevelopersSettingsClientProps) {
	const [createDialogOpen, setCreateDialogOpen] = useState(false);

	return (
		<>
			<div className='flex items-center justify-between'>
				<div>
					<CardTitle>{apiKeysTitle}</CardTitle>
					<CardDescription>{apiKeysDescription}</CardDescription>
				</div>
				<Button onClick={() => setCreateDialogOpen(true)}>
					<Plus className='mr-2 size-4' />
					{createButtonLabel}
				</Button>
			</div>
			<CardContent>
				<ApiKeysTable />
			</CardContent>

			<CreateApiKeyDialog
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
			/>
		</>
	);
}
