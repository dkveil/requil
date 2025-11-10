import { Canvas } from '../components/canvas';
import EditorHeader from './editor-header';
import { ElementsSidebar } from './elements-sidebar';
import { SettingsSidebar } from './settings-sidebar';

type Props = {
	children: React.ReactNode;
};

export default function EditorLayout({ children }: Props) {
	return (
		<div className='h-screen w-full overflow-hidden bg-background'>
			<EditorHeader />
			<div className='flex h-full'>
				<ElementsSidebar />
				<div className='flex-1'>
					<Canvas />
				</div>
				<SettingsSidebar />
			</div>
		</div>
	);
}
