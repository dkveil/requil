# Cursor Rules for Requil

This directory contains AI coding assistant rules organized by technology and domain.

## File Structure

### Always Applied Rules

These rules are automatically applied in every conversation:

- **`project.mdc`** - Project overview and core description of Requil
- **`shared.mdc`** - Version control (Git, Conventional Commits), monorepo practices, code readability

### Context-Specific Rules

These rules are applied based on the files you're working with:

#### Backend

- **`backend.mdc`** - Node.js with Fastify, email engine, queue/workers, rate limiting

#### Frontend

- **`frontend-react.mdc`** - React coding standards, state management (Zustand, Redux), data fetching (TanStack Query), routing
- **`frontend-nextjs.mdc`** - Next.js App Router patterns, dashboard-specific implementation
- **`frontend-astro.mdc`** - Astro components, islands architecture, website-specific patterns
- **`frontend-styling.mdc`** - Tailwind CSS best practices, shadcn/ui integration
- **`frontend-accessibility.mdc`** - ARIA, WCAG compliance, mobile accessibility

#### Data & Testing

- **`database.mdc`** - PostgreSQL with Supabase, Drizzle ORM, RLS policies, caching
- **`testing.mdc`** - Vitest (unit), Supertest (integration), Playwright (E2E)

#### Infrastructure

- **`devops.mdc`** - Docker, GitHub Actions, GCP deployment, monitoring
- **`turborepo.mdc`** - Monorepo configuration and best practices

## Usage

Cursor automatically loads relevant rules based on:

1. The `alwaysApply: true` frontmatter flag
2. File paths and patterns you're working with
3. Technologies mentioned in your queries

## Maintenance

When updating rules:

1. Keep rules focused and actionable
2. Use placeholders like `{{variable_name}}` for context-specific details
3. Update this README if adding new rule files
4. Remove duplicates and consolidate related rules

