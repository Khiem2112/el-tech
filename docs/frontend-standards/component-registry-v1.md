# EL-TECH Frontend Component Registry v1

## Status

- **State:** Active baseline
- **Confirmed:** 2026-10-19
- **Scope:** Angular customer storefront

## Repository baseline

At this baseline, `fe/src/app/components/atoms/` does not exist. Current pages
mostly compose native HTML controls with Tailwind classes. Dependencies include
Angular/CDK 22.x and `@spartan-ng/brain` 1.8.x; the Spartan Helm components
shown in current online documentation must not be assumed to be installed or
API-compatible.

## Registry states

- `Available`: verified local path and public API.
- `Planned`: approved direction but not yet implemented.
- `Feature-local`: intentionally not a universal primitive.
- `Deprecated`: must not be used for new work.

## Current and planned entries

| Component/pattern | State | Current evidence or intended base | Rule |
| --- | --- | --- | --- |
| Native button/input/select/checkbox | Available | Existing feature templates | May be reused until an approved shared primitive replaces it; must still meet tokens and accessibility contracts. |
| Shared Button/Input/Field | Planned | Spartan Brain/Helm or local wrapper after version verification | Do not import from a guessed atoms path. |
| Dialog/Alert Dialog | Planned | Spartan/CDK overlay | Must satisfy `SURFACE-002` and focus restoration. |
| Sheet/Drawer | Planned | Spartan/CDK overlay | Must satisfy `SURFACE-003` and mobile history rules. |
| Popover/Tooltip | Planned | Spartan/CDK overlay | Popup must escape clipping containers. |
| Single combobox | Planned | Verified Spartan combobox primitive | Must satisfy `SELECT-003`. |
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
