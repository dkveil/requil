## Przewodnik użycia tabel bazy danych (MVP)

Ten dokument wyjaśnia przeznaczenie każdej tabeli, typowe operacje, kluczowe relacje oraz istotne ograniczenia. Mapuje tabele do funkcji i endpointów MVP.

### Legenda
- **Zakres**: poziom dostępu w RLS (member/owner/service)
- **Powiązania**: relacje do innych tabel
- **Operacje**: typowe akcje (create/read/update/delete)

---

### auth.users (zarządzana przez Supabase)
- **Cel**: Tożsamość użytkowników; używana w RLS przez `auth.uid()`.
- **Zakres**: n/d (zarządza Supabase Auth)
- **Powiązania**: logicznie z `workspace_members.user_id`, `workspace_invitations.inviter_id/accepted_by`.
- **Operacje**: tworzenie i zarządzanie przez Supabase Auth.

---

### workspaces
- **Cel**: Granica najemcy (tenant) i kontekst RLS.
- **Zakres**: member (odczyt), owner (zarządzanie)
- **Powiązania**: rodzic większości tabel przez `workspace_id`.
- **Operacje**: tworzenie podczas onboardingu; administracja.

### workspace_members
- **Cel**: Członkostwo i rola (`owner`/`member`) w workspace.
- **Zakres**: member (odczyt), owner (zarządzanie członkami)
- **Powiązania**: FK→`workspaces`; powiązane z `auth.users` (`user_id`).
- **Operacje**: akceptacja zaproszeń; zmiana ról przez ownera.

### workspace_invitations
- **Cel**: Obsługa procesu zaproszeń przed dołączeniem do workspace.
- **Zakres**: owner (CRUD)
- **Powiązania**: FK→`workspaces`; `auth.users` (`inviter_id`, `accepted_by`).
- **Ograniczenia**: częściowa unikalność aktywnych zaproszeń (`workspace_id`, `invitee_email`).
- **Operacje**: utwórz/wyślij ponownie/akceptuj/anuluj/wygaszenie; po akceptacji tworzy `workspace_members`.

---

### api_keys
- **Cel**: Programistyczne klucze dostępu do API (hashowane, ze scope’ami, rotowalne).
- **Zakres**: owner (CRUD), service (ścieżki wewnętrzne)
- **Powiązania**: FK→`workspaces`; 1:N `api_key_scopes`.
- **Ograniczenia**: globalnie unikalny `key_prefix`; hasz `key_hash`.
- **Operacje**: tworzenie/rotacja/revoke; aktualizacja `last_used_at`.

### api_key_scopes
- **Cel**: Precyzyjne uprawnienia przypisane do klucza API.
- **Zakres**: owner (CRUD)
- **Powiązania**: FK→`api_keys`.
- **Operacje**: dodawanie/usuwanie scope’ów.

---

### templates
- **Cel**: Logiczny uchwyt szablonu (`stable_id`) w workspace.
- **Zakres**: member (CRUD)
- **Powiązania**: FK→`workspaces`; 1:N `template_snapshots`; wskaźnik `current_snapshot_id`.
- **Operacje**: tworzenie szablonu; publikacja przez ustawienie `current_snapshot_id`.

### template_snapshots
- **Cel**: Niezmienne, publikowalne wersje szablonu.
- **Zakres**: member (CRUD)
- **Powiązania**: FK→`templates`.
- **Ograniczenia**: UNIQUE (`template_id`, `version`); limit rozmiaru `< 150 kB`.
- **Operacje**: tworzenie wersji draft/published; walidacja guardrails przed wysyłką.

### workspace_brandkit
- **Cel**: Ustawienia marki (kolory, typografia, linki prawne) używane przy renderze.
- **Zakres**: member (CRUD)
- **Powiązania**: PK/FK→`workspaces`.
- **Operacje**: aktualizacja JSON brandu; wykorzystywane w renderze.

### workspace_transports
- **Cel**: Konfiguracja dostawcy (Resend/SMTP) i tożsamość nadawcy.
- **Zakres**: owner (CRUD)
- **Powiązania**: FK→`workspaces` (1:1).
- **Ograniczenia**: jeden rekord na workspace; walidacja e‑mail/domena; sekrety zaszyfrowane.
- **Operacje**: konfiguracja, weryfikacja, rotacja sekretów.

---

### send_jobs
- **Cel**: Kontekst pojedynczego wywołania `/v1/send` i jego cykl życia.
- **Zakres**: member (CRUD)
- **Powiązania**: FK→`workspaces`, FK→`template_snapshots`; 1:N `send_recipients`.
- **Ograniczenia**: `idempotency_key_hash` dla deduplikacji na poziomie aplikacji.
- **Operacje**: utworzenie, zmiana statusów, podsumowanie wyników.

### send_recipients
- **Cel**: Stan renderu/wysyłki i wyniki per odbiorca.
- **Zakres**: member (CRUD)
- **Powiązania**: FK→`send_jobs`, FK→`workspaces`.
- **Ograniczenia**: opcjonalne `variables` (jeśli włączone); zalecane `variables_hmac`.
- **Operacje**: walidacja, render, próby transportu, rejestracja suppression.

---

### subscribers
- **Cel**: Księga subskrybentów warstwy demo (z atrybutami i DO).
- **Zakres**: member (CRUD)
- **Powiązania**: FK→`workspaces`; 1:N `subscriber_tags`.
- **Ograniczenia**: unikalny e‑mail per workspace; statusy.
- **Operacje**: rejestracja (pending), potwierdzenie (active), wypis/bounce/complaint.

### subscriber_tags
- **Cel**: Lekkie tagowanie do segmentacji.
- **Zakres**: member (CRUD)
- **Powiązania**: FK→`subscribers`.
- **Operacje**: dodawanie/usuwanie tagów.

### suppression
- **Cel**: Lista „nie wysyłaj” w workspace (unsubscribe/bounce/complaint/manual).
- **Zakres**: member (CRUD)
- **Powiązania**: FK→`workspaces`; opcjonalnie do `events` przez `source_event_id`.
- **Ograniczenia**: PRIMARY KEY (`workspace_id`, `email`).
- **Operacje**: upsert z webhooków/akcji użytkownika; sprawdzana przed renderem/wysyłką.

---

### events (partycjonowana miesięcznie)
- **Cel**: Minimalne telemetry: `sent`, `delivered`, `bounced`.
- **Zakres**: member (read)
- **Powiązania**: FK→`workspaces`; opcjonalnie FK→`send_jobs`, FK→`template_snapshots`.
- **Ograniczenia**: partycje czasowe; retencja 90 dni (MVP).
- **Operacje**: dopisywanie przez transporty/webhooki; raporty i audyt.

### workspace_plans
- **Cel**: Plan i limity dla workspace.
- **Zakres**: member (read), owner (write)
- **Powiązania**: PK/FK→`workspaces`.
- **Operacje**: ustawienie/zmiana planu; wykorzystywane w `/v1/usage` i alertach.

### usage_counters_daily
- **Cel**: Liczniki (renders, sends, AI) zrzucane z Redis do trwałej bazy.
- **Zakres**: member (read), service (write)
- **Powiązania**: FK→`workspaces`.
- **Operacje**: okresowy flush; zasilanie `/v1/usage` i powiadomień 80%.

---

## Uwagi przekrojowe
- **RLS**: każda tabela z `workspace_id` podlega RLS; operacje wymagają ustawienia bieżącego kontekstu workspace i weryfikacji roli.
- **PII**: minimalizuj dane; preferuj `variables_hmac` zamiast pełnego `variables` w odbiorcach.
- **Idempotencja**: na poziomie aplikacji/Redis; w DB przechowujemy hash klucza dla audytu.
- **Partycjonowanie**: tylko `events` w MVP; `send_recipients` opcjonalnie później.
- **Indeksy**: zapytania wysokiej kardy nalności z prefiksem `workspace_id`; dla JSONB używaj GIN tam, gdzie filtrujesz.
