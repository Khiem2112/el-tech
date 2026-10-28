# Task: TASK-79 - Tinh Chinh Chu So Co Cot Tabular, Cai Thien Do Tuong Phan Va Lam Muot Chuyen Dong

- Feature: Tabular Numerals, High-Contrast & Motion Polish
- Governing Spec: [report/frontend_impeccable_polish_report.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/report/frontend_impeccable_polish_report.md) (Nhom 4), [design-system/el-tech/MASTER.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/design-system/el-tech/MASTER.md)
- Scope: frontend
- Priority: P2 (Medium)
- Status: Complete

## Traceability & Graph Links

- Task Type: `ui-ux-polish`
- Issue References: Polish Audit Group 4 (Typography Alignment & Contrast)
- Related Tasks:
  - [[TASK-17-TYPOGRAPHY-AND-HEADER-DROPDOWN-CLEANUP]]
  - [[TASK-71-ADMIN-SHELL-LIGHT-THEME-AND-CLEANUP]]

## Objective

1. Tinh chinh can thang cot chu so (Tabular Numerals):
   - Bo sung lop `tabular` (`font-variant-numeric: tabular-nums`) cho toan bo cac vung hien thi so tien VND, gia tri giam gia, thong so ky thuat, ma SKU va so luong san pham trong bang bieu va the san pham.
   - Dam bao moi con so giu nguyen chieu rong dong nhat, khong gay xap xe hay rung lac layout khi so lieu cap nhat hoac cuon trang.
2. Khac phuc loi do tuong phan thi giac (Contrast):
   - Tai [admin-purchase-order-detail-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/procurement/admin-purchase-order-detail-page.component.ts) (dong 555), sua doi lop `text-slate-400` tren nen `bg-rose-950` thanh `text-muted hover:text-danger hover:bg-danger/10` de dat tieu chuan tuong phan WCAG AA >= 4.5:1.
3. Loai bo chuyen dong nhay giat (Bounce animation removal):
   - Thay the `animate-bounce-short` tai dong 601 cua `admin-purchase-order-detail-page.component.ts` bang hieu ung xuat hien mượt ma `transition-all duration-200 ease-out` voi exponential deceleration.

## Technical Context And Dependencies

- Pre-requisites: Lop `.tabular` da duoc khai bao san trong [fe/src/styles.css](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/styles.css)
- Target Files:
  - `fe/src/app/features/admin/procurement/admin-purchase-order-detail-page.component.ts`
  - `fe/src/app/features/admin/coupons/admin-coupons-page.component.ts`
  - `fe/src/app/features/admin/orders/admin-order-detail-page.component.ts`
  - `fe/src/app/features/admin/inventory/admin-inventory-balances-page.component.ts`
  - `fe/src/app/features/admin/inventory/admin-transfers-page.component.ts`
  - `fe/src/app/features/catalog/catalog-page.component.ts`
  - `fe/src/app/features/cart/cart-page.component.ts`
  - `fe/src/app/features/cart/cart-drawer.component.ts`
  - `fe/src/app/features/checkout/checkout-page.component.ts`

## Checklist

- [x] Gan lop `tabular` cho cac the span/p/td chua gia tien va so luong trong bang bieu admin (don hang, phieu nhap PO, ma giam gia, ton kho).
- [x] Gan lop `tabular` cho cac the gia tien ben Storefront (catalog, chi tiet san pham, gio hang, checkout).
- [x] Sua loi tuong phan chu xam tren nen do tai `admin-purchase-order-detail-page.component.ts`.
- [x] Thay the chuyen dong `animate-bounce-short` bang transition giam toc muot ma.
- [x] Chay kiem tra `node .agents/skills/impeccable/scripts/detect.mjs --json fe` dam bao cac canh bao `gray-on-color` va `bounce-easing` giam ve 0.
- [x] Chay kiem tra `npm run check:fe` voi exit code 0.

## Review & Verification Report

### Code Completion Summary

- Implemented tabular numerals across admin and storefront surfaces to ensure uniform glyph width and prevent layout shaking when numbers update.
- Fixed WCAG AA contrast ratio at delete line button in PO detail page (`text-muted hover:text-danger hover:bg-danger/10`).
- Replaced jittery `animate-bounce-short` toast animation with smooth deceleration `transition-all duration-200 ease-out`.
- Verified detect script output: zero `gray-on-color` and zero `bounce-easing` warnings in `fe/src`.
- Verification gates:
  - `npm run check:fe`: exit code 0 (TypeScript check, Angular build, ESLint).
  - `npm run check:be`: exit code 0 (TypeScript check, ESLint).

### Dual-Pass Code Review

- Pass A (Functional):
  - Tabular numerals properly applied to all monetary figures, discounts, specs, quantities, and SKU labels.
  - Interactive elements maintain high contrast meeting WCAG AA requirements.
  - Toast notifications appear smoothly without jarring bounce motions.
- Pass B (Convention):
  - Zero emojis or icons used in code, comments, or logs.
  - Zero numbered comment chains in code.
  - All Angular standalone component rules preserved.
- Verdict: PASS
