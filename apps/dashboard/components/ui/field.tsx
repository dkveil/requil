import * as React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const FieldGroup = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn('grid gap-4', className)}
		{...props}
	/>
));
FieldGroup.displayName = 'FieldGroup';

const Field = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn('grid gap-2', className)}
		{...props}
	/>
));
Field.displayName = 'Field';

const FieldLabel = React.forwardRef<
	React.ElementRef<typeof Label>,
	React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => (
	<Label
		ref={ref}
		className={cn('text-sm font-medium', className)}
		{...props}
	/>
));
FieldLabel.displayName = 'FieldLabel';

const FieldDescription = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<p
		ref={ref}
		className={cn('text-muted-foreground text-sm', className)}
		{...props}
	/>
));
FieldDescription.displayName = 'FieldDescription';

const FieldSeparator = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
	<div
		ref={ref}
		className={cn('relative my-4', className)}
		{...props}
	>
		<div className='absolute inset-0 flex items-center'>
			<span className='w-full border-t' />
		</div>
		{children && (
			<div className='relative flex justify-center text-xs uppercase'>
				<span className='bg-background text-muted-foreground px-2'>
					{children}
				</span>
			</div>
		)}
	</div>
));
FieldSeparator.displayName = 'FieldSeparator';

export { FieldGroup, Field, FieldLabel, FieldDescription, FieldSeparator };
