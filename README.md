# Requil

> API-first email engine for generation, validation, rendering, and delivery

**Live at:** [requil.app](https://requil.app)

---

## Overview

Requil is an email platform that consolidates the entire email workflow into a single, cohesive system. It combines template creation, quality validation, cross-client rendering, and reliable delivery into one unified API-first engine.

**The core pipeline:**

```text
Template Creation → Validation & Rendering → Transport Configuration → Email Delivery
```

Instead of juggling multiple tools for building emails, validating code, rendering templates, and managing sending infrastructure, Requil provides a single source of truth for all email operations across your applications.

---

## Core Concept

### The Four-Stage Pipeline

1. **Template Creation**

   - Build emails using React Email components with Liquid templating
   - AI-assisted generation from prompts and brand guidelines
   - Drag-and-drop editor with built-in guardrails

2. **Validation & Rendering**

   - Hard validation: WCAG contrast, alt-text coverage, HTTPS enforcement, HTML size limits
   - Per-recipient rendering with variable substitution
   - Automatic plaintext generation
   - Immutable snapshots for predictable deployments

3. **Transport Configuration**

   - Unified transport layer supporting Resend (BYOK) and custom SMTP
   - SPF/DKIM setup wizard for deliverability
   - Suppression lists and bounce handling
   - Rate limiting per workspace and transport

4. **Email Delivery**

   - Single `/v1/send` endpoint with idempotency guarantees
   - Automatic retry with exponential backoff via QStash
   - Fan-out for large campaigns with batch checkpointing
   - HMAC-signed webhooks for delivery events

---

## Architecture

### Monorepo Structure

Requil is organized as a **Turborepo monorepo** with clear separation between applications and shared packages:

**Applications:**

- `apps/api` - Fastify monolith (API + rendering + worker endpoints)
- `apps/dashboard` - Next.js App Router (admin interface)
- `apps/website` - Astro/Next.js SSG (marketing site, planned)

**Shared Packages:**

- `packages/email-engine` - React Email + Liquid rendering, plaintext generation, guardrails
- `packages/transports` - Resend SDK and SMTP adapters
- `packages/validation` - AJV schemas and quality rules
- `packages/webhooks` - HMAC signature generation and verification
- `packages/ratelimit` - Upstash Redis rate limiting and idempotency
- `packages/db` - Drizzle ORM with migrations
- `packages/types` - Shared TypeScript types
- `packages/utils` - Logger (pino), crypto, error handling
- `packages/config` - Shared configs (tsconfig, vitest, biome)

### Backend Architecture

The API follows **feature-based folder structure** with **CQRS** (Command Query Responsibility Segregation) and **DDD** (Domain-Driven Design) principles:

**Feature-Based Organization:**

```text
src/modules/
  ├── auth/           - Authentication & authorization
  ├── workspace/      - Multi-tenant workspace management
  ├── templates/      - Template CRUD and snapshots
  ├── api-keys/       - API key management
  └── ...
```

**CQRS Pattern:**

- **Commands**: Write operations (create, update, delete) with side effects
- **Queries**: Read operations without side effects
- Dependency injection via Awilix
- Command/Query Bus for decoupled execution

**Domain-Driven Design:**

- Domain entities with business logic encapsulation
- Value objects for type-safe primitives
- Repository pattern for data access
- Domain events for cross-module communication

**Infrastructure:**

- **Database**: Supabase (Postgres with RLS) + Drizzle ORM
- **Cache/Queue**: Upstash Redis (rate limiting, idempotency, cache) + QStash (retry, scheduling)
- **Observability**: pino JSON logging with traceId, Sentry (planned)

### Frontend Architecture

The dashboard uses **Next.js 16 App Router** with feature-based organization:

**Features:**

- `features/auth` - Login, registration, OAuth
- `features/editor` - Drag-and-drop email builder (55+ components)
- `features/templates` - Template management
- `features/workspace` - Workspace settings

**State Management:**

- Zustand for client state
- RxJS for reactive patterns
- React Hook Form + Zod for forms

**Styling:**

- Tailwind CSS 4
- shadcn/ui (Radix UI primitives)
- Dark mode support via next-themes

---

## Tech Stack

### Core Technologies

**Backend:**

- Node.js 22+, TypeScript 5.9+, Fastify 5
- Drizzle ORM, Supabase (Postgres/Auth/Storage)
- Upstash Redis, QStash

**Frontend:**

- Next.js 16 (App Router), React 19
- Tailwind CSS 4, shadcn/ui
- Zustand, RxJS

**Email Rendering:**

- React Email (TSX components)
- Liquid templating (liquidjs)
- html-to-text (plaintext generation)
- Cheerio (HTML analysis)

**Transports:**

- Resend SDK
- Nodemailer (SMTP)

**Quality Tooling:**

- BiomeJS 2.2+ (lint + format)
- Vitest (unit + integration)
- Playwright (E2E)
- Turbo 2.6+ (monorepo orchestration)

---

## Key Features

### Implemented ✓

- Multi-tenant workspace management
- Template CRUD with React Email components
- Asset management (upload, storage)
- API key authentication with scopes
- Drag-and-drop email editor
- OAuth (Gmail, Github) + credentials authentication
- Rate limiting per workspace
- HMAC-signed webhooks
- i18n support (EN/PL)

### In Development ⏳

- `/v1/send` endpoint with idempotency
- Template snapshot publishing (immutable versions)
- QStash retry with exponential backoff
- AI-assisted template generation
- WCAG contrast validation with auto-fix
- Suppression list management
- Usage tracking and billing

### Planned (Post-MVP)

- Newsletter campaigns (double opt-in, segments)
- Advanced analytics and dashboards
- A/B testing
- Journey builder
- Multi-channel support (SMS, push)

---

## Project Status

🚧 **Active Development** - This project is in continuous development and serves dual purposes:

- Building a production-ready email platform
- Educational exploration of modern full-stack architecture patterns

Expect frequent changes, breaking updates, and ongoing experimentation with best practices in monorepo architecture, DDD, CQRS, and scalable email infrastructure.

---

## Contributing

This is a personal project primarily for learning and experimentation. However, feedback, suggestions, and discussions are always welcome. Feel free to open issues or reach out with ideas.

---

## License

[MIT License](LICENSE)

---

Built as a learning journey into modern email infrastructure and full-stack architecture.
