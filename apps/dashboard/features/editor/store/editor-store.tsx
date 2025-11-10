import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type EditorState = {
	projectName: string;
};

type EditorActions = {
	setProjectName: (name: string) => void;
	reset: () => void;
};

export const useEditorStore = create<EditorState & EditorActions>()(
	devtools(
		(set) => ({
			projectName: 'Untitled Project',

			setProjectName: (name: string) => {
				set({ projectName: name }, false, 'setProjectName');
			},

			reset: () => {
				set(
					{
						projectName: 'Untitled Project',
					},
					false,
					'reset'
				);
			},
		}),
		{ name: 'EditorStore' }
	)
);
