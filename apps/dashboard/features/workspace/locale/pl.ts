export const workspacePlLocales = {
	workspace: {
		overview: {
			greeting: {
				morning: 'Dzień dobry',
				afternoon: 'Witaj',
				evening: 'Dobry wieczór',
			},
			workspaceLabel: 'Workspace',
			stats: {
				templates: {
					title: 'Szablony Email',
					none: 'Brak szablonów',
					single: 'Aktywny szablon',
					multiple: 'Aktywne szablony',
				},
				emailsSent: {
					title: 'Wysłane Emaile',
					comingSoon: 'Wkrótce dostępne',
				},
				apiRequests: {
					title: 'Zapytania API',
					comingSoon: 'Wkrótce dostępne',
				},
			},
			inDevelopment: {
				title: 'Funkcje w budowie',
				emailSending: {
					title: 'Wysyłka Emaili',
					description:
						'System wysyłki emaili jest w fazie rozwoju. Możesz tworzyć i zapisywać szablony, ale wysyłka będzie dostępna wkrótce.',
				},
				emailTransport: {
					title: 'Email Transport',
					description:
						'Integracja z Resend i SMTP jest w trakcie implementacji.',
				},
				apiKeyCompatibility: {
					title: 'API Key Compatibility',
					description:
						'System zarządzania kluczami API i autoryzacji będzie dostępny w najbliższej aktualizacji.',
				},
			},
			debug: {
				title: 'Debug Info',
				description: 'Development mode only',
			},
		},
	},
};
