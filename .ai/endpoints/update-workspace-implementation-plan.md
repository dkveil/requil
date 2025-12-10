# API Endpoint Implementation Plan: Update Workspace

## 1. Przegląd punktu końcowego

Endpoint `PATCH /v1/workspace` umożliwia aktualizację ustawień workspace (nazwa i slug) przez właściciela workspace. Endpoint wymaga autoryzacji użytkownika z rolą `owner` i waliduje unikalność slug przed zapisem. Jest to operacja zapisu wykorzystująca wzorzec CQRS przez CommandBus.

**Cel biznesowy**: Umożliwienie właścicielom workspace zmiany nazwy lub slug workspace po jego utworzeniu, z zachowaniem unikalności slug w całym systemie.

## 2. Szczegóły żądania

### Metoda HTTP
```
PATCH /v1/workspace
```

### Nagłówki
- `Content-Type: application/json`
- `Cookie: session` (Supabase Auth JWT w httpOnly cookie)

### Parametry URL
Brak parametrów URL - workspace identyfikowany z sesji użytkownika.

### Request Body

**Struktura**:
```json
{
  "name": "New Workspace Name",
  "slug": "new-workspace-slug"
}
```

**Parametry**:
- **Opcjonalne**:
  - `name` (string): Nowa nazwa workspace
    - Min length: 1
    - Max length: 100
    - Trim whitespace
  - `slug` (string): Nowy slug workspace
    - Min length: 3
    - Max length: 63
    - Pattern: `^[a-z0-9-]+$` (tylko lowercase, cyfry, myślniki)
    - Musi być unikalny w całym systemie

**Walidacja**:
- Przynajmniej jedno pole (`name` lub `slug`) musi być dostarczone
- Jeśli `slug` dostarczony: musi być w formacie kebab-case
- Jeśli `name` dostarczony: nie może być pusty po trim

## 3. Wykorzystywane typy

### DTOs

**UpdateWorkspaceDto** (request validation):
```typescript
interface UpdateWorkspaceDto {
  name?: string;
  slug?: string;
}
```

**WorkspaceResponseDto** (response mapping):
```typescript
interface WorkspaceResponseDto {
  id: string;
  name: string;
  slug: string;
  createdBy: string;
  createdAt: string;
}
```

### Command Models

**UpdateWorkspaceCommand**:
```typescript
interface UpdateWorkspaceCommand {
  workspaceId: string;
  userId: string;
  name?: string;
  slug?: string;
}
```

### Domain Models

**Workspace** (z Drizzle schema):
```typescript
interface Workspace {
  id: string;
  name: string;
  slug: string;
  createdBy: string;
  createdAt: string;
}
```

### JSON Schema (Fastify validation)

```typescript
const updateWorkspaceBodySchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 100
    },
    slug: {
      type: 'string',
      minLength: 3,
      maxLength: 63,
      pattern: '^[a-z0-9-]+$'
    }
  },
  anyOf: [
    { required: ['name'] },
    { required: ['slug'] }
  ],
  additionalProperties: false
} as const;
```

## 4. Szczegóły odpowiedzi

### Success Response (200 OK)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "New Workspace Name",
  "slug": "new-workspace-slug",
  "createdBy": "123e4567-e89b-12d3-a456-426614174000",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### Error Responses

**400 Bad Request**:
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Invalid slug format",
  "errorCode": "VALIDATION_ERROR",
  "traceId": "abc123xyz"
}
```

Przykładowe przypadki:
- Brak żadnego pola w request body
- Nieprawidłowy format slug (uppercase, spacje, znaki specjalne)
- Name pusty lub za długi
- Slug za krótki lub za długi

**401 Unauthorized**:
```json
{
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "Authentication required",
  "errorCode": "UNAUTHORIZED",
  "traceId": "abc123xyz"
}
```

**403 Forbidden**:
```json
{
  "statusCode": 403,
  "error": "Forbidden",
  "message": "Owner role required to update workspace",
  "errorCode": "FORBIDDEN",
  "traceId": "abc123xyz"
}
```

**404 Not Found**:
```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Workspace not found",
  "errorCode": "WORKSPACE_NOT_FOUND",
  "traceId": "abc123xyz"
}
```

**409 Conflict**:
```json
{
  "statusCode": 409,
  "error": "Conflict",
  "message": "Workspace slug already exists",
  "errorCode": "SLUG_CONFLICT",
  "traceId": "abc123xyz"
}
```

**500 Internal Server Error**:
```json
{
  "statusCode": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "errorCode": "INTERNAL_ERROR",
  "traceId": "abc123xyz"
}
```

## 5. Przepływ danych

### Sekwencja operacji

```
1. Client → Fastify Route (PATCH /v1/workspace)
   ├─ JSON Schema validation (updateWorkspaceBodySchema)
   └─ Extract user session (Supabase Auth plugin)

2. Route → UpdateWorkspaceHandler (via CommandBus)
   ├─ Create UpdateWorkspaceCommand
   └─ CommandBus.execute(command)

3. UpdateWorkspaceHandler
   ├─ Get current user workspace (workspaceRepository)
   ├─ Check user role = 'owner' (workspaceMemberRepository)
   ├─ If slug changed:
   │  └─ Check slug uniqueness (workspaceRepository.findBySlug)
   ├─ Update workspace (workspaceRepository.update)
   └─ Return updated workspace

4. Handler → Route → Client
   └─ Return WorkspaceResponseDto (200 OK)
```

### Diagram przepływu

```
┌─────────┐
│ Client  │
└────┬────┘
     │ PATCH /v1/workspace
     │ { name, slug }
     ▼
┌─────────────────────┐
│  Fastify Route      │
│  - JSON validation  │
│  - Auth middleware  │
└─────────┬───────────┘
          │
          │ UpdateWorkspaceCommand
          ▼
┌──────────────────────────┐
│  UpdateWorkspaceHandler  │
│  1. Get workspace        │
│  2. Check owner role     │
│  3. Validate slug unique │
│  4. Update DB            │
└─────────┬────────────────┘
          │
          │ SQL Queries
          ▼
┌─────────────────────┐
│  Supabase Postgres  │
│  - workspaces       │
│  - workspace_members│
│  - RLS policies     │
└─────────────────────┘
```

### Interakcje z bazą danych

1. **Pobierz workspace użytkownika**:
```sql
SELECT w.* FROM workspaces w
JOIN workspace_members wm ON w.id = wm.workspace_id
WHERE wm.user_id = $1 AND wm.role = 'owner'
LIMIT 1;
```

2. **Sprawdź unikalność slug** (tylko jeśli slug się zmienia):
```sql
SELECT id FROM workspaces
WHERE slug = $1 AND id != $2
LIMIT 1;
```

3. **Aktualizuj workspace**:
```sql
UPDATE workspaces
SET name = COALESCE($1, name),
    slug = COALESCE($2, slug)
WHERE id = $3
RETURNING *;
```

### Repository Methods

**WorkspaceRepository**:
- `findById(id: string): Promise<Workspace | null>`
- `findBySlug(slug: string): Promise<Workspace | null>`
- `findUserWorkspace(userId: string): Promise<Workspace | null>`
- `update(id: string, data: Partial<Workspace>): Promise<Workspace>`

**WorkspaceMemberRepository**:
- `getUserRole(workspaceId: string, userId: string): Promise<'owner' | 'member' | null>`

## 6. Względy bezpieczeństwa

### Uwierzytelnianie
- **Mechanizm**: Supabase Auth JWT w httpOnly cookie
- **Walidacja**: Fastify auth plugin sprawdza sesję
- **Błąd**: 401 Unauthorized jeśli brak sesji

### Autoryzacja
- **Wymaganie**: User musi być ownerem workspace
- **Sprawdzanie**: Query do `workspace_members` z warunkiem `role = 'owner'`
- **Błąd**: 403 Forbidden jeśli user nie jest ownerem

### Row-Level Security (RLS)
- **Polityki Supabase**: Automatyczne filtrowanie workspace per user
- **Session variable**: `app.workspace_id` ustawiana w request context
- **Ochrona**: User może aktualizować tylko swoje workspace

### Walidacja wejścia

1. **JSON Schema (Fastify)**:
   - Type checking
   - Length validation
   - Pattern matching dla slug
   - anyOf: przynajmniej jedno pole

2. **Domain validation (Handler)**:
   - Slug uniqueness check
   - Trim whitespace z name
   - Lowercase enforcement dla slug

3. **Ochrona przed atakami**:
   - SQL Injection: Drizzle ORM (parameterized queries)
   - XSS: Sanitization nie wymagana (slug tylko a-z0-9-)
   - CSRF: SameSite cookies (Supabase Auth)
   - Path traversal: Slug pattern validation

### Rate Limiting
- **Mechanizm**: Upstash Redis token bucket per user
- **Limity**:
  - Starter: 10 req/s, 1000 req/min
  - Pro: 50 req/s, 5000 req/min
- **Response**: 429 Too Many Requests z `Retry-After` header

### Logging bezpieczeństwa
- Log wszystkie failed authorization attempts (403)
- Log slug conflict attempts (potencjalne enumeration)
- Never log session tokens lub internal details
- Include traceId dla correlation

## 7. Obsługa błędów

### Katalog błędów

| Kod | Status | ErrorCode | Opis | Context |
|-----|--------|-----------|------|---------|
| E001 | 400 | VALIDATION_ERROR | Nieprawidłowy format danych | field, reason |
| E002 | 400 | MISSING_FIELDS | Brak wymaganych pól | requiredFields |
| E003 | 401 | UNAUTHORIZED | Brak autoryzacji | - |
| E004 | 403 | FORBIDDEN | Brak uprawnień owner | workspaceId, userRole |
| E005 | 404 | WORKSPACE_NOT_FOUND | Workspace nie istnieje | userId |
| E006 | 409 | SLUG_CONFLICT | Slug już zajęty | slug |
| E007 | 500 | INTERNAL_ERROR | Nieoczekiwany błąd serwera | - |

### Error Classes

```typescript
class ValidationError extends Error {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.errorCode = 'VALIDATION_ERROR';
    this.context = context;
  }
}

class UnauthorizedError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = 401;
    this.errorCode = 'UNAUTHORIZED';
  }
}

class ForbiddenError extends Error {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = 403;
    this.errorCode = 'FORBIDDEN';
    this.context = context;
  }
}

class NotFoundError extends Error {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
    this.errorCode = 'WORKSPACE_NOT_FOUND';
    this.context = context;
  }
}

class ConflictError extends Error {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
    this.errorCode = 'SLUG_CONFLICT';
    this.context = context;
  }
}
```

### Error Handler Flow

```typescript
try {
  // Business logic
} catch (error) {
  logger.error({
    err: error,
    traceId: request.id,
    userId: request.user?.id,
    context: error.context
  }, 'Update workspace failed');

  if (error instanceof ValidationError) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: error.message,
      errorCode: error.errorCode,
      traceId: request.id
    });
  }

  if (error instanceof ConflictError) {
    return reply.status(409).send({
      statusCode: 409,
      error: 'Conflict',
      message: error.message,
      errorCode: error.errorCode,
      traceId: request.id
    });
  }

  // Default 500 response (sanitized)
  return reply.status(500).send({
    statusCode: 500,
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    errorCode: 'INTERNAL_ERROR',
    traceId: request.id
  });
}
```

### Retry Strategy
- **Idempotencja**: PATCH jest idempotentny - bezpieczny retry
- **Client retries**: Recommended dla 500, 502, 503, 504
- **No retry**: 400, 401, 403, 404, 409 (client errors)

## 8. Rozważania dotyczące wydajności

### Potencjalne wąskie gardła

1. **Database queries**:
   - Dwa SELECT queries (workspace + slug uniqueness)
   - Jeden UPDATE query
   - **Optymalizacja**: Index na `slug` kolumnie

2. **RLS policies overhead**:
   - Supabase RLS sprawdza policies dla każdego query
   - **Akceptowalne**: Niewielki overhead dla bezpieczeństwa

3. **Connection pooling**:
   - Wykorzystanie Supabase connection pool
   - **Konfiguracja**: Default pool size wystarczający dla MVP

### Strategie optymalizacji

1. **Database indexes**:
```sql
CREATE UNIQUE INDEX workspaces_slug_idx ON workspaces(slug);
CREATE INDEX workspace_members_user_role_idx
  ON workspace_members(user_id, workspace_id, role);
```

2. **Query optimization**:
   - Combine workspace + member check w jeden query (JOIN)
   - Use `LIMIT 1` dla slug uniqueness check
   - Select only needed columns

3. **Caching** (Post-MVP):
   - Cache user workspace memberships w Redis
   - Key: `user:{userId}:workspaces`
   - TTL: 5 minutes
   - Invalidate on update

4. **Connection reuse**:
   - Singleton Drizzle client przez Awilix DI
   - Persistent connections do Supabase

### Metryki wydajności

**Target SLA**:
- **P50 latency**: < 100ms
- **P95 latency**: < 300ms
- **P99 latency**: < 500ms
- **Error rate**: < 0.1%

**Monitoring** (Pino logger):
```typescript
logger.info({
  event: 'update_workspace',
  workspaceId,
  userId,
  duration: Date.now() - startTime,
  traceId: request.id
}, 'Workspace updated successfully');
```

### Skalowanie

- **Vertical**: Wystarczające dla MVP (1-10k users)
- **Horizontal**: Stateless API - łatwe skalowanie
- **Database**: Supabase managed Postgres - auto-scaling

## 9. Etapy wdrożenia

### Krok 1: Przygotowanie struktury plików

**Lokalizacja**: `apps/api/modules/workspace/commands/update-workspace/`

Pliki do utworzenia:
```
apps/api/modules/workspace/commands/update-workspace/
├── update-workspace.handler.ts
├── update-workspace.route.ts
├── update-workspace.dto.ts
└── update-workspace.spec.ts (testy)
```

### Krok 2: Implementacja DTO i Command

**Plik**: `update-workspace.dto.ts`

```typescript
export interface UpdateWorkspaceDto {
  name?: string;
  slug?: string;
}

export interface UpdateWorkspaceCommand {
  workspaceId: string;
  userId: string;
  name?: string;
  slug?: string;
}

export interface WorkspaceResponseDto {
  id: string;
  name: string;
  slug: string;
  createdBy: string;
  createdAt: string;
}

export const updateWorkspaceBodySchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 100
    },
    slug: {
      type: 'string',
      minLength: 3,
      maxLength: 63,
      pattern: '^[a-z0-9-]+$'
    }
  },
  anyOf: [
    { required: ['name'] },
    { required: ['slug'] }
  ],
  additionalProperties: false
} as const;
```

### Krok 3: Rozszerzenie WorkspaceRepository

**Plik**: `apps/api/modules/workspace/database/workspace.repository.ts`

Dodać metody:
```typescript
async findBySlug(slug: string): Promise<Workspace | null> {
  const result = await this.db
    .select()
    .from(workspaces)
    .where(eq(workspaces.slug, slug))
    .limit(1);

  return result[0] || null;
}

async findUserWorkspace(userId: string): Promise<Workspace | null> {
  const result = await this.db
    .select({
      id: workspaces.id,
      name: workspaces.name,
      slug: workspaces.slug,
      createdBy: workspaces.createdBy,
      createdAt: workspaces.createdAt
    })
    .from(workspaces)
    .innerJoin(
      workspaceMembers,
      eq(workspaces.id, workspaceMembers.workspaceId)
    )
    .where(
      and(
        eq(workspaceMembers.userId, userId),
        eq(workspaceMembers.role, 'owner')
      )
    )
    .limit(1);

  return result[0] || null;
}

async update(
  id: string,
  data: Partial<Pick<Workspace, 'name' | 'slug'>>
): Promise<Workspace> {
  const result = await this.db
    .update(workspaces)
    .set(data)
    .where(eq(workspaces.id, id))
    .returning();

  if (!result[0]) {
    throw new NotFoundError('Workspace not found', { id });
  }

  return result[0];
}
```

### Krok 4: Implementacja Command Handler

**Plik**: `update-workspace.handler.ts`

```typescript
import type { CommandBus } from '@/core/cqrs/command-bus';
import type { WorkspaceRepository } from '../../database/workspace.repository';
import { NotFoundError, ForbiddenError, ConflictError } from '@requil/utils/errors';
import type {
  UpdateWorkspaceCommand,
  WorkspaceResponseDto
} from './update-workspace.dto';

interface UpdateWorkspaceHandlerDeps {
  workspaceRepository: WorkspaceRepository;
  commandBus: CommandBus;
  logger: Logger;
}

export class UpdateWorkspaceHandler {
  constructor(private deps: UpdateWorkspaceHandlerDeps) {}

  async init() {
    this.deps.commandBus.register('UpdateWorkspace', this.handler.bind(this));
  }

  async handler(command: UpdateWorkspaceCommand): Promise<WorkspaceResponseDto> {
    const { workspaceId, userId, name, slug } = command;
    const { workspaceRepository, logger } = this.deps;

    const startTime = Date.now();

    try {
      const workspace = await workspaceRepository.findUserWorkspace(userId);

      if (!workspace) {
        throw new NotFoundError(
          'Workspace not found or you do not have owner access',
          { userId }
        );
      }

      if (slug && slug !== workspace.slug) {
        const existingWorkspace = await workspaceRepository.findBySlug(slug);

        if (existingWorkspace && existingWorkspace.id !== workspaceId) {
          throw new ConflictError(
            'Workspace slug already exists',
            { slug }
          );
        }
      }

      const updateData: Partial<Workspace> = {};
      if (name !== undefined) {
        updateData.name = name.trim();
      }
      if (slug !== undefined) {
        updateData.slug = slug.toLowerCase().trim();
      }

      const updatedWorkspace = await workspaceRepository.update(
        workspace.id,
        updateData
      );

      logger.info({
        event: 'workspace_updated',
        workspaceId: updatedWorkspace.id,
        userId,
        changes: updateData,
        duration: Date.now() - startTime
      }, 'Workspace updated successfully');

      return {
        id: updatedWorkspace.id,
        name: updatedWorkspace.name,
        slug: updatedWorkspace.slug,
        createdBy: updatedWorkspace.createdBy,
        createdAt: updatedWorkspace.createdAt
      };

    } catch (error) {
      logger.error({
        err: error,
        workspaceId,
        userId,
        duration: Date.now() - startTime
      }, 'Update workspace failed');

      throw error;
    }
  }
}
```

### Krok 5: Implementacja Route

**Plik**: `update-workspace.route.ts`

```typescript
import type { FastifyInstance } from 'fastify';
import type { CommandBus } from '@/core/cqrs/command-bus';
import { updateWorkspaceBodySchema } from './update-workspace.dto';
import type { UpdateWorkspaceDto } from './update-workspace.dto';

interface UpdateWorkspaceRouteDeps {
  commandBus: CommandBus;
}

export async function updateWorkspaceRoute(
  fastify: FastifyInstance,
  opts: UpdateWorkspaceRouteDeps
) {
  fastify.patch<{
    Body: UpdateWorkspaceDto;
  }>(
    '/v1/workspace',
    {
      schema: {
        tags: ['workspace'],
        summary: 'Update workspace settings',
        description: 'Update workspace name or slug (owner role required)',
        body: updateWorkspaceBodySchema,
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              slug: { type: 'string' },
              createdBy: { type: 'string', format: 'uuid' },
              createdAt: { type: 'string', format: 'date-time' }
            }
          },
          400: {
            type: 'object',
            properties: {
              statusCode: { type: 'number' },
              error: { type: 'string' },
              message: { type: 'string' },
              errorCode: { type: 'string' },
              traceId: { type: 'string' }
            }
          },
          401: { $ref: 'errorSchema#' },
          403: { $ref: 'errorSchema#' },
          404: { $ref: 'errorSchema#' },
          409: { $ref: 'errorSchema#' }
        }
      },
      preHandler: [fastify.authenticate]
    },
    async (request, reply) => {
      const { name, slug } = request.body;
      const userId = request.user.id;

      const workspace = await fastify.diContainer
        .resolve<WorkspaceRepository>('workspaceRepository')
        .findUserWorkspace(userId);

      if (!workspace) {
        return reply.notFound('Workspace not found');
      }

      const result = await opts.commandBus.execute('UpdateWorkspace', {
        workspaceId: workspace.id,
        userId,
        name,
        slug
      });

      return reply.status(200).send(result);
    }
  );
}
```

### Krok 6: Rejestracja route w głównym pliku

**Plik**: `apps/api/modules/workspace/workspace.module.ts`

```typescript
import { updateWorkspaceRoute } from './commands/update-workspace/update-workspace.route';

export async function workspaceModule(fastify: FastifyInstance) {
  const commandBus = fastify.diContainer.resolve<CommandBus>('commandBus');

  await fastify.register(updateWorkspaceRoute, { commandBus });
}
```

### Krok 7: Testy jednostkowe

**Plik**: `update-workspace.spec.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateWorkspaceHandler } from './update-workspace.handler';
import { NotFoundError, ConflictError } from '@requil/utils/errors';

describe('UpdateWorkspaceHandler', () => {
  let handler: UpdateWorkspaceHandler;
  let mockWorkspaceRepository: any;
  let mockCommandBus: any;
  let mockLogger: any;

  beforeEach(() => {
    mockWorkspaceRepository = {
      findUserWorkspace: vi.fn(),
      findBySlug: vi.fn(),
      update: vi.fn()
    };

    mockCommandBus = {
      register: vi.fn()
    };

    mockLogger = {
      info: vi.fn(),
      error: vi.fn()
    };

    handler = new UpdateWorkspaceHandler({
      workspaceRepository: mockWorkspaceRepository,
      commandBus: mockCommandBus,
      logger: mockLogger
    });
  });

  it('should update workspace name successfully', async () => {
    const workspace = {
      id: 'workspace-1',
      name: 'Old Name',
      slug: 'old-slug',
      createdBy: 'user-1',
      createdAt: '2024-01-01T00:00:00Z'
    };

    mockWorkspaceRepository.findUserWorkspace.mockResolvedValue(workspace);
    mockWorkspaceRepository.update.mockResolvedValue({
      ...workspace,
      name: 'New Name'
    });

    const result = await handler.handler({
      workspaceId: 'workspace-1',
      userId: 'user-1',
      name: 'New Name'
    });

    expect(result.name).toBe('New Name');
    expect(mockLogger.info).toHaveBeenCalled();
  });

  it('should throw NotFoundError if workspace not found', async () => {
    mockWorkspaceRepository.findUserWorkspace.mockResolvedValue(null);

    await expect(
      handler.handler({
        workspaceId: 'workspace-1',
        userId: 'user-1',
        name: 'New Name'
      })
    ).rejects.toThrow(NotFoundError);
  });

  it('should throw ConflictError if slug already exists', async () => {
    const workspace = {
      id: 'workspace-1',
      name: 'Workspace',
      slug: 'old-slug',
      createdBy: 'user-1',
      createdAt: '2024-01-01T00:00:00Z'
    };

    const existingWorkspace = {
      id: 'workspace-2',
      slug: 'new-slug'
    };

    mockWorkspaceRepository.findUserWorkspace.mockResolvedValue(workspace);
    mockWorkspaceRepository.findBySlug.mockResolvedValue(existingWorkspace);

    await expect(
      handler.handler({
        workspaceId: 'workspace-1',
        userId: 'user-1',
        slug: 'new-slug'
      })
    ).rejects.toThrow(ConflictError);
  });

  it('should update slug when unique', async () => {
    const workspace = {
      id: 'workspace-1',
      name: 'Workspace',
      slug: 'old-slug',
      createdBy: 'user-1',
      createdAt: '2024-01-01T00:00:00Z'
    };

    mockWorkspaceRepository.findUserWorkspace.mockResolvedValue(workspace);
    mockWorkspaceRepository.findBySlug.mockResolvedValue(null);
    mockWorkspaceRepository.update.mockResolvedValue({
      ...workspace,
      slug: 'new-slug'
    });

    const result = await handler.handler({
      workspaceId: 'workspace-1',
      userId: 'user-1',
      slug: 'new-slug'
    });

    expect(result.slug).toBe('new-slug');
  });

  it('should trim and lowercase slug', async () => {
    const workspace = {
      id: 'workspace-1',
      name: 'Workspace',
      slug: 'old-slug',
      createdBy: 'user-1',
      createdAt: '2024-01-01T00:00:00Z'
    };

    mockWorkspaceRepository.findUserWorkspace.mockResolvedValue(workspace);
    mockWorkspaceRepository.findBySlug.mockResolvedValue(null);
    mockWorkspaceRepository.update.mockResolvedValue({
      ...workspace,
      slug: 'new-slug'
    });

    await handler.handler({
      workspaceId: 'workspace-1',
      userId: 'user-1',
      slug: '  NEW-SLUG  '
    });

    expect(mockWorkspaceRepository.update).toHaveBeenCalledWith(
      'workspace-1',
      expect.objectContaining({ slug: 'new-slug' })
    );
  });
});
```

### Krok 8: Testy integracyjne

**Plik**: `update-workspace.integration.spec.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { build } from '@/app';
import type { FastifyInstance } from 'fastify';

describe('PATCH /v1/workspace - Integration', () => {
  let app: FastifyInstance;
  let authCookie: string;
  let workspaceId: string;

  beforeAll(async () => {
    app = await build();

    const registerResponse = await app.inject({
      method: 'POST',
      url: '/v1/auth/register',
      payload: {
        email: 'test@example.com',
        password: 'Password123!'
      }
    });

    authCookie = registerResponse.cookies[0].value;

    const workspaceResponse = await app.inject({
      method: 'POST',
      url: '/v1/workspace',
      cookies: { session: authCookie },
      payload: {
        name: 'Test Workspace',
        slug: 'test-workspace'
      }
    });

    workspaceId = JSON.parse(workspaceResponse.body).id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should update workspace name', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: '/v1/workspace',
      cookies: { session: authCookie },
      payload: {
        name: 'Updated Workspace'
      }
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.name).toBe('Updated Workspace');
    expect(body.slug).toBe('test-workspace');
  });

  it('should update workspace slug', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: '/v1/workspace',
      cookies: { session: authCookie },
      payload: {
        slug: 'updated-slug'
      }
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.slug).toBe('updated-slug');
  });

  it('should return 409 for duplicate slug', async () => {
    await app.inject({
      method: 'POST',
      url: '/v1/workspace',
      cookies: { session: authCookie },
      payload: {
        name: 'Another Workspace',
        slug: 'another-workspace'
      }
    });

    const response = await app.inject({
      method: 'PATCH',
      url: '/v1/workspace',
      cookies: { session: authCookie },
      payload: {
        slug: 'another-workspace'
      }
    });

    expect(response.statusCode).toBe(409);
    const body = JSON.parse(response.body);
    expect(body.errorCode).toBe('SLUG_CONFLICT');
  });

  it('should return 400 for invalid slug format', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: '/v1/workspace',
      cookies: { session: authCookie },
      payload: {
        slug: 'Invalid Slug!'
      }
    });

    expect(response.statusCode).toBe(400);
  });

  it('should return 401 without authentication', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: '/v1/workspace',
      payload: {
        name: 'Updated Name'
      }
    });

    expect(response.statusCode).toBe(401);
  });

  it('should return 400 when no fields provided', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: '/v1/workspace',
      cookies: { session: authCookie },
      payload: {}
    });

    expect(response.statusCode).toBe(400);
  });
});
```

### Krok 9: Aktualizacja dokumentacji API (Swagger)

**Plik**: `apps/api/docs/swagger.ts`

Dodać endpoint do Swagger schema:
```typescript
{
  '/v1/workspace': {
    patch: {
      tags: ['Workspace'],
      summary: 'Update workspace settings',
      description: 'Update workspace name or slug. Requires owner role.',
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  minLength: 1,
                  maxLength: 100,
                  example: 'My Workspace'
                },
                slug: {
                  type: 'string',
                  minLength: 3,
                  maxLength: 63,
                  pattern: '^[a-z0-9-]+$',
                  example: 'my-workspace'
                }
              },
              anyOf: [
                { required: ['name'] },
                { required: ['slug'] }
              ]
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Workspace updated successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Workspace' }
            }
          }
        },
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
        409: { $ref: '#/components/responses/Conflict' }
      }
    }
  }
}
```

### Krok 10: Migracja bazy danych (jeśli potrzebna)

**Sprawdzenie indexów**:
```sql
-- Sprawdź czy istnieje unique index na slug
SELECT * FROM pg_indexes
WHERE tablename = 'workspaces'
AND indexname = 'workspaces_slug_idx';

-- Sprawdź czy istnieje composite index na workspace_members
SELECT * FROM pg_indexes
WHERE tablename = 'workspace_members'
AND indexname LIKE '%user%role%';
```

**Migracja** (jeśli brakuje indexów):
```sql
-- packages/db/migrations/0010_add_workspace_update_indexes.sql

-- Unique index dla slug (już istnieje w schema)
CREATE UNIQUE INDEX IF NOT EXISTS workspaces_slug_idx
  ON workspaces(slug);

-- Composite index dla sprawdzania owner role
CREATE INDEX IF NOT EXISTS workspace_members_user_role_idx
  ON workspace_members(user_id, workspace_id, role);

-- Komentarze
COMMENT ON INDEX workspaces_slug_idx
  IS 'Ensures slug uniqueness and speeds up slug lookups';

COMMENT ON INDEX workspace_members_user_role_idx
  IS 'Speeds up owner role checks for workspace updates';
```

### Krok 11: Uruchomienie testów

```bash
# Testy jednostkowe
pnpm --filter @requil/api test update-workspace.spec.ts

# Testy integracyjne
pnpm --filter @requil/api test:integration update-workspace.integration.spec.ts

# Coverage
pnpm --filter @requil/api test:coverage

# Wszystkie testy API
pnpm --filter @requil/api test
```

### Krok 12: Weryfikacja manualna

```bash
# Start API lokalnie
pnpm --filter @requil/api dev

# Test z curl
curl -X PATCH http://localhost:3000/v1/workspace \
  -H "Content-Type: application/json" \
  -H "Cookie: session=YOUR_SESSION_TOKEN" \
  -d '{"name": "Updated Name"}'

# Test z httpie
http PATCH localhost:3000/v1/workspace \
  name="Updated Workspace" \
  Cookie:session=YOUR_SESSION_TOKEN
```

### Krok 13: Code review checklist

- [ ] JSON Schema validation działa poprawnie
- [ ] Authorization sprawdza rolę owner
- [ ] Slug uniqueness jest walidowany
- [ ] Error handling dla wszystkich przypadków
- [ ] Testy jednostkowe i integracyjne przechodzą
- [ ] Logging z traceId
- [ ] Swagger docs aktualizowane
- [ ] No comments w kodzie (self-documenting)
- [ ] TypeScript strict mode bez błędów
- [ ] BiomeJS lint i format OK
- [ ] Performance: < 300ms P95

### Krok 14: Deploy do staging

```bash
# Merge do main branch
git add .
git commit -m "feat(api): implement PATCH /v1/workspace endpoint"
git push origin feature/update-workspace

# Po merge do main:
# Railway auto-deploy (jeśli skonfigurowane)
# Lub manual deploy
```

### Krok 15: Monitoring i post-deployment

Po deploy:
1. Sprawdź logi w Railway/production
2. Monitoruj error rate (target < 0.1%)
3. Sprawdź latencję (target P95 < 300ms)
4. Testuj endpoint na produkcji z testowym workspace
5. Weryfikuj RLS policies działają poprawnie

```bash
# Check logs
railway logs --tail

# Test production endpoint
curl -X PATCH https://api.requil.com/v1/workspace \
  -H "Content-Type: application/json" \
  -H "Cookie: session=PROD_SESSION" \
  -d '{"name": "Test Update"}'
```

## 10. Checklist implementacji

### Pre-implementation
- [ ] Przeczytaj i zrozum cały plan
- [ ] Sprawdź istniejący kod workspace module
- [ ] Zweryfikuj schema bazy danych
- [ ] Przygotuj środowisko developerskie

### Implementation
- [ ] Utwórz strukturę plików
- [ ] Zaimplementuj DTO i Command
- [ ] Rozszerz WorkspaceRepository
- [ ] Zaimplementuj UpdateWorkspaceHandler
- [ ] Zaimplementuj route
- [ ] Zarejestruj route w module
- [ ] Napisz testy jednostkowe
- [ ] Napisz testy integracyjne
- [ ] Aktualizuj dokumentację Swagger
- [ ] Sprawdź/dodaj indexy w DB

### Quality Assurance
- [ ] Wszystkie testy przechodzą
- [ ] BiomeJS lint bez błędów
- [ ] TypeScript strict mode OK
- [ ] Coverage > 80%
- [ ] Manual testing OK
- [ ] Code review przeprowadzony

### Deployment
- [ ] Deploy do staging
- [ ] Smoke tests na staging
- [ ] Performance monitoring
- [ ] Deploy do production
- [ ] Post-deployment monitoring

## 11. Podsumowanie

Endpoint `PATCH /v1/workspace` umożliwia właścicielom workspace aktualizację nazwy i slug z zachowaniem bezpieczeństwa i walidacji biznesowej. Implementacja wykorzystuje wzorzec CQRS, DI przez Awilix, oraz RLS policies Supabase dla izolacji danych między workspace.

**Kluczowe punkty**:
- Owner role required (403 jeśli brak uprawnień)
- Slug uniqueness validation (409 przy konflikcie)
- JSON Schema + domain validation
- Full error handling z traceId
- Performance: < 300ms P95 z proper indexing
- Self-documenting kod bez komentarzy
- Test coverage > 80%

**Estimated effort**: 4-6 godzin (development + testing)

