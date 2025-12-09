# Stack techniczny – Requil (Aktualny Stan)

## Architektura

- Backend: monolit Fastify (Node 22+, TypeScript) – API, render React Email+Liquid, wysyłka (Resend/SMTP), webhooki HMAC. Endpointy workerowe i QStash – **planowane**. Osobny serwis worker – po MVP.
- Frontend (zaimplementowany):
  - Dashboard: Next.js 16 App Router, React 19, Tailwind 4, shadcn/ui, lucide-react
  - Website: **planowany** (Astro lub Next.js SSG)
- Dane: Supabase (Postgres/Auth/Storage + RLS), Drizzle ORM
- Infrastruktura: Upstash Redis (rate‑limit, idempotencja, webhooks) ✓, Upstash QStash **planowany**

## Pakiety (Turborepo) - Stan Implementacji

- apps/
  - dashboard/ ✓ (Next.js 16, React 19, Tailwind 4)
  - website/ ⏳ (planowany – Astro)
  - api/ ✓ (Fastify – monolit HTTP)
- services/
  - worker/ ⏳ (po MVP)
- packages/
  - email-engine/ ✓ – React Email+Liquid, plaintext (html-to-text), guardrails (cheerio)
  - transports/ ✓ – Resend SDK, Nodemailer/SMTP
  - validation/ ✓ – AJV + Zod, reguły jakości
  - webhooks/ ✓ – HMAC sign/verify, Upstash Redis
  - ratelimit/ ✓ – Upstash Redis: token bucket + idempotencja
  - db/ ✓ – Drizzle ORM + migracje
  - types/ ✓ – typy wspólne (bez generacji z OpenAPI na razie)
  - ui/ ✓ – shadcn/ui komponenty (button, card, code)
  - utils/ ✓ – logger (pino), crypto, errors, helpers
  - config/ ✓ – tsconfig, vitest, env schemas (Zod)

## Backend - Zaimplementowane

- Node 22+, TypeScript 5.9+, pnpm 10.6+, Fastify 5 ✓
- Drizzle ORM + drizzle-kit ✓; Supabase (Postgres/Auth/Storage + RLS) ✓
- Upstash Redis ✓ (rate-limit per workspace, idempotencja, webhooks)
  - Cache MJML/HTML/brandKit/schema **planowane**
  - Liczniki kampanii **planowane**
- Upstash QStash ⏳ (exponential backoff, fan-out, cron/at) – **planowany**
- Render/templating ✓:
  - React Email (@react-email/components + render) zamiast MJML
  - liquidjs (templating per recipient)
  - html-to-text (automatyczny plaintext)
  - cheerio (analiza HTML w guardrails)
- Guardrails ✓: ajv + zod, cheerio (HTML), HTTPS enforcement
  - wcag-contrast/color ⏳ (kontrast) – **planowany**
- Transporty ✓: resend SDK, nodemailer (SMTP BYOK)
- DI/CQRS: Awilix (@fastify/awilix), Command/Query Bus
- Pluginy Fastify: cors, helmet, cookie, multipart, swagger + swagger-ui, sensible, under-pressure

## Bezpieczeństwo

- API Keys: hash argon2id, scope’y; RLS (owner/member).
- SMTP creds: szyfrowanie z KMS (AES‑256‑GCM envelope). Alternatywnie libsodium/XChaCha20‑Poly1305.
- Webhooki: HMAC (timestamp + nonce, odporność na powtórki), retry przez QStash.
- Idempotencja: nagłówek Idempotency‑Key → lock:send:{key} (TTL) + hash(ciała) + result:send:{key} (utrwalenie wyniku, statusy per‑recipient). Różne body z tym samym kluczem → 409; retencja wyników konfigurowalna.

## Frontend - Zaimplementowane

- Dashboard ✓:
  - Next.js 16 (App Router), React 19
  - Tailwind 4 (@tailwindcss/postcss)
  - shadcn/ui (Radix UI primitives)
  - lucide-react (ikony)
  - react-hook-form + zod (formularze)
  - zustand (state management)
  - rxjs (reactive patterns)
  - next-intl (i18n: PL/EN)
  - next-themes (dark mode)
  - @dnd-kit (drag & drop w edytorze)
  - sonner (toast notifications)
  - **Brak**: tanstack/query, supabase-js client-side (auth przez API), GrapesJS
  - **Własny edytor**: drag-and-drop z React Email komponentami zamiast GrapesJS
- Website ⏳: **planowany** (Astro + MDX)

## AI - Planowane

- ⏳ Vercel AI SDK lub OpenAI/Anthropic przez wrapper
- ⏳ Structured JSON: React Email TSX, variablesSchema, subjectLines[], preheader, notes[], safety.flags[]
- ⏳ Walidacja AJV + lokalne guardrails
- Status: **nie zaimplementowane w MVP**

## Moduły API - Zaimplementowane

- Auth ✓:
  - Register, Login, Logout
  - OAuth (Gmail, Github)
  - Forgot Password, Reset Password
  - Refresh Token, Get Session
- Workspace ✓:
  - Create Workspace
  - Find User Workspaces
- Templates ✓:
  - Create Template, Update Template
  - Get Template, Find Workspace Templates
- Assets ✓:
  - Upload Asset (multipart)
  - Delete Asset
  - Find Assets
- API Keys ✓:
  - Create API Key
  - Revoke API Key
  - List API Keys
- Accounts ✓:
  - Get Account (plan limits)
- Billing ⏳:
  - Update Plan (w trakcie)
- **Brakuje**: /v1/send, /v1/templates/:id/validate, /v1/usage, AI Generate

## Features Dashboard - Zaimplementowane

- Auth ✓:
  - Login, Register (credentials + OAuth)
  - Forgot Password, Reset Password
  - Auth Layout, Auth Providers
- Workspace ✓:
  - Workspace Management
  - Workspace Layout, Workspace Provider
- Editor ✓:
  - Drag & Drop (dnd-kit)
  - 55+ komponentów edytora
  - Registry (11 bloków React Email)
  - Templates, Contexts, Hooks
  - Editor Layout (5 komponentów)
- Templates ✓:
  - Templates Components
  - Templates Store
- Navigation ✓:
  - Navigation Components, Hooks
- Welcome Flow ✓:
  - Welcome Components, Stores
- UI Components ✓: 22 komponenty shadcn/ui
- i18n ✓: PL/EN (next-intl)
- **Brakuje**: AI Generate UI, kampanie, newsletter demo

## CI/CD i jakość - Zaimplementowane

- Jakość kodu ✓:
  - BiomeJS 2.2+ (lint + format w całym repo)
  - TypeScript 5.9+ (strict mode, tsc --noEmit)
  - Vitest (unit + integration tests z coverage)
  - Playwright (E2E tests dla dashboard)
  - Turbo 2.6+ (monorepo tasks z cache)
- Git hooks ✓:
  - Lefthook 1.13+ (pre-commit, pre-push)
  - Commitlint (Conventional Commits)
- CI ⏳: GitHub Actions **planowane**:
  - biome ci, tsc --noEmit, vitest, playwright
  - turbo run build, drizzle-kit migrate
  - Docker build/push
- Hosting ✓:
  - API: Railway (deployed)
  - Dashboard: Vercel (deployed)
  - Website: **planowane** (Astro na Vercel/Cloudflare Pages)
- Sekrety ⏳: **planowane** (Doppler/Infisical)
- Deploy ✓: manualne (Railway + Vercel)
  - Auto-deploy z git ⏳ **do skonfigurowania**
- Obserwowalność ✓:
  - pino (JSON logging z traceId)
  - Sentry ⏳ **planowane**
  - OpenTelemetry ⏳ po MVP

## Priorytety MVP - Do Zaimplementowania

### Critical (Blokujące MVP)

1. **Email Sending Engine**:
   - POST /v1/send (walidacja → render per recipient → transport)
   - Idempotencja (Idempotency-Key, Redis locks)
   - QStash retry z exponential backoff
   - Suppression list (hard bounce/complaint)

2. **Template Validation**:
   - POST /v1/templates/:stableId/validate (pre-check)
   - Guardrails: WCAG contrast, alt-text 100%, HTTPS enforcement
   - HTML size limit < 150 kB

3. **Publishing System**:
   - Publikacja immutable snapshot
   - used_template_snapshot_id w response /v1/send

4. **AI Generate** (optional dla MVP):
   - Vercel AI SDK / OpenAI / Anthropic
   - Prompt + brandKit → React Email TSX
   - variablesSchema, subjectLines[], preheader

### High Priority

1. **Redis Cache**:
   - Cache skompilowanego HTML (React Email)
   - Cache brandKit, variablesSchema
   - Liczniki kampanii

2. **Usage & Billing**:
   - GET /v1/usage (renders/sends/AI, limity planu)
   - Alert 80% zużycia
   - Hard stop przy przekroczeniu (402/429)

3. **Webhooks**:
   - Events: delivered, bounced, clicked
   - HMAC signatures
   - Retry przez QStash

### Nice to Have (Post-MVP)

1. **Website** (Astro/Next.js SSG)
2. **Newsletter Demo** (double opt-in, campaigns)
3. **Advanced Analytics** (open tracking, dashboards)
4. **GitHub Actions CI/CD** (auto-deploy z git)
5. **Secrets Management** (Doppler/Infisical)

## Legenda

- ✓ = Zaimplementowane
- ⏳ = W trakcie / planowane
- **Brak** = Nie rozpoczęte
