export const editorEnLocales = {
	editor: {
		header: {
			close: 'Close',
			publish: 'Publish',
			exit: 'Exit',
			testEmail: 'Send Test',
			dekstop: 'Desktop',
			mobile: 'Mobile',
			undo: 'Undo',
			redo: 'Redo',
			emailSettings: 'Email Settings',
		},
		emailSettings: {
			title: 'Email Settings',
			description:
				'Configure sender information, subject line, and preheader for this email.',
			fields: {
				subject: 'Subject Line',
				preheader: 'Preview Text',
				senderName: 'Sender Name',
				senderEmail: 'Sender Email',
				useReplyTo: 'Use Reply-To address',
				replyToEmail: 'Reply-To Email',
			},
			placeholders: {
				subject: 'Enter email subject...',
				preheader: 'Enter preview text (visible in inbox)...',
				senderName: 'e.g. John Doe',
				senderEmail: 'e.g. contact@company.com',
				replyToEmail: 'e.g. replies@company.com',
			},
			characterCount: '{current} of {max} characters',
			validation: {
				subjectRequired: 'Subject is required',
				subjectTooLong: 'Subject is too long',
				senderNameRequired: 'Sender name is required',
				senderNameTooLong: 'Sender name is too long',
				senderEmailRequired: 'Sender email is required',
				senderEmailInvalid: 'Invalid email address',
				replyToEmailInvalid: 'Invalid reply-to email address',
			},
			saved: 'Email settings saved successfully',
		},
		loading: 'Loading editor...',
		templateNotFound: 'Template not found',
		unableToLoadTemplate: 'Unable to load template',
		failedToCreateBlock: 'Failed to create block',
		addedBlockToSelectedBlock: 'Added {blockType} to selected block',
		addedBlockToCanvas: 'Added {blockType} to canvas',
		noDocumentAvailable: 'No document available',
		elementsSidebar: {
			addElements: 'Add elements',
			layers: 'Layers',
			assets: 'Assets',
			search: 'Search',
			category: 'Category',
			component: 'Component',
			searchPlaceholder: 'Type to search',
			layout: {
				title: 'Layout',
			},
			content: {
				title: 'Content',
			},
			container: {
				title: 'Container',
			},
			section: {
				title: 'Section',
			},
			column: {
				title: 'Column',
			},
			spacer: {
				title: 'Spacer',
			},
			divider: {
				title: 'Divider',
			},
		},
		settingsSidebar: {
			noBlockSelected: 'No block selected',
			tabs: {
				layout: 'Layout',
				animation: 'Animation',
			},
			sections: {
				selector: 'Selector',
				spacing: 'Spacing',
				typography: 'Typography',
				fill: 'Fill',
				properties: 'Properties',
			},
			blockName: 'Block Name',
			blockType: 'Block Type',
			backgroundColor: 'Background Color',
			animationComingSoon: 'Animation coming soon...',
		},
		layersPanel: {
			noDocument: 'No document available',
		},
		movedBlock: 'Block moved successfully',
		blockActions: {
			selectParent: 'Select parent',
			moveUp: 'Move up',
			moveDown: 'Move down',
			delete: 'Delete',
		},
	},
};
