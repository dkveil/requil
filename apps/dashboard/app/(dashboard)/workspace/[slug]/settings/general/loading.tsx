import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function GeneralSettingsLoading() {
	return (
		<div className='flex flex-col gap-6'>
			<Card>
				<CardHeader>
					<Skeleton className='h-7 w-48' />
					<Skeleton className='mt-2 h-4 w-96' />
				</CardHeader>
				<CardContent className='space-y-6'>
					<div className='space-y-2'>
						<Skeleton className='h-4 w-32' />
						<Skeleton className='h-10 w-full' />
						<Skeleton className='h-3 w-64' />
					</div>

					<div className='space-y-2'>
						<Skeleton className='h-4 w-32' />
						<Skeleton className='h-10 w-full' />
						<Skeleton className='h-3 w-80' />
					</div>

					<div className='flex justify-end'>
						<Skeleton className='h-9 w-32' />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
