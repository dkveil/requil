## 1. Tabele

### 1.1. Typy i rozszerzenia
- **Rozszerzenia**: `citext`, `pgcrypto`, `btree_gin`.
- **Enumy**:
  - `workspace_role`: `owner`, `member`.
  - `api_scope`: `send`, `templates:read`, `templates:write`, `subscribers:read`, `subscribers:write`, `keys:manage`, `transports:manage`, `usage:read`, `webhooks:manage`.
  - `transport_type`: `resend`, `smtp`.
  - `transport_state`: `active`, `inactive`, `unverified`.
  - `send_job_status`: `pending`, `processing`, `completed`, `failed`.
  - `recipient_status`: `pending`, `sent`, `delivered`, `bounced`, `failed`, `suppressed`.
  - `subscriber_status`: `pending`, `active`, `unsubscribed`, `bounced`, `complaint`.
  - `event_type`: `sent`, `delivered`, `bounced`.
  - `suppression_reason`: `unsubscribed`, `hard_bounce`, `complaint`, `manual`.
  - `plan`: `starter`, `pro`.

### 1.2. auth.users (zarządzana przez Supabase Auth)
- Tabela zarządzana przez Supabase; używana przez RLS przez `auth.uid()`.
- **Klucz główny**: `id: uuid`.
- **Pola istotne**: `email: citext unique`, `created_at: timestamptz`, `confirmed_at: timestamptz` (wg Supabase).

### 1.3. workspaces
- `id: uuid` PRIMARY KEY
- `name: text` NOT NULL
- `created_by: uuid`
- `created_at: timestamptz` NOT NULL DEFAULT now()

### 1.4. workspace_members
- `workspace_id: uuid` FK → `workspaces.id` (ON DELETE CASCADE)
- `user_id: uuid`
- `role: workspace_role` NOT NULL
- `invited_at: timestamptz` NOT NULL DEFAULT now()
- `accepted_at: timestamptz`
- PRIMARY KEY (`workspace_id`, `user_id`)

### 1.5. workspace_invitations
- `id: uuid` PRIMARY KEY
- `workspace_id: uuid` FK → `workspaces.id` (CASCADE)
- `invitee_email: citext` NOT NULL
- `role: workspace_role` NOT NULL DEFAULT `member`
- `inviter_id: uuid` NOT NULL
- `token_hash: bytea` NOT NULL
- `expires_at: timestamptz` NOT NULL
- `accepted_by: uuid`
- `accepted_at: timestamptz`
- `canceled_at: timestamptz`
- Partial UNIQUE: (`workspace_id`, `invitee_email`) gdy `accepted_at IS NULL AND canceled_at IS NULL`

### 1.6. api_keys
- `id: uuid` PRIMARY KEY
- `workspace_id: uuid` FK → `workspaces.id` (CASCADE)
- `name: text` NOT NULL
- `key_prefix: text` NOT NULL UNIQUE (globalnie)
- `key_hash: text` NOT NULL (argon2id)
- `created_by: uuid`
- `created_at: timestamptz` NOT NULL DEFAULT now()
- `last_used_at: timestamptz`
- `revoked_at: timestamptz`
- `expires_at: timestamptz`

### 1.7. api_key_scopes
- `api_key_id: uuid` FK → `api_keys.id` (CASCADE)
- `scope: api_scope` NOT NULL
- PRIMARY KEY (`api_key_id`, `scope`)

### 1.8. templates
- `id: uuid` PRIMARY KEY
- `workspace_id: uuid` FK → `workspaces.id` (CASCADE)
- `stable_id: citext` NOT NULL (UNIQUE w parze z `workspace_id`)
- `name: text`
- `current_snapshot_id: uuid` (FK → `template_snapshots.id`, ON DELETE SET NULL)
- `created_by: uuid`
- `created_at: timestamptz` NOT NULL DEFAULT now()
- UNIQUE (`workspace_id`, `stable_id`)

### 1.9. template_snapshots
- `id: uuid` PRIMARY KEY
- `template_id: uuid` FK → `templates.id` (CASCADE)
- `version: int` NOT NULL (UNIQUE w parze z `template_id`)
- `published_at: timestamptz`
- `mjml: text` NOT NULL
- `html: text` NOT NULL
- `plaintext: text`
- `variables_schema: jsonb` NOT NULL
- `subject_lines: text[]` NOT NULL
- `preheader: text`
- `notes: jsonb`
- `safety_flags: jsonb`
- `size_bytes: int` NOT NULL CHECK `< 150000`
- `created_by: uuid`
- `created_at: timestamptz` NOT NULL DEFAULT now()

### 1.10. workspace_brandkit
- `workspace_id: uuid` PRIMARY KEY, FK → `workspaces.id` (CASCADE)
- `data: jsonb` NOT NULL
- `updated_at: timestamptz` NOT NULL DEFAULT now()

### 1.11. workspace_transports (jeden rekord per workspace)
- `id: uuid` PRIMARY KEY
- `workspace_id: uuid` FK → `workspaces.id` (CASCADE), UNIQUE (`workspace_id`)
- `type: transport_type` NOT NULL (`resend`|`smtp`)
- `state: transport_state` NOT NULL DEFAULT `unverified`
- `from_domain: text`
- `from_email: citext`
- SMTP: `smtp_host: text`, `smtp_port: int2` (1–65535), `smtp_secure: boolean`, `smtp_user: text`
- Sekrety: `secret_encrypted: bytea` NOT NULL, `enc_key_id: text`, `nonce: bytea`
- `updated_at: timestamptz` NOT NULL DEFAULT now()

### 1.12. send_jobs
- `id: uuid` PRIMARY KEY (możliwe ULID w implementacji)
- `workspace_id: uuid` FK → `workspaces.id` (CASCADE)
- `template_snapshot_id: uuid` FK → `template_snapshots.id`
- `transport: transport_type` NOT NULL
- `status: send_job_status` NOT NULL DEFAULT `pending`
- `idempotency_key_hash: bytea` NOT NULL
- `created_by: uuid`
- `created_at: timestamptz` NOT NULL DEFAULT now()

### 1.13. send_recipients
- `id: uuid` PRIMARY KEY
- `job_id: uuid` FK → `send_jobs.id` (CASCADE)
- `workspace_id: uuid` FK → `workspaces.id` (CASCADE)
- `email: citext` NOT NULL
- `variables: jsonb` (opcjonalnie; kontrolowane flagą workspace)
- `variables_hmac: bytea` (zalecane)
- `status: recipient_status` NOT NULL DEFAULT `pending`
- `suppressed_reason: suppression_reason`
- `error_code: text`
- `transport_message_id: text`
- `attempts: smallint` NOT NULL DEFAULT 0
- `first_sent_at: timestamptz`
- `last_attempt_at: timestamptz`

### 1.14. subscribers
- `id: uuid` PRIMARY KEY
- `workspace_id: uuid` FK → `workspaces.id` (CASCADE)
- `email: citext` NOT NULL (UNIQUE w parze z `workspace_id`)
- `status: subscriber_status` NOT NULL
- `attributes: jsonb`
- `confirmed_at: timestamptz`
- `token_hash: bytea` (DO)
- `created_at: timestamptz` NOT NULL DEFAULT now()

### 1.15. subscriber_tags
- `subscriber_id: uuid` FK → `subscribers.id` (CASCADE)
- `tag: text` NOT NULL
- PRIMARY KEY (`subscriber_id`, `tag`)

### 1.16. suppression
- `workspace_id: uuid` FK → `workspaces.id` (CASCADE)
- `email: citext` NOT NULL
- `reason: suppression_reason` NOT NULL
- `source_event_id: uuid`
- `created_at: timestamptz` NOT NULL DEFAULT now()
- PRIMARY KEY (`workspace_id`, `email`)

### 1.17. events (partycjonowana miesięcznie po `occurred_at`)
- `id: uuid` PRIMARY KEY
- `workspace_id: uuid` FK → `workspaces.id` (CASCADE)
- `type: event_type` NOT NULL (`sent`|`delivered`|`bounced`)
- `job_id: uuid` FK → `send_jobs.id` (SET NULL)
- `recipient_email: citext` NOT NULL
- `transport: transport_type` NOT NULL
- `template_snapshot_id: uuid` FK → `template_snapshots.id` (SET NULL)
- `external_id: text`
- `occurred_at: timestamptz` NOT NULL
- Retencja: 90 dni (MVP)

### 1.18. workspace_plans
- `workspace_id: uuid` PRIMARY KEY, FK → `workspaces.id` (CASCADE)
- `plan: plan` NOT NULL (`starter`|`pro`)
- `limits: jsonb` NOT NULL
- `updated_at: timestamptz` NOT NULL DEFAULT now()

### 1.19. usage_counters_daily
- `workspace_id: uuid` FK → `workspaces.id` (CASCADE)
- `day: date` NOT NULL
- `renders: int` NOT NULL DEFAULT 0
- `sends: int` NOT NULL DEFAULT 0
- `ai: int` NOT NULL DEFAULT 0
- PRIMARY KEY (`workspace_id`, `day`)

---

## 2. Relacje między tabelami
- `workspaces` 1‑N `workspace_members`
- `workspaces` 1‑N `workspace_invitations`
- `workspaces` 1‑N `api_keys`, a `api_keys` 1‑N `api_key_scopes`
- `workspaces` 1‑N `templates`, `templates` 1‑N `template_snapshots`, `templates.current_snapshot_id` → `template_snapshots.id`
- `workspaces` 1‑1 `workspace_brandkit`
- `workspaces` 1‑1 `workspace_transports`
- `workspaces` 1‑N `send_jobs`, `send_jobs` 1‑N `send_recipients`
- `workspaces` 1‑N `subscribers`, `subscribers` 1‑N `subscriber_tags`
- `workspaces` 1‑N `suppression`
- `workspaces` 1‑N `events` (N‑1 do `send_jobs` oraz N‑1 do `template_snapshots`)
- `workspaces` 1‑1 `workspace_plans`, `workspaces` 1‑N `usage_counters_daily`

---

## 3. Indeksy
- `templates`: UNIQUE (`workspace_id`, `stable_id`).
- `template_snapshots`: UNIQUE (`template_id`, `version`); indeks (`template_id`, `published_at DESC`); GIN na `variables_schema`.
- `api_keys`: UNIQUE `key_prefix`; indeks (`workspace_id`).
- `send_jobs`: indeks (`workspace_id`, `created_at DESC`); indeks (`workspace_id`, `idempotency_key_hash`).
- `send_recipients`: indeks (`job_id`, `status`); indeks (`workspace_id`, `email`).
- `subscribers`: UNIQUE (`workspace_id`, `email`); GIN na `attributes`.
- `suppression`: PRIMARY KEY (`workspace_id`, `email`).
- `events`: indeks (`workspace_id`, `occurred_at`), indeks (`job_id`), indeks (`recipient_email`).
- `workspace_transports`: indeks (`workspace_id`, `state`).
- `usage_counters_daily`: indeks (`workspace_id`, `day DESC`).

---

## 4. Zasady PostgreSQL (RLS)
- Kontekst: każda tabela zawiera `workspace_id` (lub pośrednio przez FK). Aplikacja ustawia `app.workspace_id` dla sesji.
- Funkcja `is_member(workspace_id, min_role)` (logika w aplikacji/SQL) rozstrzyga dostęp użytkownika (`owner`/`member`).

- **Dostęp owner‑only**: `api_keys`, `api_key_scopes`, `workspace_transports`, zapisy do `workspace_plans`.
- **Dostęp member (CRUD)**: `templates`, `template_snapshots`, `workspace_brandkit`, `send_jobs`, `send_recipients`, `subscribers`, `subscriber_tags`, `suppression`.
- **Odczyt member**: `workspaces` (tylko bieżący), `events`, `workspace_plans`, `usage_counters_daily`, `workspace_members` (read), `workspace_invitations` (tylko owner pełen CRUD).
- Zasada wspólna: operacje dozwolone, gdy rekord ma `workspace_id = app.workspace_id` oraz użytkownik spełnia rolę minimalną.

---

## 5. Uwagi
- `events` partycjonować miesięcznie po `occurred_at`; utrzymywać partycje rotacyjnie; retencja 90 dni.
- `send_jobs.idempotency_key_hash` przechowuje hash nagłówka `Idempotency-Key` (bez unikalności w DB – deduplikacja na poziomie aplikacji/Redis zgodnie z PRD).
- `send_recipients.variables` jest opcjonalne; rekomendowane `variables_hmac` dla spójności audytu i ochrony PII.
- Wymagana kolumna `workspace_id` we wszystkich tabelach (lub w tabelach zależnych przez FK) dla egzekwowania RLS.
