import { AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';

type TransportStatus = 'active' | 'inactive' | 'unverified' | 'failed';

type TransportStatusBadgeProps = {
	status: TransportStatus;
};

export function TransportStatusBadge({ status }: TransportStatusBadgeProps) {
	const t = useTranslations('settings.transport.status');

	const config = {
		active: {
			label: t('active'),
			variant: 'default' as const,
			icon: CheckCircle2,
			className: 'bg-green-500 text-white',
		},
		inactive: {
			label: t('inactive'),
			variant: 'secondary' as const,
			icon: XCircle,
			className: 'bg-gray-500 text-white',
		},
		unverified: {
			label: t('unverified'),
			variant: 'outline' as const,
			icon: Clock,
			className: 'border-orange-500 text-orange-600',
		},
		failed: {
			label: t('failed'),
			variant: 'destructive' as const,
			icon: AlertCircle,
			className: '',
		},
	};

	const { label, variant, icon: Icon, className } = config[status];

	return (
		<Badge
			variant={variant}
			className={`gap-1.5 ${className}`}
		>
			<Icon className='size-3' />
			{label}
		</Badge>
	);
}
