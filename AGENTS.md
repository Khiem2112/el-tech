# Project Agent Guidance

## Project Overview

- Domain: Web ban linh kien PC va ho tro tu van lap rap PC (PC Builder, hardware compatibility, component catalog).
- Frontend: Angular (v17+) + Tailwind CSS + Spartan UI (`spartan/ui`) + Angular Native Signals Service + Angular Reactive Forms + Zod.
- Backend: Node.js (Express / Fastify) + Better-Auth + Prisma Client.
- Database: PostgreSQL (Supabase) managed via Prisma schema (`prisma/schema.prisma`).
- Full Tech Stack Document: Read `TECH_STACK.md` for architecture diagrams and layer responsibilities.

## Database & Persistence Policy

- Database schema is defined and managed using Prisma (`prisma/schema.prisma`).
- Refer to `.agents/skills/db-conventions/SKILL.md` for schema conventions:
  - Singular PascalCase models mapped to snake_case tables via `@@map("...")`.
  - Primary key is always named `id` (`Int` or `String` / `UUID`).
  - Mandatory audit columns for mutable entities: creation timestamp (`createdAt` / `created_at`), update timestamp (`updatedAt` / `updated_at`), and soft-delete active flag (`isActive` / `is_active`).
  - Money and prices must use `Decimal`, never floating point numbers (`Float`).
  - Foreign keys explicitly follow related entity names.
  - Dynamic component specifications (e.g., CPU socket, RAM bus, dimensions, TDP) can utilize `Json` fields in PostgreSQL when schema variation per component category is high.

## Skill Loading Policy

Agents must not read all skills before starting a task. Load the minimal relevant set on demand directly from `.agents/skills/`.

### Product Context, Flow Planning & UX

When defining user journeys, hardware selection workflows, or edge cases:
- `.agents/skills/jtbd-framing/SKILL.md` for user struggling moments, job statements, and purchase criteria.
- `.agents/skills/journey-mapping/SKILL.md` for end-to-end operator and buyer journeys, handoffs, and friction analysis.
- `.agents/skills/information-architecture/SKILL.md` for component catalog taxonomy, specification filters, and navigation hierarchy.
- `.agents/skills/ecommerce-operations-flow/SKILL.md` for durable state modeling, PC configuration steps, checkout branches, and error recovery before implementation.

### Operational State Patterns & UI Shell

When designing or reviewing UI interactions:
- `.agents/skills/flow-app-shell/SKILL.md` for overall layout, master-detail views, responsive sidebars, and sticky configuration bars.
- `.agents/skills/flow-tables/SKILL.md` for component comparison tables, order histories, specification matrices, and inventory lists.
- `.agents/skills/flow-forms/SKILL.md` for hardware filter forms, checkout forms, customer addresses, and inline validation.
- `.agents/skills/flow-empty-states/SKILL.md` for empty carts, zero search/filter results, unconfigured PC builder states, and network loading states.
- `.agents/skills/flow-errors/SKILL.md` for incompatibility alerts, stock exhaustion, payment failures, and graceful recovery.
- `.agents/skills/flow-navigation/SKILL.md` for category mega-menus, breadcrumbs, search bars, and builder-to-cart handoffs.
- `.agents/skills/flow-permissions/SKILL.md` for guest users, customer accounts, and administrative staff roles.
- `.agents/skills/flow-settings/SKILL.md` for user profiles, saved PC build configurations, and address management.

### UI, Styling & Design System

When building, styling, or auditing frontend interfaces:
- `.agents/skills/styling/SKILL.md` for Angular Tailwind utility classes, `cn` / `hlm` dynamic class merging, and interactive component states.
- `.agents/skills/ui-styling/SKILL.md` for Spartan UI primitives installation in `src/app/components/atoms/`, Angular CDK foundations, and accessible button/tooltip patterns.
- `.agents/skills/design-system/SKILL.md` for design token architecture in `fe/src/styles.css` (Primitive -> Semantic -> Component tokens) and dark mode rules.
- `.agents/skills/ui-ux-pro-max/SKILL.md` for design system guidance, color balance, typography, accessibility, and responsive behavior.
- `.agents/skills/impeccable/SKILL.md` for visual polish, layout rhythm, contrast checks, and frontend defect detection.

### Forms & UI Implementation

When building forms and user inputs:
- `.agents/skills/angular-form-conventions/SKILL.md` for Angular Reactive Forms, Zod validator integration, `novalidate`, accessible errors, and submission signals.
- `.agents/skills/flow-forms/SKILL.md` for form UX structure, field grouping, and inline validation timing.

### Architecture, Code Quality & Ambiguity

When writing code or verifying logic:
- `.agents/skills/checklist/SKILL.md` for mandatory pre-commit verification gates (running `tsc --noEmit`, lint, architectural layering, and zero-error delivery).
- `.agents/skills/code-review/SKILL.md` for routing code reviews across functional and convention passes.
- `.agents/skills/reuse-first/SKILL.md` for checking existing Spartan atoms, services, schemas, and utils before creating new files or abstractions.
- `.agents/skills/typescript/SKILL.md` for strict TypeScript standards (`type` over `interface`, explicit return types, no `any`, and pre-commit checks).
- `.agents/skills/db-conventions/SKILL.md` for Prisma schema design, migrations, and model relationships.
- `.agents/skills/implement-qa/SKILL.md` when specifications or business logic are ambiguous; write questions to `QA/QA-<slug>.md` and wait for user answers before guessing.
- `.agents/skills/functional-review/SKILL.md` for verifying implementation against functional requirements and acceptance criteria.
- `.agents/skills/graphify/SKILL.md` for codebase relationship mapping and knowledge graph queries.

## Pre-Commit Automated Verification Gate

Before staging, creating a commit, or marking a coding task complete, agents MUST run automated verification on all touched scopes:

- Frontend changes:
  - Run `npx tsc --noEmit` in `fe/` to verify TypeScript compile-time safety.
  - Run `npm run lint` (or `npx eslint .`) in `fe/` to verify code quality and conventions.
- Backend changes:
  - Run `npx tsc --noEmit` in `be/` to verify TypeScript compile-time safety.
  - Run `npm run lint` (or `npx eslint .`) in `be/` to verify code quality and conventions.
- Mandatory gate:
  - All verification commands must exit with code 0.
  - If any type error or lint error occurs, commits are strictly blocked until the errors are fixed.
  - Follow the command policy in `.agents/rules/command-whitelist.md`.

