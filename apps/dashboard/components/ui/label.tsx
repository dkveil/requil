import * as React from 'react';

export interface LabelProps
	extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
	({ className, ...props }, ref) => {
		return (
			// biome-ignore lint/a11y/noLabelWithoutControl: Generic label component used with inputs via htmlFor
			<label
				ref={ref}
				className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
				{...props}
			/>
		);
	}
);
Label.displayName = 'Label';

export { Label };
