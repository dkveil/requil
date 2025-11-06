import { authPlLocales } from '@/features/auth/locales/pl';
import { welcomePlLocales } from '@/features/welcome/locales';

export default {
	common: {
		loading: 'Ładowanie...',
		redirecting: 'Przekierowanie...',
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
	...welcomePlLocales,
};
