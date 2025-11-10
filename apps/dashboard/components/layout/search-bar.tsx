'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { MENU_SECTIONS } from '@/features/navigation/constants/menu-structure';
import { useWorkspace } from '@/features/workspace';
import { cn } from '@/lib/utils';

type SearchResult = {
	id: string;
	title: string;
	description: string;
	section: string;
	route: string;
	icon: React.ComponentType<{ className?: string }>;
};

export function SearchBar() {
	const t = useTranslations();
	const router = useRouter();
	const { currentWorkspace } = useWorkspace();
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState('');
	const [results, setResults] = useState<SearchResult[]>([]);
	const [selectedIndex, setSelectedIndex] = useState(0);

	const searchIndex: SearchResult[] = MENU_SECTIONS.flatMap((section) =>
		section.items.map((item) => ({
			id: item.id,
			title: t(`navigation.${section.title}.items.${item.id}.title`),
			description: t(
				`navigation.${section.title}.items.${item.id}.description`
			),
			section: t(`navigation.${section.title}.title`),
			route: currentWorkspace ? item.route(currentWorkspace.slug) : '#',
			icon: item.icon,
		}))
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: just i need to use it once
	useEffect(() => {
		if (!search) {
			setResults([]);
			setSelectedIndex(0);
			return;
		}

		const query = search.toLowerCase();
		const filtered = searchIndex.filter(
			(item) =>
				item.title.toLowerCase().includes(query) ||
				item.description.toLowerCase().includes(query) ||
				item.section.toLowerCase().includes(query)
		);

		setResults(filtered);
		setSelectedIndex(0);
	}, [search]);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (!results.length) return;

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				setSelectedIndex((prev) => (prev + 1) % results.length);
				break;
			case 'ArrowUp':
				e.preventDefault();
				setSelectedIndex(
					(prev) => (prev - 1 + results.length) % results.length
				);
				break;
			case 'Enter':
				e.preventDefault();
				if (results[selectedIndex]) {
					handleSelect(results[selectedIndex]);
				}
				break;
			case 'Escape':
				e.preventDefault();
				setOpen(false);
				setSearch('');
				break;
		}
	};

	const handleSelect = (result: SearchResult) => {
		router.push(result.route);
		setOpen(false);
		setSearch('');
	};

	return (
		<Popover
			open={open}
			onOpenChange={setOpen}
		>
			<PopoverTrigger asChild>
				<div className='relative w-full'>
					<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
					<Input
						type='search'
						placeholder={t('header.searchPlaceholder')}
						className='w-full pl-9'
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
							setOpen(true);
						}}
						onKeyDown={handleKeyDown}
						onFocus={() => setOpen(true)}
					/>
				</div>
			</PopoverTrigger>
			{results.length > 0 && (
				<PopoverContent
					className='w-[var(--radix-popover-trigger-width)] p-0'
					align='start'
					side='bottom'
					sideOffset={4}
				>
					<div className='max-h-[300px] overflow-y-auto'>
						{results.map((result, index) => {
							const Icon = result.icon;
							return (
								<button
									key={result.id}
									type='button'
									onClick={() => handleSelect(result)}
									onMouseEnter={() => setSelectedIndex(index)}
									className={cn(
										'flex w-full items-start gap-3 px-3 py-2 text-left transition-colors cursor-pointer',
										index === selectedIndex
											? 'bg-accent text-accent-foreground'
											: 'hover:bg-accent/50'
									)}
								>
									<Icon className='h-4 w-4 mt-0.5 flex-shrink-0' />
									<div className='flex-1 min-w-0'>
										<div className='font-medium text-sm'>{result.title}</div>
										<div className='text-xs text-muted-foreground truncate'>
											{result.description}
										</div>
									</div>
									<div className='text-xs text-muted-foreground flex-shrink-0'>
										{result.section}
									</div>
								</button>
							);
						})}
					</div>
				</PopoverContent>
			)}
		</Popover>
	);
}
