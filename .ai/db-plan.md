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
  - `asset_status`: `uploading`, `ready`, `error`.
  - `asset_type`: `image`, `font`.
  - `plan`: `free`.

### 1.2. accounts
- `user_id: uuid` PRIMARY KEY
- `plan: plan` NOT NULL DEFAULT `free`
- `limits: jsonb` NOT NULL
- `current_period_start: timestamptz` NOT NULL DEFAULT now()
- `current_period_end: timestamptz` NOT NULL
- `stripe_customer_id: text`
- `stripe_subscription_id: text`
- `updated_at: timestamptz` NOT NULL DEFAULT now()

### 1.3. workspaces
- `id: uuid` PRIMARY KEY
- `name: text` NOT NULL
- `slug: text` NOT NULL UNIQUE
- `created_by: uuid` NOT NULL
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
- `name: text` NOT NULL
- `description: text`
- `document: jsonb` (struktura dokumentu edytora - MVP)
- `variables_schema: jsonb`
- `subject_lines: text[]`
- `preheader: text`
- `created_by: uuid` NOT NULL
- `created_at: timestamptz` NOT NULL DEFAULT now()
- `updated_at: timestamptz` NOT NULL DEFAULT now()
- UNIQUE (`workspace_id`, `stable_id`)
- Uwaga: `current_snapshot_id` będzie dodany po MVP, gdy snapshots będą aktywne

### 1.9. template_snapshots
- `id: uuid` PRIMARY KEY
- `template_id: uuid` FK → `templates.id` (CASCADE)
- `version: int` NOT NULL (UNIQUE w parze z `template_id`)
- `published_at: timestamptz`
- `document: jsonb` (struktura dokumentu edytora)
- `html: text` NOT NULL
- `plaintext: text`
- `variables_schema: jsonb` NOT NULL
- `subject_lines: text[]` NOT NULL
- `preheader: text`
- `notes: jsonb`
- `safety_flags: jsonb`
- `size_bytes: int` NOT NULL
- `created_by: uuid`
- `created_at: timestamptz` NOT NULL DEFAULT now()
- Uwaga: Tabela przygotowana na post-MVP, obecnie templates przechowują dane bezpośrednio

### 1.10. assets
- `id: uuid` PRIMARY KEY
- `workspace_id: uuid` FK → `workspaces.id` (CASCADE)
- `type: asset_type` NOT NULL (`image`|`font`)
- `status: asset_status` NOT NULL DEFAULT `uploading`
- `filename: text` NOT NULL
- `original_filename: text` NOT NULL
- `mime_type: text` NOT NULL
- `size_bytes: int` NOT NULL
- `storage_path: text` NOT NULL
- `public_url: text`
- `width: int` (dla obrazów)
- `height: int` (dla obrazów)
- `alt: text`
- `uploaded_by: uuid` NOT NULL
- `created_at: timestamptz` NOT NULL DEFAULT now()
- `updated_at: timestamptz` NOT NULL DEFAULT now()

### 1.11. workspace_brandkit
- `workspace_id: uuid` PRIMARY KEY, FK → `workspaces.id` (CASCADE)
- `data: jsonb` NOT NULL
- `updated_at: timestamptz` NOT NULL DEFAULT now()

### 1.12. workspace_transports
- `id: uuid` PRIMARY KEY
- `workspace_id: uuid` FK → `workspaces.id` (CASCADE), UNIQUE (`workspace_id`)
- `type: transport_type` NOT NULL (`resend`|`smtp`)
- `state: transport_state` NOT NULL DEFAULT `unverified`
- `from_domain: text`
- `from_email: citext`
- SMTP: `smtp_host: text`, `smtp_port: smallint` (1–65535), `smtp_secure: boolean`, `smtp_user: text`
- Sekrety: `secret_encrypted: bytea` NOT NULL, `enc_key_id: text`, `nonce: bytea`
- `updated_at: timestamptz` NOT NULL DEFAULT now()

### 1.13. send_jobs
- `id: uuid` PRIMARY KEY
- `workspace_id: uuid` FK → `workspaces.id` (CASCADE)
- `template_snapshot_id: uuid` FK → `template_snapshots.id`
- `transport: transport_type` NOT NULL
- `status: send_job_status` NOT NULL DEFAULT `pending`
- `idempotency_key_hash: bytea` NOT NULL
- `created_by: uuid`
- `created_at: timestamptz` NOT NULL DEFAULT now()

### 1.14. send_recipients
- `id: uuid` PRIMARY KEY
- `job_id: uuid` FK → `send_jobs.id` (CASCADE)
- `workspace_id: uuid` FK → `workspaces.id` (CASCADE)
- `email: citext` NOT NULL
- `variables: jsonb`
- `variables_hmac: bytea`
- `status: recipient_status` NOT NULL DEFAULT `pending`
- `suppressed_reason: suppression_reason`
- `error_code: text`
- `transport_message_id: text`
- `attempts: smallint` NOT NULL DEFAULT 0
- `first_sent_at: timestamptz`
- `last_attempt_at: timestamptz`

### 1.15. subscribers
- `id: uuid` PRIMARY KEY
- `workspace_id: uuid` FK → `workspaces.id` (CASCADE)
- `email: citext` NOT NULL (UNIQUE w parze z `workspace_id`)
- `status: subscriber_status` NOT NULL
- `attributes: jsonb`
- `confirmed_at: timestamptz`
- `token_hash: bytea`
- `created_at: timestamptz` NOT NULL DEFAULT now()

### 1.16. subscriber_tags
- `subscriber_id: uuid` FK → `subscribers.id` (CASCADE)
- `tag: text` NOT NULL
- PRIMARY KEY (`subscriber_id`, `tag`)

### 1.17. suppression
- `workspace_id: uuid` FK → `workspaces.id` (CASCADE)
- `email: citext` NOT NULL
- `reason: suppression_reason` NOT NULL
- `source_event_id: uuid`
- `created_at: timestamptz` NOT NULL DEFAULT now()
- PRIMARY KEY (`workspace_id`, `email`)

### 1.18. events
- `id: uuid` NOT NULL
- `workspace_id: uuid` FK → `workspaces.id` (CASCADE)
- `type: event_type` NOT NULL (`sent`|`delivered`|`bounced`)
- `job_id: uuid` FK → `send_jobs.id` (SET NULL)
- `recipient_email: citext` NOT NULL
- `transport: transport_type` NOT NULL
- `template_snapshot_id: uuid` FK → `template_snapshots.id` (SET NULL)
- `external_id: text`
- `occurred_at: timestamptz` NOT NULL
- PRIMARY KEY (`id`, `occurred_at`)
- Uwaga: Przygotowana do partycjonowania miesięcznego po `occurred_at`; retencja 90 dni

### 1.19. workspace_plans
- `workspace_id: uuid` PRIMARY KEY, FK → `workspaces.id` (CASCADE)
- `plan: plan` NOT NULL
- `limits: jsonb` NOT NULL
- `updated_at: timestamptz` NOT NULL DEFAULT now()

### 1.20. usage_counters_daily
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
- `workspaces` 1‑N `templates`, `templates` 1‑N `template_snapshots` (post-MVP: `templates.current_snapshot_id` → `template_snapshots.id`)
- `workspaces` 1‑N `assets`
- `workspaces` 1‑1 `workspace_brandkit`
- `workspaces` 1‑1 `workspace_transports`
- `workspaces` 1‑N `send_jobs`, `send_jobs` 1‑N `send_recipients`
- `workspaces` 1‑N `subscribers`, `subscribers` 1‑N `subscriber_tags`
- `workspaces` 1‑N `suppression`
- `workspaces` 1‑N `events` (N‑1 do `send_jobs` oraz N‑1 do `template_snapshots`)
- `workspaces` 1‑1 `workspace_plans`
- `workspaces` 1‑N `usage_counters_daily`

---

## 3. Indeksy
- `workspaces`: UNIQUE (`slug`).
- `workspace_invitations`: partial UNIQUE (`workspace_id`, `invitee_email`) WHERE `accepted_at IS NULL AND canceled_at IS NULL`.
- `templates`: UNIQUE (`workspace_id`, `stable_id`).
- `template_snapshots`: UNIQUE (`template_id`, `version`); indeks (`template_id`, `published_at DESC`); GIN na `variables_schema`.
- `assets`: indeks (`workspace_id`, `type`); indeks (`created_at DESC`).
- `api_keys`: UNIQUE `key_prefix`; indeks (`workspace_id`).
- `api_key_scopes`: indeks (`scope`).
- `send_jobs`: indeks (`workspace_id`, `created_at DESC`); indeks (`workspace_id`, `idempotency_key_hash`).
- `send_recipients`: indeks (`job_id`, `status`); indeks (`workspace_id`, `email`).
- `subscribers`: UNIQUE (`workspace_id`, `email`); GIN na `attributes`.
- `suppression`: PRIMARY KEY (`workspace_id`, `email`).
- `events`: PRIMARY KEY (`id`, `occurred_at`); indeks (`workspace_id`, `occurred_at`); indeks (`job_id`); indeks (`recipient_email`).
- `workspace_transports`: UNIQUE (`workspace_id`); indeks (`workspace_id`, `state`).
- `usage_counters_daily`: indeks (`workspace_id`, `day DESC`).

---

## 4. Zasady PostgreSQL (RLS)
- **Struktura polityk**: Wszystkie tabele mają zdefiniowane polityki RLS blokujące dostęp dla roli `anon` oraz definiujące dostęp dla roli `authenticated`.
- **Kontekst**: Każda tabela zawiera `workspace_id` (lub pośrednio przez FK). Kontrola dostępu opiera się o relacje workspace-member oraz rolę użytkownika.

- **Dostęp dla owner**: `api_keys`, `api_key_scopes`, `workspace_transports`, operacje zapisu dla `workspace_plans`, `workspace_invitations`.
- **Dostęp dla member**: `templates`, `template_snapshots`, `workspace_brandkit`, `send_jobs`, `send_recipients`, `subscribers`, `subscriber_tags`, `suppression`, `assets`.
- **Dostęp read-only dla member**: `workspaces`, `events`, `workspace_plans`, `usage_counters_daily`, `workspace_members`.
- **Polityki szczególne**:
  - `accounts`: użytkownik widzi tylko swój rekord (`user_id = auth.uid()`).
  - `assets`: dodatkowo rola `service_role` ma pełny dostęp.
  - `events`: authenticated może tylko czytać, nie może modyfikować.

---

## 5. Uwagi
- **MVP vs Post-MVP**:
  - **MVP**: `templates` przechowuje wszystko bezpośrednio (`document`, `variables_schema`, `subject_lines`, `preheader`), brak aktywnego `current_snapshot_id`.
  - **Post-MVP**: Aktywacja `template_snapshots` z historią wersji, `templates.current_snapshot_id` będzie wskazywać na aktywną wersję.
- **Events partitioning**: Tabela `events` ma composite PRIMARY KEY (`id`, `occurred_at`) przygotowany do partycjonowania miesięcznego po `occurred_at`; retencja 90 dni.
- **Idempotency**: `send_jobs.idempotency_key_hash` przechowuje hash nagłówka `Idempotency-Key` (deduplikacja na poziomie aplikacji/Redis).
- **Assets**: Nowa tabela do zarządzania plikami (obrazy, fonty) w workspace z metadanymi i storage path.
- **Accounts**: Tabela na poziomie użytkownika (nie workspace) do zarządzania planem subskrypcji i limitami, integracja ze Stripe.
- **RLS**: Wymagana kolumna `workspace_id` we wszystkich tabelach workspace'owych (lub w tabelach zależnych przez FK) dla egzekwowania polityk bezpieczeństwa.
