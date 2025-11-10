'use client';

import { Header } from '@/components/layout';
import { LoadingScreen } from '@/components/loading-screen';
import { Sidebar } from '@/features/navigation';
import { useWorkspace } from '@/features/workspace';

type Props = {
	children: React.ReactNode;
};

function DashboardContent({ children }: Props) {
	const { initialized, loading } = useWorkspace();

	if (!initialized || loading) {
		return <LoadingScreen text='Loading workspace...' />;
	}

	return (
		<div className='flex min-h-screen'>
			<Sidebar />
			<div className='flex flex-1 flex-col'>
				<Header />
				<main className='flex-1'>{children}</main>
			</div>
		</div>
	);
}

export default function WorkspaceLayout({ children }: Props) {
	return <DashboardContent>{children}</DashboardContent>;
}
