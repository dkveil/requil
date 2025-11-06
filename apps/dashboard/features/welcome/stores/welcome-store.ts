import { create } from 'zustand';

type WelcomeStep = 'pricing' | 'workspace';

interface WelcomeState {
	currentStep: WelcomeStep;
	selectedPlan: 'free' | null;
	workspaceData: {
		name: string;
		slug: string;
	} | null;
	setStep: (step: WelcomeStep) => void;
	selectPlan: (plan: 'free') => void;
	setWorkspaceData: (data: { name: string; slug: string }) => void;
	reset: () => void;
}

const initialState = {
	currentStep: 'pricing' as WelcomeStep,
	selectedPlan: null,
	workspaceData: null,
};

export const useWelcomeStore = create<WelcomeState>((set) => ({
	...initialState,
	setStep: (step) => set({ currentStep: step }),
	selectPlan: (plan) => set({ selectedPlan: plan }),
	setWorkspaceData: (data) => set({ workspaceData: data }),
	reset: () => set(initialState),
}));
