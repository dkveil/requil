# Stack techniczny – ReLetrr (MVP)

## Architektura

- Backend: jeden serwis monolityczny (Fastify, Node 20+ / TypeScript) – API, render MJML+Liquid, wysyłka (Resend/SMTP), webhooki HMAC, endpointy workerowe wywoływane przez QStash (retry/backoff, fan‑out, planowanie). Osobny serwis worker – po MVP.
- Dwa fronty:
  - Dashboard: Next.js (App Router), Tailwind, shadcn/ui.
  - Website: Astro (content/SEO) lub alternatywnie Next.js SSG (pozostajemy przy rozdzieleniu aplikacji).
- Dane: Supabase (Postgres/Auth/Storage/RLS owner/member).
- Infrastruktura: Upstash Redis (rate‑limit, idempotencja, cache, liczniki), Upstash QStash (retry, cron/at, fan‑out paczek).

## Pakiety (Turborepo)

- apps/
  - dashboard/ (Next.js)
  - website/ (Astro)
  - api/ (Fastify – monolit HTTP)
- services/
  - worker/ (wydzielenie po MVP; dziś QStash→HTTP monolitu)
- packages/
  - email-engine/ – MJML+Liquid, plaintext, guardrails
  - transports/ – Resend SDK, Nodemailer/SMTP
  - validation/ – AJV + reguły jakości (kontrast/alt/HTTPS/size)
  - webhooks/ – HMAC sign/verify, typy zdarzeń
  - ratelimit/ – Upstash: token bucket + idempotencja
  - db/ – Drizzle ORM + migracje
  - sdk/ – @requil/sdk (OpenAPI → TS)
  - ui/ – shadcn/ui, wspólne komponenty
  - utils/ – logger (pino), traceId, helpers
  - config/ – tsconfig, turbo, biome config

## Backend

- Node 22+, TypeScript, pnpm, Fastify.
- Drizzle ORM + drizzle‑kit; Supabase (Postgres/Auth/Storage/RLS).
- Upstash Redis (rate‑limit per workspace/transport, idempotencja lock:send:{key} + result:send:{key}, cache MJML/HTML/brandKit/schema, liczniki kampanii).
- Upstash QStash (exponential backoff, fan‑out, cron/at) → wywołania HTTP do monolitu.
- Render/templating: mjml, liquidjs, inline‑css, html‑to‑text, sanitize‑html.
- Guardrails: ajv (strict/permissive + defaulty), cheerio (analiza HTML), wcag‑contrast/color (kontrast), wymuszanie HTTPS + rel="noopener", hard‑stop HTML < 150 kB.
- Transporty: @resend/sdk, nodemailer (SMTP BYOK).

## Bezpieczeństwo

- API Keys: hash argon2id, scope’y; RLS (owner/member).
- SMTP creds: szyfrowanie z KMS (AES‑256‑GCM envelope). Alternatywnie libsodium/XChaCha20‑Poly1305.
- Webhooki: HMAC (timestamp + nonce, odporność na powtórki), retry przez QStash.
- Idempotencja: nagłówek Idempotency‑Key → lock:send:{key} (TTL) + hash(ciała) + result:send:{key} (utrwalenie wyniku, statusy per‑recipient). Różne body z tym samym kluczem → 409; retencja wyników konfigurowalna.

## Frontend

- Dashboard: Next.js (App Router), Tailwind, shadcn/ui, lucide‑react, tanstack/query, react‑hook‑form + zod, supabase‑js (auth), GrapesJS + grapesjs‑mjml.
- Website: Astro + MDX, sitemap, og:image; formularz DO → API.

## AI

- Vercel AI SDK (ai) lub OpenAI/Anthropic przez lekki wrapper; structured JSON: mjml, variablesSchema, subjectLines[], preheader, notes[], safety.flags[]. Walidacja AJV + lokalne guardrails.

## CI/CD i jakość

- CI: GitHub Actions – workflow: `biome ci` (lint+format), `tsc --noEmit` (type‑check), `vitest` (unit), `supertest` (API), `playwright` (E2E), `turbo run build`, `drizzle-kit migrate`, Docker build/push i deploy (Railway/Cloud Run). Cache pnpm/Turbo, concurrency z cancel‑in‑progress dla PR, OIDC do GCP, sekrety z Doppler/Infisical.
- BiomeJS 2 (lint+format w całym repo), tsc --noEmit, vitest (unit), supertest (API), playwright (E2E), knip (dead code), Turbo remote cache.
- Hosting: API/Worker – Railway lub Cloud Run; Fronty – Vercel/Cloudflare Pages.
- Sekrety: Doppler/Infisical lub Google Secret Manager.
- Obserwowalność: pino (JSON + traceId), Sentry (errors). OpenTelemetry – po MVP.
