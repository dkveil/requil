import { authMiddleware, authMiddlewareConfig } from '@/features/auth';

export const middleware = authMiddleware;
export const config = authMiddlewareConfig;
