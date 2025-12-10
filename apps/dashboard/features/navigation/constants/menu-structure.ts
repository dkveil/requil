import { DASHBOARD_ROUTES } from '@requil/utils/dashboard-routes';
import type { LucideIcon } from 'lucide-react';
import {
	Activity,
	Code,
	CreditCard,
	FileText,
	Key,
	LayoutDashboard,
	Mail,
	Settings,
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
				id: 'general',
				icon: Settings,
				route: (slug) => DASHBOARD_ROUTES.WORKSPACE.SETTINGS.GENERAL(slug),
			},
			{
				id: 'transports',
				icon: Mail,
				route: (slug) => DASHBOARD_ROUTES.WORKSPACE.SETTINGS.TRANSPORT(slug),
			},
			{
				id: 'developers',
				icon: Code,
				route: (slug) => DASHBOARD_ROUTES.WORKSPACE.SETTINGS.DEVELOPERS(slug),
			},
		],
	},
];
