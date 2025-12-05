import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const textareaVariants = cva(
	'flex w-full outline-none disabled:cursor-not-allowed disabled:opacity-50',
	{
		variants: {
			variant: {
				default:
					'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 field-sizing-content min-h-16 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] focus-visible:ring-[3px] md:text-sm',
				unstyled:
					'bg-transparent border-0 p-0 m-0 resize-none overflow-hidden font-[inherit] leading-[inherit] text-[length:inherit]',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	}
);

function Textarea({
	className,
	variant,
	...props
}: React.ComponentProps<'textarea'> & VariantProps<typeof textareaVariants>) {
	return (
		<textarea
			data-slot='textarea'
			className={cn(textareaVariants({ variant, className }))}
			{...props}
		/>
	);
}

export { Textarea, textareaVariants };
