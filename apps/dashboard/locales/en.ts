import { authEnLocales } from '@/features/auth/locales/en';
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
		},
	},
	...authEnLocales,
	...welcomeEnLocales,
};
