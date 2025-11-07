export const welcomeEnLocales = {
	welcome: {
		title: 'Welcome to Requil',
		subtitle: "Let's get you started with your email engine",
		step: 'Step {current} of {total}',
		pricing: {
			title: 'Choose Your Plan',
			description: 'Select the plan that works best for you',
			free: {
				name: 'Free',
				description: 'Perfect for getting started',
				badge: 'Beta',
				notice:
					'During the beta phase, all features are free with strict usage limits',
				features: {
					emails: 'Up to {count} emails per month',
					workspaces: '{count} workspace',
					templates: 'Up to {count} templates per workspace',
					apiCalls: 'Up to {count} API calls per month',
					support: 'Community support',
				},
			},
			selectPlan: 'Continue with Free Plan',
		},
		workspace: {
			title: 'Create Your Workspace',
			description:
				'A workspace is where you manage your email templates and campaigns.',
			form: {
				name: {
					label: 'Workspace Name',
					placeholder: 'My Company',
					error: 'Name must be at least 3 characters',
				},
				slug: {
					label: 'Workspace Slug',
					placeholder: 'my-company',
					description: 'Used in URLs and API endpoints',
					error:
						'Slug must be at least 3 characters and contain only lowercase letters, numbers, and hyphens',
				},
			},
			create: 'Create Workspace',
			creating: 'Creating workspace...',
		},
	},
};
