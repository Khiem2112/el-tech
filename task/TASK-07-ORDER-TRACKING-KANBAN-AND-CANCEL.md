# Task: TASK-07 - Order Tracking 5-Stage Pipeline, Kanban Board va Order Cancellation

- Feature: Order Lifecycle & Post-Purchase Operations
- Governing Spec: [docs/order-tracking-and-aftercare/flows/v1.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/docs/order-tracking-and-aftercare/flows/v1.md)
- Scope: frontend
- Status: Complete

## Objective

Nang cap toan dien tinh nang tra cuu va giam sat don hang tai [fe/src/app/features/orders/order-lookup-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/orders/order-lookup-page.component.ts), bo sung man hinh Kanban theo doi tien do [ui-templates/store-front/order-kanban-view.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/order-kanban-view.html) va modal huy don tu phuc vu (Self-Service Cancellation) theo [ui-templates/store-front/order-cancel.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/order-cancel.html).

## Technical Context And Dependencies

- Pre-requisites: TASK-06 (Order creation and codes)
- Reusable Assets:
  - [fe/src/app/core/api/api-client.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/core/api/api-client.service.ts)
  - [fe/src/app/components/atoms](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms)
  - [fe/src/app/lib/vnd.pipe.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/lib/vnd.pipe.ts)
  - [fe/src/app/lib/product-image.pipe.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/lib/product-image.pipe.ts)
- Target Files:
  - `fe/src/app/features/orders/order-lookup-page.component.ts`
  - `fe/src/app/features/orders/order-kanban-page.component.ts`
  - `fe/src/app/features/orders/order-cancel-modal.component.ts`
  - `fe/src/app/features/storefront/storefront.routes.ts`

## Checklist

- [x] Hoan thien thanh tien trinh 5 buoc (5-Stage Visual Stepper) tren trang Tra cuu don hang:
  - Buoc 1: Da xac nhan don (CONFIRMED)
  - Buoc 2: Chuan bi linh kien (PREPARING_COMPONENTS)
  - Buoc 3: Lap rap & Ky thuat test stress (ASSEMBLING)
  - Buoc 4: San sang / Nhan tai Hub (READY_FOR_PICKUP)
  - Buoc 5: Hoan tat don hang (COMPLETED)
- [x] Tich hop day du thong tin telemetry: Thoi diem tao don, ky thuat vien phu trach, ma OTP nhan hang tai quay va nut in bien nhan / hoa don VAT
- [x] Xay dung `OrderKanbanPageComponent` tai route `/tien-do-don` theo template `order-kanban-view.html`:
  - 5 cot trang thai tuong ung voi vong doi don hang
  - Thanh bo loc nhanh: Tim theo ma don hang, loc theo loai don (PC Custom Build, Linh kien roi, Workstation) va loc theo chi nhanh
  - Card don hang the hien: Ma don, thoi gian, thumbnail he thong, gia tri tong, dong ho dem nguoc thoi gian giu hang
- [x] Xay dung `OrderCancelModalComponent` doc lap theo template `order-cancel.html`:
  - Kiem tra dieu kien huy don hop le (don hang o trang thai PENDING_PAYMENT hoac CONFIRMED truoc khi xé seal linh kien)
  - Dropdown lua chon ly do huy don (Doi y muon doi cau hinh, Tim thay noi khac, Thay doi dia chi...)
  - Khung nhap thong tin tai khoan ngan hang nhan hoan tien (Ten ngan hang, So tai khoan, Ten chu tai khoan)
  - Cam ket hoan tien 100% khong mat phi giao dich trong 24h lam viec
  - Xac nhan huy don va cap nhat trang thai don hang thoi gian thuc

## Acceptance Criteria

- Criterion 1: Khi tra cuu dung ma don va so dien thoai, toan bo tien trinh 5 buoc va lich su timeline xu ly phai duoc hien thi chi tiet.
- Criterion 2: Nut "Huy don hang" chi duoc phep hien thi va thao tac khi don hang thoa man dieu kien duoc quy dinh trong chinh sach.
- Criterion 3: Khi huy don thanh cong, modal tu dong dong lai, trang thai don hang cap nhat sang CANCELLED va hien thi thong tin tiep nhan hoan tien.
- Criterion 4: Giao dien Kanban board phai co thanh cuon ngang muot ma tren man hinh hep va responsive tot.

## Verification Commands

- Command 1: npm run check:fe
