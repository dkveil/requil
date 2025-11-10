import WorkspaceLayout from '@/features/workspace/layout/workspace-layout';

type Props = {
	children: React.ReactNode;
};

export default function WorkspacePageLayout({ children }: Props) {
	return <WorkspaceLayout>{children}</WorkspaceLayout>;
}
