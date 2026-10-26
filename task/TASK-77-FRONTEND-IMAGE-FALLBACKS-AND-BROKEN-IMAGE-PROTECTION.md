# Task: TASK-77 - Bo Sung Co Che Fallback Placeholder Va Xu Ly Loi Cho Toan Bo The Anh

- Feature: Image Fallbacks & Broken Image Protection
- Governing Spec: [report/frontend_impeccable_polish_report.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/report/frontend_impeccable_polish_report.md) (Nhom 2), [design-system/el-tech/MASTER.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/design-system/el-tech/MASTER.md)
- Scope: frontend
- Priority: P1 (High)
- Status: Complete

## Traceability & Graph Links

- Task Type: `ui-ux-polish`
- Issue References: Polish Audit Group 2 (Broken Image Protection)
- Related Tasks:
  - [[TASK-72-ADMIN-INVENTORY-TABLES-AND-TRANSFERS]]
  - [[TASK-74-ADMIN-CATALOG-AND-PC-BUNDLES-UI]]

## Objective

Xu ly triet de 12 vi tri the `<img>` trong phan he Quan Tri dang co nguy co hien thi hop anh vo (broken image box) khi duong dan hinh anh bi null, undefined, rong hoac 404:
1. Thiet lap xu ly su kien `(error)="onImageError($event)"` tren moi the anh de tu dong thay the bang asset placeholder hop le `/images/products/placeholder.webp` hoac render container icon `<lucide-icon name="image" class="size-5 text-muted" />`.
2. Dam bao moi the `<img>` deu co thuoc tinh `[alt]` mang noi dung y nghia ro rang, khong de chuoi rong.
3. Kiem tra va giu nguyen ti le khung hinh (`aspect-square`, `object-contain`), tranh gay ra hien tuong giat layout (Cumulative Layout Shift - CLS).

## Technical Context And Dependencies

- Pre-requisites: Hoan tat cac task quan tri danh muc va kho hang
- Reusable Assets:
  - Asset placeholder: `public/images/products/placeholder.webp`
  - Pipe hinh anh (neu dung): `productImage` pipe tai `fe/src/app/shared`
- Target Files:
  - `fe/src/app/features/admin/orders/components/order-lines-pc-group.component.ts` (dong 63, 151)
  - `fe/src/app/features/admin/pc-bundles/admin-pc-bundles-page.component.ts` (dong 246, 372)
  - `fe/src/app/features/admin/procurement/admin-purchase-order-detail-page.component.ts` (dong 496)
  - `fe/src/app/features/admin/templates/admin-product-template-detail-page.component.ts` (dong 200, 457)
  - `fe/src/app/features/admin/templates/admin-product-templates-page.component.ts` (dong 202, 288)
  - `fe/src/app/features/admin/variants/admin-variants-page.component.ts` (dong 272, 542)
  - `fe/src/app/features/admin/inventory/admin-transfers-page.component.ts` (dong 237)

## Checklist

- [x] Bo sung co che fallback va xu ly loi cho the anh trong `order-lines-pc-group.component.ts`.
- [x] Bo sung co che fallback cho the anh bundle va xem truoc trong `admin-pc-bundles-page.component.ts`.
- [x] Bo sung co che fallback cho the anh san pham nhap kho trong `admin-purchase-order-detail-page.component.ts`.
- [x] Bo sung co che fallback cho the anh dai dien template trong `admin-product-template-detail-page.component.ts` va `admin-product-templates-page.component.ts`.
- [x] Bo sung co che fallback cho the anh bien the SKU va hop thoai preview trong `admin-variants-page.component.ts`.
- [x] Bo sung co che fallback cho the anh san pham chuyen kho trong `admin-transfers-page.component.ts`.
- [x] Chay kiem tra `node .agents/skills/impeccable/scripts/detect.mjs --json fe` dam bao canh bao `broken-image` giam ve 0.
- [x] Chay kiem tra `npm run check:fe` voi exit code 0.

## Review And Verification Log

- Dual-Pass Review:
  - Pass A (Functional): Toan bo 12 vi tri the img trong phan he quan tri da duoc gan src fallback `/images/products/placeholder.webp`, binding du phong `[src]="... || '/images/products/placeholder.webp'"`, su kien `(error)="onImageError($event)"` va thuoc tinh alt mo ta ro rang. Khong con nguy co hien thi hop anh vo khi duong dan bi null hoac 404.
  - Pass B (Convention): Tuan thu Angular OnPush, standalone components, khong dung ky tu emoji hay icon cam, khong dung chuoi comment danh so thu tu.
- Verification Gates:
  - `node .agents/skills/impeccable/scripts/detect.mjs --json fe`: 0 broken-image warnings (giam tu 12 xuong 0).
  - `npm run check:fe`: Exit code 0.
  - `npm run check:be`: Exit code 0.
