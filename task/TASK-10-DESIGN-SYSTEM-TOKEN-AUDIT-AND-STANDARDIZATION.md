# Task: TASK-10 - Chuan Hoa Va Dong Bo Design System EL-TECH

- Feature: EL-TECH Design System Alignment
- Governing Spec: [design-system/el-tech/MASTER.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/design-system/el-tech/MASTER.md)
- Scope: frontend
- Status: Complete

## Objective

Kiem toan va chuan hoa toan bo he thong style, tokens, mau sac, border va corner radii tren toan bo ma nguon frontend Angular tai [fe/src/app](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app). Loai bo hoan toan hon 250 vi tri dang su dung class loi `border-border` khong ton tai trong Tailwind theme; thay the cac ma mau tuy tien (emerald, amber, slate, sky, red) bang cac design tokens chuan cua he thong NVIDIA Softened Geometry; dam bao typography scale va tabular-nums cho moi khoi hien thi gia ca, thong so ky thuat va ma SKU.

## Technical Context And Dependencies

- Pre-requisites: [design-system/el-tech/MASTER.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/design-system/el-tech/MASTER.md), [fe/src/styles.css](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/styles.css)
- Reusable Assets:
  - [fe/src/app/components/atoms/button/button.directive.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms/button/button.directive.ts)
  - [fe/src/app/components/atoms/badge/badge.directive.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms/badge/badge.directive.ts)
  - [fe/src/app/components/atoms/input/input.directive.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms/input/input.directive.ts)
  - [fe/src/app/lib/cn.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/lib/cn.ts)
- Target Files:
  - `fe/src/styles.css`
  - `fe/src/app/components/atoms/button/button.directive.ts`
  - `fe/src/app/components/atoms/badge/badge.directive.ts`
  - `fe/src/app/components/atoms/input/input.directive.ts`
  - `fe/src/app/features/storefront/storefront-home.component.ts`
  - `fe/src/app/features/storefront/storefront-shell.component.html`
  - `fe/src/app/features/catalog/catalog-page.component.ts`
  - `fe/src/app/features/catalog/product-detail-page.component.ts`
  - `fe/src/app/features/catalog/review-modal.component.ts`
  - `fe/src/app/features/cart/cart-drawer.component.html`
  - `fe/src/app/features/pc-build/custom-build-page.component.ts`
  - `fe/src/app/features/pc-build/component-swap-modal.component.ts`
  - `fe/src/app/features/checkout/checkout-page.component.ts`
  - `fe/src/app/features/checkout/order-success-page.component.ts`
  - `fe/src/app/features/orders/order-kanban-page.component.ts`
  - `fe/src/app/features/orders/order-lookup-page.component.ts`
  - `fe/src/app/features/refund/refund-page.component.ts`
  - `fe/src/app/features/auth/auth-modal.component.ts`
  - `fe/src/app/features/profile/profile-page.component.ts`

## Checklist

- [x] Cap nhat va dong bo token trong [fe/src/styles.css](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/styles.css):
  - Bo sung `--color-line-dark: var(--line-dark);` va `--color-foreground-dark: var(--foreground-dark);` vao block `@theme`.
  - Khai bao bien `--line-dark: #272f3d;` va `--foreground-dark: #ffffff;` trong `:root`.
  - Khai bao alias `--color-border: var(--line);` hoac cap nhat triet de de phong ngua xung dot class.
- [x] Chuan hoa cac Atomic Directives tai [fe/src/app/components/atoms](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms):
  - ButtonDirective: Quy chuan ban kinh cong `rounded-md` (8px), variant mau `primary` (#76b900), `secondary` (surface-alt border-line), `outline`, `ghost`, `danger`, va chieu cao chuan (sm: 32px, md: 36px, lg: 40px). Loai bo `slate-200` va `red-700` tho cung.
  - BadgeDirective: Quy chuan ban kinh cong `rounded-sm` (4px), variant `primary`, `dark`, `muted`, `success`, `outline` theo dung bang token trong MASTER.md.
  - InputDirective: Chieu cao 36px (h-9), ban kinh `rounded-md` (8px), vien `border-line` va focus ring `ring-primary`.
- [x] Thay the toan dien class `border-border` tren toan bo cac component:
  - Cac be mat sang: Chuyen thanh `border-line` hoac `border-line-strong` (doi voi input/khung tuong tac).
  - Cac be mat toi (Dark surface / elevated): Chuyen thanh `border-line-dark` hoac `border-line-dark/60`.
- [x] Chuan hoa mau sac theo token EL-TECH NVIDIA Palette:
  - Thay the `text-emerald-400` / `bg-emerald-500` bang `text-primary` / `bg-primary` hoac `text-success`.
  - Thay the `text-amber-400` / `bg-amber-500` bang `text-warning` hoac `text-primary`.
  - Thay the `bg-slate-900` / `bg-slate-950` bang `bg-surface-dark` va `bg-surface-elevated`.
  - Thay the `bg-slate-800` bang `bg-line-dark` hoac `bg-surface-elevated`.
  - Thay the `text-slate-400` / `text-slate-300` bang `text-muted` hoac `text-foreground-dark/70`.
- [x] Chuan hoa ban kinh cong (Corner Radii Softened Geometry):
  - Badge, tag, chip: `rounded-sm` (4px).
  - Nut bam, o nhap lieu, dropdown: `rounded-md` (8px).
  - The card linh kien, bang thong so, filter panel: `rounded-lg` (12px).
  - Modal lon, hero container: `rounded-xl` (16px).
- [x] Dong nhat Typography va Tabular-nums:
  - Ap dung class `tabular` cho tat ca cac truong gia tien VND, ma SKU, so luong, dung luong, cong suat TDP.
  - Chuan hoa cap do tieu de theo dung bang scale (display 32px, heading-xl 24px, heading-lg 20px, heading-md 16px, body-md 14px, body-sm 12px, caption 11px uppercase).

## Acceptance Criteria

- Criterion 1: Khong con bat ky file nao trong frontend su dung class `border-border`, toan bo vien su dung `border-line`, `border-line-strong` hoac `border-line-dark`.
- Criterion 2: Toan bo cac thanh phan giao dien tu app shell den cac trang con tuan thu nhat quan bang mau EL-TECH: mau chu dao NVIDIA Green (#76b900), be mat surface sang va dark tech accents, he thong goc bo tron mem mai theo Master Spec.
- Criterion 3: Cac directive button, badge, input hoat dong on dinh, dung ty le kich thuoc va khong bi pha vo boi class inline ghi de tuy tien.
- Criterion 4: Cac gia tri tien te, thong so ky thuat va ma don deu duoc dinh dang voi `tabular` giup dong hang cot so deu dan.

## Verification Commands

- Command 1: npm run check:fe
