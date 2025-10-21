-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."api_scope" AS ENUM('send', 'templates:read', 'templates:write', 'subscribers:read', 'subscribers:write', 'keys:manage', 'transports:manage', 'usage:read', 'webhooks:manage');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('sent', 'delivered', 'bounced');--> statement-breakpoint
CREATE TYPE "public"."plan" AS ENUM('starter', 'pro');--> statement-breakpoint
CREATE TYPE "public"."recipient_status" AS ENUM('pending', 'sent', 'delivered', 'bounced', 'failed', 'suppressed');--> statement-breakpoint
CREATE TYPE "public"."send_job_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."subscriber_status" AS ENUM('pending', 'active', 'unsubscribed', 'bounced', 'complaint');--> statement-breakpoint
CREATE TYPE "public"."suppression_reason" AS ENUM('unsubscribed', 'hard_bounce', 'complaint', 'manual');--> statement-breakpoint
CREATE TYPE "public"."transport_state" AS ENUM('active', 'inactive', 'unverified');--> statement-breakpoint
CREATE TYPE "public"."transport_type" AS ENUM('resend', 'smtp');--> statement-breakpoint
CREATE TYPE "public"."workspace_role" AS ENUM('owner', 'member');--> statement-breakpoint
CREATE TABLE "subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"email" "citext" NOT NULL,
	"status" "subscriber_status" NOT NULL,
	"attributes" jsonb,
	"confirmed_at" timestamp with time zone,
	"token_hash" "bytea",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscribers_workspace_email_unique" UNIQUE("workspace_id","email")
);
--> statement-breakpoint
ALTER TABLE "subscribers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "workspace_plans" (
	"workspace_id" uuid PRIMARY KEY NOT NULL,
	"plan" "plan" NOT NULL,
	"limits" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workspace_plans" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "workspaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workspaces" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "workspace_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"invitee_email" "citext" NOT NULL,
	"role" "workspace_role" DEFAULT 'member' NOT NULL,
	"inviter_id" uuid NOT NULL,
	"token_hash" "bytea" NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_by" uuid,
	"accepted_at" timestamp with time zone,
	"canceled_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "workspace_invitations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"key_prefix" text NOT NULL,
	"key_hash" text NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	CONSTRAINT "api_keys_key_prefix_key" UNIQUE("key_prefix")
);
--> statement-breakpoint
ALTER TABLE "api_keys" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"stable_id" "citext" NOT NULL,
	"name" text,
	"current_snapshot_id" uuid,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "templates_workspace_stable_unique" UNIQUE("workspace_id","stable_id")
);
--> statement-breakpoint
ALTER TABLE "templates" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "template_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"published_at" timestamp with time zone,
	"mjml" text NOT NULL,
	"html" text NOT NULL,
	"plaintext" text,
	"variables_schema" jsonb NOT NULL,
	"subject_lines" text[] NOT NULL,
	"preheader" text,
	"notes" jsonb,
	"safety_flags" jsonb,
	"size_bytes" integer NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "template_snapshots_version_unique" UNIQUE("template_id","version"),
	CONSTRAINT "template_snapshots_size_bytes_check" CHECK (size_bytes < 150000)
);
--> statement-breakpoint
ALTER TABLE "template_snapshots" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "workspace_brandkit" (
	"workspace_id" uuid PRIMARY KEY NOT NULL,
	"data" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workspace_brandkit" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "workspace_transports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"type" "transport_type" NOT NULL,
	"state" "transport_state" DEFAULT 'unverified' NOT NULL,
	"from_domain" text,
	"from_email" "citext",
	"smtp_host" text,
	"smtp_port" smallint,
	"smtp_secure" boolean,
	"smtp_user" text,
	"secret_encrypted" "bytea" NOT NULL,
	"enc_key_id" text,
	"nonce" "bytea",
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workspace_transports_workspace_id_key" UNIQUE("workspace_id"),
	CONSTRAINT "workspace_transports_smtp_port_check" CHECK ((smtp_port IS NULL) OR ((smtp_port >= 1) AND (smtp_port <= 65535)))
);
--> statement-breakpoint
ALTER TABLE "workspace_transports" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "send_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"template_snapshot_id" uuid NOT NULL,
	"transport" "transport_type" NOT NULL,
	"status" "send_job_status" DEFAULT 'pending' NOT NULL,
	"idempotency_key_hash" "bytea" NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "send_jobs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "send_recipients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"workspace_id" uuid NOT NULL,
	"email" "citext" NOT NULL,
	"variables" jsonb,
	"variables_hmac" "bytea",
	"status" "recipient_status" DEFAULT 'pending' NOT NULL,
	"suppressed_reason" "suppression_reason",
	"error_code" text,
	"transport_message_id" text,
	"attempts" smallint DEFAULT 0 NOT NULL,
	"first_sent_at" timestamp with time zone,
	"last_attempt_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "send_recipients" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "subscriber_tags" (
	"subscriber_id" uuid NOT NULL,
	"tag" text NOT NULL,
	CONSTRAINT "subscriber_tags_pkey" PRIMARY KEY("subscriber_id","tag")
);
--> statement-breakpoint
ALTER TABLE "subscriber_tags" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "api_key_scopes" (
	"api_key_id" uuid NOT NULL,
	"scope" "api_scope" NOT NULL,
	CONSTRAINT "api_key_scopes_pkey" PRIMARY KEY("api_key_id","scope")
);
--> statement-breakpoint
ALTER TABLE "api_key_scopes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "suppression" (
	"workspace_id" uuid NOT NULL,
	"email" "citext" NOT NULL,
	"reason" "suppression_reason" NOT NULL,
	"source_event_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "suppression_pkey" PRIMARY KEY("workspace_id","email")
);
--> statement-breakpoint
ALTER TABLE "suppression" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "workspace_members" (
	"workspace_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "workspace_role" NOT NULL,
	"invited_at" timestamp with time zone DEFAULT now() NOT NULL,
	"accepted_at" timestamp with time zone,
	CONSTRAINT "workspace_members_pkey" PRIMARY KEY("workspace_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "workspace_members" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "usage_counters_daily" (
	"workspace_id" uuid NOT NULL,
	"day" date NOT NULL,
	"renders" integer DEFAULT 0 NOT NULL,
	"sends" integer DEFAULT 0 NOT NULL,
	"ai" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "usage_counters_daily_pkey" PRIMARY KEY("workspace_id","day")
);
--> statement-breakpoint
ALTER TABLE "usage_counters_daily" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "events_202510" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"type" "event_type" NOT NULL,
	"job_id" uuid,
	"recipient_email" "citext" NOT NULL,
	"transport" "transport_type" NOT NULL,
	"template_snapshot_id" uuid,
	"external_id" text,
	"occurred_at" timestamp with time zone NOT NULL,
	CONSTRAINT "events_202510_pkey" PRIMARY KEY("id","occurred_at")
);
--> statement-breakpoint
ALTER TABLE "events_202510" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "events_202511" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"type" "event_type" NOT NULL,
	"job_id" uuid,
	"recipient_email" "citext" NOT NULL,
	"transport" "transport_type" NOT NULL,
	"template_snapshot_id" uuid,
	"external_id" text,
	"occurred_at" timestamp with time zone NOT NULL,
	CONSTRAINT "events_202511_pkey" PRIMARY KEY("id","occurred_at")
);
--> statement-breakpoint
ALTER TABLE "events_202511" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "events_202512" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"type" "event_type" NOT NULL,
	"job_id" uuid,
	"recipient_email" "citext" NOT NULL,
	"transport" "transport_type" NOT NULL,
	"template_snapshot_id" uuid,
	"external_id" text,
	"occurred_at" timestamp with time zone NOT NULL,
	CONSTRAINT "events_202512_pkey" PRIMARY KEY("id","occurred_at")
);
--> statement-breakpoint
ALTER TABLE "events_202512" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "subscribers" ADD CONSTRAINT "subscribers_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_plans" ADD CONSTRAINT "workspace_plans_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_invitations" ADD CONSTRAINT "workspace_invitations_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "templates_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "templates_current_snapshot_fk" FOREIGN KEY ("current_snapshot_id") REFERENCES "public"."template_snapshots"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_snapshots" ADD CONSTRAINT "template_snapshots_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_brandkit" ADD CONSTRAINT "workspace_brandkit_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_transports" ADD CONSTRAINT "workspace_transports_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "send_jobs" ADD CONSTRAINT "send_jobs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "send_jobs" ADD CONSTRAINT "send_jobs_template_snapshot_id_fkey" FOREIGN KEY ("template_snapshot_id") REFERENCES "public"."template_snapshots"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "send_recipients" ADD CONSTRAINT "send_recipients_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."send_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "send_recipients" ADD CONSTRAINT "send_recipients_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriber_tags" ADD CONSTRAINT "subscriber_tags_subscriber_id_fkey" FOREIGN KEY ("subscriber_id") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_key_scopes" ADD CONSTRAINT "api_key_scopes_api_key_id_fkey" FOREIGN KEY ("api_key_id") REFERENCES "public"."api_keys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suppression" ADD CONSTRAINT "suppression_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_counters_daily" ADD CONSTRAINT "usage_counters_daily_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events_202510" ADD CONSTRAINT "events_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events_202510" ADD CONSTRAINT "events_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."send_jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events_202510" ADD CONSTRAINT "events_template_snapshot_id_fkey" FOREIGN KEY ("template_snapshot_id") REFERENCES "public"."template_snapshots"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events_202511" ADD CONSTRAINT "events_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."send_jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events_202511" ADD CONSTRAINT "events_template_snapshot_id_fkey" FOREIGN KEY ("template_snapshot_id") REFERENCES "public"."template_snapshots"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events_202511" ADD CONSTRAINT "events_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events_202512" ADD CONSTRAINT "events_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."send_jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events_202512" ADD CONSTRAINT "events_template_snapshot_id_fkey" FOREIGN KEY ("template_snapshot_id") REFERENCES "public"."template_snapshots"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events_202512" ADD CONSTRAINT "events_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "subscribers_attributes_gin" ON "subscribers" USING gin ("attributes" jsonb_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_invitations_open_unique" ON "workspace_invitations" USING btree ("workspace_id" uuid_ops,"invitee_email" uuid_ops) WHERE ((accepted_at IS NULL) AND (canceled_at IS NULL));--> statement-breakpoint
CREATE INDEX "api_keys_workspace_id_idx" ON "api_keys" USING btree ("workspace_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "template_snapshots_template_id_published_idx" ON "template_snapshots" USING btree ("template_id" timestamptz_ops,"published_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "template_snapshots_variables_schema_gin" ON "template_snapshots" USING gin ("variables_schema" jsonb_ops);--> statement-breakpoint
CREATE INDEX "workspace_transports_workspace_state_idx" ON "workspace_transports" USING btree ("workspace_id" uuid_ops,"state" uuid_ops);--> statement-breakpoint
CREATE INDEX "send_jobs_workspace_created_idx" ON "send_jobs" USING btree ("workspace_id" timestamptz_ops,"created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "send_jobs_workspace_idem_idx" ON "send_jobs" USING btree ("workspace_id" bytea_ops,"idempotency_key_hash" bytea_ops);--> statement-breakpoint
CREATE INDEX "send_recipients_job_status_idx" ON "send_recipients" USING btree ("job_id" uuid_ops,"status" enum_ops);--> statement-breakpoint
CREATE INDEX "send_recipients_workspace_email_idx" ON "send_recipients" USING btree ("workspace_id" uuid_ops,"email" uuid_ops);--> statement-breakpoint
CREATE INDEX "api_key_scopes_scope_idx" ON "api_key_scopes" USING btree ("scope" enum_ops);--> statement-breakpoint
CREATE INDEX "usage_counters_daily_workspace_day_desc_idx" ON "usage_counters_daily" USING btree ("workspace_id" date_ops,"day" date_ops);--> statement-breakpoint
CREATE INDEX "events_202510_job_id_idx" ON "events_202510" USING btree ("job_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "events_202510_recipient_email_idx" ON "events_202510" USING btree ("recipient_email" citext_ops);--> statement-breakpoint
CREATE INDEX "events_202510_workspace_id_occurred_at_idx" ON "events_202510" USING btree ("workspace_id" uuid_ops,"occurred_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "events_202511_job_id_idx" ON "events_202511" USING btree ("job_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "events_202511_recipient_email_idx" ON "events_202511" USING btree ("recipient_email" citext_ops);--> statement-breakpoint
CREATE INDEX "events_202511_workspace_id_occurred_at_idx" ON "events_202511" USING btree ("workspace_id" uuid_ops,"occurred_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "events_202512_job_id_idx" ON "events_202512" USING btree ("job_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "events_202512_recipient_email_idx" ON "events_202512" USING btree ("recipient_email" citext_ops);--> statement-breakpoint
CREATE INDEX "events_202512_workspace_id_occurred_at_idx" ON "events_202512" USING btree ("workspace_id" uuid_ops,"occurred_at" timestamptz_ops);--> statement-breakpoint
CREATE POLICY "subscribers_select_anon_deny" ON "subscribers" AS PERMISSIVE FOR SELECT TO "anon" USING (false);--> statement-breakpoint
CREATE POLICY "subscribers_insert_anon_deny" ON "subscribers" AS PERMISSIVE FOR INSERT TO "anon";--> statement-breakpoint
CREATE POLICY "subscribers_update_anon_deny" ON "subscribers" AS PERMISSIVE FOR UPDATE TO "anon";--> statement-breakpoint
CREATE POLICY "subscribers_delete_anon_deny" ON "subscribers" AS PERMISSIVE FOR DELETE TO "anon";--> statement-breakpoint
CREATE POLICY "subscribers_select_auth_member" ON "subscribers" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "subscribers_insert_auth_member" ON "subscribers" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "subscribers_update_auth_member" ON "subscribers" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "subscribers_delete_auth_member" ON "subscribers" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "workspace_plans_select_anon_deny" ON "workspace_plans" AS PERMISSIVE FOR SELECT TO "anon" USING (false);--> statement-breakpoint
CREATE POLICY "workspace_plans_insert_anon_deny" ON "workspace_plans" AS PERMISSIVE FOR INSERT TO "anon";--> statement-breakpoint
CREATE POLICY "workspace_plans_update_anon_deny" ON "workspace_plans" AS PERMISSIVE FOR UPDATE TO "anon";--> statement-breakpoint
CREATE POLICY "workspace_plans_delete_anon_deny" ON "workspace_plans" AS PERMISSIVE FOR DELETE TO "anon";--> statement-breakpoint
CREATE POLICY "workspace_plans_select_auth_member" ON "workspace_plans" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "workspace_plans_insert_auth_owner" ON "workspace_plans" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "workspace_plans_update_auth_owner" ON "workspace_plans" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "workspace_plans_delete_auth_deny" ON "workspace_plans" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "workspaces_select_anon_deny" ON "workspaces" AS PERMISSIVE FOR SELECT TO "anon" USING (false);--> statement-breakpoint
CREATE POLICY "workspaces_insert_anon_deny" ON "workspaces" AS PERMISSIVE FOR INSERT TO "anon";--> statement-breakpoint
CREATE POLICY "workspaces_update_anon_deny" ON "workspaces" AS PERMISSIVE FOR UPDATE TO "anon";--> statement-breakpoint
CREATE POLICY "workspaces_delete_anon_deny" ON "workspaces" AS PERMISSIVE FOR DELETE TO "anon";--> statement-breakpoint
CREATE POLICY "workspaces_select_auth_member" ON "workspaces" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "workspaces_insert_auth_deny" ON "workspaces" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "workspaces_update_auth_owner" ON "workspaces" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "workspaces_delete_auth_deny" ON "workspaces" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "workspace_invitations_select_anon_deny" ON "workspace_invitations" AS PERMISSIVE FOR SELECT TO "anon" USING (false);--> statement-breakpoint
CREATE POLICY "workspace_invitations_insert_anon_deny" ON "workspace_invitations" AS PERMISSIVE FOR INSERT TO "anon";--> statement-breakpoint
CREATE POLICY "workspace_invitations_update_anon_deny" ON "workspace_invitations" AS PERMISSIVE FOR UPDATE TO "anon";--> statement-breakpoint
CREATE POLICY "workspace_invitations_delete_anon_deny" ON "workspace_invitations" AS PERMISSIVE FOR DELETE TO "anon";--> statement-breakpoint
CREATE POLICY "workspace_invitations_select_auth_owner" ON "workspace_invitations" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "workspace_invitations_insert_auth_owner" ON "workspace_invitations" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "workspace_invitations_update_auth_owner" ON "workspace_invitations" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "workspace_invitations_delete_auth_owner" ON "workspace_invitations" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "api_keys_select_anon_deny" ON "api_keys" AS PERMISSIVE FOR SELECT TO "anon" USING (false);--> statement-breakpoint
CREATE POLICY "api_keys_insert_anon_deny" ON "api_keys" AS PERMISSIVE FOR INSERT TO "anon";--> statement-breakpoint
CREATE POLICY "api_keys_update_anon_deny" ON "api_keys" AS PERMISSIVE FOR UPDATE TO "anon";--> statement-breakpoint
CREATE POLICY "api_keys_delete_anon_deny" ON "api_keys" AS PERMISSIVE FOR DELETE TO "anon";--> statement-breakpoint
CREATE POLICY "api_keys_select_auth_owner" ON "api_keys" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "api_keys_insert_auth_owner" ON "api_keys" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "api_keys_update_auth_owner" ON "api_keys" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "api_keys_delete_auth_owner" ON "api_keys" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "templates_select_anon_deny" ON "templates" AS PERMISSIVE FOR SELECT TO "anon" USING (false);--> statement-breakpoint
CREATE POLICY "templates_insert_anon_deny" ON "templates" AS PERMISSIVE FOR INSERT TO "anon";--> statement-breakpoint
CREATE POLICY "templates_update_anon_deny" ON "templates" AS PERMISSIVE FOR UPDATE TO "anon";--> statement-breakpoint
CREATE POLICY "templates_delete_anon_deny" ON "templates" AS PERMISSIVE FOR DELETE TO "anon";--> statement-breakpoint
CREATE POLICY "templates_select_auth_member" ON "templates" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "templates_insert_auth_member" ON "templates" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "templates_update_auth_member" ON "templates" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "templates_delete_auth_member" ON "templates" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "template_snapshots_select_anon_deny" ON "template_snapshots" AS PERMISSIVE FOR SELECT TO "anon" USING (false);--> statement-breakpoint
CREATE POLICY "template_snapshots_insert_anon_deny" ON "template_snapshots" AS PERMISSIVE FOR INSERT TO "anon";--> statement-breakpoint
CREATE POLICY "template_snapshots_update_anon_deny" ON "template_snapshots" AS PERMISSIVE FOR UPDATE TO "anon";--> statement-breakpoint
CREATE POLICY "template_snapshots_delete_anon_deny" ON "template_snapshots" AS PERMISSIVE FOR DELETE TO "anon";--> statement-breakpoint
CREATE POLICY "template_snapshots_select_auth_member" ON "template_snapshots" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "template_snapshots_insert_auth_member" ON "template_snapshots" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "template_snapshots_update_auth_member" ON "template_snapshots" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "template_snapshots_delete_auth_member" ON "template_snapshots" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "workspace_brandkit_select_anon_deny" ON "workspace_brandkit" AS PERMISSIVE FOR SELECT TO "anon" USING (false);--> statement-breakpoint
CREATE POLICY "workspace_brandkit_insert_anon_deny" ON "workspace_brandkit" AS PERMISSIVE FOR INSERT TO "anon";--> statement-breakpoint
CREATE POLICY "workspace_brandkit_update_anon_deny" ON "workspace_brandkit" AS PERMISSIVE FOR UPDATE TO "anon";--> statement-breakpoint
CREATE POLICY "workspace_brandkit_delete_anon_deny" ON "workspace_brandkit" AS PERMISSIVE FOR DELETE TO "anon";--> statement-breakpoint
CREATE POLICY "workspace_brandkit_select_auth_member" ON "workspace_brandkit" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "workspace_brandkit_insert_auth_member" ON "workspace_brandkit" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "workspace_brandkit_update_auth_member" ON "workspace_brandkit" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "workspace_brandkit_delete_auth_member" ON "workspace_brandkit" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "workspace_transports_select_anon_deny" ON "workspace_transports" AS PERMISSIVE FOR SELECT TO "anon" USING (false);--> statement-breakpoint
CREATE POLICY "workspace_transports_insert_anon_deny" ON "workspace_transports" AS PERMISSIVE FOR INSERT TO "anon";--> statement-breakpoint
CREATE POLICY "workspace_transports_update_anon_deny" ON "workspace_transports" AS PERMISSIVE FOR UPDATE TO "anon";--> statement-breakpoint
CREATE POLICY "workspace_transports_delete_anon_deny" ON "workspace_transports" AS PERMISSIVE FOR DELETE TO "anon";--> statement-breakpoint
CREATE POLICY "workspace_transports_select_auth_owner" ON "workspace_transports" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "workspace_transports_insert_auth_owner" ON "workspace_transports" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "workspace_transports_update_auth_owner" ON "workspace_transports" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "workspace_transports_delete_auth_owner" ON "workspace_transports" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "send_jobs_select_anon_deny" ON "send_jobs" AS PERMISSIVE FOR SELECT TO "anon" USING (false);--> statement-breakpoint
CREATE POLICY "send_jobs_insert_anon_deny" ON "send_jobs" AS PERMISSIVE FOR INSERT TO "anon";--> statement-breakpoint
CREATE POLICY "send_jobs_update_anon_deny" ON "send_jobs" AS PERMISSIVE FOR UPDATE TO "anon";--> statement-breakpoint
CREATE POLICY "send_jobs_delete_anon_deny" ON "send_jobs" AS PERMISSIVE FOR DELETE TO "anon";--> statement-breakpoint
CREATE POLICY "send_jobs_select_auth_member" ON "send_jobs" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "send_jobs_insert_auth_member" ON "send_jobs" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "send_jobs_update_auth_member" ON "send_jobs" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "send_jobs_delete_auth_member" ON "send_jobs" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "send_recipients_select_anon_deny" ON "send_recipients" AS PERMISSIVE FOR SELECT TO "anon" USING (false);--> statement-breakpoint
CREATE POLICY "send_recipients_insert_anon_deny" ON "send_recipients" AS PERMISSIVE FOR INSERT TO "anon";--> statement-breakpoint
CREATE POLICY "send_recipients_update_anon_deny" ON "send_recipients" AS PERMISSIVE FOR UPDATE TO "anon";--> statement-breakpoint
CREATE POLICY "send_recipients_delete_anon_deny" ON "send_recipients" AS PERMISSIVE FOR DELETE TO "anon";--> statement-breakpoint
CREATE POLICY "send_recipients_select_auth_member" ON "send_recipients" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "send_recipients_insert_auth_member" ON "send_recipients" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "send_recipients_update_auth_member" ON "send_recipients" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "send_recipients_delete_auth_member" ON "send_recipients" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "subscriber_tags_update_auth_member" ON "subscriber_tags" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM subscribers s
  WHERE ((s.id = subscriber_tags.subscriber_id) AND (s.workspace_id = app.current_workspace_id()) AND app.is_member(s.workspace_id, 'member'::workspace_role))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM subscribers s
  WHERE ((s.id = subscriber_tags.subscriber_id) AND (s.workspace_id = app.current_workspace_id()) AND app.is_member(s.workspace_id, 'member'::workspace_role)))));--> statement-breakpoint
CREATE POLICY "subscriber_tags_delete_auth_member" ON "subscriber_tags" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "subscriber_tags_select_anon_deny" ON "subscriber_tags" AS PERMISSIVE FOR SELECT TO "anon";--> statement-breakpoint
CREATE POLICY "subscriber_tags_insert_anon_deny" ON "subscriber_tags" AS PERMISSIVE FOR INSERT TO "anon";--> statement-breakpoint
CREATE POLICY "subscriber_tags_update_anon_deny" ON "subscriber_tags" AS PERMISSIVE FOR UPDATE TO "anon";--> statement-breakpoint
CREATE POLICY "subscriber_tags_delete_anon_deny" ON "subscriber_tags" AS PERMISSIVE FOR DELETE TO "anon";--> statement-breakpoint
CREATE POLICY "subscriber_tags_select_auth_member" ON "subscriber_tags" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "subscriber_tags_insert_auth_member" ON "subscriber_tags" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "api_key_scopes_select_anon_deny" ON "api_key_scopes" AS PERMISSIVE FOR SELECT TO "anon" USING (false);--> statement-breakpoint
CREATE POLICY "api_key_scopes_insert_anon_deny" ON "api_key_scopes" AS PERMISSIVE FOR INSERT TO "anon";--> statement-breakpoint
CREATE POLICY "api_key_scopes_update_anon_deny" ON "api_key_scopes" AS PERMISSIVE FOR UPDATE TO "anon";--> statement-breakpoint
CREATE POLICY "api_key_scopes_delete_anon_deny" ON "api_key_scopes" AS PERMISSIVE FOR DELETE TO "anon";--> statement-breakpoint
CREATE POLICY "api_key_scopes_select_auth_owner" ON "api_key_scopes" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "api_key_scopes_insert_auth_owner" ON "api_key_scopes" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "api_key_scopes_update_auth_owner" ON "api_key_scopes" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "api_key_scopes_delete_auth_owner" ON "api_key_scopes" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "suppression_select_anon_deny" ON "suppression" AS PERMISSIVE FOR SELECT TO "anon" USING (false);--> statement-breakpoint
CREATE POLICY "suppression_insert_anon_deny" ON "suppression" AS PERMISSIVE FOR INSERT TO "anon";--> statement-breakpoint
CREATE POLICY "suppression_update_anon_deny" ON "suppression" AS PERMISSIVE FOR UPDATE TO "anon";--> statement-breakpoint
CREATE POLICY "suppression_delete_anon_deny" ON "suppression" AS PERMISSIVE FOR DELETE TO "anon";--> statement-breakpoint
CREATE POLICY "suppression_select_auth_member" ON "suppression" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "suppression_insert_auth_member" ON "suppression" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "suppression_update_auth_member" ON "suppression" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "suppression_delete_auth_member" ON "suppression" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "workspace_members_select_anon_deny" ON "workspace_members" AS PERMISSIVE FOR SELECT TO "anon" USING (false);--> statement-breakpoint
CREATE POLICY "workspace_members_insert_anon_deny" ON "workspace_members" AS PERMISSIVE FOR INSERT TO "anon";--> statement-breakpoint
CREATE POLICY "workspace_members_update_anon_deny" ON "workspace_members" AS PERMISSIVE FOR UPDATE TO "anon";--> statement-breakpoint
CREATE POLICY "workspace_members_delete_anon_deny" ON "workspace_members" AS PERMISSIVE FOR DELETE TO "anon";--> statement-breakpoint
CREATE POLICY "workspace_members_select_auth_member" ON "workspace_members" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "workspace_members_insert_auth_deny" ON "workspace_members" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "workspace_members_update_auth_deny" ON "workspace_members" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "workspace_members_delete_auth_deny" ON "workspace_members" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "usage_counters_daily_select_anon_deny" ON "usage_counters_daily" AS PERMISSIVE FOR SELECT TO "anon" USING (false);--> statement-breakpoint
CREATE POLICY "usage_counters_daily_insert_anon_deny" ON "usage_counters_daily" AS PERMISSIVE FOR INSERT TO "anon";--> statement-breakpoint
CREATE POLICY "usage_counters_daily_update_anon_deny" ON "usage_counters_daily" AS PERMISSIVE FOR UPDATE TO "anon";--> statement-breakpoint
CREATE POLICY "usage_counters_daily_delete_anon_deny" ON "usage_counters_daily" AS PERMISSIVE FOR DELETE TO "anon";--> statement-breakpoint
CREATE POLICY "usage_counters_daily_select_auth_member" ON "usage_counters_daily" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "usage_counters_daily_insert_auth_deny" ON "usage_counters_daily" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "usage_counters_daily_update_auth_deny" ON "usage_counters_daily" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "usage_counters_daily_delete_auth_deny" ON "usage_counters_daily" AS PERMISSIVE FOR DELETE TO "authenticated";
*/