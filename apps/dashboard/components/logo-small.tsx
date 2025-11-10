import Image from 'next/image';
import logoIconBlack from 'public/images/logo/logo-icon-black.webp';
import logoIconWhite from 'public/images/logo/logo-icon-white.webp';

interface LogoSmallProps {
	variant?: 'light' | 'dark';
	size?: number;
}

export default function LogoSmall({
	variant = 'light',
	size = 32,
}: LogoSmallProps) {
	const logoSrc = variant === 'light' ? logoIconWhite : logoIconBlack;

	return (
		<div className='flex items-center justify-center'>
			<Image
				src={logoSrc}
				alt='Requil'
				width={size}
				height={size}
				priority
			/>
		</div>
	);
}
