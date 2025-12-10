export const settingsPlLocales = {
	settings: {
		navigation: {
			title: 'Ustawienia',
			description: 'Zarządzaj konfiguracją workspace i preferencjami',
			general: 'Ogólne',
			transport: 'Konfiguracja Email',
			developers: 'Deweloperzy',
		},
		general: {
			card: {
				title: 'Szczegóły Workspace',
				description: 'Zaktualizuj nazwę i identyfikator workspace',
			},
			form: {
				name: {
					label: 'Nazwa Workspace',
					description: 'Wyświetlana nazwa workspace',
					placeholder: 'Mój Workspace',
				},
				slug: {
					label: 'Slug Workspace',
					description:
						'Unikalny identyfikator używany w URL (małe litery, cyfry i myślniki)',
					placeholder: 'moj-workspace',
				},
				submit: 'Zapisz zmiany',
				submitting: 'Zapisywanie...',
			},
			success: 'Workspace zaktualizowany pomyślnie',
			error: 'Nie udało się zaktualizować workspace',
			noWorkspace: 'Nie wybrano workspace',
		},
		transport: {
			card: {
				title: 'Konfiguracja Transportu Email',
				description:
					'Skonfiguruj sposób wysyłki emaili. Wybierz wewnętrzny serwis Resend lub użyj własnego dostawcy.',
			},
			provider: {
				label: 'Dostawca Email',
			},
			providers: {
				internalResend: {
					label: 'Wewnętrzny Resend',
					description: 'Użyj naszego zarządzanego serwisu Resend (domyślnie)',
				},
				customResend: {
					label: 'Własny Resend (BYOK)',
					description: 'Użyj własnego klucza API Resend',
					badge: 'Wkrótce',
				},
				smtp: {
					label: 'Własny SMTP',
					description: 'Użyj własnego serwera SMTP',
					badge: 'Wkrótce',
				},
			},
			internalResendInfo:
				'Twój workspace aktualnie używa naszego zarządzanego serwisu Resend. Nie jest wymagana dodatkowa konfiguracja.',
			customResendForm: {
				apiKey: {
					label: 'Klucz API Resend',
					placeholder: 're_...',
					description: 'Twój klucz API Resend. Pobierz z resend.com/api-keys',
				},
				fromEmail: {
					label: 'Email nadawcy',
					placeholder: 'noreply@twojadomena.pl',
					description: 'Domyślny adres email nadawcy',
				},
				fromDomain: {
					label: 'Domena nadawcy',
					placeholder: 'twojadomena.pl',
					description: 'Zweryfikowana domena w koncie Resend',
				},
			},
			smtpForm: {
				host: {
					label: 'Host SMTP',
					placeholder: 'smtp.example.com',
					description: 'Nazwa hosta serwera SMTP',
				},
				port: {
					label: 'Port SMTP',
					placeholder: '587',
					description: 'Typowe: 587 (TLS), 465 (SSL), 25 (plain)',
				},
				user: {
					label: 'Nazwa użytkownika',
					placeholder: 'user@example.com',
					description: 'Login do uwierzytelnienia SMTP',
				},
				password: {
					label: 'Hasło',
					placeholder: '••••••••',
					description: 'Hasło do uwierzytelnienia SMTP (szyfrowane)',
				},
				secure: {
					label: 'Użyj TLS/SSL',
					description: 'Włącz bezpieczne połączenie (zalecane)',
				},
				fromEmail: {
					label: 'Email nadawcy',
					placeholder: 'noreply@twojadomena.pl',
					description: 'Domyślny adres email nadawcy',
				},
			},
			actions: {
				save: 'Zapisz konfigurację',
				saving: 'Zapisywanie...',
				verify: 'Weryfikuj połączenie',
				verifying: 'Weryfikacja...',
			},
			status: {
				unverified: 'Niezweryfikowane',
				active: 'Aktywne',
				inactive: 'Nieaktywne',
				failed: 'Weryfikacja nieudana',
			},
			messages: {
				saveSuccess: 'Konfiguracja transportu zapisana',
				saveError: 'Nie udało się zapisać konfiguracji',
				verifySuccess: 'Połączenie zweryfikowane pomyślnie',
				verifyError: 'Weryfikacja połączenia nie powiodła się',
			},
		},
		developers: {
			apiKeys: {
				card: {
					title: 'Klucze API',
					description:
						'Zarządzaj kluczami API do programistycznego dostępu do workspace',
				},
				table: {
					name: 'Nazwa',
					key: 'Klucz',
					created: 'Utworzony',
					lastUsed: 'Ostatnio użyty',
					actions: 'Akcje',
					noKeys: 'Brak kluczy API',
					noKeysDescription: 'Utwórz pierwszy klucz API, aby rozpocząć',
					never: 'Nigdy',
				},
				create: {
					button: 'Utwórz klucz API',
					title: 'Utwórz nowy klucz API',
					description: 'Wprowadź nazwę dla nowego klucza API',
					nameLabel: 'Nazwa',
					namePlaceholder: 'Klucz API produkcyjny',
					nameDescription: 'Opisowa nazwa do identyfikacji tego klucza',
					cancel: 'Anuluj',
					create: 'Utwórz klucz',
					creating: 'Tworzenie...',
					successTitle: 'Klucz API utworzony',
					successDescription:
						'Skopiuj ten klucz teraz. Nie będziesz mógł go zobaczyć ponownie.',
					copyKey: 'Kopiuj klucz',
					copied: 'Skopiowano!',
					close: 'Zamknij',
				},
				delete: {
					button: 'Usuń',
					title: 'Usuń klucz API',
					description:
						'Czy na pewno chcesz usunąć ten klucz? Tej operacji nie można cofnąć.',
					cancel: 'Anuluj',
					confirm: 'Usuń',
					success: 'Klucz API usunięty',
				},
				messages: {
					createSuccess: 'Klucz API utworzony pomyślnie',
					createError: 'Nie udało się utworzyć klucza API',
					deleteSuccess: 'Klucz API usunięty pomyślnie',
					deleteError: 'Nie udało się usunąć klucza API',
					copySuccess: 'Klucz API skopiowany do schowka',
				},
			},
			webhooks: {
				card: {
					title: 'Webhooki',
					description:
						'Skonfiguruj endpointy webhooków do otrzymywania powiadomień o zdarzeniach',
				},
				form: {
					url: {
						label: 'URL Webhooka',
						placeholder: 'https://api.twojadomena.pl/webhooks',
						description:
							'Endpoint, który będzie otrzymywał zdarzenia webhooków',
					},
					signingSecret: {
						label: 'Sekret podpisywania',
						description: 'Użyj tego do weryfikacji podpisów webhooków',
						copy: 'Kopiuj',
						roll: 'Wygeneruj nowy',
						rollConfirm:
							'Czy na pewno? To unieważni obecny sekret podpisywania.',
					},
					events: {
						label: 'Zdarzenia',
						description: 'Wybierz, które zdarzenia chcesz otrzymywać',
					},
					save: 'Zapisz konfigurację',
					saving: 'Zapisywanie...',
				},
				messages: {
					saveSuccess: 'Konfiguracja webhooka zapisana',
					saveError: 'Nie udało się zapisać konfiguracji webhooka',
					secretRolled: 'Sekret podpisywania wygenerowany ponownie',
					secretCopied: 'Sekret podpisywania skopiowany do schowka',
				},
			},
		},
	},
};
