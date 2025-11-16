'use client';

import { AlertCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'requil-email-send-info-dismissed';

export function DevInfoBanner() {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const dismissed = localStorage.getItem(STORAGE_KEY);
		setIsVisible(!dismissed);
	}, []);

	if (!isVisible) return null;

	return (
		<div className='px-4 pt-4 absolute bottom-[62px] right-0 max-w-[420px]'>
			<Alert>
				<AlertCircle className='h-4 w-4' />
				<AlertTitle className='flex items-center justify-between'>
					<span>Email Sending Feature in Development</span>
				</AlertTitle>
				<AlertDescription>
					You can create and save email templates, but the email sending
					functionality is currently under development.
				</AlertDescription>
			</Alert>
		</div>
	);
}
