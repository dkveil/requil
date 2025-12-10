export const settingsEnLocales = {
	settings: {
		navigation: {
			title: 'Settings',
			description: 'Manage your workspace configuration and preferences',
			general: 'General',
			transport: 'Email Setup',
			developers: 'Developers',
		},
		general: {
			card: {
				title: 'Workspace Details',
				description: 'Update your workspace name and identifier',
			},
			form: {
				name: {
					label: 'Workspace Name',
					description: 'The display name of your workspace',
					placeholder: 'My Workspace',
				},
				slug: {
					label: 'Workspace Slug',
					description:
						'Unique identifier used in URLs (lowercase, numbers, and hyphens only)',
					placeholder: 'my-workspace',
				},
				submit: 'Save Changes',
				submitting: 'Saving...',
			},
			success: 'Workspace updated successfully',
			error: 'Failed to update workspace',
			noWorkspace: 'No workspace selected',
		},
		transport: {
			card: {
				title: 'Email Transport Configuration',
				description:
					'Configure how your emails are sent. Choose between internal Resend service or bring your own provider.',
			},
			provider: {
				label: 'Email Provider',
			},
			providers: {
				internalResend: {
					label: 'Internal Resend',
					description: 'Use our managed Resend service (default)',
				},
				customResend: {
					label: 'Custom Resend (BYOK)',
					description: 'Bring your own Resend API key',
					badge: 'Coming Soon',
				},
				smtp: {
					label: 'Custom SMTP',
					description: 'Use your own SMTP server',
					badge: 'Coming Soon',
				},
			},
			internalResendInfo:
				'Your workspace is currently using our managed Resend service. No additional configuration required.',
			customResendForm: {
				apiKey: {
					label: 'Resend API Key',
					placeholder: 're_...',
					description: 'Your Resend API key. Get it from resend.com/api-keys',
				},
				fromEmail: {
					label: 'From Email',
					placeholder: 'noreply@yourdomain.com',
					description: 'Default sender email address',
				},
				fromDomain: {
					label: 'From Domain',
					placeholder: 'yourdomain.com',
					description: 'Verified domain in your Resend account',
				},
			},
			smtpForm: {
				host: {
					label: 'SMTP Host',
					placeholder: 'smtp.example.com',
					description: 'Your SMTP server hostname',
				},
				port: {
					label: 'SMTP Port',
					placeholder: '587',
					description: 'Common: 587 (TLS), 465 (SSL), 25 (plain)',
				},
				user: {
					label: 'Username',
					placeholder: 'user@example.com',
					description: 'SMTP authentication username',
				},
				password: {
					label: 'Password',
					placeholder: '••••••••',
					description: 'SMTP authentication password (encrypted)',
				},
				secure: {
					label: 'Use TLS/SSL',
					description: 'Enable secure connection (recommended)',
				},
				fromEmail: {
					label: 'From Email',
					placeholder: 'noreply@yourdomain.com',
					description: 'Default sender email address',
				},
			},
			actions: {
				save: 'Save Configuration',
				saving: 'Saving...',
				verify: 'Verify Connection',
				verifying: 'Verifying...',
			},
			status: {
				unverified: 'Not Verified',
				active: 'Active',
				inactive: 'Inactive',
				failed: 'Verification Failed',
			},
			messages: {
				saveSuccess: 'Transport configuration saved',
				saveError: 'Failed to save configuration',
				verifySuccess: 'Connection verified successfully',
				verifyError: 'Connection verification failed',
			},
		},
		developers: {
			apiKeys: {
				card: {
					title: 'API Keys',
					description:
						'Manage API keys for programmatic access to your workspace',
				},
				table: {
					name: 'Name',
					key: 'Key',
					created: 'Created',
					lastUsed: 'Last Used',
					actions: 'Actions',
					noKeys: 'No API keys yet',
					noKeysDescription: 'Create your first API key to get started',
					never: 'Never',
				},
				create: {
					button: 'Create API Key',
					title: 'Create New API Key',
					description: 'Enter a name for your new API key',
					nameLabel: 'Name',
					namePlaceholder: 'Production API Key',
					nameDescription: 'A descriptive name to identify this key',
					cancel: 'Cancel',
					create: 'Create Key',
					creating: 'Creating...',
					successTitle: 'API Key Created',
					successDescription:
						"Copy this key now. You won't be able to see it again.",
					copyKey: 'Copy Key',
					copied: 'Copied!',
					close: 'Close',
				},
				delete: {
					button: 'Delete',
					title: 'Delete API Key',
					description:
						'Are you sure you want to delete this key? This action cannot be undone.',
					cancel: 'Cancel',
					confirm: 'Delete',
					success: 'API key deleted',
				},
				messages: {
					createSuccess: 'API key created successfully',
					createError: 'Failed to create API key',
					deleteSuccess: 'API key deleted successfully',
					deleteError: 'Failed to delete API key',
					copySuccess: 'API key copied to clipboard',
				},
			},
			webhooks: {
				card: {
					title: 'Webhooks',
					description:
						'Configure webhook endpoints to receive event notifications',
				},
				form: {
					url: {
						label: 'Webhook URL',
						placeholder: 'https://api.yourdomain.com/webhooks',
						description: 'The endpoint that will receive webhook events',
					},
					signingSecret: {
						label: 'Signing Secret',
						description: 'Use this to verify webhook signatures',
						copy: 'Copy',
						roll: 'Roll Secret',
						rollConfirm:
							'Are you sure? This will invalidate the current secret.',
					},
					events: {
						label: 'Events',
						description: 'Select which events to receive',
					},
					save: 'Save Configuration',
					saving: 'Saving...',
				},
				messages: {
					saveSuccess: 'Webhook configuration saved',
					saveError: 'Failed to save webhook configuration',
					secretRolled: 'Signing secret regenerated',
					secretCopied: 'Signing secret copied to clipboard',
				},
			},
		},
	},
};
