import { DASHBOARD_ROUTES } from '@requil/utils/dashboard-routes';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { LanguageToggle } from '@/components/layout/language-toggle';
import { ModeToggle } from '@/components/layout/theme-toggle';
import Logo from '@/components/logo';
import { Button } from '@/components/ui/button';

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
			<div className='relative hidden lg:flex items-center justify-center overflow-hidden'>
				<div className='absolute inset-0 bg-gradient-to-br from-primary via-primary/70 to-primary/40 animate-gradient-shift' />

				<div className='relative z-10 flex flex-col items-center gap-6 px-10 w-full'>
					<div className='relative w-full max-w-xl aspect-[5/3] rounded-xl border-2 border-white/20 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden'>
						<div className='absolute inset-0 flex items-center justify-center text-white/30'>
							<svg
								className='w-16 h-16'
								fill='none'
								stroke='currentColor'
								strokeWidth='1.5'
								viewBox='0 0 24 24'
							>
								<title>Email template editor</title>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									d='M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75'
								/>
							</svg>
						</div>
					</div>

					<Link href={DASHBOARD_ROUTES.DEMO.EDITOR}>
						<Button
							variant='secondary'
							size='lg'
							className='gap-2 group/btn'
						>
							Wypróbuj demo
							<ArrowRight className='w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform' />
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
