import { authPlLocales } from '@/features/auth/locales/pl';
import { editorPlLocales } from '@/features/editor/locale/pl';
import { navigationPlLocales } from '@/features/navigation/locale/pl';
import { settingsPlLocales } from '@/features/settings/locale';
import { templatesPlLocales } from '@/features/templates/locale';
import { welcomePlLocales } from '@/features/welcome/locales';
import { workspacePlLocales } from '@/features/workspace/locale';

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
		back: 'Wróć',
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
	...templatesPlLocales,
	...editorPlLocales,
	...workspacePlLocales,
	...settingsPlLocales,
};
