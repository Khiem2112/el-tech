# Task: TASK-12 - Tich Hop API Backend Va Loai Bo Mock Data Tren Frontend

- Feature: Live Data Integration & Mock Data Elimination
- Governing Spec: [plan/03-catalog-and-pc-shopping.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/plan/03-catalog-and-pc-shopping.md), [plan/05-orders-account-reviews.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/plan/05-orders-account-reviews.md)
- Scope: shared
- Status: Complete

## Objective

Mo rong cac endpoint API tren backend Node.js tai [be/src](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src) de cung cap du lieu that tu PostgreSQL cho cac man hinh dang su dung du lieu mock: PC Builder (`custom-build-page`), Banh dieu phoi tien do Kanban (`order-kanban-page`), Trang tai khoan khach hang (`profile-page`). Ket noi cac Angular Services tren frontend de goi API that, loai bo triet de cac hang so mock data khoi ma nguon va xoa bo file du lieu cu [fe/src/app/data/product.data.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/data/product.data.ts).

## Technical Context And Dependencies

- Pre-requisites: TASK-11 (Du lieu mau PC bundles, Orders, Reviews, Users da duoc seed vao PostgreSQL)
- Reusable Assets:
  - [be/src/services/pc-build.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/pc-build.service.ts)
  - [be/src/services/order.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/order.service.ts)
  - [fe/src/app/core/api/api-client.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/core/api/api-client.service.ts)
  - [fe/src/app/features/catalog/catalog.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/catalog/catalog.service.ts)
- Target Files:
  - `be/src/routes/pc-build.routes.ts`
  - `be/src/routes/order.routes.ts`
  - `be/src/index.ts`
  - `be/src/services/pc-build.service.ts`
  - `fe/src/app/services/pc-build.service.ts`
  - `fe/src/app/features/pc-build/custom-build-page.component.ts`
  - `fe/src/app/features/orders/order-kanban-page.component.ts`
  - `fe/src/app/features/profile/profile-page.component.ts`
  - `fe/src/app/core/auth/auth.service.ts`
  - `fe/src/app/data/product.data.ts` (xoa bo)

## Checklist

- [x] Mo rong va dang ky cac API routes backend:
  - Xay dung `be/src/routes/pc-build.routes.ts` va mount vao `/v1/pc-build` trong `be/src/index.ts`:
    - `GET /v1/pc-build/bundles`: Tra ve danh sach cac bo PC dong san kem chi tiet BOM items.
    - `GET /v1/pc-build/components`: Tra ve danh sach linh kien theo tung category (cpu, mainboard, ram, ssd, vga, psu, cooling, case) kem thong so tuong thich (socket, tdp, memoryType, lengthMm).
  - Bo sung route `GET /v1/orders/kanban` trong `order.routes.ts` de tra ve danh sach don hang duoc dinh dang cho 5 cot tien do (pending, preparing, assembling, ready, completed).
  - Bo sung route `GET /v1/orders/customer` de tra ve danh sach don hang cua khach hang hien tai.
- [x] Xay dung `PcBuildService` tren frontend [fe/src/app/services/pc-build.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/services/pc-build.service.ts):
  - Phuong thuc `getBundles()` goi `/v1/pc-build/bundles`.
  - Phuong thuc `getComponentsByCategory(category: string)` goi `/v1/pc-build/components?category=...`.
- [x] Refactor [fe/src/app/features/pc-build/custom-build-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/pc-build/custom-build-page.component.ts):
  - Xoa bo hang so mock data `HARDWARE_CATALOG` 25 phan tu.
  - Tich hop inject `PcBuildService` va load du lieu linh kien tu API backend khi component khoi tao.
  - Chuc nang doi mau preset (`togglePreset`) lay truc tiep tu cac `PcBundle` thuc te trong CSDL.
  - Modal chon linh kien thay the (`ComponentSwapModalComponent`) su dung danh sach linh kien thuc te.
- [x] Refactor [fe/src/app/features/orders/order-kanban-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/orders/order-kanban-page.component.ts):
  - Xoa bo hang so mock data `INITIAL_KANBAN_ORDERS`.
  - Ket noi API de lay danh sach don hang thuc te tu CSDL qua backend.
  - Ho tro loc thoi gian thuc theo loai don va chi nhanh dua tren du lieu that.
- [x] Refactor [fe/src/app/features/profile/profile-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/profile/profile-page.component.ts):
  - Ket noi de hien thi thong tin don hang moi nhat cua khach hang that tu CSDL (ma don, ma OTP nhan may, tong tien).
  - Hien thi chi so linh kien va thong tin dia chi tu tai khoan khach hang.
- [x] Don dep va loai bo code thua:
  - Xoa bo file [fe/src/app/data/product.data.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/data/product.data.ts) da loi thoi.
  - Kiem tra toan bo du an dam bao khong con bat ky file nao import hoac tham chieu toi du lieu mock cu.

## Acceptance Criteria

- Criterion 1: Toan bo cac man hinh PC Builder, Kanban Board va Profile Page hoat dong binh thuong bang cach truy van du lieu tu API backend, khong co loi network hoac runtime crash.
- Criterion 2: Man hinh PC Builder load dung linh kien va bundle da duoc seed trong CSDL, cac thong so cong suat nguon va socket check van tinh toan chinh xac theo thoi gian thuc.
- Criterion 3: File `fe/src/app/data/product.data.ts` duoc xoa sach khoi git tree, khong con bat ky import loi nao.
- Criterion 4: Ca 2 lenh kiem tra `npm run check:fe` va `npm run check:be` deu vuot qua voi exit code 0.

## Verification Commands

- Command 1: npm run check:be
- Command 2: npm run check:fe
