import { DASHBOARD_ROUTES } from '@requil/utils/dashboard-routes';
import { FileText, Mail, Plus } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

type Props = {
	params: Promise<{ slug: string }>;
};

const MOCK_TEMPLATES = [
	{
		id: '1',
		name: 'Welcome Email',
		description: 'Welcome email for new users',
		updatedAt: new Date('2024-01-15'),
	},
	{
		id: '2',
		name: 'Password Reset',
		description: 'Password reset email template',
		updatedAt: new Date('2024-01-10'),
	},
	{
		id: '3',
		name: 'Newsletter',
		description: 'Monthly newsletter template',
		updatedAt: new Date('2024-01-05'),
	},
];

export default async function EmailTemplatesPage({ params }: Props) {
	const { slug } = await params;
	const t = await getTranslations('templates');

	return (
		<div className='mx-auto max-w-7xl flex flex-col gap-6 p-8'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold tracking-tight'>{t('title')}</h1>
					<p className='text-muted-foreground mt-1'>{t('description')}</p>
				</div>
				<Button asChild>
					<Link href={DASHBOARD_ROUTES.WORKSPACE.NEW_EMAIL_TEMPLATE(slug)}>
						<Plus />
						{t('newTemplate')}
					</Link>
				</Button>
			</div>

			{MOCK_TEMPLATES.length === 0 ? (
				<Card className='border-dashed'>
					<CardContent className='flex flex-col items-center justify-center py-16'>
						<div className='flex size-12 items-center justify-center rounded-full bg-muted'>
							<Mail className='size-6 text-muted-foreground' />
						</div>
						<h3 className='mt-4 text-lg font-semibold'>
							{t('noTemplatesYet')}
						</h3>
						<p className='text-sm text-muted-foreground mt-2 text-center max-w-sm'>
							{t('noTemplatesDescription')}
						</p>
						<Button
							asChild
							className='mt-6'
						>
							<Link href={DASHBOARD_ROUTES.WORKSPACE.NEW_EMAIL_TEMPLATE(slug)}>
								<Plus />
								{t('createTemplate')}
							</Link>
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
					{MOCK_TEMPLATES.map((template) => (
						<Link
							key={template.id}
							href={DASHBOARD_ROUTES.WORKSPACE.EMAIL_TEMPLATE_EDITOR(
								slug,
								template.id
							)}
							className='group'
						>
							<Card className='h-full transition-all hover:shadow-md hover:border-primary/50'>
								<CardHeader>
									<div className='flex items-start justify-between'>
										<div className='flex items-center gap-3'>
											<div className='flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary'>
												<FileText className='size-5' />
											</div>
											<div>
												<CardTitle className='text-lg group-hover:text-primary transition-colors'>
													{template.name}
												</CardTitle>
												<CardDescription className='text-xs mt-1'>
													{t('updated')}{' '}
													{template.updatedAt.toLocaleDateString('en-US', {
														month: 'short',
														day: 'numeric',
													})}
												</CardDescription>
											</div>
										</div>
									</div>
								</CardHeader>
								<CardContent>
									<p className='text-sm text-muted-foreground line-clamp-2'>
										{template.description}
									</p>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
