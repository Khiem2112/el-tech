# EL-TECH Frontend Component Registry v1

## Status

- **State:** Active baseline
- **Confirmed:** 2026-10-19
- **Scope:** Angular customer storefront

## Repository baseline

`fe/src/app/components/atoms/` is established with verified standalone primitives adhering to the softened NVIDIA design tokens and Lucide iconography. Current dependencies include Angular/CDK 22.x, `@spartan-ng/brain` 1.8.x, and `lucide-angular` 0.475.x.

## Registry states

- `Available`: verified local path and public API.
- `Planned`: approved direction but not yet implemented.
- `Feature-local`: intentionally not a universal primitive.
- `Deprecated`: must not be used for new work.

## Current and planned entries

| Component/pattern | State | Current evidence or intended base | Rule |
| --- | --- | --- | --- |
| Button (`ButtonDirective`) | Available | `fe/src/app/components/atoms/button/button.directive.ts` | Uses `[appButton]`, supports variants and softened radius (`rounded-md`). |
| Badge (`BadgeDirective`) | Available | `fe/src/app/components/atoms/badge/badge.directive.ts` | Uses `[appBadge]`, supports status and category tagging (`rounded-sm`). |
| Input (`InputDirective`) | Available | `fe/src/app/components/atoms/input/input.directive.ts` | Uses `[appInput]`, styled to NVIDIA tokens with focus ring and clear placeholder. |
| Icon Module (`AppIconModule`) | Available | `fe/src/app/components/atoms/icon/icon.module.ts` | Standardized `lucide-angular` icons for compact, accessible UI actions. |
| Dialog/Alert Dialog | Planned | Spartan/CDK overlay | Must satisfy `SURFACE-002` and focus restoration. |

| Sheet/Drawer | Planned | Spartan/CDK overlay | Must satisfy `SURFACE-003` and mobile history rules. |
| Single combobox (`SelectComponent`) | Available | `fe/src/app/components/atoms/select/select.component.ts` | Uses `<app-select>`, CDK Connected Overlay, searchable dropdown, keyboard navigation, satisfies `SELECT-003`. |
| Multi-select combobox/listbox | Planned | Verified Spartan multiple-select primitive | Must satisfy `SELECT-004`; never hand-roll ARIA without a documented gap. |
| Filter bar | Feature-local until reused | Catalog implementation composed from available controls | Must satisfy `FILTER-001`; promote only after two proven consumers. |
| Pagination | Planned | Spartan router-aware pagination or accessible local wrapper | Must satisfy `PAGE-001` or `PAGE-002`. |
| Reorderable list | Feature-local until reused | Angular CDK drag/drop plus keyboard controls | Must satisfy `ORDER-002`. |
| Data table | Planned | Semantic table plus verified table primitives | Customer product grids remain cards, not admin tables. |

## Promotion rule

Before creating a shared primitive, inspect the installed package and existing
repository. Record its local path, supported states, Angular inputs/outputs,
keyboard behavior, and tests here. A CLI command or online example alone does
not change a registry entry to `Available`.
