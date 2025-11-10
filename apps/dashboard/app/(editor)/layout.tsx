import { WorkspaceProvider } from '@/features/workspace';

type Props = {
	children: React.ReactNode;
};

export default function EditorRouteLayout({ children }: Props) {
	return <WorkspaceProvider>{children}</WorkspaceProvider>;
}
