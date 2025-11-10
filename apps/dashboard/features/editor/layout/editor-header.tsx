'use client';

import { DASHBOARD_ROUTES } from '@requil/utils/dashboard-routes';
import { Monitor, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import LogoSmall from '@/components/logo-small';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useEditor } from '../hooks/use-editor';

export default function EditorHeader() {
	const t = useTranslations('editor.header');
	const { projectName } = useEditor();

	return (
		<header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-1'>
			<div className='flex h-10 items-center justify-between gap-4 px-4'>
				<div className='flex items-center flex-1 gap-4'>
					<Link href={DASHBOARD_ROUTES.HOME}>
						<LogoSmall
							variant='light'
							size={24}
						/>
					</Link>
					<Separator
						orientation='vertical'
						className=' h-[24px]!'
					/>

					<span className='text-xl uppercase'>{projectName}</span>
				</div>

				<div>
					<Button variant='ghost'>
						<Monitor className='h-4 w-4' />
						{t('dekstop')}
					</Button>
					<Button variant='ghost'>
						<Smartphone className='h-4 w-4' />
						{t('mobile')}
					</Button>
				</div>

				<div className='flex justify-end items-center flex-1 gap-2'>
					<Button variant='outline'>{t('testEmail')}</Button>

					<Separator
						orientation='vertical'
						className='h-[36px]!'
					/>

					<Link href={DASHBOARD_ROUTES.HOME}>
						<Button variant='outline'>{t('exit')}</Button>
					</Link>
					<Button variant='default'>{t('publish')}</Button>
				</div>
			</div>
		</header>
	);
}
