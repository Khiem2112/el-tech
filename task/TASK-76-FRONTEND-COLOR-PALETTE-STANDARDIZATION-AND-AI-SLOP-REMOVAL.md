# Task: TASK-76 - Chuan Hoa Bang Mau NVIDIA Design System Va Loai Bo Vet Tich Mau Sinh Boi AI

- Feature: Color Palette Standardization & AI Slop Removal
- Governing Spec: [report/frontend_impeccable_polish_report.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/report/frontend_impeccable_polish_report.md) (Nhom 1), [design-system/el-tech/MASTER.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/design-system/el-tech/MASTER.md)
- Scope: frontend
- Priority: P1 (High)
- Status: Complete

## Traceability & Graph Links

- Task Type: `ui-ux-polish`
- Issue References: Polish Audit Group 1 (AI Color Palette)
- Related Tasks:
  - [[TASK-71-ADMIN-SHELL-LIGHT-THEME-AND-CLEANUP]]
  - [[TASK-73-ADMIN-ORDERS-OPERATIONS-AND-MODALS]]
  - [[TASK-75-ADMIN-PROMOTIONS-PAYMENTS-AND-CUSTOMERS]]

## Objective

Chuan hoa toan bo cac gam mau bat thuong (purple, indigo, cyan) dang ton tai rai rac trong phan he Quan Tri, dua ve 100% bang mau NVIDIA Signature duoc quy dinh trong [MASTER.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/design-system/el-tech/MASTER.md):
1. Hop thoai [resolve-hold-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/components/modals/resolve-hold-dialog.component.ts): Thay the `text-purple-600 dark:text-purple-400`, `bg-purple-500/10`, `border-purple-500/30` bang token canh bao chuan `text-warning`, `bg-warning/10`, `border-warning/30`.
2. Hop thoai [assemble-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/components/modals/assemble-dialog.component.ts) va thanh tien do [order-status-bar.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/components/order-status-bar.component.ts): Chuyen trang thai dang lap rap tu mau tim sang token ky thuat `bg-surface-elevated text-primary border-line`.
3. Trang khach hang [admin-customer-detail-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/customers/admin-customer-detail-page.component.ts) va [admin-customers-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/customers/admin-customers-page.component.ts): Thay the mau xanh lo `cyan-500` cho khach vang lai bang token trung tinh `bg-surface-alt text-muted border-line`.
4. Trang so cai kho [admin-stock-ledger-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/inventory/admin-stock-ledger-page.component.ts) va sheet chi tiet [stock-ledger-sheet.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/inventory/components/stock-ledger-sheet.component.ts): Thay the lop mau `text-indigo-700`, `text-purple-700` bang token thuoc tinh chuan `text-foreground`, `text-muted`.
5. Trang quan ly so seri [admin-serials-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/serials/admin-serials-page.component.ts) va bieu do trang thai [order-status-distribution.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/dashboard/components/order-status-distribution.component.ts): Thay the triet de cac chi so mau tim ngoai he thong.

## Technical Context And Dependencies

- Pre-requisites: Hoan tat cac task nghiep vu goc
- Reusable Assets:
  - Token CSS: `var(--warning)`, `var(--primary)`, `var(--surface-dark)`, `var(--surface-alt)`, `var(--line)` trong [fe/src/styles.css](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/styles.css)
- Target Files:
  - `fe/src/app/features/admin/orders/components/modals/resolve-hold-dialog.component.ts`
  - `fe/src/app/features/admin/orders/components/modals/assemble-dialog.component.ts`
  - `fe/src/app/features/admin/orders/components/order-status-bar.component.ts`
  - `fe/src/app/features/admin/orders/admin-order-detail-page.component.ts`
  - `fe/src/app/features/admin/orders/admin-orders-page.component.ts`
  - `fe/src/app/features/admin/customers/admin-customers-page.component.ts`
  - `fe/src/app/features/admin/customers/admin-customer-detail-page.component.ts`
  - `fe/src/app/features/admin/inventory/admin-stock-ledger-page.component.ts`
  - `fe/src/app/features/admin/inventory/components/stock-ledger-sheet.component.ts`
  - `fe/src/app/features/admin/serials/admin-serials-page.component.ts`
  - `fe/src/app/features/admin/serials/components/serial-detail-dialog.component.ts`
  - `fe/src/app/features/admin/dashboard/components/order-status-distribution.component.ts`

## Checklist

- [x] Thay the toan bo cac lop `text-purple-*`, `bg-purple-*`, `border-purple-*` trong `resolve-hold-dialog.component.ts` sang token `warning`.
- [x] Chuyen huy hieu lap rap trong `assemble-dialog.component.ts` va `order-status-bar.component.ts` ve token dong nhat voi he thong trang thai don hang.
- [x] Chuyen huy hieu khach vang lai trong `admin-customers-page.component.ts` va `admin-customer-detail-page.component.ts` tu cyan sang `bg-surface-alt text-muted border-line`.
- [x] Chuan hoa tag loai giao dich kho trong `admin-stock-ledger-page.component.ts` va `stock-ledger-sheet.component.ts`.
- [x] Chuan hoa mau sac the trang thai so seri trong `admin-serials-page.component.ts`.
- [x] Chay kiem tra tu dong `node .agents/skills/impeccable/scripts/detect.mjs --json fe` dam bao phat hien `ai-color-palette` giam ve 0.
- [x] Chay kiem tra `npm run check:fe` vuot qua toan bo kieu va cu phap voi exit code 0.
