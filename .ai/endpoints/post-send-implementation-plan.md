# API Endpoint Implementation Plan: POST /v1/send

## 1. Przegląd punktu końcowego

Punkt końcowy `POST /v1/send` jest kluczowym elementem systemu Requil, odpowiedzialnym za procesowanie wysyłki wiadomości e-mail. Realizuje on proces walidacji requestu, weryfikacji idempotencji, sprawdzania limitów (Rate Limit), renderowania treści na podstawie szablonu oraz finalnej wysyłki.

Obsługuje dwa główne scenariusze użycia:
1.  **Wysyłka API (Server-to-Server)**: Autoryzacja przez API Key, używana przez integracje klientów.
2.  **Wysyłka Testowa (Dashboard)**: Autoryzacja przez sesję użytkownika (Supabase Auth), używana do testowania szablonów bezpośrednio z panelu administracyjnego.

## 2. Szczegóły żądania

- **Metoda HTTP**: `POST`
- **Struktura URL**: `/v1/send`
- **Autoryzacja**:
  - `Bearer {api_key}` (API Key ze scope `send`).
  - LUB Cookie Sesyjne (dla zapytań z Dashboardu - wysyłka testowa).
- **Nagłówki**:
  - `Idempotency-Key` (Wymagany dla API Key): Unikalny klucz requestu. Opcjonalny dla wysyłki testowej z Dashboardu.
  - `Authorization`: `Bearer {api_key}` (opcjonalne, jeśli sesja).

- **Parametry Body (JSON)**:

| Pole | Typ | Wymagalność | Opis |
|------|-----|-------------|------|
| `template` | string | **Wymagane** | Alias lub ID szablonu do użycia. |
| `to` | array | **Wymagane** | Lista odbiorców (min. 1). |
| `to[].email` | string | **Wymagane** | Adres email odbiorcy. |
| `to[].variables` | object | Opcjonalne | Zmienne do interpolacji dla konkretnego odbiorcy. |

**Uwaga**: `subject` i `preheader` są pobierane z template (nie można nadpisać w request).

## 3. Wykorzystywane typy

### DTO (Data Transfer Objects)

Zdefiniowane za pomocą Zod Schema w `modules/sending/sending.schema.ts` (do utworzenia):

```typescript
// Uproszczony schemat
const SendEmailSchema = z.object({
  template: z.string(),
  to: z.array(z.object({
    email: z.string().email(),
    variables: z.record(z.any()).optional()
  })).min(1).max(500) // Limit batcha
});
```

### Command Models

Command w architekturze CQRS (`modules/sending/commands/send-email/send-email.command.ts`):

```typescript
export class SendEmailCommand {
  constructor(
    public readonly workspaceId: string,
    public readonly idempotencyKey: string,
    public readonly payload: SendEmailDto,
    public readonly traceId: string
  ) {}
}
```

## 4. Szczegóły odpowiedzi

**Sukces (200 OK)** - Zwracany, gdy job został przyjęty i przetworzony (lub zakolejkowany).

```json
{
  "ok": true,
  "job_id": "job_123...",
  "used_template_snapshot_id": "snap_456...",
  "sent": 1,
  "failed": 0,
  "warnings": []
}
```

**Błędy**:
- `400 Bad Request`: Błąd walidacji danych (np. brak zmiennej).
- `401 Unauthorized`: Nieprawidłowy API Key.
- `409 Conflict`: Konflikt klucza idempotencji (użyty wcześniej z innym body) lub brak opublikowanego snapshotu.
- `429 Too Many Requests`: Przekroczony limit zapytań dla workspace.
- `500 Internal Server Error`: Błąd wewnętrzny.

## 5. Przepływ danych

1.  **Request**: Klient (API lub Dashboard) wysyła `POST /v1/send`.
2.  **Auth Guard**:
    - **API Key**: Weryfikacja klucza, scope `send`, pobranie `workspace_id`.
    - **Session**: Weryfikacja sesji użytkownika (Supabase), sprawdzenie członkostwa w workspace (Header `x-workspace-id` lub context).
3.  **Idempotency Check (Redis)**:
    - Dla API Key: Wymagane sprawdzenie klucza `lock:send:{key}`.
    - Dla Dashboardu: Opcjonalne (można pominąć dla pojedynczych testów).
4.  **Rate Limit Check (Upstash)**: Weryfikacja limitu tokenów dla workspace.
5.  **Handler (CQRS)**:
    - Pobierz najnowszy snapshot szablonu (`template_snapshots`).
    - Walidacja zmiennych odbiorców względem schema snapshotu (AJV).
    - Utworzenie rekordu `SendJob` (status `pending`) oraz `SendRecipients` w DB.
    - **Renderowanie**: Wykorzystanie silnika **React Email**.
      - JSON Document (z DB) -> React Components -> HTML.
      - Interpolacja zmiennych.
    - Inicjalizacja transportu (Internal Resend lub Custom z DB).
    - Wysyłka via `@requil/transports`.
    - Aktualizacja statusu `SendJob` i `SendRecipients` (sent/failed).
6.  **Response**: Zwrócenie wyniku i zapisanie go w cache idempotencji.

## 6. Względy bezpieczeństwa

-   **Dual Auth**: Obsługa zarówno API Key (S2S) jak i Sesji (Dashboard). Dashboard wymaga poprawnej konfiguracji CORS (whitelist domeny dashboardu) lub proxy.
-   **API Key Scopes**: Wymagany scope `send` dla kluczy API.
-   **Workspace Isolation**: `workspace_id` zawsze weryfikowany (z klucza lub uprawnień użytkownika).
-   **Input Validation**: Strict schema validation (Zod).
-   **HTML Sanitization**: React Email zapewnia escaping zmiennych, chroniąc przed XSS.
-   **CORS**: Endpoint musi być dostępny dla Dashboardu. Należy zweryfikować konfigurację w `apps/api/src/server/plugins/cors.ts` lub zezwolić na specyficzne originy dla tego route'a.

## 7. Obsługa błędów

Błędy są mapowane na odpowiednie kody HTTP przez globalny `ErrorHandler`:

-   `TemplateNotFoundError` -> 404
-   `NoPublishedSnapshotError` -> 409
-   `IdempotencyConflictError` -> 409
-   `RateLimitExceededError` -> 429
-   `ValidationError` -> 400 (szczegóły w body)
-   `TransportError` -> 502/503 (jeśli retry nie pomogło)

## 8. Wydajność

-   **Redis Cache**: Wyniki idempotencji i snapshoty szablonów cache'owane w Redis.
-   **Batch Insert**: `SendRecipients` zapisywane przy użyciu `db.insert().values([...])` dla wydajności.
-   **Connection Pooling**: Supabase pooler obsługuje połączenia DB.
-   **Future Optimization**: Dla dużych batchy (>500), handler powinien tylko kolejkować job (QStash) i zwracać 202 Accepted (post-MVP).

## 9. Etapy wdrożenia

### Krok 1: Scaffolding Modułu
Utworzenie struktury katalogów w `apps/api/src/modules/sending`:
- `sending.schema.ts` (Zod schema)
- `commands/send-email/` (Route, Handler, Command)
- `database/` (Repository port i implementacja Drizzle)
- `domain/` (Model domenowy, błędy)

### Krok 2: Implementacja Warstwy Danych
Implementacja `SendingRepository`:
- Metoda `createJob(job: NewSendJob, recipients: NewSendRecipient[])`: Transakcyjny zapis joba i odbiorców.
- Metoda `updateJobStatus(...)`.
- Metoda `updateRecipientStatus(...)`.

### Krok 3: Implementacja Logiki Domenowej (Handler)
Implementacja `SendEmailHandler`:
- Integracja z `TemplateRepository` (pobranie snapshotu).
- Logika walidacji zmiennych.
- Logika renderowania (wykorzystanie **React Email** engine/komponentów).
- Integracja z `@requil/transports`.

### Krok 4: Endpoint i Middleware
Konfiguracja `send-email.route.ts`:
- Rejestracja w Fastify.
- Podpięcie walidacji Zod.
- Konfiguracja **Auth Pre-handler**:
  - Sprawdź API Key.
  - Jeśli brak, sprawdź sesję (Supabase Auth).
  - Jeśli oba brak -> 401.
- Obsługa nagłówka `Idempotency-Key` (warunkowa dla API Key).
- Weryfikacja ustawień CORS dla endpointu (upewnienie się, że Dashboard ma dostęp).

### Krok 5: Testy
- Unit testy dla Handlera (mockowanie repozytoriów, React Email i transportu).
- Integration testy z bazą danych (Testcontainers).
- Scenariusze testowe:
  - Wysyłka z poprawnym API Key.
  - Wysyłka testowa z sesji użytkownika.
  - Błąd walidacji.
  - Konflikt idempotencji.

