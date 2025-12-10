import { DASHBOARD_ROUTES } from '@requil/utils/dashboard-routes';
import { redirect } from 'next/navigation';

type SettingsPageProps = {
	params: {
		slug: string;
	};
};

export default function SettingsPage({ params }: SettingsPageProps) {
	redirect(DASHBOARD_ROUTES.WORKSPACE.SETTINGS.GENERAL(params.slug));
}
