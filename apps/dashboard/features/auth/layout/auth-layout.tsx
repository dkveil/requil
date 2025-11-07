import { DASHBOARD_ROUTES } from '@requil/utils/dashboard-routes';
import Link from 'next/link';
import { LanguageToggle } from '@/components/layout/language-toggle';
import { ModeToggle } from '@/components/layout/theme-toggle';
import Logo from '@/components/logo';

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className='grid min-h-svh lg:grid-cols-2'>
			<div className='flex flex-col gap-4 p-6 md:p-10'>
				<div className='flex items-center justify-between'>
					<Link href={DASHBOARD_ROUTES.HOME}>
						<Logo />
					</Link>
					<div className='flex items-center gap-2'>
						<LanguageToggle />
						<ModeToggle />
					</div>
				</div>
				<div className='flex flex-1 items-center justify-center'>
					<div className='w-full'>{children}</div>
				</div>
				<div className='text-center'>
					<p className='text-muted-foreground text-sm'>
						designed by{' '}
						<a
							href='https://reveil.dev'
							target='_blank'
							rel='noopener noreferrer'
							className='hover:text-foreground font-medium transition-colors underline-offset-4 hover:underline'
						>
							reveil.dev
						</a>
					</p>
				</div>
			</div>
			<div className='bg-muted relative hidden lg:block'>
				{/* <Image
					src='/placeholder.svg'
					alt='Requil logo'
					className='absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale'
				/> */}
			</div>
		</div>
	);
}
