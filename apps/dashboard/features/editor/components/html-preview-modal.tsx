'use client';

import type { Document } from '@requil/types/editor';
import {
	AlertTriangle,
	CheckCircle2,
	Code,
	Eye,
	FileJson,
	Loader2,
	XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateHtmlPreview } from '../actions/generate-html-preview';

interface HtmlPreviewModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	document: Document | null;
}

export function HtmlPreviewModal({
	open,
	onOpenChange,
	document,
}: HtmlPreviewModalProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [renderResult, setRenderResult] = useState<{
		html: string;
		warnings: string[];
		errors: string[];
	}>({
		html: '',
		warnings: [],
		errors: [],
	});

	// Generate preview when modal opens or document changes
	useEffect(() => {
		if (!(open && document)) {
			return;
		}

		let isCancelled = false;

		async function generate() {
			setIsLoading(true);
			try {
				const result = await generateHtmlPreview(document);

				if (!isCancelled) {
					setRenderResult({
						html: result.html || '',
						warnings: result.warnings || [],
						errors: result.errors || [],
					});
				}
			} catch (error) {
				if (!isCancelled) {
					setRenderResult({
						html: '',
						warnings: [],
						errors: [
							`Failed to generate preview: ${error instanceof Error ? error.message : String(error)}`,
						],
					});
				}
			} finally {
				if (!isCancelled) {
					setIsLoading(false);
				}
			}
		}

		generate();

		return () => {
			isCancelled = true;
		};
	}, [open, document]);

	const hasErrors = renderResult.errors.length > 0;
	const hasWarnings = renderResult.warnings.length > 0;
	const hasIssues = hasErrors || hasWarnings;

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className='max-w-[800px]! h-[90vh] flex flex-col'>
				<DialogHeader>
					<DialogTitle>HTML Preview</DialogTitle>
					<DialogDescription>
						Preview your email template and inspect the generated HTML
					</DialogDescription>
				</DialogHeader>

				<Tabs
					defaultValue='preview'
					className='flex-1 flex flex-col overflow-hidden'
				>
					<TabsList className='w-full justify-start'>
						<TabsTrigger
							value='preview'
							className='gap-2'
						>
							<Eye className='h-4 w-4' />
							Preview
						</TabsTrigger>
						<TabsTrigger
							value='issues'
							className='gap-2'
						>
							{hasErrors ? (
								<XCircle className='h-4 w-4 text-destructive' />
							) : hasWarnings ? (
								<AlertTriangle className='h-4 w-4 text-yellow-500' />
							) : (
								<CheckCircle2 className='h-4 w-4 text-green-500' />
							)}
							Issues{' '}
							{hasIssues &&
								`(${renderResult.errors.length + renderResult.warnings.length})`}
						</TabsTrigger>
						<TabsTrigger
							value='document'
							className='gap-2'
						>
							<FileJson className='h-4 w-4' />
							Document
						</TabsTrigger>
						<TabsTrigger
							value='html'
							className='gap-2'
						>
							<Code className='h-4 w-4' />
							HTML
						</TabsTrigger>
					</TabsList>

					<TabsContent
						value='preview'
						className='flex-1 overflow-auto mt-4'
					>
						{isLoading ? (
							<div className='flex items-center justify-center h-full'>
								<div className='text-center space-y-4'>
									<Loader2 className='h-16 w-16 text-muted-foreground mx-auto animate-spin' />
									<div>
										<h3 className='text-lg font-semibold'>
											Generating preview...
										</h3>
										<p className='text-sm text-muted-foreground'>
											Converting your email to HTML
										</p>
									</div>
								</div>
							</div>
						) : hasErrors ? (
							<div className='flex items-center justify-center h-full'>
								<div className='text-center space-y-4'>
									<XCircle className='h-16 w-16 text-destructive mx-auto' />
									<div>
										<h3 className='text-lg font-semibold'>
											Preview unavailable
										</h3>
										<p className='text-sm text-muted-foreground'>
											Fix the errors in the Issues tab to see the preview
										</p>
									</div>
								</div>
							</div>
						) : (
							<div className='max-w-[600px] bg-muted/30 rounded-md mx-auto overflow-hidden'>
								<iframe
									srcDoc={renderResult.html}
									className='w-full h-full border-0 bg-transparent'
									title='Email Preview'
									sandbox='allow-same-origin'
								/>
							</div>
						)}
					</TabsContent>

					<TabsContent
						value='issues'
						className='flex-1 overflow-auto mt-4'
					>
						<div className='space-y-4'>
							{renderResult.errors.length > 0 && (
								<div className='space-y-2'>
									<h3 className='text-sm font-semibold flex items-center gap-2 text-destructive'>
										<XCircle className='h-4 w-4' />
										Errors ({renderResult.errors.length})
									</h3>
									<div className='space-y-2'>
										{renderResult.errors.map((error, index) => (
											<div
												key={error}
												className='p-3 bg-destructive/10 border border-destructive/20 rounded-md'
											>
												<pre className='text-xs font-mono whitespace-pre-wrap text-destructive'>
													{error}
												</pre>
											</div>
										))}
									</div>
								</div>
							)}

							{renderResult.warnings.length > 0 && (
								<div className='space-y-2'>
									<h3 className='text-sm font-semibold flex items-center gap-2 text-yellow-600 dark:text-yellow-500'>
										<AlertTriangle className='h-4 w-4' />
										Warnings ({renderResult.warnings.length})
									</h3>
									<div className='space-y-2'>
										{renderResult.warnings.map((warning, index) => (
											<div
												key={warning}
												className='p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md'
											>
												<pre className='text-xs font-mono whitespace-pre-wrap text-yellow-700 dark:text-yellow-400'>
													{warning}
												</pre>
											</div>
										))}
									</div>
								</div>
							)}

							{!hasIssues && (
								<div className='flex items-center justify-center h-full py-12'>
									<div className='text-center space-y-4'>
										<CheckCircle2 className='h-16 w-16 text-green-500 mx-auto' />
										<div>
											<h3 className='text-lg font-semibold'>No issues found</h3>
											<p className='text-sm text-muted-foreground'>
												Your email template looks good!
											</p>
										</div>
									</div>
								</div>
							)}
						</div>
					</TabsContent>

					<TabsContent
						value='document'
						className='flex-1 overflow-auto mt-4'
					>
						<div className='bg-muted/30 rounded-md p-4 h-full overflow-auto relative'>
							<Button
								variant='outline'
								size='sm'
								className='absolute top-2 right-2 z-10'
								onClick={() => {
									navigator.clipboard.writeText(
										JSON.stringify(document, null, 2)
									);
									toast.success('Document JSON copied to clipboard');
								}}
							>
								Copy
							</Button>
							<pre className='text-xs font-mono whitespace-pre-wrap'>
								{JSON.stringify(document, null, 2)}
							</pre>
						</div>
					</TabsContent>

					<TabsContent
						value='html'
						className='flex-1 overflow-auto mt-4'
					>
						<div className='bg-muted/30 rounded-md p-4 h-full overflow-auto relative'>
							<Button
								variant='outline'
								size='sm'
								className='absolute top-2 right-2 z-10'
								onClick={() => {
									navigator.clipboard.writeText(renderResult.html);
									toast.success('HTML copied to clipboard');
								}}
							>
								Copy
							</Button>
							<pre className='text-xs font-mono whitespace-pre-wrap'>
								{renderResult.html}
							</pre>
						</div>
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}
