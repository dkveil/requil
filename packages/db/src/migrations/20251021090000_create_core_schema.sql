/*
  migracja: utworzenie podstawowego schematu bazy requil (mvp)
  data (utc): 2025-10-21 09:00:00

  cel:
  - utworzenie rozszerzeń, typów enum i wszystkich tabel zgodnie z planem db
  - definicja rls i polityk bezpieczeństwa dla każdego typu operacji i roli
  - indeksy wydajnościowe i unikalności
  - partycjonowanie miesięczne tabeli events oraz startowe partycje

  dotknięte obiekty:
  - extensions: citext, pgcrypto, btree_gin
  - types: workspace_role, api_scope, transport_type, transport_state, send_job_status,
           recipient_status, subscriber_status, event_type, suppression_reason, plan
  - schema: app (funkcje pomocnicze rls)
  - tables: workspaces, workspace_members, workspace_invitations, api_keys, api_key_scopes,
            templates, template_snapshots, workspace_brandkit, workspace_transports,
            send_jobs, send_recipients, subscribers, subscriber_tags, suppression,
            events (partycjonowana), workspace_plans, usage_counters_daily

  uwagi:
  - wszystkie tabele mają włączony rls; każda operacja ma oddzielną politykę dla ról anon i authenticated
  - polityki opierają się na zmiennej sesyjnej app.workspace_id (ustawianej przez aplikację)
  - funkcje app.current_workspace_id() i app.is_member() wspierają rls; is_member działa jako security definer
  - destrukcyjne polecenia nie są wykonywane w tej migracji
*/

-- rozszerzenia wymagane przez schemat
create extension if not exists citext with schema public;
create extension if not exists pgcrypto with schema public;
create extension if not exists btree_gin with schema public;

-- przestrzeń nazw na funkcje pomocnicze
create schema if not exists app;

-- funkcja: aktualny workspace_id z sesji; zwraca null, jeśli nie ustawiono
create or replace function app.current_workspace_id()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('app.workspace_id', true), '')::uuid;
$$;

-- typy enum zgodnie z planem
do $$ begin
  if not exists (select 1 from pg_type where typname = 'workspace_role') then
    create type workspace_role as enum ('owner', 'member');
  end if;
  if not exists (select 1 from pg_type where typname = 'api_scope') then
    create type api_scope as enum (
      'send',
      'templates:read', 'templates:write',
      'subscribers:read', 'subscribers:write',
      'keys:manage', 'transports:manage',
      'usage:read', 'webhooks:manage'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'transport_type') then
    create type transport_type as enum ('resend', 'smtp');
  end if;
  if not exists (select 1 from pg_type where typname = 'transport_state') then
    create type transport_state as enum ('active', 'inactive', 'unverified');
  end if;
  if not exists (select 1 from pg_type where typname = 'send_job_status') then
    create type send_job_status as enum ('pending', 'processing', 'completed', 'failed');
  end if;
  if not exists (select 1 from pg_type where typname = 'recipient_status') then
    create type recipient_status as enum ('pending', 'sent', 'delivered', 'bounced', 'failed', 'suppressed');
  end if;
  if not exists (select 1 from pg_type where typname = 'subscriber_status') then
    create type subscriber_status as enum ('pending', 'active', 'unsubscribed', 'bounced', 'complaint');
  end if;
  if not exists (select 1 from pg_type where typname = 'event_type') then
    create type event_type as enum ('sent', 'delivered', 'bounced');
  end if;
  if not exists (select 1 from pg_type where typname = 'suppression_reason') then
    create type suppression_reason as enum ('unsubscribed', 'hard_bounce', 'complaint', 'manual');
  end if;
  if not exists (select 1 from pg_type where typname = 'plan') then
    create type plan as enum ('starter', 'pro');
  end if;
end $$;

-- tabele bazowe
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null,
  role workspace_role not null,
  invited_at timestamptz not null default now(),
  accepted_at timestamptz,
  constraint workspace_members_pkey primary key (workspace_id, user_id)
);

create table if not exists public.workspace_invitations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  invitee_email citext not null,
  role workspace_role not null default 'member',
  inviter_id uuid not null,
  token_hash bytea not null,
  expires_at timestamptz not null,
  accepted_by uuid,
  accepted_at timestamptz,
  canceled_at timestamptz
);

create unique index if not exists workspace_invitations_open_unique
  on public.workspace_invitations (workspace_id, invitee_email)
  where accepted_at is null and canceled_at is null;

create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  key_prefix text not null unique,
  key_hash text not null,
  created_by uuid,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz,
  expires_at timestamptz
);

create index if not exists api_keys_workspace_id_idx on public.api_keys (workspace_id);

create table if not exists public.api_key_scopes (
  api_key_id uuid not null references public.api_keys(id) on delete cascade,
  scope api_scope not null,
  constraint api_key_scopes_pkey primary key (api_key_id, scope)
);

create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  stable_id citext not null,
  name text,
  current_snapshot_id uuid,
  created_by uuid,
  created_at timestamptz not null default now(),
  constraint templates_workspace_stable_unique unique (workspace_id, stable_id)
);

create table if not exists public.template_snapshots (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.templates(id) on delete cascade,
  version int not null,
  published_at timestamptz,
  mjml text not null,
  html text not null,
  plaintext text,
  variables_schema jsonb not null,
  subject_lines text[] not null,
  preheader text,
  notes jsonb,
  safety_flags jsonb,
  size_bytes int not null,
  created_by uuid,
  created_at timestamptz not null default now(),
  constraint template_snapshots_version_unique unique (template_id, version),
  constraint template_snapshots_size_bytes_check check (size_bytes < 150000)
);

create index if not exists template_snapshots_template_id_published_idx
  on public.template_snapshots (template_id, published_at desc);

create index if not exists template_snapshots_variables_schema_gin
  on public.template_snapshots using gin (variables_schema);

-- cykliczny fk: templates -> snapshots i snapshots -> templates
-- używamy deferrable aby umożliwić wstawienie w ramach jednej transakcji
alter table public.templates
  add constraint templates_current_snapshot_fk
  foreign key (current_snapshot_id) references public.template_snapshots(id) on delete set null
  deferrable initially deferred;

create table if not exists public.workspace_brandkit (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_transports (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null unique references public.workspaces(id) on delete cascade,
  type transport_type not null,
  state transport_state not null default 'unverified',
  from_domain text,
  from_email citext,
  smtp_host text,
  smtp_port int2,
  smtp_secure boolean,
  smtp_user text,
  secret_encrypted bytea not null,
  enc_key_id text,
  nonce bytea,
  updated_at timestamptz not null default now(),
  constraint workspace_transports_smtp_port_check check (smtp_port is null or (smtp_port between 1 and 65535))
);

create index if not exists workspace_transports_workspace_state_idx
  on public.workspace_transports (workspace_id, state);

create table if not exists public.send_jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  template_snapshot_id uuid not null references public.template_snapshots(id) on delete set null,
  transport transport_type not null,
  status send_job_status not null default 'pending',
  idempotency_key_hash bytea not null,
  created_by uuid,
  created_at timestamptz not null default now()
);

create index if not exists send_jobs_workspace_created_idx
  on public.send_jobs (workspace_id, created_at desc);

create index if not exists send_jobs_workspace_idem_idx
  on public.send_jobs (workspace_id, idempotency_key_hash);

create table if not exists public.send_recipients (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.send_jobs(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email citext not null,
  variables jsonb,
  variables_hmac bytea,
  status recipient_status not null default 'pending',
  suppressed_reason suppression_reason,
  error_code text,
  transport_message_id text,
  attempts smallint not null default 0,
  first_sent_at timestamptz,
  last_attempt_at timestamptz
);

create index if not exists send_recipients_job_status_idx
  on public.send_recipients (job_id, status);

create index if not exists send_recipients_workspace_email_idx
  on public.send_recipients (workspace_id, email);

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email citext not null,
  status subscriber_status not null,
  attributes jsonb,
  confirmed_at timestamptz,
  token_hash bytea,
  created_at timestamptz not null default now(),
  constraint subscribers_workspace_email_unique unique (workspace_id, email)
);

create index if not exists subscribers_attributes_gin
  on public.subscribers using gin (attributes);

create table if not exists public.subscriber_tags (
  subscriber_id uuid not null references public.subscribers(id) on delete cascade,
  tag text not null,
  constraint subscriber_tags_pkey primary key (subscriber_id, tag)
);

create table if not exists public.suppression (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email citext not null,
  reason suppression_reason not null,
  source_event_id uuid,
  created_at timestamptz not null default now(),
  constraint suppression_pkey primary key (workspace_id, email)
);

-- tabela partycjonowana: events
-- uwaga: primary key musi zawierać kolumnę partycjonowania (occurred_at)
create table if not exists public.events (
  id uuid not null default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  type event_type not null,
  job_id uuid references public.send_jobs(id) on delete set null,
  recipient_email citext not null,
  transport transport_type not null,
  template_snapshot_id uuid references public.template_snapshots(id) on delete set null,
  external_id text,
  occurred_at timestamptz not null,
  constraint events_pkey primary key (id, occurred_at)
) partition by range (occurred_at);

create index if not exists events_workspace_occurred_idx on public.events (workspace_id, occurred_at);
create index if not exists events_job_id_idx on public.events (job_id);
create index if not exists events_recipient_email_idx on public.events (recipient_email);

-- startowe partycje miesięczne: bieżący + kolejne 2 miesiące
do $$
declare
  m_start timestamptz;
  i int;
  p_start timestamptz;
  p_end timestamptz;
  p_name text;
begin
  m_start := date_trunc('month', now());
  for i in 0..2 loop
    p_start := (m_start + make_interval(months => i));
    p_end := (m_start + make_interval(months => i + 1));
    p_name := format('events_%s', to_char(p_start, 'yyyymm'));
    execute format(
      'create table if not exists %I partition of public.events for values from (%L) to (%L);',
      p_name, p_start, p_end
    );
    execute format('alter table if exists %I enable row level security;', p_name);
  end loop;
end $$;

create table if not exists public.workspace_plans (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  plan plan not null,
  limits jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.usage_counters_daily (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  day date not null,
  renders int not null default 0,
  sends int not null default 0,
  ai int not null default 0,
  constraint usage_counters_daily_pkey primary key (workspace_id, day)
);

create index if not exists usage_counters_daily_workspace_day_desc_idx
  on public.usage_counters_daily (workspace_id, day desc);

-- funkcja: aktualizacja kolumny updated_at przy modyfikacjach
create or replace function app.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- triggery utrzymujące updated_at
drop trigger if exists trg_touch_workspace_brandkit on public.workspace_brandkit;
create trigger trg_touch_workspace_brandkit
  before update on public.workspace_brandkit
  for each row
  execute function app.touch_updated_at();

drop trigger if exists trg_touch_workspace_transports on public.workspace_transports;
create trigger trg_touch_workspace_transports
  before update on public.workspace_transports
  for each row
  execute function app.touch_updated_at();

drop trigger if exists trg_touch_workspace_plans on public.workspace_plans;
create trigger trg_touch_workspace_plans
  before update on public.workspace_plans
  for each row
  execute function app.touch_updated_at();

-- funkcja rls: czy bieżący użytkownik jest członkiem workspace, z progiem roli
create or replace function app.is_member(target_workspace_id uuid, min_role workspace_role default 'member')
returns boolean
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    return false;
  end if;
  return exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = uid
      and (
        case when min_role = 'owner' then wm.role = 'owner' else wm.role in ('owner','member') end
      )
  );
end;
$$;

-- włączenie rls na wszystkich tabelach
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.workspace_invitations enable row level security;
alter table public.api_keys enable row level security;
alter table public.api_key_scopes enable row level security;
alter table public.templates enable row level security;
alter table public.template_snapshots enable row level security;
alter table public.workspace_brandkit enable row level security;
alter table public.workspace_transports enable row level security;
alter table public.send_jobs enable row level security;
alter table public.send_recipients enable row level security;
alter table public.subscribers enable row level security;
alter table public.subscriber_tags enable row level security;
alter table public.suppression enable row level security;
alter table public.events enable row level security;
alter table public.workspace_plans enable row level security;
alter table public.usage_counters_daily enable row level security;

-- polityki rls: jedna polityka per operacja i rola (anon / authenticated)

-- workspaces
create policy workspaces_select_anon_deny on public.workspaces for select to anon using (false);
create policy workspaces_insert_anon_deny on public.workspaces for insert to anon with check (false);
create policy workspaces_update_anon_deny on public.workspaces for update to anon using (false) with check (false);
create policy workspaces_delete_anon_deny on public.workspaces for delete to anon using (false);

create policy workspaces_select_auth_member on public.workspaces for select to authenticated
  using (id = app.current_workspace_id() and app.is_member(id, 'member'));
create policy workspaces_insert_auth_deny on public.workspaces for insert to authenticated with check (false);
create policy workspaces_update_auth_owner on public.workspaces for update to authenticated
  using (id = app.current_workspace_id() and app.is_member(id, 'owner'))
  with check (id = app.current_workspace_id() and app.is_member(id, 'owner'));
create policy workspaces_delete_auth_deny on public.workspaces for delete to authenticated using (false);

-- workspace_members (tylko odczyt dla członków w ramach bieżącego workspace)
create policy workspace_members_select_anon_deny on public.workspace_members for select to anon using (false);
create policy workspace_members_insert_anon_deny on public.workspace_members for insert to anon with check (false);
create policy workspace_members_update_anon_deny on public.workspace_members for update to anon using (false) with check (false);
create policy workspace_members_delete_anon_deny on public.workspace_members for delete to anon using (false);

create policy workspace_members_select_auth_member on public.workspace_members for select to authenticated
  using (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'member'));
create policy workspace_members_insert_auth_deny on public.workspace_members for insert to authenticated with check (false);
create policy workspace_members_update_auth_deny on public.workspace_members for update to authenticated using (false) with check (false);
create policy workspace_members_delete_auth_deny on public.workspace_members for delete to authenticated using (false);

-- workspace_invitations (owner pełen crud)
create policy workspace_invitations_select_anon_deny on public.workspace_invitations for select to anon using (false);
create policy workspace_invitations_insert_anon_deny on public.workspace_invitations for insert to anon with check (false);
create policy workspace_invitations_update_anon_deny on public.workspace_invitations for update to anon using (false) with check (false);
create policy workspace_invitations_delete_anon_deny on public.workspace_invitations for delete to anon using (false);

create policy workspace_invitations_select_auth_owner on public.workspace_invitations for select to authenticated
  using (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'owner'));
create policy workspace_invitations_insert_auth_owner on public.workspace_invitations for insert to authenticated
  with check (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'owner'));
create policy workspace_invitations_update_auth_owner on public.workspace_invitations for update to authenticated
  using (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'owner'))
  with check (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'owner'));
create policy workspace_invitations_delete_auth_owner on public.workspace_invitations for delete to authenticated
  using (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'owner'));

-- api_keys (owner-only)
create policy api_keys_select_anon_deny on public.api_keys for select to anon using (false);
create policy api_keys_insert_anon_deny on public.api_keys for insert to anon with check (false);
create policy api_keys_update_anon_deny on public.api_keys for update to anon using (false) with check (false);
create policy api_keys_delete_anon_deny on public.api_keys for delete to anon using (false);

create policy api_keys_select_auth_owner on public.api_keys for select to authenticated
  using (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'owner'));
create policy api_keys_insert_auth_owner on public.api_keys for insert to authenticated
  with check (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'owner'));
create policy api_keys_update_auth_owner on public.api_keys for update to authenticated
  using (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'owner'))
  with check (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'owner'));
create policy api_keys_delete_auth_owner on public.api_keys for delete to authenticated
  using (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'owner'));

-- api_key_scopes (owner-only)
create policy api_key_scopes_select_anon_deny on public.api_key_scopes for select to anon using (false);
create policy api_key_scopes_insert_anon_deny on public.api_key_scopes for insert to anon with check (false);
create policy api_key_scopes_update_anon_deny on public.api_key_scopes for update to anon using (false) with check (false);
create policy api_key_scopes_delete_anon_deny on public.api_key_scopes for delete to anon using (false);

create policy api_key_scopes_select_auth_owner on public.api_key_scopes for select to authenticated
  using (exists (
    select 1 from public.api_keys k
    where k.id = api_key_id
      and k.workspace_id = app.current_workspace_id()
      and app.is_member(k.workspace_id, 'owner')
  ));
create policy api_key_scopes_insert_auth_owner on public.api_key_scopes for insert to authenticated
  with check (exists (
    select 1 from public.api_keys k
    where k.id = api_key_id
      and k.workspace_id = app.current_workspace_id()
      and app.is_member(k.workspace_id, 'owner')
  ));
create policy api_key_scopes_update_auth_owner on public.api_key_scopes for update to authenticated
  using (exists (
    select 1 from public.api_keys k
    where k.id = api_key_id
      and k.workspace_id = app.current_workspace_id()
      and app.is_member(k.workspace_id, 'owner')
  ))
  with check (exists (
    select 1 from public.api_keys k
    where k.id = api_key_id
      and k.workspace_id = app.current_workspace_id()
      and app.is_member(k.workspace_id, 'owner')
  ));
create policy api_key_scopes_delete_auth_owner on public.api_key_scopes for delete to authenticated
  using (exists (
    select 1 from public.api_keys k
    where k.id = api_key_id
      and k.workspace_id = app.current_workspace_id()
      and app.is_member(k.workspace_id, 'owner')
  ));

-- templates (member crud)
create policy templates_select_anon_deny on public.templates for select to anon using (false);
create policy templates_insert_anon_deny on public.templates for insert to anon with check (false);
create policy templates_update_anon_deny on public.templates for update to anon using (false) with check (false);
create policy templates_delete_anon_deny on public.templates for delete to anon using (false);

create policy templates_select_auth_member on public.templates for select to authenticated
  using (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'member'));
create policy templates_insert_auth_member on public.templates for insert to authenticated
  with check (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'member'));
create policy templates_update_auth_member on public.templates for update to authenticated
  using (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'member'))
  with check (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'member'));
create policy templates_delete_auth_member on public.templates for delete to authenticated
  using (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'member'));

-- template_snapshots (member crud)
create policy template_snapshots_select_anon_deny on public.template_snapshots for select to anon using (false);
create policy template_snapshots_insert_anon_deny on public.template_snapshots for insert to anon with check (false);
create policy template_snapshots_update_anon_deny on public.template_snapshots for update to anon using (false) with check (false);
create policy template_snapshots_delete_anon_deny on public.template_snapshots for delete to anon using (false);

create policy template_snapshots_select_auth_member on public.template_snapshots for select to authenticated
  using (exists (
    select 1 from public.templates t
    where t.id = template_id
      and t.workspace_id = app.current_workspace_id()
      and app.is_member(t.workspace_id, 'member')
  ));
create policy template_snapshots_insert_auth_member on public.template_snapshots for insert to authenticated
  with check (exists (
    select 1 from public.templates t
    where t.id = template_id
      and t.workspace_id = app.current_workspace_id()
      and app.is_member(t.workspace_id, 'member')
  ));
create policy template_snapshots_update_auth_member on public.template_snapshots for update to authenticated
  using (exists (
    select 1 from public.templates t
    where t.id = template_id
      and t.workspace_id = app.current_workspace_id()
      and app.is_member(t.workspace_id, 'member')
  ))
  with check (exists (
    select 1 from public.templates t
    where t.id = template_id
      and t.workspace_id = app.current_workspace_id()
      and app.is_member(t.workspace_id, 'member')
  ));
create policy template_snapshots_delete_auth_member on public.template_snapshots for delete to authenticated
  using (exists (
    select 1 from public.templates t
    where t.id = template_id
      and t.workspace_id = app.current_workspace_id()
      and app.is_member(t.workspace_id, 'member')
  ));

-- workspace_brandkit (member crud)
create policy workspace_brandkit_select_anon_deny on public.workspace_brandkit for select to anon using (false);
create policy workspace_brandkit_insert_anon_deny on public.workspace_brandkit for insert to anon with check (false);
create policy workspace_brandkit_update_anon_deny on public.workspace_brandkit for update to anon using (false) with check (false);
create policy workspace_brandkit_delete_anon_deny on public.workspace_brandkit for delete to anon using (false);

create policy workspace_brandkit_select_auth_member on public.workspace_brandkit for select to authenticated
  using (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'member'));
create policy workspace_brandkit_insert_auth_member on public.workspace_brandkit for insert to authenticated
  with check (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'member'));
create policy workspace_brandkit_update_auth_member on public.workspace_brandkit for update to authenticated
  using (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'member'))
  with check (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'member'));
create policy workspace_brandkit_delete_auth_member on public.workspace_brandkit for delete to authenticated
  using (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'member'));

-- workspace_transports (owner-only)
create policy workspace_transports_select_anon_deny on public.workspace_transports for select to anon using (false);
create policy workspace_transports_insert_anon_deny on public.workspace_transports for insert to anon with check (false);
create policy workspace_transports_update_anon_deny on public.workspace_transports for update to anon using (false) with check (false);
create policy workspace_transports_delete_anon_deny on public.workspace_transports for delete to anon using (false);

create policy workspace_transports_select_auth_owner on public.workspace_transports for select to authenticated
  using (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'owner'));
create policy workspace_transports_insert_auth_owner on public.workspace_transports for insert to authenticated
  with check (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'owner'));
create policy workspace_transports_update_auth_owner on public.workspace_transports for update to authenticated
  using (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'owner'))
  with check (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'owner'));
create policy workspace_transports_delete_auth_owner on public.workspace_transports for delete to authenticated
  using (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'owner'));

-- send_jobs (member crud)
create policy send_jobs_select_anon_deny on public.send_jobs for select to anon using (false);
create policy send_jobs_insert_anon_deny on public.send_jobs for insert to anon with check (false);
create policy send_jobs_update_anon_deny on public.send_jobs for update to anon using (false) with check (false);
create policy send_jobs_delete_anon_deny on public.send_jobs for delete to anon using (false);

create policy send_jobs_select_auth_member on public.send_jobs for select to authenticated
  using (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'member'));
create policy send_jobs_insert_auth_member on public.send_jobs for insert to authenticated
  with check (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'member'));
create policy send_jobs_update_auth_member on public.send_jobs for update to authenticated
  using (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'member'))
  with check (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'member'));
create policy send_jobs_delete_auth_member on public.send_jobs for delete to authenticated
  using (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'member'));

-- send_recipients (member crud)
create policy send_recipients_select_anon_deny on public.send_recipients for select to anon using (false);
create policy send_recipients_insert_anon_deny on public.send_recipients for insert to anon with check (false);
create policy send_recipients_update_anon_deny on public.send_recipients for update to anon using (false) with check (false);
create policy send_recipients_delete_anon_deny on public.send_recipients for delete to anon using (false);

create policy send_recipients_select_auth_member on public.send_recipients for select to authenticated
  using (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'member'));
create policy send_recipients_insert_auth_member on public.send_recipients for insert to authenticated
  with check (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'member'));
create policy send_recipients_update_auth_member on public.send_recipients for update to authenticated
  using (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'member'))
  with check (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'member'));
create policy send_recipients_delete_auth_member on public.send_recipients for delete to authenticated
  using (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'member'));

-- subscribers (member crud)
create policy subscribers_select_anon_deny on public.subscribers for select to anon using (false);
create policy subscribers_insert_anon_deny on public.subscribers for insert to anon with check (false);
create policy subscribers_update_anon_deny on public.subscribers for update to anon using (false) with check (false);
create policy subscribers_delete_anon_deny on public.subscribers for delete to anon using (false);

create policy subscribers_select_auth_member on public.subscribers for select to authenticated
  using (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'member'));
create policy subscribers_insert_auth_member on public.subscribers for insert to authenticated
  with check (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'member'));
create policy subscribers_update_auth_member on public.subscribers for update to authenticated
  using (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'member'))
  with check (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'member'));
create policy subscribers_delete_auth_member on public.subscribers for delete to authenticated
  using (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'member'));

-- subscriber_tags (member crud)
create policy subscriber_tags_select_anon_deny on public.subscriber_tags for select to anon using (false);
create policy subscriber_tags_insert_anon_deny on public.subscriber_tags for insert to anon with check (false);
create policy subscriber_tags_update_anon_deny on public.subscriber_tags for update to anon using (false) with check (false);
create policy subscriber_tags_delete_anon_deny on public.subscriber_tags for delete to anon using (false);

create policy subscriber_tags_select_auth_member on public.subscriber_tags for select to authenticated
  using (exists (
    select 1 from public.subscribers s
    where s.id = subscriber_id
      and s.workspace_id = app.current_workspace_id()
      and app.is_member(s.workspace_id, 'member')
  ));
create policy subscriber_tags_insert_auth_member on public.subscriber_tags for insert to authenticated
  with check (exists (
    select 1 from public.subscribers s
    where s.id = subscriber_id
      and s.workspace_id = app.current_workspace_id()
      and app.is_member(s.workspace_id, 'member')
  ));
create policy subscriber_tags_update_auth_member on public.subscriber_tags for update to authenticated
  using (exists (
    select 1 from public.subscribers s
    where s.id = subscriber_id
      and s.workspace_id = app.current_workspace_id()
      and app.is_member(s.workspace_id, 'member')
  ))
  with check (exists (
    select 1 from public.subscribers s
    where s.id = subscriber_id
      and s.workspace_id = app.current_workspace_id()
      and app.is_member(s.workspace_id, 'member')
  ));
create policy subscriber_tags_delete_auth_member on public.subscriber_tags for delete to authenticated
  using (exists (
    select 1 from public.subscribers s
    where s.id = subscriber_id
      and s.workspace_id = app.current_workspace_id()
      and app.is_member(s.workspace_id, 'member')
  ));

-- suppression (member crud)
create policy suppression_select_anon_deny on public.suppression for select to anon using (false);
create policy suppression_insert_anon_deny on public.suppression for insert to anon with check (false);
create policy suppression_update_anon_deny on public.suppression for update to anon using (false) with check (false);
create policy suppression_delete_anon_deny on public.suppression for delete to anon using (false);

create policy suppression_select_auth_member on public.suppression for select to authenticated
  using (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'member'));
create policy suppression_insert_auth_member on public.suppression for insert to authenticated
  with check (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'member'));
create policy suppression_update_auth_member on public.suppression for update to authenticated
  using (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'member'))
  with check (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'member'));
create policy suppression_delete_auth_member on public.suppression for delete to authenticated
  using (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'member'));

-- events (tylko odczyt dla member; zapisy realizuje backend z service_role, który omija rls)
create policy events_select_anon_deny on public.events for select to anon using (false);
create policy events_insert_anon_deny on public.events for insert to anon with check (false);
create policy events_update_anon_deny on public.events for update to anon using (false) with check (false);
create policy events_delete_anon_deny on public.events for delete to anon using (false);

create policy events_select_auth_member on public.events for select to authenticated
  using (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'member'));
create policy events_insert_auth_deny on public.events for insert to authenticated with check (false);
create policy events_update_auth_deny on public.events for update to authenticated using (false) with check (false);
create policy events_delete_auth_deny on public.events for delete to authenticated using (false);

-- workspace_plans (odczyt member, zapisy owner)
create policy workspace_plans_select_anon_deny on public.workspace_plans for select to anon using (false);
create policy workspace_plans_insert_anon_deny on public.workspace_plans for insert to anon with check (false);
create policy workspace_plans_update_anon_deny on public.workspace_plans for update to anon using (false) with check (false);
create policy workspace_plans_delete_anon_deny on public.workspace_plans for delete to anon using (false);

create policy workspace_plans_select_auth_member on public.workspace_plans for select to authenticated
  using (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'member'));
create policy workspace_plans_insert_auth_owner on public.workspace_plans for insert to authenticated
  with check (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'owner'));
create policy workspace_plans_update_auth_owner on public.workspace_plans for update to authenticated
  using (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'owner'))
  with check (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'owner'));
create policy workspace_plans_delete_auth_deny on public.workspace_plans for delete to authenticated using (false);

-- usage_counters_daily (tylko odczyt member)
create policy usage_counters_daily_select_anon_deny on public.usage_counters_daily for select to anon using (false);
create policy usage_counters_daily_insert_anon_deny on public.usage_counters_daily for insert to anon with check (false);
create policy usage_counters_daily_update_anon_deny on public.usage_counters_daily for update to anon using (false) with check (false);
create policy usage_counters_daily_delete_anon_deny on public.usage_counters_daily for delete to anon using (false);

create policy usage_counters_daily_select_auth_member on public.usage_counters_daily for select to authenticated
  using (workspace_id = app.current_workspace_id() and app.is_member(workspace_id, 'member'));
create policy usage_counters_daily_insert_auth_deny on public.usage_counters_daily for insert to authenticated with check (false);
create policy usage_counters_daily_update_auth_deny on public.usage_counters_daily for update to authenticated using (false) with check (false);
create policy usage_counters_daily_delete_auth_deny on public.usage_counters_daily for delete to authenticated using (false);

-- przypomnienie operacyjne:
-- aplikacja musi ustawiać current_setting 'app.workspace_id' na uuid bieżącego workspace'u dla każdej sesji/żądania
-- przykładowo: select set_config('app.workspace_id', '<uuid>', true);

-- ========================================
-- BUILDER STRUCTURE SUPPORT (2025-10-27)
-- ========================================

-- nowe typy enum dla builder element types
do $$ begin
  if not exists (select 1 from pg_type where typname = 'builder_element_type') then
    create type builder_element_type as enum ('layout', 'content', 'media', 'advanced');
  end if;
  if not exists (select 1 from pg_type where typname = 'builder_layout_element') then
    create type builder_layout_element as enum ('container', 'section', 'column', 'columns-2', 'columns-3', 'row');
  end if;
  if not exists (select 1 from pg_type where typname = 'builder_content_element') then
    create type builder_content_element as enum ('heading', 'paragraph', 'text', 'button', 'divider', 'spacer');
  end if;
  if not exists (select 1 from pg_type where typname = 'builder_media_element') then
    create type builder_media_element as enum ('image', 'video');
  end if;
  if not exists (select 1 from pg_type where typname = 'builder_advanced_element') then
    create type builder_advanced_element as enum ('social-links', 'unsubscribe', 'custom');
  end if;
end $$;

-- dodanie pól draft do templates
alter table public.templates
  add column if not exists builder_structure jsonb,
  add column if not exists mjml text,
  add column if not exists variables_schema jsonb,
  add column if not exists subject_lines text[],
  add column if not exists preheader text,
  add column if not exists updated_at timestamptz not null default now();

-- dodanie builder_structure do template_snapshots (dla archiwizacji)
alter table public.template_snapshots
  add column if not exists builder_structure jsonb;

-- trigger dla auto-update updated_at w templates
drop trigger if exists trg_touch_templates on public.templates;
create trigger trg_touch_templates
  before update on public.templates
  for each row
  execute function app.touch_updated_at();

-- komentarze dokumentujące nowe kolumny
comment on column public.templates.builder_structure is 'Builder structure (JSON) - primary storage format, source of truth for visual editor';
comment on column public.templates.mjml is 'MJML template - generated from builder_structure or provided directly via API';
comment on column public.templates.variables_schema is 'JSON Schema for template variables (draft)';
comment on column public.templates.subject_lines is 'Array of subject line suggestions (draft)';
comment on column public.templates.preheader is 'Email preheader text (draft)';
comment on column public.templates.updated_at is 'Timestamp of last draft modification';

comment on column public.template_snapshots.builder_structure is 'Archived builder structure from publish time - allows rollback and re-editing';

-- indeks GIN na builder_structure dla szybkiego wyszukiwania
create index if not exists templates_builder_structure_gin
  on public.templates using gin (builder_structure);

create index if not exists template_snapshots_builder_structure_gin
  on public.template_snapshots using gin (builder_structure);


