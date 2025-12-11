import { DASHBOARD_ROUTES } from '@requil/utils/dashboard-routes';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
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
					<div className='relative w-full max-w-2xl aspect-video shadow-[0_20px_50px_rgba(0,0,0,0.5) rounded overflow-hidden'>
						<Image
							src='/images/editor-screenshot.png'
							alt='Requil Email Editor'
							fill
							className='object-contain'
							priority
						/>
					</div>

					<Link href={DASHBOARD_ROUTES.DEMO.EDITOR}>
						<Button
							variant='secondary'
							size='lg'
							className='gap-2 group/btn'
						>
							DEMO
							<ArrowRight className='w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform' />
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
