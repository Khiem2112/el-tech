---
name: design-system
description: Focused web design-token architecture and persisted design-system guidance for Angular + Tailwind CSS. Use for primitive, semantic, and component tokens, Tailwind token integration, or maintained design-system documentation.
argument-hint: "[component or token]"
license: MIT
metadata:
  author: claudekit
  version: "1.0.0"
---
# Design System for PC Store & Builder

Use this skill for durable token and component-language decisions in the Angular application. It is not required for an ordinary feature that can reuse existing styles without creating or changing system-wide tokens.

## Start With Discovery

Before creating or changing system-wide tokens:

1. Follow `.agents/skills/ui-ux-pro-max/rules/style-discovery.md`.
2. Read the resolved `fe/src/styles.css` and existing component classes before proposing new tokens.
3. Reuse the current primitive, semantic, and component layers unless the requested change is intentionally system-wide.

## Token Model

```text
Primitive (raw values: neutral-900, blue-600, amber-500)
       -> Semantic (purpose aliases: bg-canvas, text-foreground, status-warning)
       -> Component (component-specific differences)
```

- Keep raw values in primitives (HSL or OKLCH variables).
- Use semantic aliases in Angular templates and features (`bg-surface-card`, `border-hairline`, `text-muted`).
- Use component tokens only for component-specific differences that cannot be expressed semantically.
- Document each newly introduced token purpose and supported theme behavior (Light/Dark mode).

## Angular & Tailwind v4 Integration

Tokens are defined in `fe/src/styles.css` using CSS custom properties and mapped to Tailwind v4:

```css
@import "tailwindcss";

@layer base {
  :root {
    --canvas: 0 0% 100%;
    --surface-card: 0 0% 98%;
    --foreground: 240 10% 4%;
    --muted: 240 4% 46%;
    --hairline: 240 6% 90%;
    --primary: 221 83% 53%;
    --primary-foreground: 0 0% 100%;
    --status-compatible: 142 71% 45%;
    --status-warning: 38 92% 50%;
    --status-incompatible: 0 84% 60%;
  }

  .dark {
    --canvas: 240 10% 4%;
    --surface-card: 240 10% 7%;
    --foreground: 0 0% 98%;
    --muted: 240 5% 65%;
    --hairline: 240 4% 16%;
    --primary: 217 91% 60%;
    --primary-foreground: 0 0% 100%;
    --status-compatible: 142 71% 45%;
    --status-warning: 38 92% 50%;
    --status-incompatible: 0 84% 60%;
  }
}
```

## Focused References

| Need | Read |
|---|---|
| Token layers and naming | `references/token-architecture.md` |
| Primitive values | `references/primitive-tokens.md` |
| Semantic aliases/themes | `references/semantic-tokens.md` |
| Component-level tokens | `references/component-tokens.md` |
| Component state specifications | `references/states-and-variants.md` |
| Tailwind integration | `references/tailwind-integration.md` |

## Boundary

This skill owns primitive, semantic, and component tokens in `fe/src/styles.css`. UX behavior and accessibility outcomes belong to `.agents/skills/ui-ux-pro-max/rules/web-rules.md`; component implementation belongs to `ui-styling` and `styling`.
