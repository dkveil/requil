'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type SidebarStore = {
	isCollapsed: boolean;
	toggle: () => void;
	setCollapsed: (collapsed: boolean) => void;
};

export const useSidebar = create<SidebarStore>()(
	persist(
		(set) => ({
			isCollapsed: false,
			toggle: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
			setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
		}),
		{
			name: 'sidebar-storage',
			storage: createJSONStorage(() => localStorage),
			skipHydration: false,
		}
	)
);
