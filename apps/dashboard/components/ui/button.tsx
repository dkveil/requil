import * as React from 'react';

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'default' | 'outline' | 'ghost';
	size?: 'default' | 'sm' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{ className, variant = 'default', size = 'default', children, ...props },
		ref
	) => {
		const baseStyles =
			'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

		const variantStyles = {
			default: 'bg-gray-900 text-white hover:bg-gray-800',
			outline:
				'border border-gray-300 bg-white hover:bg-gray-100 text-gray-900',
			ghost: 'hover:bg-gray-100 text-gray-900',
		};

		const sizeStyles = {
			default: 'h-10 px-4 py-2',
			sm: 'h-9 rounded-md px-3',
			lg: 'h-11 rounded-md px-8',
		};

		return (
			<button
				className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
				ref={ref}
				{...props}
			>
				{children}
			</button>
		);
	}
);
Button.displayName = 'Button';

export { Button };
