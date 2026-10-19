# Codex Project Instructions

Read and follow `AGENTS.md` before making project changes.
Follow the Skill Loading Policy in `AGENTS.md` and load skills directly from `.agents/skills/`. Do not copy or duplicate skills.

For a new or materially changed customer-facing feature, follow
`.agents/skills/feature-delivery-workflow/SKILL.md` and `docs/README.md`. Do not
implement before the governing flow, required UI design, and spec carry explicit
approval records and non-trivial work has an adequate implementation plan.

Database schema conventions follow `.agents/skills/db-conventions/SKILL.md` using Prisma.
TypeScript standards follow `.agents/skills/typescript/SKILL.md`.
Pre-commit verification uses `npm run check:fe` and/or `npm run check:be` for
the touched scopes, plus targeted tests when required by the approved spec or a
review finding. Follow `.agents/skills/checklist/SKILL.md`.
See `.codex/instructions.md` for additional environment details.

