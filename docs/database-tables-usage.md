## Database Tables Usage Guide (MVP)

This guide explains what each table is for, what typical operations touch it, and any noteworthy constraints or behaviors. It maps back to API endpoints and product features from the MVP.

### Legend
- **Scope**: access level under RLS (member/owner/service)
- **Links**: key relations to other tables
- **Ops**: common operations (create/read/update/delete)

---

### auth.users (managed by Supabase)
- **Purpose**: Authentication identity for end users. Used by RLS via `auth.uid()`.
- **Scope**: n/a (managed by Supabase Auth)
- **Links**: referenced logically by `workspace_members.user_id`, `workspace_invitations.inviter_id/accepted_by`.
- **Ops**: created/managed by Supabase Auth flows.

---

### workspaces
- **Purpose**: Tenant boundary for all data and RLS context.
- **Scope**: member (read), owner (manage)
- **Links**: parent of most tables through `workspace_id`.
- **Ops**: create on signup/onboarding; soft administration.

### workspace_members
- **Purpose**: Membership and role (`owner`/`member`) within a workspace.
- **Scope**: member (read), owner (manage membership)
- **Links**: FK→`workspaces`; references `auth.users` (by `user_id`).
- **Ops**: invite acceptance creates/updates membership; role changes by owner.

### workspace_invitations
- **Purpose**: Invite flow management before a user becomes a member.
- **Scope**: owner (CRUD)
- **Links**: FK→`workspaces`; references `auth.users` (`inviter_id`, `accepted_by`).
- **Constraints**: Partial UNIQUE per active invite (`workspace_id`, `invitee_email`).
- **Ops**: create invite, resend, accept (convert to `workspace_members`), cancel/expire.

---

### api_keys
- **Purpose**: Programmatic access tokens for the API (hashed, scoped, rotatable).
- **Scope**: owner (CRUD), service (bypass for internal auth paths)
- **Links**: FK→`workspaces`; 1:N `api_key_scopes`.
- **Constraints**: globally unique `key_prefix`, hashed secret `key_hash`.
- **Ops**: create/rotate/revoke; audit `last_used_at`.

### api_key_scopes
- **Purpose**: Fine‑grained permissions bound to an API key.
- **Scope**: owner (CRUD)
- **Links**: FK→`api_keys`.
- **Ops**: attach/detach scopes to enforce least privilege.

---

### templates
- **Purpose**: Logical template handle (`stable_id`) within a workspace.
- **Scope**: member (CRUD)
- **Links**: FK→`workspaces`; 1:N `template_snapshots`; pointer `current_snapshot_id`.
- **Ops**: create template, publish updates by setting `current_snapshot_id`.

### template_snapshots
- **Purpose**: Immutable, publishable versions of a template.
- **Scope**: member (CRUD)
- **Links**: FK→`templates`.
- **Constraints**: UNIQUE (`template_id`, `version`); size limit `< 150 kB`.
- **Ops**: create new version (draft/published), validate guardrails before send.

### workspace_brandkit
- **Purpose**: Brand settings (colors, typography, legal links) used by render.
- **Scope**: member (CRUD)
- **Links**: PK/FK→`workspaces`.
- **Ops**: update brand JSON; referenced during template render.

### workspace_transports
- **Purpose**: Delivery configuration (Resend or SMTP) and sender identity.
- **Scope**: owner (CRUD)
- **Links**: FK→`workspaces` (1:1 per workspace).
- **Constraints**: one row per workspace; email/domain validation; encrypted secrets.
- **Ops**: configure provider, verify domain/sender, rotate secrets.

---

### send_jobs
- **Purpose**: A single send request context (`/v1/send`) and its lifecycle.
- **Scope**: member (CRUD)
- **Links**: FK→`workspaces`, FK→`template_snapshots`; 1:N `send_recipients`.
- **Constraints**: stores `idempotency_key_hash` to deduplicate at app level.
- **Ops**: create on request, transition statuses, summarize results.

### send_recipients
- **Purpose**: Per‑recipient render/send state and results.
- **Scope**: member (CRUD)
- **Links**: FK→`send_jobs`, FK→`workspaces`.
- **Constraints**: optional `variables` (if enabled), recommended `variables_hmac`.
- **Ops**: validation, render, transport attempt tracking, suppression reason capture.

---

### subscribers
- **Purpose**: Newsletter demo subscriber directory with attributes and DO flow.
- **Scope**: member (CRUD)
- **Links**: FK→`workspaces`; 1:N `subscriber_tags`.
- **Constraints**: UNIQUE per workspace by email; status lifecycle.
- **Ops**: create (pending), confirm (active), unsubscribe/bounce/complaint transitions.

### subscriber_tags
- **Purpose**: Lightweight tagging for segmentation.
- **Scope**: member (CRUD)
- **Links**: FK→`subscribers`.
- **Ops**: add/remove tags for campaign targeting.

### suppression
- **Purpose**: Global do‑not‑send within a workspace (unsub, bounce, complaint, manual).
- **Scope**: member (CRUD)
- **Links**: FK→`workspaces`; may reference `events` via `source_event_id`.
- **Constraints**: PRIMARY KEY (`workspace_id`, `email`).
- **Ops**: upsert from webhook events or user actions; consulted before render/send.

---

### events (partitioned monthly)
- **Purpose**: Minimal delivery telemetry: `sent`, `delivered`, `bounced`.
- **Scope**: member (read)
- **Links**: FK→`workspaces`; optional FK→`send_jobs`, FK→`template_snapshots`.
- **Constraints**: time‑based partitions, 90‑day retention (MVP).
- **Ops**: append via transports/webhooks; used for dashboards and audits.

### workspace_plans
- **Purpose**: Plan tier and limits for a workspace.
- **Scope**: member (read), owner (write)
- **Links**: PK/FK→`workspaces`.
- **Ops**: set/change plan, read in usage checks and alerts.

### usage_counters_daily
- **Purpose**: Persisted counters (renders, sends, AI) flushed from Redis.
- **Scope**: member (read), service (write)
- **Links**: FK→`workspaces`.
- **Ops**: nightly/hourly flush, power `/v1/usage` and 80% alerts.

---

## Cross‑cutting Notes
- **RLS**: every table with `workspace_id` is guarded; operations require the session to set current workspace context and pass role checks.
- **PII**: store minimal data; prefer `variables_hmac` over full `variables` for recipients.
- **Idempotency**: enforced at app/Redis; DB stores hashed key for audit and lookup.
- **Partitioning**: only `events` in MVP; consider `send_recipients` later if volume requires.
- **Indices**: all high‑cardinality queries include `workspace_id` prefix; JSONB fields use GIN where filtering is expected.
