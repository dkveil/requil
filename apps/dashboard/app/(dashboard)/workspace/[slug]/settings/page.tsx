import { DASHBOARD_ROUTES } from '@requil/utils/dashboard-routes';
import { redirect } from 'next/navigation';

type SettingsPageProps = {
	params: Promise<{
		slug: string;
	}>;
};

export default async function SettingsPage({ params }: SettingsPageProps) {
	const { slug } = await params;
	redirect(DASHBOARD_ROUTES.WORKSPACE.SETTINGS.GENERAL(slug));
}
