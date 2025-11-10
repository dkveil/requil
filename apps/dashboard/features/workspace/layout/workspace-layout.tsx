'use client';

import { Header } from '@/components/layout';
import { LoadingScreen } from '@/components/loading-screen';
import { Sidebar } from '@/features/navigation';
import { useWorkspace } from '../hooks/use-workspace';

type Props = {
	children: React.ReactNode;
};

export default function WorkspaceLayout({ children }: Props) {
	const { initialized, loading } = useWorkspace();

	if (!initialized || loading) {
		return <LoadingScreen text='Loading workspace...' />;
	}

	return (
		<div className='flex flex-col min-h-screen'>
			<Header />
			<div className='flex flex-1'>
				<Sidebar />
				<main className='flex-1 w-full'>{children}</main>
			</div>
		</div>
	);
}
