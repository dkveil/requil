import { useEditorStore } from '../store/editor-store';

export function useEditor() {
	const projectName = useEditorStore((state) => state.projectName);
	const defaultSenderEmail = useEditorStore(
		(state) => state.defaultSenderEmail
	);
	const defaultSenderName = useEditorStore((state) => state.defaultSenderName);

	return {
		projectName,
		defaultSenderEmail,
		defaultSenderName,
	};
}
