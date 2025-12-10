'use client';

import { Copy, Trash2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useWorkspace } from '@/features/workspace';
import { getErrorMessage } from '@/lib/api/error';
import { useApiKeys } from '../hooks/use-api-keys';
import { useDeleteApiKey } from '../hooks/use-delete-api-key';

export function ApiKeysTable() {
	const t = useTranslations('settings.developers.apiKeys.table');
	const tDelete = useTranslations('settings.developers.apiKeys.delete');
	const tMessages = useTranslations('settings.developers.apiKeys.messages');
	const locale = useLocale();
	const { currentWorkspace } = useWorkspace();
	const { data: apiKeys = [], isLoading } = useApiKeys();
	const deleteApiKey = useDeleteApiKey();

	const handleCopy = (prefix: string) => {
		navigator.clipboard.writeText(`${prefix}...`);
		toast.success(tMessages('copySuccess'));
	};

	const handleDelete = async (keyId: string) => {
		if (!currentWorkspace?.id) return;

		if (!confirm(tDelete('description'))) return;

		try {
			await deleteApiKey.mutateAsync({
				workspaceId: currentWorkspace.id,
				keyId,
			});
			toast.success(tDelete('success'));
		} catch (err) {
			if (err instanceof Error && err.message.includes('not implemented')) {
				toast.warning('API endpoint not ready yet', {
					description: 'API key deletion will be available soon',
				});
			} else {
				toast.error(tMessages('deleteError'), {
					description: getErrorMessage(err, locale),
				});
			}
		}
	};

	if (isLoading) {
		return (
			<div className='flex items-center justify-center py-8'>
				<p className='text-sm text-muted-foreground'>Loading...</p>
			</div>
		);
	}

	if (apiKeys.length === 0) {
		return (
			<div className='flex flex-col items-center justify-center rounded-lg border border-dashed py-12'>
				<p className='text-sm font-medium'>{t('noKeys')}</p>
				<p className='text-sm text-muted-foreground'>
					{t('noKeysDescription')}
				</p>
			</div>
		);
	}

	return (
		<div className='space-y-2'>
			{apiKeys.map((key) => (
				<div
					key={key.id}
					className='flex items-center justify-between rounded-lg border p-4'
				>
					<div className='flex-1 space-y-1'>
						<div className='flex items-center gap-4'>
							<p className='font-medium'>{key.name}</p>
							<div className='flex items-center gap-2'>
								<code className='rounded bg-muted px-2 py-0.5 text-xs'>
									{key.prefix}...
								</code>
								<Button
									variant='ghost'
									size='icon-sm'
									onClick={() => handleCopy(key.prefix)}
								>
									<Copy className='size-3' />
								</Button>
							</div>
						</div>
						<div className='flex items-center gap-4 text-sm text-muted-foreground'>
							<span>
								{t('created')}: {new Date(key.createdAt).toLocaleDateString()}
							</span>
							<span>
								{t('lastUsed')}:{' '}
								{key.lastUsedAt
									? new Date(key.lastUsedAt).toLocaleDateString()
									: t('never')}
							</span>
						</div>
					</div>
					<Button
						variant='ghost'
						size='icon-sm'
						onClick={() => handleDelete(key.id)}
					>
						<Trash2 className='size-4 text-destructive' />
					</Button>
				</div>
			))}
		</div>
	);
}
