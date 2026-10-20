# Project Agent Guidance

## Project Overview

- Domain: Web ban linh kien PC va ho tro tu van lap rap PC (PC Builder, hardware compatibility, component catalog).
- Frontend: Angular 22 standalone components + Tailwind CSS + Spartan UI (`spartan/ui`) + Angular Native Signals Service + Angular Reactive Forms + Zod.
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

For a new or materially changed customer-facing journey, use
`.agents/skills/feature-delivery-workflow/SKILL.md` as the lifecycle router and
complete `flow -> UI design -> spec -> implementation plan -> code -> review -> fix`
in that order.

Before coding a material behavior change:

1. Read `plan/README.md`, the applicable legacy plan files, and the routed files
   under `.agents/skills/business-logic/features/`.
2. Create an implementation-neutral flow at
   `docs/<feature-name>/flows/v1.md` from `docs/templates/flow-v1.md`. Later
   material changes use delta-only `v<N>-diff.md` files.
3. Record explicit flow approval with approver and date. Approval of a document
   in `plan/` does not automatically approve a newly generated flow.
4. After flow approval, create `docs/<feature-name>/designs/v1.md` from
   `docs/templates/ui-design-v1.md` for material customer-facing UI work. Select
   pattern IDs from `docs/frontend-standards/`, define desktop/mobile layout and
   states, and obtain explicit design approval.
5. After required design approval, create `docs/<feature-name>/specs/v1.md` from
   `docs/templates/spec-v1.md`, inspect the actual repository before naming
   files/modules, and obtain explicit spec approval.
6. Create an implementation plan for non-trivial work, then implement the
   approved spec in bounded phases. Each phase declares its review
   mode, scope, validations, and exit criteria.
7. Review functional behavior first and conventions second when both are
   requested. Fix blockers, rerun targeted checks, and re-review before
   advancing.

Do not require this full cycle for behavior-preserving fixes or small visual-only
refinements. When defining journeys, hardware selection workflows, or edge cases:
- `.agents/skills/jtbd-framing/SKILL.md` for user struggling moments, job statements, and purchase criteria.
- `.agents/skills/journey-mapping/SKILL.md` for end-to-end operator and buyer journeys, handoffs, and friction analysis.
- `.agents/skills/information-architecture/SKILL.md` for component catalog taxonomy, specification filters, and navigation hierarchy.
- `.agents/skills/ecommerce-operations-flow/SKILL.md` for durable state modeling, PC configuration steps, checkout branches, and error recovery before implementation.

### Operational State Patterns & UI Shell

When designing or reviewing UI interactions:
- `.agents/skills/ui-design-workflow/SKILL.md` for the feature-specific UI
  design artifact and approval gate after flow approval.
- `.agents/skills/frontend-interaction-patterns/SKILL.md` for page/dialog/sheet,
  selection controls, filter bars, sorting/reordering, and pagination contracts.
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
- Read `design-system/el-tech/MASTER.md` for the locked NVIDIA design system (softened geometry, high-contrast palette, typography scales).
- Read `.agents/rules/atomic-design-spartan.md` to adhere strictly to Atomic Design (`atoms/`, `molecules/`, `organisms/`) and use restyled Spartan UI / Angular CDK primitives.
- Read `.agents/skills/iconography/SKILL.md` to prioritize `lucide-angular` icons for compact, high-density actions over verbose text buttons and ASCII symbols.
- Read `.agents/skills/ui-ux-pro-max/rules/style-discovery.md` and
  `.agents/skills/ui-ux-pro-max/rules/web-rules.md` before visually changing a
  user-facing surface.
- `.agents/skills/styling/SKILL.md` for Angular Tailwind utility classes, `cn` / `hlm` dynamic class merging, and interactive component states.
- `.agents/skills/ui-styling/SKILL.md` for Spartan UI/Angular CDK primitives and the tracked component registry.
- `.agents/skills/design-system/SKILL.md` for token architecture in `fe/src/styles.css`.
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
- `.agents/skills/task-runner/SKILL.md` for autonomous task execution loops, dual-pass review gates, defect remediation, automated commits, and progress tracking.

## Phase-Gated Review Policy

Complex specs and multi-file customer journeys must not be implemented as one
unstructured pass.

1. Each phase in the approved spec or implementation plan must identify the
   review target, mode, scope, validations, and observable exit criteria.
2. `mode=functional` verifies the approved flow/design/spec, branches, failures,
   recovery, and regressions. `mode=convention` verifies only applicable project
   rules. `mode=both` runs these as two separate passes, functional first.
3. Valid scopes are `frontend`, `backend`, `database`, `security`, and `all`;
   `auto` expands only to areas actually touched.
4. Critical and High findings are blockers. Fix them and perform a proportionate
   re-check plus re-review before advancing.
5. Review-only requests are read-only. An implementation task authorizes fixes
   needed to close its approved phase.

## Pre-Commit Automated Verification Gate

Before staging, creating a commit, or marking a coding task complete, agents MUST run automated verification on all touched scopes:

- Frontend changes:
  - Run `npm run check:fe` from the repository root (validates TypeScript types, Angular HTML/inline templates via build, and ESLint).
- Backend changes:
  - Run `npm run check:be` from the repository root, or the equivalent backend
    typecheck and lint commands.
- Mandatory gate:
  - All verification commands must exit with code 0.
  - If any type error or lint error occurs, commits are strictly blocked until the errors are fixed.
  - Run only touched scopes; add targeted tests when they prove changed behavior
    or a review finding.
  - Follow the command policy in `.agents/rules/command-whitelist.md`.

