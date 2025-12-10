import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function TransportSettingsLoading() {
	return (
		<div className='flex flex-col gap-6'>
			<Card>
				<CardHeader>
					<Skeleton className='h-7 w-64' />
					<Skeleton className='mt-2 h-4 w-full max-w-2xl' />
				</CardHeader>
				<CardContent className='space-y-6'>
					<div className='space-y-4'>
						<Skeleton className='h-4 w-32' />
						<div className='space-y-3'>
							{[1, 2, 3].map((i) => (
								<div
									key={i}
									className='flex items-start space-x-3 rounded-lg border p-4'
								>
									<Skeleton className='size-5 rounded-full' />
									<div className='flex-1 space-y-2'>
										<div className='flex items-center gap-2'>
											<Skeleton className='h-5 w-40' />
											{i > 1 && <Skeleton className='h-5 w-24' />}
										</div>
										<Skeleton className='h-4 w-full max-w-md' />
									</div>
								</div>
							))}
						</div>
					</div>

					<div className='rounded-lg border bg-muted/50 p-4'>
						<Skeleton className='h-4 w-full max-w-xl' />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
