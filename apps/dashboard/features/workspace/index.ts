// API
export * from './api/workspace-api';

// Hooks
export * from './hooks/use-workspace';
// Providers
export { WorkspaceProvider } from './providers/workspace-provider';
// Services (Client-side)
export * from './services/workspace.service';
export * from './services/workspace-cache.service';

// Stores (legacy - możesz usunąć po migracji do RxJS)
export * from './stores/workspace-store';

// UWAGA: Dla Server Components użyj '@/features/workspace/server'
