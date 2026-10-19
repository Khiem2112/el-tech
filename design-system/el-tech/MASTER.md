# EL-TECH Design System Master Specification

## 1. Overview and Direction

- Basis: NVIDIA Design System (adapted from awesome-design-md) with softened edges.
- Objective: Provide an engineering-grade, high-density, technical aesthetic for PC component e-commerce and custom PC building.
- Key Characteristics:
  - High-contrast visual hierarchy: Clean crisp canvas paired with dark tech accents and deep surfaces.
  - Accent color: Distinctive NVIDIA Green (`#76b900`) for primary actions, active indicators, and highlight markers.
  - Softened edges: Replaced rigid 0px/2px corners with ergonomic, modern radii (`4px` for chips, `8px` for buttons/inputs, `12px` for cards).
  - High information density: Balanced compact padding to showcase PC specs without excessive empty space.
  - Strict typography scale: Single primary font family with unified sizes (Body: 14px, Header: 24px/32px).
  - Icon-first action design: Compact icon buttons with accessible names instead of verbose text buttons.

---

## 2. Design Tokens

### Color Palette

- Primary Accent:
  - `primary`: `#76b900` (NVIDIA Signature Green)
  - `primary-strong`: `#5a8d00` (Active and hover state)
  - `primary-pale`: `#88d400` (Muted accent, active border)
  - `primary-foreground`: `#090d16` (Deep black text on primary background for maximum contrast)
- Canvas and Surfaces:
  - `canvas`: `#f8fafc` (Light technical background)
  - `surface`: `#ffffff` (Card and panel background)
  - `surface-alt`: `#f1f5f9` (Subtle toolbar and container background)
  - `surface-dark`: `#090d16` (Contrast headers and tech banners)
  - `surface-elevated`: `#161b26` (Dark elevated surfaces)
- Lines and Borders:
  - `line`: `#e2e8f0` (Standard hairline border)
  - `line-strong`: `#cbd5e1` (Input and interactive borders)
  - `line-dark`: `#272f3d` (Borders on dark surfaces)
- Text and Foreground:
  - `foreground`: `#090d16` (High-contrast charcoal black)
  - `muted`: `#64748b` (Secondary labels and descriptions)
  - `foreground-dark`: `#ffffff` (Text on dark surfaces)
- Functional Feedback:
  - `danger`: `#e52020`
  - `success`: `#76b900`
  - `warning`: `#df6500`

### Corner Radii (Softened Geometry)

- `radius-none`: `0px`
- `radius-xs`: `2px` (Corner accent notches)
- `radius-sm`: `4px` (Tags, status badges, small chips)
- `radius-md`: `8px` (Buttons, inputs, selects, dropdowns, tabs)
- `radius-lg`: `12px` (Product cards, filter panels, dialogs)
- `radius-xl`: `16px` (Hero containers, large modals)
- `radius-full`: `9999px` (Pill badges, round icon buttons)

### Typography Scale

- Font Family:
  - Unified Primary UI: `Inter, ui-sans-serif, system-ui, -apple-system, sans-serif` (applied universally across all headers, navigation, labels, badges, buttons, cards, and body text).
  - Tabular Numerals: `font-variant-numeric: tabular-nums` (`tabular`) applied on the unified sans-serif font for prices, SKU, specs, and quantities to ensure aligned columnar numbers without fragmenting into monospace font.
- Scale:
  - `display`: `32px` / `2rem`, line-height `1.2`, font-weight `800`
  - `heading-xl`: `24px` / `1.5rem`, line-height `1.25`, font-weight `700`
  - `heading-lg`: `20px` / `1.25rem`, line-height `1.3`, font-weight `700`
  - `heading-md`: `16px` / `1rem`, line-height `1.4`, font-weight `600`
  - `body-md`: `14px` / `0.875rem`, line-height `1.5`, font-weight `400`
  - `body-sm`: `12px` / `0.75rem`, line-height `1.4`, font-weight `400`
  - `caption`: `11px` / `0.6875rem`, line-height `1.3`, font-weight `600`, uppercase

---

## 3. Component Architecture and Density Rules

- Shell and Filter:
  - Catalog sidebar filters must use sticky positioning (`sticky top-4 self-start`) so controls remain accessible during page scrolling.
  - Filter headers and collapse sections must use compact 12px-14px text.
- Action Buttons and Iconography:
  - Standard action buttons must be compact (height 36px-40px, padding 8px 16px).
  - Use Lucide icons (`lucide-angular`) with `aria-label` for common actions (Search, Clear, AddToCart, Filter, Chevron).
  - Avoid text-heavy labels such as "+ Thêm giỏ hàng này vào đơn"; use icon button or compact text "Thêm giỏ".
- Dropdowns and Selects:
  - Form select elements must have styled borders, custom chevrons, and consistent padding matching text inputs.
- Spacing Rhythm:
  - Container padding: 16px to 24px (avoiding 32px+ dead zones).
  - Grid gutters: 16px to 20px for product grids.
