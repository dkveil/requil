'use client';

import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
	Bold,
	Italic,
	Link as LinkIcon,
	Underline as UnderlineIcon,
	Unlink,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
	value: string;
	onChange: (value: string) => void;
	onBlur?: () => void;
	editable?: boolean;
	className?: string;
}

export function RichTextEditor({
	value,
	onChange,
	onBlur,
	editable = true,
	className,
}: RichTextEditorProps) {
	const [linkUrl, setLinkUrl] = useState('');
	const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading: false,
				bulletList: false,
				orderedList: false,
				dropcursor: false,
			}),
			Underline,
			Link.configure({
				openOnClick: false,
				HTMLAttributes: {
					class: 'text-blue-600 underline',
				},
			}),
		],
		content: value,
		editable,
		onUpdate: ({ editor }) => {
			const html = editor.getHTML();
			onChange(html === '<p></p>' ? '' : html);
		},
		onBlur: ({ event }) => {
			onBlur?.();
		},
		editorProps: {
			attributes: {
				class: cn(
					'prose prose-sm focus:outline-none min-h-[1em] max-w-none [&_p]:my-0',
					className
				),
			},
		},
	});

	useEffect(() => {
		if (editor && !editor.isFocused && value !== editor.getHTML()) {
			editor.commands.setContent(value);
		}
	}, [value, editor]);

	const setLink = useCallback(() => {
		if (!editor) return;

		if (linkUrl === '') {
			editor.chain().focus().extendMarkRange('link').unsetLink().run();
		} else {
			editor
				.chain()
				.focus()
				.extendMarkRange('link')
				.setLink({ href: linkUrl })
				.run();
		}
		setIsLinkPopoverOpen(false);
	}, [editor, linkUrl]);

	const onLinkButtonClick = () => {
		if (!editor) return;
		const previousUrl = editor.getAttributes('link').href;
		setLinkUrl(previousUrl || '');
		setIsLinkPopoverOpen(true);
	};

	if (!editor) {
		return null;
	}

	return (
		<div className='relative w-full border rounded-md bg-background'>
			{editable && (
				<div className='flex items-center gap-1 border-b p-1 bg-muted/20'>
					<Button
						variant='ghost'
						size='icon'
						className={cn('h-8 w-8', editor.isActive('bold') && 'bg-muted')}
						onClick={() => editor.chain().focus().toggleBold().run()}
						title='Bold'
					>
						<Bold className='h-4 w-4' />
					</Button>
					<Button
						variant='ghost'
						size='icon'
						className={cn('h-8 w-8', editor.isActive('italic') && 'bg-muted')}
						onClick={() => editor.chain().focus().toggleItalic().run()}
						title='Italic'
					>
						<Italic className='h-4 w-4' />
					</Button>
					<Button
						variant='ghost'
						size='icon'
						className={cn(
							'h-8 w-8',
							editor.isActive('underline') && 'bg-muted'
						)}
						onClick={() => editor.chain().focus().toggleUnderline().run()}
						title='Underline'
					>
						<UnderlineIcon className='h-4 w-4' />
					</Button>

					<Popover
						open={isLinkPopoverOpen}
						onOpenChange={setIsLinkPopoverOpen}
					>
						<PopoverTrigger asChild>
							<Button
								variant='ghost'
								size='icon'
								className={cn('h-8 w-8', editor.isActive('link') && 'bg-muted')}
								onClick={onLinkButtonClick}
								title='Link'
							>
								<LinkIcon className='h-4 w-4' />
							</Button>
						</PopoverTrigger>
						<PopoverContent
							className='w-80 p-2'
							align='start'
						>
							<div className='flex gap-2'>
								<Input
									value={linkUrl}
									onChange={(e) => setLinkUrl(e.target.value)}
									placeholder='https://example.com'
									onKeyDown={(e) => {
										if (e.key === 'Enter') {
											setLink();
										}
									}}
								/>
								<Button
									size='sm'
									onClick={setLink}
								>
									Save
								</Button>
							</div>
						</PopoverContent>
					</Popover>

					{editor.isActive('link') && (
						<Button
							variant='ghost'
							size='icon'
							className='h-8 w-8'
							onClick={() => editor.chain().focus().unsetLink().run()}
							title='Unlink'
						>
							<Unlink className='h-4 w-4' />
						</Button>
					)}
				</div>
			)}
			<EditorContent
				editor={editor}
				className='p-2'
			/>
		</div>
	);
}
