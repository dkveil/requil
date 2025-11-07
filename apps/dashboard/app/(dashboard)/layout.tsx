import { WorkspaceProvider } from '@/features/workspace';

type Props = {
	children: React.ReactNode;
};

export default function DashboardLayout({ children }: Props) {
	return (
		<WorkspaceProvider>
			<div>
				<main>{children}</main>
			</div>
		</WorkspaceProvider>
	);
}
