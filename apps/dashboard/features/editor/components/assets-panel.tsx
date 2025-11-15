'use client';

import { useDraggable } from '@dnd-kit/core';
import type { Asset, AssetType } from '@requil/types';
import { FileText, Image, Search, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { deleteAsset, findAssets, uploadAsset } from '../lib/assets-api';

interface AssetsPanelProps {
	workspaceId: string;
	onSelectAsset?: (asset: Asset) => void;
	filterType?: AssetType;
}

export function AssetsPanel({
	workspaceId,
	onSelectAsset,
	filterType,
}: AssetsPanelProps) {
	const [assets, setAssets] = useState<Asset[]>([]);
	const [loading, setLoading] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

	const loadAssets = useCallback(async () => {
		try {
			setLoading(true);
			const response = await findAssets(workspaceId, {
				type: filterType,
				search: searchQuery || undefined,
				limit: 50,
			});
			setAssets(response.data);
		} catch (error: any) {
			const message = error?.message || 'Failed to load assets';
			toast.error(message);
		} finally {
			setLoading(false);
		}
	}, [workspaceId, filterType, searchQuery]);

	useEffect(() => {
		loadAssets();
	}, [loadAssets]);

	const onDrop = useCallback(
		async (acceptedFiles: File[]) => {
			if (acceptedFiles.length === 0) return;

			const file = acceptedFiles[0];
			if (!file) return;

			try {
				setUploading(true);
				const type = filterType || 'image';
				const uploadedAsset = await uploadAsset(workspaceId, file, type);
				setAssets((prev) => [uploadedAsset, ...prev]);
				toast.success('Asset uploaded successfully!');
			} catch (error: any) {
				const message = error?.message || 'Failed to upload asset';
				toast.error(message);
			} finally {
				setUploading(false);
			}
		},
		[workspaceId, filterType]
	);

	const handleDelete = async (assetId: string) => {
		try {
			await deleteAsset(workspaceId, assetId);
			setAssets((prev) => prev.filter((a) => a.id !== assetId));
			if (selectedAsset === assetId) {
				setSelectedAsset(null);
			}
			toast.success('Asset deleted successfully!');
		} catch (error: any) {
			const message = error?.message || 'Failed to delete asset';
			toast.error(message);
		}
	};

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept:
			filterType === 'image'
				? {
						'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],
					}
				: {
						'font/*': ['.woff', '.woff2', '.ttf', '.otf'],
					},
		maxSize: 10 * 1024 * 1024,
		multiple: false,
	});

	const handleSearch = () => {
		loadAssets();
	};

	return (
		<div className='flex flex-col h-full'>
			<div className='p-4 border-b space-y-4'>
				<div className='flex items-center gap-2'>
					<div className='relative flex-1'>
						<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
						<Input
							type='search'
							placeholder='Search assets...'
							className='pl-8 h-9 text-sm bg-background'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
						/>
					</div>
					<Button
						onClick={handleSearch}
						size='sm'
						variant='outline'
					>
						Search
					</Button>
				</div>

				<div
					{...getRootProps()}
					className={cn(
						'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
						isDragActive
							? 'border-primary bg-primary/5'
							: 'border-border hover:border-primary/50',
						uploading && 'opacity-50 pointer-events-none'
					)}
				>
					<input {...getInputProps()} />
					<Upload className='h-8 w-8 mx-auto mb-2 text-muted-foreground' />
					<p className='text-sm text-muted-foreground'>
						{uploading
							? 'Uploading...'
							: isDragActive
								? 'Drop file here'
								: 'Drag & drop or click to upload'}
					</p>
					<p className='text-xs text-muted-foreground mt-1'>
						Max 10MB • {filterType === 'image' ? 'Images' : 'Fonts'} only
					</p>
				</div>
			</div>

			<div className='flex-1 overflow-auto p-4'>
				{loading ? (
					<div className='text-center text-sm text-muted-foreground py-8'>
						Loading...
					</div>
				) : assets.length === 0 ? (
					<div className='text-center text-sm text-muted-foreground py-8'>
						No assets found
					</div>
				) : (
					<div className='grid grid-cols-2 gap-3'>
						{assets.map((asset) => (
							<AssetCard
								key={asset.id}
								asset={asset}
								isSelected={selectedAsset === asset.id}
								onSelect={() => {
									setSelectedAsset(asset.id);
									onSelectAsset?.(asset);
								}}
								onDelete={() => handleDelete(asset.id)}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

interface AssetCardProps {
	asset: Asset;
	isSelected: boolean;
	onSelect: () => void;
	onDelete: () => void;
}

function AssetCard({ asset, isSelected, onSelect, onDelete }: AssetCardProps) {
	const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
		id: `asset-${asset.id}`,
		data: {
			type: 'asset',
			assetId: asset.id,
			assetType: asset.type,
			publicUrl: asset.publicUrl,
			alt: asset.alt || asset.originalFilename,
		},
	});

	const handleClick = (e: React.MouseEvent) => {
		if (!isDragging) {
			onSelect();
		}
	};

	return (
		<div
			ref={setNodeRef}
			className={cn(
				'relative group rounded-lg border overflow-hidden cursor-grab active:cursor-grabbing transition-all w-full text-left',
				isSelected
					? 'border-primary ring-2 ring-primary'
					: 'border-border hover:border-primary/50',
				isDragging && 'opacity-50'
			)}
			onClick={handleClick}
			{...listeners}
			{...attributes}
		>
			<div className='aspect-square bg-muted flex items-center justify-center'>
				{asset.type === 'image' ? (
					asset.publicUrl ? (
						<img
							src={asset.publicUrl}
							alt={asset.alt || asset.filename}
							className='w-full h-full object-cover'
						/>
					) : (
						<Image className='h-8 w-8 text-muted-foreground' />
					)
				) : (
					<FileText className='h-8 w-8 text-muted-foreground' />
				)}
			</div>

			<div className='p-2'>
				<p
					className='text-xs font-medium truncate'
					title={asset.originalFilename}
				>
					{asset.originalFilename}
				</p>
				<p className='text-xs text-muted-foreground'>
					{(asset.sizeBytes / 1024).toFixed(1)} KB
				</p>
			</div>

			<button
				type='button'
				onClick={(e) => {
					e.stopPropagation();
					onDelete();
				}}
				className='absolute top-1 right-1 p-1 rounded-md bg-background/80 hover:bg-destructive hover:text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity'
				aria-label='Delete asset'
			>
				<X className='h-3 w-3' />
			</button>
		</div>
	);
}
