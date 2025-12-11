import { DASHBOARD_ROUTES } from '@requil/utils/dashboard-routes';
import { redirect } from 'next/navigation';
import { generatePageMetadata } from '@/lib/metadata';
import GeneralSettingsLoading from './general/loading';

type SettingsPageProps = {
	params: Promise<{
		slug: string;
	}>;
};

export async function generateMetadata() {
	return generatePageMetadata('settings');
}

export default async function SettingsPage({ params }: SettingsPageProps) {
	if (process.env.NODE_ENV === 'development') {
		await new Promise((resolve) => setTimeout(resolve, 2000));
	}

	if (process.env.NODE_ENV === 'production') {
		setTimeout(() => {
			redirect(DASHBOARD_ROUTES.WORKSPACE.SETTINGS.GENERAL(slug));
		}, 1000);
	}

	const { slug } = await params;

	return <GeneralSettingsLoading />;
}
