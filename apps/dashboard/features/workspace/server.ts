/**
 * Server-side workspace helpers
 *
 * ⚠️ TYLKO DLA SERVER COMPONENTS I SERVER ACTIONS
 * Nie importuj tego w Client Components!
 *
 * Użycie:
 * import { getLastWorkspaceIdServer } from '@/features/workspace/server';
 */

export {
	clearLastWorkspaceIdServer,
	getLastWorkspaceIdServer,
	setLastWorkspaceIdServer,
} from './services/workspace-cache.server';
