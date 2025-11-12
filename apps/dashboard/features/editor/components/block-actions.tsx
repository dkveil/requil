import { ArrowDown, ArrowUp, ChevronUp, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BlockActionsProps {
	blockId: string;
	onMoveUp?: () => void;
	onMoveDown?: () => void;
	onDelete?: () => void;
	onSelectParent?: () => void;
	canMoveUp?: boolean;
	canMoveDown?: boolean;
	hasParent?: boolean;
}

export function BlockActions({
	onMoveUp,
	onMoveDown,
	onDelete,
	onSelectParent,
	canMoveUp = true,
	canMoveDown = true,
	hasParent = true,
}: BlockActionsProps) {
	const t = useTranslations('editor.blockActions');

	return (
		<div className='absolute -top-2 -right-2 z-10 flex gap-1 bg-background border border-primary rounded-md shadow-lg p-1'>
			{hasParent && (
				<Button
					size='icon'
					variant='ghost'
					className='h-6 w-6'
					onClick={(e) => {
						e.stopPropagation();
						onSelectParent?.();
					}}
					title={t('selectParent')}
				>
					<ChevronUp className='h-3 w-3' />
				</Button>
			)}
			<Button
				size='icon'
				variant='ghost'
				className={cn('h-6 w-6', !canMoveUp && 'opacity-50 cursor-not-allowed')}
				onClick={(e) => {
					e.stopPropagation();
					if (canMoveUp) onMoveUp?.();
				}}
				disabled={!canMoveUp}
				title={t('moveUp')}
			>
				<ArrowUp className='h-3 w-3' />
			</Button>
			<Button
				size='icon'
				variant='ghost'
				className={cn(
					'h-6 w-6',
					!canMoveDown && 'opacity-50 cursor-not-allowed'
				)}
				onClick={(e) => {
					e.stopPropagation();
					if (canMoveDown) onMoveDown?.();
				}}
				disabled={!canMoveDown}
				title={t('moveDown')}
			>
				<ArrowDown className='h-3 w-3' />
			</Button>
			<Button
				size='icon'
				variant='ghost'
				className='h-6 w-6 hover:bg-destructive hover:text-destructive-foreground'
				onClick={(e) => {
					e.stopPropagation();
					onDelete?.();
				}}
				title={t('delete')}
			>
				<Trash2 className='h-3 w-3' />
			</Button>
		</div>
	);
}
