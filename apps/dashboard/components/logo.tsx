import Image from 'next/image';
import logoBlack from 'public/images/logo/logo-black.webp';
import logoWhite from 'public/images/logo/logo-white.webp';

interface LogoProps {
	variant?: 'light' | 'dark';
	width?: number;
	height?: number;
}

export default function Logo({
	variant = 'light',
	width = 120,
	height = 40,
}: LogoProps) {
	const logoSrc = variant === 'light' ? logoWhite : logoBlack;

	return (
		<Image
			src={logoSrc}
			alt='Requil'
			width={width}
			height={height}
			priority
		/>
	);
}
