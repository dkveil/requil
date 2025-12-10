import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function DevelopersSettingsLoading() {
	return (
		<div className='flex flex-col gap-6'>
			<Card>
				<CardHeader>
					<div className='flex items-center justify-between'>
						<div className='flex-1'>
							<Skeleton className='h-7 w-32' />
							<Skeleton className='mt-2 h-4 w-96' />
						</div>
						<Skeleton className='h-9 w-36' />
					</div>
				</CardHeader>
				<CardContent>
					<div className='flex flex-col items-center justify-center rounded-lg border border-dashed py-12'>
						<Skeleton className='h-5 w-32' />
						<Skeleton className='mt-2 h-4 w-64' />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<Skeleton className='h-7 w-32' />
					<Skeleton className='mt-2 h-4 w-96' />
				</CardHeader>
				<CardContent>
					<Skeleton className='h-4 w-40' />
				</CardContent>
			</Card>
		</div>
	);
}
