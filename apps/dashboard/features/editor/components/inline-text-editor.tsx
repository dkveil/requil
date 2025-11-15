'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface InlineTextEditorProps {
	value: string;
	onChange: (value: string) => void;
	onComplete: () => void;
	multiline?: boolean;
	style?: React.CSSProperties;
	className?: string;
	placeholder?: string;
}

export function InlineTextEditor({
	value,
	onChange,
	onComplete,
	multiline = false,
	style,
	className,
	placeholder,
}: InlineTextEditorProps) {
	const [localValue, setLocalValue] = useState(value);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const ref = multiline ? textareaRef.current : inputRef.current;
		if (ref) {
			ref.focus();
			ref.select();
		}
	}, [multiline]);

	useEffect(() => {
		if (multiline && textareaRef.current) {
			textareaRef.current.style.height = 'auto';
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
		}
	}, [multiline]);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const newValue = e.target.value;
		setLocalValue(newValue);
		onChange(newValue);
	};

	const handleKeyDown = (
		e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		if (e.key === 'Escape') {
			e.preventDefault();
			e.stopPropagation();
			onComplete();
		} else if (e.key === 'Enter' && !multiline) {
			e.preventDefault();
			e.stopPropagation();
			onComplete();
		} else if (e.key === 'Enter' && e.ctrlKey && multiline) {
			e.preventDefault();
			e.stopPropagation();
			onComplete();
		}
	};

	const handleBlur = () => {
		onComplete();
	};

	const handleClick = (
		e: React.MouseEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		e.stopPropagation();
	};

	const handleMouseDown = (
		e: React.MouseEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		e.stopPropagation();
	};

	const commonProps = {
		value: localValue,
		onChange: handleChange,
		onKeyDown: handleKeyDown,
		onBlur: handleBlur,
		onClick: handleClick,
		onMouseDown: handleMouseDown,
		style,
		className: cn(
			'w-full bg-white/95 border-2 border-blue-500 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500',
			className
		),
		placeholder,
	};

	if (multiline) {
		return (
			<textarea
				ref={textareaRef}
				{...commonProps}
				rows={1}
				className={cn(commonProps.className, 'resize-none overflow-hidden')}
			/>
		);
	}

	return (
		<input
			ref={inputRef}
			type='text'
			{...commonProps}
		/>
	);
}
