'use client';

import { Asset } from '@requil/types';
import { Check, Image as ImageIcon, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { findAssets, uploadAsset } from '../../../lib/assets-api';

interface ImagePickerControlProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
	workspaceId: string;
}

export function ImagePickerControl({
	label,
	value,
	onChange,
	workspaceId,
}: ImagePickerControlProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [assets, setAssets] = useState<Asset[]>([]);
	const [loading, setLoading] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedUrl, setSelectedUrl] = useState<string>(value);

	const loadAssets = useCallback(async () => {
		try {
			setLoading(true);
			const response = await findAssets(workspaceId, {
				type: 'image',
				search: searchQuery || undefined,
				limit: 50,
			});
			setAssets(response.data);
		} catch (error: any) {
			const errorMessage = error?.message || 'Failed to load images';
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	}, [workspaceId, searchQuery]);

	useEffect(() => {
		if (isOpen) {
			loadAssets();
		}
	}, [isOpen, loadAssets]);

	const onDrop = useCallback(
		async (acceptedFiles: File[]) => {
			if (acceptedFiles.length === 0) return;

			const file = acceptedFiles[0];
			if (!file) return;

			try {
				setUploading(true);
				const uploadedAsset = await uploadAsset(workspaceId, file, 'image');

				if (uploadedAsset.publicUrl) {
					setAssets((prev) => [uploadedAsset, ...prev]);
					toast.success('Image uploaded successfully!');
				}
			} catch (error: any) {
				const errorMessage = error?.message || 'Failed to upload image';
				toast.error(errorMessage);
			} finally {
				setUploading(false);
			}
		},
		[workspaceId]
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		maxFiles: 1,
		maxSize: 10 * 1024 * 1024,
		accept: {
			'image/jpeg': ['.jpeg', '.jpg'],
			'image/png': ['.png'],
			'image/webp': ['.webp'],
			'image/gif': ['.gif'],
			'image/svg+xml': ['.svg'],
		},
	});

	const handleSelectAsset = (asset: Asset) => {
		if (asset.publicUrl) {
			setSelectedUrl(asset.publicUrl);
		}
	};

	const handleConfirm = () => {
		onChange(selectedUrl);
		setIsOpen(false);
	};

	const handleClear = () => {
		onChange('');
		setSelectedUrl('');
	};

	return (
		<div className='flex items-center justify-between gap-3'>
			<Label className='text-xs text-muted-foreground shrink-0'>{label}</Label>
			<div className='flex items-center gap-2 flex-1'>
				{value && (
					<div className='relative w-8 h-8 rounded border border-border overflow-hidden bg-muted shrink-0'>
						<img
							src={value}
							alt='Preview'
							className='w-full h-full object-cover'
						/>
					</div>
				)}
				<Dialog
					open={isOpen}
					onOpenChange={setIsOpen}
				>
					<DialogTrigger asChild>
						<Button
							type='button'
							variant='outline'
							size='sm'
							className='h-7 text-xs flex-1'
						>
							{value ? 'Change' : 'Select Image'}
						</Button>
					</DialogTrigger>
					<DialogContent className='max-w-4xl max-h-[80vh]'>
						<DialogHeader>
							<DialogTitle>Select or Upload Image</DialogTitle>
						</DialogHeader>

						<div className='space-y-4'>
							<div className='relative'>
								<Input
									type='text'
									placeholder='Search images...'
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className='pl-9'
								/>
								<ImageIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
							</div>

							<div
								{...getRootProps()}
								className={cn(
									'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
									isDragActive
										? 'border-primary bg-primary/5'
										: 'border-border hover:border-primary/50',
									uploading && 'opacity-50 pointer-events-none'
								)}
							>
								<input {...getInputProps()} />
								<Upload className='mx-auto h-8 w-8 text-muted-foreground mb-2' />
								<p className='text-sm text-muted-foreground'>
									{uploading
										? 'Uploading...'
										: isDragActive
											? 'Drop image here'
											: 'Drag & drop or click to upload'}
								</p>
								<p className='text-xs text-muted-foreground mt-1'>
									Max 10MB • JPG, PNG, WebP, GIF, SVG
								</p>
							</div>

							<ScrollArea className='h-[400px] pr-4'>
								{loading ? (
									<div className='grid grid-cols-4 gap-4'>
										{Array.from({ length: 8 }, (_, index) => index).map(
											(index) => (
												<Skeleton
													key={`skeleton-${index}`}
													className='aspect-square rounded-lg'
												/>
											)
										)}
									</div>
								) : assets.length === 0 ? (
									<div className='flex flex-col items-center justify-center h-[200px] text-center'>
										<ImageIcon className='h-12 w-12 text-muted-foreground/50 mb-2' />
										<p className='text-sm text-muted-foreground'>
											No images found
										</p>
										<p className='text-xs text-muted-foreground'>
											Upload your first image above
										</p>
									</div>
								) : (
									<div className='grid grid-cols-4 gap-4'>
										{assets.map((asset) => (
											<button
												key={asset.id}
												type='button'
												onClick={() => handleSelectAsset(asset)}
												className={cn(
													'relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105',
													selectedUrl === asset.publicUrl
														? 'border-primary ring-2 ring-primary/20'
														: 'border-border hover:border-primary/50'
												)}
											>
												{asset.publicUrl ? (
													<img
														src={asset.publicUrl}
														alt={asset.alt || asset.originalFilename}
														className='w-full h-full object-cover'
													/>
												) : (
													<div className='w-full h-full flex items-center justify-center bg-muted'>
														<ImageIcon className='h-8 w-8 text-muted-foreground' />
													</div>
												)}
												{selectedUrl === asset.publicUrl && (
													<div className='absolute inset-0 bg-primary/20 flex items-center justify-center'>
														<div className='bg-primary text-primary-foreground rounded-full p-1'>
															<Check className='h-4 w-4' />
														</div>
													</div>
												)}
											</button>
										))}
									</div>
								)}
							</ScrollArea>

							<div className='flex items-center justify-between pt-4 border-t'>
								<Button
									type='button'
									variant='ghost'
									size='sm'
									onClick={handleClear}
								>
									Clear
								</Button>
								<div className='flex gap-2'>
									<Button
										type='button'
										variant='outline'
										size='sm'
										onClick={() => setIsOpen(false)}
									>
										Cancel
									</Button>
									<Button
										type='button'
										size='sm'
										onClick={handleConfirm}
										disabled={!selectedUrl}
									>
										Select
									</Button>
								</div>
							</div>
						</div>
					</DialogContent>
				</Dialog>
				{value && (
					<Button
						type='button'
						variant='ghost'
						size='sm'
						className='h-7 w-7 p-0'
						onClick={handleClear}
					>
						<X className='h-3 w-3' />
					</Button>
				)}
			</div>
		</div>
	);
}
