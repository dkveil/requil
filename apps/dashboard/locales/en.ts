import { authEnLocales } from '@/features/auth/locales/en';
import { editorEnLocales } from '@/features/editor/locale/en';
import { navigationEnLocales } from '@/features/navigation/locale/en';
import { templatesEnLocales } from '@/features/templates/locale';
import { welcomeEnLocales } from '@/features/welcome/locales';

export default {
	common: {
		loading: 'Loading...',
		redirecting: 'Redirecting...',
		error: 'An error occurred',
		success: 'Success',
		cancel: 'Cancel',
		save: 'Save',
		delete: 'Delete',
		edit: 'Edit',
		close: 'Close',
		submit: 'Submit',
		continueWith: 'Or continue with',
		validationError: 'Validation error',
		validationErrorDescription: 'Please check the form for errors',
		actions: {
			signIn: 'Sign In',
			signUp: 'Sign Up',
			signOut: 'Sign Out',
			signingIn: 'Signing in...',
			signingUp: 'Registering...',
			loginWithGithub: 'Login with GitHub',
			signUpWithGithub: 'Sign up with GitHub',
			loginWithGoogle: 'Login with Google',
			signUpWithGoogle: 'Sign up with Google',
		},
	},
	header: {
		searchPlaceholder: 'Search...',
		new: 'New',
		newTemplate: 'Template',
		accountSettings: 'Account Settings',
		guest: 'Guest',
	},
	...authEnLocales,
	...welcomeEnLocales,
	...navigationEnLocales,
	...templatesEnLocales,
	...editorEnLocales,
};
