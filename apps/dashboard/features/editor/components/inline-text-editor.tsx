'use client';

import { useEffect, useRef, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
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

	// biome-ignore lint/correctness/useExhaustiveDependencies: we need to update the height of the textarea when the value changes
	useEffect(() => {
		if (multiline && textareaRef.current) {
			textareaRef.current.style.height = 'auto';
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
		}
	}, [multiline, value]);

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

	const handlePointerDown = (
		e: React.PointerEvent<HTMLInputElement | HTMLTextAreaElement>
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
		onPointerDown: handlePointerDown,
		style,
		className: cn(
			'p-0! m-0! w-full border-0! bg-white/95 bg-transparent rounded-none focus:outline-none',
			'font-[inherit]!',
			className
		),
		placeholder,
	};

	if (multiline) {
		return (
			<Textarea
				variant='unstyled'
				ref={textareaRef}
				rows={1}
				{...commonProps}
				className={cn(commonProps.className, 'overflow-hidden resize-none')}
			/>
		);
	}

	return (
		<input
			ref={inputRef}
			type='text'
			size={localValue.length || 1}
			{...commonProps}
		/>
	);
}
