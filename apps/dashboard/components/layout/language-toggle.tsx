'use client';

import { Languages } from 'lucide-react';
import { useLocale } from 'next-intl';
import { setLocale } from '@/actions/locale';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type Locale, localeNames, locales } from '@/i18n/i18n.config';

type Props = {
	iconClassName?: string;
};

export function LanguageToggle(props: Props) {
	const locale = useLocale();
	const { iconClassName = 'h-[1.2rem] w-[1.2rem]' } = props;

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
					<Languages className={iconClassName} />
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
