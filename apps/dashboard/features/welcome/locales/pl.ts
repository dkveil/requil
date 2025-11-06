export const welcomePlLocales = {
	welcome: {
		title: 'Witaj w Requil',
		subtitle: 'Rozpocznijmy konfigurację Twojego silnika email',
		step: 'Krok {current} z {total}',
		pricing: {
			title: 'Wybierz Swój Plan',
			description: 'Wybierz plan, który najlepiej do Ciebie pasuje',
			free: {
				name: 'Darmowy',
				description: 'Idealny na start',
				badge: 'Beta',
				notice:
					'W fazie beta wszystkie funkcje są darmowe z restrykcyjnymi limitami użycia',
				features: {
					emails: 'Do {count} emaili/miesiąc',
					workspaces: '{count} workspace',
					templates: 'Do {count} szablonów',
					apiCalls: 'Do {count} wywołań API/dzień',
					support: 'Wsparcie społeczności',
				},
			},
			selectPlan: 'Kontynuuj z Planem Darmowym',
		},
		workspace: {
			title: 'Utwórz Swój Workspace',
			description:
				'Workspace to miejsce, gdzie zarządzasz szablonami i kampaniami email',
			form: {
				name: {
					label: 'Nazwa Workspace',
					placeholder: 'Moja Firma',
					error: 'Nazwa musi mieć co najmniej 3 znaki',
				},
				slug: {
					label: 'Slug Workspace',
					placeholder: 'moja-firma',
					description: 'Używany w URL-ach i endpointach API',
					error:
						'Slug musi mieć co najmniej 3 znaki i zawierać tylko małe litery, cyfry i myślniki',
				},
			},
			create: 'Utwórz Workspace',
			creating: 'Tworzenie workspace...',
		},
	},
};
