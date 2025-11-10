import { useEditorStore } from '../store/editor-store';

export function useEditor() {
	const projectName = useEditorStore((state) => state.projectName);

	return {
		projectName,
	};
}
