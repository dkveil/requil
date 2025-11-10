import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type EditorState = {
	projectName: string;
};

export const useEditorStore = create<EditorState>()(
	devtools(
		(set, get) => ({
			projectName: 'Untitled Project',
		}),
		{ name: 'EditorStore' }
	)
);
