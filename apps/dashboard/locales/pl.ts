import { authPlLocales } from '@/features/auth/locales/pl';

export default {
	common: {
		loading: 'Ładowanie...',
		error: 'Wystąpił błąd',
		success: 'Sukces',
		cancel: 'Anuluj',
		save: 'Zapisz',
		delete: 'Usuń',
		edit: 'Edytuj',
		close: 'Zamknij',
		submit: 'Wyślij',
		continueWith: 'Lub kontynuuj z',
		validationError: 'Błąd walidacji',
		validationErrorDescription: 'Sprawdź poprawność wypełnienia formularza',
		actions: {
			signIn: 'Zaloguj się',
			signUp: 'Zarejestruj się',
			signOut: 'Wyloguj się',
			signingIn: 'Logowanie...',
			signingUp: 'Rejestracja...',
			loginWithGithub: 'Zaloguj się przez GitHub',
			signUpWithGithub: 'Zarejestruj się przez GitHub',
		},
	},
	...authPlLocales,
};
