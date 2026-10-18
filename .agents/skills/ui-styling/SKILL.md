---
name: ui-styling
description: Focused Spartan UI (shadcn for Angular), Angular CDK, and Tailwind component implementation guidance. Use when creating or modifying reusable UI primitives, accessible components, or Tailwind theme configurations in Angular.
argument-hint: "[component or layout]"
license: MIT
metadata:
  author: claudekit
  version: "1.0.0"
---
# UI Styling with Spartan UI and Tailwind CSS

Use this as a component-implementation guide for the Angular frontend. Before creating or changing a user-facing feature, follow `.agents/skills/ui-ux-pro-max/rules/style-discovery.md` and apply `.agents/skills/ui-ux-pro-max/rules/web-rules.md`.

---

## 1. Component Architecture & Atomic Placement

This project uses an Atomic UI component hierarchy centered around **Spartan UI** (the Angular implementation of shadcn UI primitives based on Angular CDK and `@spartan-ng/brain`):

```
[ Domain / Feature Components (fe/src/app/components/pc-builder/, catalog/, cart/) ]
                                  ↓ (composes)
[ Universal Primitive Atoms (fe/src/app/components/atoms/) ]
  ├── Spartan UI Primitives (Button, Table, Badge, Combobox, Input, Dialog, Tooltip, Sheet)
  ├── Exported via barrel file: fe/src/app/components/atoms/index.ts
  └── Styled strictly with CSS variables from fe/src/styles.css
```

### Core Architecture Rules:
- **Universal Primitive Atoms (`fe/src/app/components/atoms/`)**:
  - Generic interactive components (Button, Dialog, Popover, Tooltip, Input, Table, Badge) reside under `src/app/components/atoms/`.
  - Installed via Spartan CLI: `npx @spartan-ng/cli ui [component]` or generated into the atoms directory.
  - Export all primitive atoms through `fe/src/app/components/atoms/index.ts`.
- **CSS Token Customization (`styles.css`)**:
  - All primitive atoms must be styled using the design tokens established in `fe/src/styles.css` (e.g. `--primary`, `--canvas`, `--surface-card`, `--hairline`, `--status-*`).
  - Do not use arbitrary hex colors (e.g. `bg-[#292524]`).
  - Use the class merging helper `hlm()` from `@spartan-ng/brain/hlm-tailwind-merge` or `cn()` from `@/lib/cn`.
- **Feature Components (Higher Layers)**:
  - Higher-level modules (PC Builder Wizard, Product Card, Cart Drawer, Checkout) compose these primitive atoms.
  - Combine primitive atoms with Angular Reactive Forms + Zod and Angular Native Signals Services.

---

## 2. Accessible Icon Button + Tooltip Pattern in Angular

Any button rendered without visible text (`size="icon"`) must be accessible to both mouse hover users (via Tooltip) and screen reader users (via `aria-label`).

```html
<!-- INCORRECT: Naked icon button without tooltip or accessible name -->
<button hlmBtn variant="ghost" size="icon" (click)="handleReset()">
  <lucide-icon name="rotate-ccw" class="size-4"></lucide-icon>
</button>

<!-- CORRECT: Accessible composition with Tooltip, aria-label, and aria-hidden icon -->
<hlm-tooltip>
  <button
    hlmTooltipTrigger
    hlmBtn
    type="button"
    variant="ghost"
    size="icon"
    [attr.aria-label]="resetLabel"
    (click)="handleReset()"
    class="size-8 text-muted hover:text-foreground"
  >
    <lucide-icon name="rotate-ccw" class="size-4" aria-hidden="true"></lucide-icon>
  </button>
  <span *hlmTooltipContent>{{ resetLabel }}</span>
</hlm-tooltip>
```

---

## 3. Primitive State Contracts

- **Button hierarchy**: One solid primary action per context (`variant="default"`), neutral secondary actions (`variant="secondary"` or `variant="outline"`), and destructive variant (`variant="destructive"`) only for irreversible consequences (e.g. clearing entire PC configuration or deleting an account).
- **Badge states**: Badges use medium or semibold text and expose status meaning in text; color alone must not encode compatibility or stock state. Keep badges resilient to long localized labels.
- **Focus visibility**: Never suppress `focus-visible`. All interactive controls must show a clear focus ring matching the primary token.

---

## 4. Boundary

This skill owns Spartan UI component installation, primitive atom placement in `src/app/components/atoms/`, and Tailwind styling details. `web-rules.md` owns UX outcomes and accessibility criteria. `design-system` owns token definitions.
