'use client';

import { LoadingScreen } from '@/components/loading-screen';
import { Sidebar, useSidebar } from '@/features/navigation';
import { useWorkspace, WorkspaceProvider } from '@/features/workspace';
import { cn } from '@/lib/utils';

type Props = {
	children: React.ReactNode;
};

function DashboardContent({ children }: Props) {
	const { initialized, loading } = useWorkspace();
	const { isCollapsed } = useSidebar();

	if (!initialized || loading) {
		return <LoadingScreen text='Loading workspace...' />;
	}

	return (
		<div className='flex min-h-screen'>
			<Sidebar />
			<main
				className={cn(
					'flex-1 transition-all duration-300',
					isCollapsed ? 'ml-16' : 'ml-64'
				)}
			>
				{children}
			</main>
		</div>
	);
}

export default function DashboardLayout({ children }: Props) {
	return (
		<WorkspaceProvider>
			<DashboardContent>{children}</DashboardContent>
		</WorkspaceProvider>
	);
}
