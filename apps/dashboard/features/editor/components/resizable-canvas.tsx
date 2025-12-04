'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useCanvas } from '../hooks/use-canvas';

interface ResizableCanvasProps {
	children: React.ReactNode;
	viewport: 'desktop' | 'mobile';
}

export function ResizableCanvas({ children, viewport }: ResizableCanvasProps) {
	const { canvasWidth, setCanvasWidth } = useCanvas();
	const [isResizing, setIsResizing] = useState(false);
	const [showBadge, setShowBadge] = useState(false);
	const [resizeSide, setResizeSide] = useState<'left' | 'right' | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const startXRef = useRef(0);
	const startWidthRef = useRef(0);
	const badgeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const handleMouseDown = (side: 'left' | 'right') => (e: React.MouseEvent) => {
		e.preventDefault();
		setIsResizing(true);
		setShowBadge(true);
		setResizeSide(side);
		startXRef.current = e.clientX;
		startWidthRef.current = canvasWidth;

		if (badgeTimeoutRef.current) {
			clearTimeout(badgeTimeoutRef.current);
		}
	};

	useEffect(() => {
		if (!isResizing) return;

		const handleMouseMove = (e: MouseEvent) => {
			const delta = e.clientX - startXRef.current;
			const direction = resizeSide === 'right' ? 1 : -1;
			const newWidth = startWidthRef.current + delta * direction * 2;
			setCanvasWidth(newWidth);
		};

		const handleMouseUp = () => {
			setIsResizing(false);
			setResizeSide(null);

			badgeTimeoutRef.current = setTimeout(() => {
				setShowBadge(false);
			}, 1000);
		};

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	}, [isResizing, resizeSide, setCanvasWidth]);

	useEffect(() => {
		return () => {
			if (badgeTimeoutRef.current) {
				clearTimeout(badgeTimeoutRef.current);
			}
		};
	}, []);

	return (
		<div className='relative w-full flex justify-center py-8'>
			<div
				ref={containerRef}
				className='relative transition-all duration-150'
				style={{
					width: `${canvasWidth}px`,
					maxWidth: '100%',
				}}
			>
				<button
					type='button'
					className={cn(
						'absolute -left-1 top-0 bottom-0 w-2 cursor-ew-resize z-10 group',
						'hover:bg-primary/20 transition-colors',
						isResizing && resizeSide === 'left' && 'bg-primary/30'
					)}
					onMouseDown={handleMouseDown('left')}
					aria-label='Resize left'
				>
					<div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-12 bg-primary/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity' />
				</button>

				<button
					type='button'
					className={cn(
						'absolute -right-1 top-0 bottom-0 w-2 cursor-ew-resize z-10 group',
						'hover:bg-primary/20 transition-colors',
						isResizing && resizeSide === 'right' && 'bg-primary/30'
					)}
					onMouseDown={handleMouseDown('right')}
					aria-label='Resize right'
				>
					<div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-12 bg-primary/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity' />
				</button>

				<div className='absolute -top-6 left-0 right-0 flex items-center justify-center'>
					<div
						className={cn(
							'px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full shadow-sm',
							'transition-opacity duration-300',
							showBadge || isResizing ? 'opacity-100' : 'opacity-60'
						)}
					>
						{canvasWidth}px
						{viewport === 'mobile' || (canvasWidth <= 768 && ' (Mobile)')}
						{viewport === 'desktop' && canvasWidth > 768 && ' (Desktop)'}
					</div>
				</div>
				<div className='pt-3'>{children}</div>
			</div>

			{isResizing && <div className='fixed inset-0 z-50 cursor-ew-resize' />}
		</div>
	);
}
