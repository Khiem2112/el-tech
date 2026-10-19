# Ke Hoach Trien Khai Toi Uu Luong Tuong Tac Khach Hang

Tai lieu nay xac dinh lo trinh va danh sach cac task ky thuat de chuyen hoa toan bo cac mau giao dien trong [ui-templates/store-front](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front) vao ma nguon Angular tai [fe/src/app](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app).

## 1. Tong Quan Kien Truc Luong Tuong Tac (Customer Journey)

He thong luong khach hang duoc chia thanh 9 cum tinh nang tuong ung voi 9 task thuc thi:

1. Task 01: Global App Shell, Telemetry Bar, Header Navigation va Footer ([TASK-01-SHELL-AND-TELEMETRY-HEADER.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/task/TASK-01-SHELL-AND-TELEMETRY-HEADER.md))
2. Task 02: Quick Cart Slide-Over Drawer va Cart Breakdown ([TASK-02-SLIDE-OVER-CART-DRAWER.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/task/TASK-02-SLIDE-OVER-CART-DRAWER.md))
3. Task 03: Catalog Faceted Filterbar va Hardware Listing Grid ([TASK-03-CATALOG-FILTERBAR-AND-GRID.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/task/TASK-03-CATALOG-FILTERBAR-AND-GRID.md))
4. Task 04: Product Detail Page (PDP), Specs Matrix va Verified Review Modal ([TASK-04-PRODUCT-DETAIL-AND-REVIEWS.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/task/TASK-04-PRODUCT-DETAIL-AND-REVIEWS.md))
5. Task 05: PC Builder Diagnostics, Wattage Bar va Component Swap Modal ([TASK-05-PC-BUILDER-COMPATIBILITY-AND-SWAP.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/task/TASK-05-PC-BUILDER-COMPATIBILITY-AND-SWAP.md))
6. Task 06: Multi-Step Checkout va Dedicated Order Success Receipt ([TASK-06-CHECKOUT-AND-ORDER-SUCCESS.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/task/TASK-06-CHECKOUT-AND-ORDER-SUCCESS.md))
7. Task 07: Order Tracking 5-Stage Pipeline, Kanban Board va Order Cancellation ([TASK-07-ORDER-TRACKING-KANBAN-AND-CANCEL.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/task/TASK-07-ORDER-TRACKING-KANBAN-AND-CANCEL.md))
8. Task 08: Warranty Policy Hub va Interactive RMA Ticket Submission ([TASK-08-WARRANTY-RMA-AND-RETURN-FLOW.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/task/TASK-08-WARRANTY-RMA-AND-RETURN-FLOW.md))
9. Task 09: Customer Authentication Modal va Profile Account Center ([TASK-09-AUTH-MODAL-AND-CUSTOMER-PROFILE.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/task/TASK-09-AUTH-MODAL-AND-CUSTOMER-PROFILE.md))

## 2. Bang Anh Xa Template Sang Source Code FE

| Task ID | UI Template Nguon | Component & File Dich Trong FE | Trang Thai |
| :--- | :--- | :--- | :--- |
| TASK-01 | `header.html`, `footer.html`, `index.html` | `features/storefront/storefront-shell.component.*`, `styles.css` | Complete |
| TASK-02 | `cart.html` | `features/cart/cart-drawer.component.*`, `services/cart.service.ts` | Complete |
| TASK-03 | `product-list.html`, `filterbar.html`, `catalog-filter.js` | `features/catalog/catalog-page.component.ts`, `catalog.service.ts` | Complete |
| TASK-04 | `product-detail.html`, `user-review-form.html` | `features/catalog/product-detail-page.component.ts`, `review-modal.component.ts` | Complete |
| TASK-05 | `pc-build.html`, `change-component.html` | `features/pc-build/custom-build-page.component.ts`, `component-swap-modal.component.ts` | Complete |
| TASK-06 | `checkout.html`, `order-success.html` | `features/checkout/checkout-page.component.ts`, `order-success-page.component.ts` | Complete |
| TASK-07 | `order-tracking.html`, `order-kanban-view.html`, `order-cancel.html` | `features/orders/order-lookup-page.component.ts`, `order-kanban-page.component.ts`, `order-cancel-modal.component.ts` | Complete |
| TASK-08 | `refund.html` | `features/refund/refund-page.component.ts` | Complete |
| TASK-09 | `auth.html`, `profile-page.html` | `features/auth/auth-modal.component.ts`, `features/profile/profile-page.component.ts` | Pending |

## 3. Quy Trinh Thuc Thi Va Kiem Thu Chat Che

Moi task phai tuan thu vong doi duoc quy dinh tai [.agents/skills/task-runner/SKILL.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/.agents/skills/task-runner/SKILL.md):

1. Giai doan 1: Doc ky template HTML tuong ung tai [ui-templates/store-front](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front) va kiem tra reusable assets tai [fe/src/app/components/atoms](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms).
2. Giai doan 2: Trien khai code tuan thu chat che cac nguyen tac:
   - Standalone Angular components, OnPush change detection.
   - Lucide Angular icons thay the cho ky tu ASCII va icon thu cong.
   - Reactive Forms + Zod validation, khong dung danh so thu tu comment (`// 1.`, `// Step 1`).
   - Khong su dung emoji hoac icon trang tri trong code/comments/log.
3. Giai doan 3: Chay kiem thu tu dong truoc khi hoan thanh:
   - `npm run check:fe` tu thu muc goc phai dat exit code 0.
   - Khong co bat ky loi typecheck (tsc) hoac lint error nao.
