import { DASHBOARD_ROUTES } from '@requil/utils/dashboard-routes';
import type { LucideIcon } from 'lucide-react';
import {
	Activity,
	CreditCard,
	FileText,
	Key,
	LayoutDashboard,
	Mail,
} from 'lucide-react';

export type MenuItem = {
	id: string;
	icon: LucideIcon;
	route: (slug: string) => string;
};

export type MenuSection = {
	title: string;
	items: MenuItem[];
};

export const MENU_SECTIONS: MenuSection[] = [
	{
		title: 'general',
		items: [
			{
				id: 'dashboard',
				icon: LayoutDashboard,
				route: (slug) => DASHBOARD_ROUTES.WORKSPACE.HOME(slug),
			},
			{
				id: 'email-templates',
				icon: FileText,
				route: (slug) => DASHBOARD_ROUTES.WORKSPACE.EMAIL_TEMPLATES(slug),
			},
		],
	},
	{
		title: 'analytics',
		items: [
			{
				id: 'events',
				icon: Activity,
				route: (slug) => DASHBOARD_ROUTES.WORKSPACE.ANALYTICS.EVENTS(slug),
			},
		],
	},
	{
		title: 'settings',
		items: [
			{
				id: 'transports',
				icon: Mail,
				route: (slug) => DASHBOARD_ROUTES.WORKSPACE.SETTINGS.TRANSPORTS(slug),
			},
			{
				id: 'api-keys',
				icon: Key,
				route: (slug) => DASHBOARD_ROUTES.WORKSPACE.SETTINGS.API_KEYS(slug),
			},
			{
				id: 'billing',
				icon: CreditCard,
				route: (slug) => DASHBOARD_ROUTES.WORKSPACE.SETTINGS.BILLING(slug),
			},
		],
	},
];
