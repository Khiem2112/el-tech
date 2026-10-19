# Codex Agent Instructions

Read and follow `AGENTS.md` before generating, editing, or executing code.

- Conventions & Skills: Follow the Skill Loading Policy in `AGENTS.md` to load skills directly from `.agents/skills/`. Do not copy or duplicate skills.
- Feature Delivery: Material customer-facing work follows
  `.agents/skills/feature-delivery-workflow/SKILL.md` and the versioned artifacts
  under `docs/`: approved flow, approved UI design when required, approved spec,
  implementation plan, phase implementation, review, fix, and re-review.
- Database: Database schema is managed via Prisma in `prisma/schema.prisma` following `.agents/skills/db-conventions/SKILL.md`.
- TypeScript: Follow strict typing rules in `.agents/skills/typescript/SKILL.md`.
- Pre-Commit Gate: Execute `npm run check:fe` and/or `npm run check:be` for the
  touched scopes, plus targeted tests when applicable, per
  `.agents/skills/checklist/SKILL.md` before finalizing changes.

