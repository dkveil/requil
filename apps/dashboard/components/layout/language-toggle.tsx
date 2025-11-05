'use client';

import { Languages } from 'lucide-react';
import { useLocale } from 'next-intl';
import { setLocale } from '@/app/actions/locale';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type Locale, localeNames, locales } from '@/i18n/i18n.config';

export function LanguageToggle() {
	const locale = useLocale();

	const switchLocale = async (newLocale: Locale) => {
		await setLocale(newLocale);
		window.location.reload();
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant='outline'
					size='icon'
				>
					<Languages className='h-[1.2rem] w-[1.2rem]' />
					<span className='sr-only'>Change language</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end'>
				{locales.map((loc) => (
					<DropdownMenuItem
						key={loc}
						onClick={() => switchLocale(loc)}
						disabled={locale === loc}
					>
						{localeNames[loc]}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
