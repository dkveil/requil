# API Endpoint Implementation Plan: API Keys Management

## 1. Przegląd punktu końcowego

Moduł zarządzania kluczami API (`api-keys`) umożliwia użytkownikom z rolą `owner` generowanie, listowanie oraz unieważnianie kluczy dostępowych do API Requil. Klucze te służą do uwierzytelniania w systemie (np. wysyłka e-maili) i posiadają określone zakresy uprawnień (scopes).

## 2. Szczegóły żądania

### 2.1 Tworzenie klucza (Create)
- **Metoda HTTP**: `POST`
- **URL**: `/v1/api-keys`
- **Autoryzacja**: Wymagana sesja + rola `owner` w workspace.
- **Body** (`application/json`):
  ```json
  {
    "name": "Production Key",
    "scopes": ["send", "templates:read"],
    "expires_at": "2025-12-31T23:59:59Z" // Opcjonalne
  }
  ```

### 2.2 Listowanie kluczy (List)
- **Metoda HTTP**: `GET`
- **URL**: `/v1/api-keys`
- **Parametry Query**:
  - `page`: number (default: 1)
  - `limit`: number (default: 20)
  - `include_revoked`: boolean (default: false)

### 2.3 Unieważnianie klucza (Revoke)
- **Metoda HTTP**: `DELETE`
- **URL**: `/v1/api-keys/:keyId`
- **Parametry Path**:
  - `keyId`: UUID klucza do unieważnienia.

## 3. Wykorzystywane typy

### Command & Query Models (CQRS)
```typescript
// modules/api-keys/commands/create-api-key/create-api-key.command.ts
export interface CreateApiKeyCommand {
  workspaceId: string;
  userId: string;
  name: string;
  scopes: ApiKeyScope[]; // z packages/validation
  expiresAt?: Date;
}

// modules/api-keys/commands/revoke-api-key/revoke-api-key.command.ts
export interface RevokeApiKeyCommand {
  workspaceId: string;
  keyId: string;
}

// modules/api-keys/queries/list-api-keys/list-api-keys.query.ts
export interface ListApiKeysQuery {
  workspaceId: string;
  page: number;
  limit: number;
  includeRevoked: boolean;
}
```

### DTOs
Należy mapować snake_case z API na camelCase w aplikacji. Wykorzystać schematy z `packages/validation/src/schemas/api-key.ts`.

## 4. Szczegóły odpowiedzi

### Create Response (201 Created)
Zwraca pełny klucz (tylko ten jeden raz).
```json
{
  "id": "uuid",
  "key": "rq_live_...", // Pełny klucz
  "key_prefix": "rq_live_abc1",
  "name": "Production Key",
  "scopes": ["send"],
  "created_at": "ISO8601",
  "expires_at": "ISO8601 | null"
}
```

### List Response (200 OK)
Nie zwraca pełnego klucza ani hasha.
```json
{
  "data": [
    {
      "id": "uuid",
      "key_prefix": "rq_live_abc1",
      "name": "Production Key",
      "scopes": ["send"],
      "last_used_at": "ISO8601 | null",
      "created_at": "ISO8601",
      "revoked_at": "ISO8601 | null"
    }
  ],
  "meta": {
    "total": 10,
    "page": 1,
    "limit": 20
  }
}
```

## 5. Przepływ danych

### Create Flow
1. **Controller**: Waliduje body (Zod), pobiera `workspaceId` z sesji.
2. **CommandBus**: Dispatch `CreateApiKeyCommand`.
3. **Handler**:
   - Generuje losowy klucz: prefix (np. `rq_live_`) + random (32 chars hex/base62).
   - Oblicza hash klucza używając `Argon2id`.
   - Wyciąga prefix (np. pierwsze 8-12 znaków).
4. **Repository**:
   - Transaction:
     - Insert do `api_keys` (hash, prefix, metadata).
     - Insert do `api_key_scopes`.
5. **Return**: Zwraca obiekt zawierający wygenerowany, niehashowany klucz (plain text) użytkownikowi.

### List/Revoke Flow
1. **Controller**: Parsuje parametry, sprawdza uprawnienia.
2. **Bus**: Dispatch Query lub Command.
3. **Repository**: Wykonuje zapytanie do `api_keys` (z join do scopes dla List).
4. **Handler**: Mapuje encje DB na DTO odpowiedzi.

## 6. Względy bezpieczeństwa

- **Format klucza**: Użycie prefixu (np. `rq_live_`) pozwala na łatwą identyfikację typu klucza i skanowanie np. GitHub w poszukiwaniu wycieków (secret scanning).
- **Hashowanie**: Klucze w bazie są hashowane algorytmem odpornym na GPU (Argon2id).
- **Izolacja**: Każde zapytanie do bazy **musi** zawierać `where workspace_id = :id`.
- **Role**: Middleware musi weryfikować, czy użytkownik ma uprawnienia do zarządzania zasobami workspace'u (owner).
- **Audit**: `created_by` przechowuje ID użytkownika, który wygenerował klucz.

## 7. Obsługa błędów

| Sytuacja | Kod HTTP | Error Class | Opis |
|----------|----------|-------------|------|
| Brak autoryzacji | 401 | `UnauthorizedError` | Brak lub nieprawidłowa sesja |
| Brak uprawnień (nie owner) | 403 | `ForbiddenError` | Użytkownik nie jest właścicielem workspace |
| Nieprawidłowe dane (zły scope) | 400 | `ValidationError` | Błąd walidacji Zod |
| Nie znaleziono klucza (revoke) | 404 | `NotFoundError` | Klucz nie istnieje w tym workspace |
| Limit kluczy (opcjonalnie) | 409 | `ConflictError` | Osiągnięto limit kluczy dla planu |

## 8. Etapy wdrożenia

1. **Struktura katalogów**:
   - Utworzenie `apps/api/src/modules/api-keys/`.
   - Utworzenie podkatalogów: `commands`, `queries`, `database`, `dtos`.

2. **Repository Implementation**:
   - Implementacja `ApiKeyRepository` w `database/api-key.repository.ts`.
   - Metody: `create` (transakcja), `list` (z filtrami), `findById`, `revoke`.
   - Rejestracja w kontenerze DI (Awilix).

3. **Key Generation Logic**:
   - Implementacja utility do generowania bezpiecznych kluczy (np. `utils/crypto.ts`).

4. **Create Endpoint**:
   - Stworzenie `CreateApiKeyCommand` i Handlera.
   - Implementacja logiki hashowania i zapisu.
   - Dodanie trasy w `api-keys.routes.ts`.

5. **List Endpoint**:
   - Stworzenie `ListApiKeysQuery` i Handlera.
   - Implementacja mapowania encji na DTO (ukrycie sekretów).

6. **Revoke Endpoint**:
   - Stworzenie `RevokeApiKeyCommand` i Handlera.
   - Logika ustawiania `revoked_at`.

7. **Rejestracja modułu**:
   - Dodanie modułu do głównego pliku aplikacji Fastify.

