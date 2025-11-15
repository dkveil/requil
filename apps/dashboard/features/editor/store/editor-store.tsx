import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type EditorState = {
	projectName: string;
	defaultSenderEmail: string;
	defaultSenderName: string;
};

type EditorActions = {
	setProjectName: (name: string) => void;
	setDefaultSender: (email: string, name: string) => void;
	reset: () => void;
};

export const useEditorStore = create<EditorState & EditorActions>()(
	devtools(
		(set) => ({
			projectName: 'Untitled Project',
			defaultSenderEmail: '',
			defaultSenderName: '',

			setProjectName: (name: string) => {
				set({ projectName: name }, false, 'setProjectName');
			},

			setDefaultSender: (email: string, name: string) => {
				set(
					{ defaultSenderEmail: email, defaultSenderName: name },
					false,
					'setDefaultSender'
				);
			},

			reset: () => {
				set(
					{
						projectName: 'Untitled Project',
						defaultSenderEmail: '',
						defaultSenderName: '',
					},
					false,
					'reset'
				);
			},
		}),
		{ name: 'EditorStore' }
	)
);
