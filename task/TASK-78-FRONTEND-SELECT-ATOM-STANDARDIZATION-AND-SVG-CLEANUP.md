# Task: TASK-78 - Chuan Hoa Dropdown Sang Atom app-select Va Thay The The SVG Tho Bang Lucide Icon

- Feature: Form Select Atoms & Lucide Iconography
- Governing Spec: [report/frontend_impeccable_polish_report.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/report/frontend_impeccable_polish_report.md) (Nhom 3), [design-system/el-tech/MASTER.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/design-system/el-tech/MASTER.md), [.agents/skills/iconography/SKILL.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/.agents/skills/iconography/SKILL.md)
- Scope: frontend
- Priority: P1 (High)
- Status: Complete

## Traceability & Graph Links

- Task Type: `ui-ux-polish`
- Issue References: Polish Audit Group 3 (Raw Select & Inline SVG Bloat)
- Related Tasks:
  - [[TASK-18-SPARTAN-COMBOBOX-AND-CATALOG-SELECTION]]
  - [[TASK-72-ADMIN-INVENTORY-TABLES-AND-TRANSFERS]]
  - [[TASK-75-ADMIN-PROMOTIONS-PAYMENTS-AND-CUSTOMERS]]

## Objective

1. Thay the toan bo the `<select>` HTML tho tai 15 tep giao dien sang component nguyen tu `app-select` (`SelectComponent`) hoac chi thi `hlmSelect` tu Spartan UI:
   - Ap dung border bo goc 8px (`--radius-md: 8px`), hieu ung hover/focus voi ring mau xanh NVIDIA `primary`.
   - Dam bao icon mui ten chevron xo xuong dong nhat, khong bi lech kieu tren he dieu hanh Windows, macOS hoac thiet bi di dong.
2. Thay the cac the `<svg>` nhung truc tiep trong template bang `<lucide-icon name="..." class="..." />` tu thu vien `lucide-angular`:
   - Giam kich thuoc bundle va loai bo su phan manh cua cac ma SVG path tho.
   - Thiet lap day du thuoc tinh tiep can `aria-label` hoac `title` cho toan bo cac nut chi chua icon (icon-only buttons), giai quyet loi tiep can tren trinh doc man hinh.

## Technical Context And Dependencies

- Pre-requisites: Reusable select component tai `fe/src/app/components/atoms/select/select.component.ts`
- Reusable Assets:
  - `SelectComponent`, `SelectOption`
  - `lucide-angular` icons
- Target Files:
  - `fe/src/app/features/catalog/catalog-page.component.ts`
  - `fe/src/app/features/pc-build/custom-build-page.component.ts`
  - `fe/src/app/features/orders/order-cancel-modal.component.ts`
  - `fe/src/app/features/orders/order-kanban-page.component.ts`
  - `fe/src/app/features/orders/order-lookup-page.component.ts`
  - `fe/src/app/features/refund/refund-page.component.ts`
  - `fe/src/app/features/admin/branches/admin-branches-page.component.ts`
  - `fe/src/app/features/admin/dashboard/admin-dashboard-page.component.ts`
  - `fe/src/app/features/admin/categories/components/spec-schema-sheet.component.ts`
  - `fe/src/app/features/admin/orders/components/modals/delivery-failed-dialog.component.ts`
  - `fe/src/app/features/admin/procurement/admin-purchase-order-detail-page.component.ts`
  - `fe/src/app/features/admin/procurement/components/create-supplier-return-dialog.component.ts`
  - `fe/src/app/features/admin/reviews/admin-reviews-page.component.ts`
  - `fe/src/app/features/admin/notifications/admin-notification-outbox-page.component.ts`
  - `fe/src/app/features/admin/templates/components/dynamic-spec-renderer.component.ts`

## Checklist

- [x] Thay the the select sap xep va phan trang trong `catalog-page.component.ts` sang `app-select`.
- [x] Thay the the select chi nhanh trong `custom-build-page.component.ts` sang `app-select`.
- [x] Thay the the select ly do huy don trong `order-cancel-modal.component.ts` sang `app-select`.
- [x] Thay the the select danh gia va loc trong `order-lookup-page.component.ts` va `order-kanban-page.component.ts`.
- [x] Thay the the select ly do tra hang trong `refund-page.component.ts`.
- [x] Thay the the select trong cac man hinh va modal quan tri con lai (branches, dashboard, schema, delivery-failed, PO detail, returns, reviews, notifications, dynamic-spec).
- [x] Thay the the svg inline tho sang `lucide-icon` va bo sung `aria-label`/`title` cho cac nut thao tac icon-only.
- [x] Chay kiem tra `npm run check:fe` voi exit code 0.

## Review & Verification Log

- Automated Check: `npm run check:fe` exited with code 0.
- Automated Check: `npm run check:be` exited with code 0.
- Pass A (Functional): All dropdowns and select interactions now leverage `SelectComponent` (`app-select`) with ergonomic border radius, NVIDIA primary highlight, and consistent cross-platform chevrons. All inline SVGs in target files have been converted to `lucide-icon` with accessible `aria-label` or `title` attributes on icon-only buttons.
- Pass B (Convention): No emojis or icons used in code, comments, or documentation. No sequential numbered comments. Strict TypeScript, OnPush change detection, standalone components, and full type safety preserved.
- Verdict: PASS
