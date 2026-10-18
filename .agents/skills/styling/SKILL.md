---
name: styling-convention
description: >
  Pure styling conventions using Tailwind CSS and cn / hlm utility for Angular. Covers utility classes, class merging, layout & spacing consistency, and component state variants.
---

# Styling & UI Conventions for Angular

This skill defines pure styling rules for Angular and Tailwind CSS v4. Domain business rules must not be placed here; refer to `business-logic` skill for business rules.

---

## 1. Tailwind CSS Utility Classes (No Inline Styles)
Always use Tailwind CSS utility classes. Never use inline styles (`style="..."` or `[style]="..."`) except for runtime CSS variables (e.g. calculated cursor positions or dynamic progress percentages).

```html
<!-- CORRECT -->
<div class="flex items-center gap-4 rounded-lg bg-neutral-900 p-4 shadow-sm"></div>

<!-- INCORRECT -->
<div style="display: flex; align-items: center; padding: 16px; background: #171717;"></div>
```

---

## 2. Dynamic Class Merging with `cn()` / `hlm()`
Always use the `cn()` or `hlm()` utility (`clsx` + `tailwind-merge`) when applying conditional or merged class names in Angular component templates or directives. Never use manual string concatenation or template literal interpolation.

```typescript
// Definition in src/app/lib/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

```html
<!-- CORRECT -->
<button
  [class]="cn(
    'rounded-md px-4 py-2 text-sm font-medium transition-colors',
    isActive() ? 'bg-primary text-primary-foreground' : 'bg-surface-card text-muted hover:text-foreground',
    customClass
  )"
>
  Select Component
</button>

<!-- INCORRECT -->
<button [class]="'px-4 py-2 ' + (isActive() ? 'bg-primary' : 'bg-surface-card') + ' ' + customClass">
  Select Component
</button>
```

---

## 3. Design Token Usage from `styles.css`
Always use semantic tokens defined in `src/styles.css` and mapped in Tailwind CSS v4 (e.g. `bg-canvas`, `bg-surface-card`, `border-hairline`, `text-foreground`, `text-muted`, `bg-status-*`, `bg-badge-*`). Never use hardcoded arbitrary hex colors like `bg-[#292524]`.

```html
<!-- CORRECT -->
<div class="border border-hairline bg-surface-card p-4 text-foreground shadow-card"></div>

<!-- INCORRECT -->
<div class="border border-[#e7e5e4] bg-[#ffffff] p-4 text-[#0c0a09]"></div>
```

---

## 4. Layout & Spacing Consistency
Use Tailwind's standard design tokens for spacing, padding, margins, and flex/grid gaps (`p-2`, `p-4`, `p-6`, `gap-3`, `gap-6`). Avoid arbitrary values like `p-[17px]` unless specifically required by pixel-perfect designs.

```html
<!-- CORRECT -->
<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
  <aside class="space-y-4 p-4"></aside>
  <main class="col-span-2 space-y-6 p-6"></main>
</div>
```

---

## 5. Component States & Interactive Variants
Always provide clear interactive states (hover, focus-visible, active, disabled) using Tailwind modifiers in Angular templates:

```html
<!-- CORRECT -->
<button
  type="button"
  [disabled]="isDisabled()"
  class="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
>
  Confirm Configuration
</button>
```
