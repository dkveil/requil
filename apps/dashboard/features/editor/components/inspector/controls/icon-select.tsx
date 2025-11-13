import {
	AlignCenter,
	AlignCenterHorizontal,
	AlignEndHorizontal,
	AlignJustify,
	AlignLeft,
	AlignRight,
	AlignStartHorizontal,
	AlignVerticalSpaceAround,
	Baseline,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface IconOption {
	label: string;
	value: string;
	icon: React.ReactNode;
}

interface IconSelectProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
	options: IconOption[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
	AlignLeft,
	AlignCenter,
	AlignRight,
	AlignJustify,
	AlignStartHorizontal,
	AlignCenterHorizontal,
	AlignEndHorizontal,
	AlignVerticalSpaceAround,
	Baseline,
};

export function IconSelect({
	label,
	value,
	onChange,
	options,
}: IconSelectProps) {
	return (
		<div className='flex items-center justify-between gap-3'>
			<Label className='text-xs text-muted-foreground flex-shrink-0'>
				{label}
			</Label>
			<div className='flex items-center gap-1 bg-accent/50 rounded-md p-0.5'>
				{options.map((option) => {
					const IconComponent =
						typeof option.icon === 'string' ? iconMap[option.icon] : undefined;

					return (
						<button
							key={option.value}
							type='button'
							onClick={() => onChange(option.value)}
							className={cn(
								'p-1.5 rounded transition-colors',
								value === option.value
									? 'bg-background text-foreground shadow-sm'
									: 'text-muted-foreground hover:text-foreground'
							)}
							title={option.label}
						>
							{IconComponent ? (
								<IconComponent className='h-3.5 w-3.5' />
							) : (
								option.icon
							)}
						</button>
					);
				})}
			</div>
		</div>
	);
}
