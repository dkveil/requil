import { authPlLocales } from '@/features/auth/locales/pl';
import { navigationPlLocales } from '@/features/navigation/locale/pl';
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
			loginWithGoogle: 'Zaloguj się przez Google',
			signUpWithGoogle: 'Zarejestruj się przez Google',
		},
	},
	header: {
		searchPlaceholder: 'Szukaj...',
		new: 'Nowy',
		newTemplate: 'Szablon',
		accountSettings: 'Ustawienia konta',
		guest: 'Gość',
	},
	...authPlLocales,
	...welcomePlLocales,
	...navigationPlLocales,
};
