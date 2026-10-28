# Task: TASK-95 - Chuẩn Hóa Cỡ Chữ Normal Text 14px Và Loại Bỏ Monospace Phân Hệ Admin: Kho Hàng, Đơn Hàng Và Quản Trị Hệ Thống

- Feature: Admin Inventory, Orders & Governance Typography Standardization
- Governing Spec: [MASTER.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/design-system/el-tech/MASTER.md), [TASK-92-FOUNDATION-TYPOGRAPHY-TOKENS-AND-SHARED-COMPONENTS.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/task/TASK-92-FOUNDATION-TYPOGRAPHY-TOKENS-AND-SHARED-COMPONENTS.md)
- Scope: frontend
- Priority: P1 (High)
- Status: Complete

## Traceability & Graph Links

- Task Type: `ui-ux-refactor`
- Issue References: Hơn 180 vị trí trong bảng tồn kho, quét sê-ri barcode, phiếu chuyển kho, danh sách đơn hàng, chi tiết đơn hàng, 15 hộp thoại nghiệp vụ đơn hàng (assemble, ship, confirm, refund...), bảng khuyến mãi, mã coupon, phí vận chuyển và khách hàng đang sử dụng `font-mono`, nhiều nơi dùng cỡ chữ nhỏ 10px-12px cho thông tin quan trọng.
- Related Tasks:
  - [[TASK-36-ADMIN-ORDERS-PIPELINE-GROUPING-AND-ORDER-DETAIL-BUSINESS-LOGIC]]
  - [[TASK-49-ADMIN-INVENTORY-BALANCES-AND-IMMUTABLE-LEDGER]]
  - [[TASK-50-ADMIN-SERIAL-NUMBERS-AND-WARRANTY-LIFECYCLE]]
  - [[TASK-51-ADMIN-INTERNAL-TRANSFERS-MULTI-STEP-PIPELINE]]
  - [[TASK-53-ADMIN-ORDER-DETAIL-LAYOUT-FINANCE-AND-AUDIT]]
  - [[TASK-73-ADMIN-ORDERS-OPERATIONS-AND-MODALS]]
  - [[TASK-89-ADMIN-DISTILL-INVENTORY-TRANSFERS-AND-SERIALS]]
  - [[TASK-90-ADMIN-DISTILL-ORDERS-AND-FULFILLMENT-MODALS]]
  - [[TASK-91-ADMIN-DISTILL-PROMOTIONS-GOVERNANCE-AND-FEEDBACK]]
  - [[TASK-92-FOUNDATION-TYPOGRAPHY-TOKENS-AND-SHARED-COMPONENTS]]

## Objective

1. Loại bỏ toàn bộ việc sử dụng phông monospace (`font-mono`):
   - Thay thế toàn bộ class `font-mono` bằng phông sans-serif chuẩn trong toàn bộ phân hệ Quản lý kho, Mã sê-ri, Điều chuyển nội bộ, Chi nhánh, Đơn hàng & 15 Hộp thoại nghiệp vụ thực thi đơn, Khuyến mãi, Coupon, Phí vận chuyển, Khách hàng, Đánh giá và Thông báo.
   - Đối với các vị trí hiển thị mã đơn hàng `#ORD-...`, mã phiếu điều chuyển `#TRF-...`, số sê-ri linh kiện, số tiền thanh toán, tiền cọc, số điện thoại khách hàng, mã bưu vận: áp dụng lớp `tabular` (`font-variant-numeric: tabular-nums`) trên phông sans-serif chuẩn để đảm bảo căn lề thẳng hàng không bị lệch cột.

2. Chuẩn hóa cỡ chữ toàn bộ normal text lên mức 14px (`text-sm`):
   - Nâng toàn bộ bảng dữ liệu danh sách đơn hàng, chi tiết đơn hàng, bảng biến động tồn kho, danh sách sê-ri linh kiện lên chuẩn 14px (`text-sm`).
   - Chuẩn hóa toàn bộ nội dung trong 15 hộp thoại (modals) thao tác đơn hàng (gán sê-ri lắp ráp, nhập mã vận đơn, xử lý hoàn tiền, xác nhận giao hàng) lên 14px, xóa bỏ các cỡ chữ nhỏ 10px/11px/12px đối với các trường thông tin và nhãn thao tác chính.
   - Nâng các nút hành động, thẻ trạng thái tiến trình (Order Status Bar, Timeline), tóm tắt tài chính đơn hàng lên 14px.
   - Xóa bỏ triệt để các class cỡ chữ tùy tiện dưới 12px: `text-[9px]`, `text-[10px]`, `text-[11px]`.

3. Giới hạn nghiêm ngặt cỡ chữ 12px (`text-xs`):
   - Cỡ chữ 12px (`text-xs`) chỉ được phép sử dụng cho:
     - Ghi chú phụ trợ không quan trọng (ví dụ: ngày giờ hệ thống ghi nhận log audit phụ, chú thích nhỏ bên dưới mã vận đơn, ghi chú phụ về điều khoản).
     - Tuyệt đối không để mã sê-ri, số lượng linh kiện, số tiền phụ phí, hay tên khách hàng ở kích thước 12px.

4. Danh sách các màn hình và tệp mục tiêu:
   - Kho vận & Chi nhánh:
     - [admin-inventory-balances-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/inventory/admin-inventory-balances-page.component.ts)
     - [admin-serial-numbers-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/inventory/admin-serial-numbers-page.component.ts)
     - [admin-transfers-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/inventory/admin-transfers-page.component.ts)
     - [admin-transfer-detail-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/inventory/admin-transfer-detail-page.component.ts)
     - [admin-branches-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/branches/admin-branches-page.component.ts)
   - Đơn hàng & Hộp thoại thao tác:
     - [admin-orders-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/admin-orders-page.component.ts)
     - [admin-order-detail-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/admin-order-detail-page.component.ts)
     - Các component con đơn hàng: `order-action-bar.component.ts`, `order-buyer-section.component.ts`, `order-finance-summary.component.ts`, `order-lines-pc-group.component.ts`, `order-status-bar.component.ts`, `order-timeline-history.component.ts`.
     - Toàn bộ 15 hộp thoại nghiệp vụ trong [fe/src/app/features/admin/orders/components/modals](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/components/modals): `assemble-dialog.component.ts`, `ship-dialog.component.ts`, `confirm-cod-dialog.component.ts`, `prepare-dialog.component.ts`, `ready-for-pickup-dialog.component.ts`, `complete-order-dialog.component.ts`, `cancel-order-dialog.component.ts`, `delivery-failed-dialog.component.ts`, `redelivery-dialog.component.ts`, `return-initiate-dialog.component.ts`, `return-receive-dialog.component.ts`, `manual-refund-dialog.component.ts`, `resolve-hold-dialog.component.ts`, `resolve-qr-discrepancy-dialog.component.ts`, `pickup-to-delivery-amendment-dialog.component.ts`.
   - Khuyến mãi, Quản trị chính sách & Phản hồi:
     - [admin-promotions-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/promotions/admin-promotions-page.component.ts)
     - [admin-coupons-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/coupons/admin-coupons-page.component.ts)
     - [admin-delivery-fees-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/delivery-fees/admin-delivery-fees-page.component.ts)
     - [admin-customers-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/customers/admin-customers-page.component.ts)
     - [admin-reviews-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/reviews/admin-reviews-page.component.ts)
     - [admin-notifications-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/notifications/admin-notifications-page.component.ts)
     - [admin-payments-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/payments/admin-payments-page.component.ts)

## Technical Context And Dependencies

- Target Files:
  - `fe/src/app/features/admin/inventory/*`
  - `fe/src/app/features/admin/branches/*`
  - `fe/src/app/features/admin/orders/admin-orders-page.component.ts`
  - `fe/src/app/features/admin/orders/admin-order-detail-page.component.ts`
  - `fe/src/app/features/admin/orders/components/*`
  - `fe/src/app/features/admin/orders/components/modals/*`
  - `fe/src/app/features/admin/promotions/*`
  - `fe/src/app/features/admin/coupons/*`
  - `fe/src/app/features/admin/shipping-fee/*`
  - `fe/src/app/features/admin/customers/*`
  - `fe/src/app/features/admin/reviews/*`
  - `fe/src/app/features/admin/notifications/*`
  - `fe/src/app/features/admin/serials/*`

## Checklist

- [x] Thay thế triệt để `font-mono` bằng sans-serif kết hợp lớp `tabular` trong toàn bộ các bảng tồn kho, sê-ri, đơn hàng, modal thực thi, khuyến mãi và thanh toán.
- [x] Chuyển đổi toàn bộ normal text từ 11px/12px lên chuẩn 14px (`text-sm`).
- [x] Xóa bỏ toàn bộ các class cỡ chữ dưới 12px (`text-[9px]`, `text-[10px]`, `text-[11px]`).
- [x] Kiểm tra 15 hộp thoại nghiệp vụ đơn hàng đảm bảo form nhập liệu, danh sách chọn sê-ri và nút bấm hành động đều có cỡ chữ 14px rõ ràng.
- [x] Xác nhận chỉ các dòng mô tả bổ sung phụ mới được giữ `text-xs` (12px).
- [x] Chạy kiểm tra pre-commit gate `npm run check:fe` đạt exit code 0.

## Review & Verification Report

### Code Completion Summary

- Hoàn thành loại bỏ hoàn toàn class `font-mono` và thay thế bằng font sans-serif chuẩn kết hợp `tabular` / `tabular-nums` trên hơn 50 tệp thuộc phân hệ Quản trị Admin:
  - Kho vận & biến động tồn kho: `admin-inventory-balances-page.component.ts`, `admin-stock-ledger-page.component.ts`, `stock-ledger-sheet.component.ts`, `quarantine-stock-dialog.component.ts`.
  - Quản lý mã sê-ri: `admin-serials-page.component.ts`, `serial-detail-dialog.component.ts`.
  - Điều chuyển nội bộ: `admin-transfers-page.component.ts`, `create-transfer-dialog.component.ts`, `dispatch-transfer-dialog.component.ts`, `receive-transfer-dialog.component.ts`, `cancel-transfer-dialog.component.ts`.
  - Chi nhánh: `admin-branches-page.component.ts`, `branch-form-dialog.component.ts`.
  - Đơn hàng và 15 hộp thoại nghiệp vụ: `admin-orders-page.component.ts`, `admin-order-detail-page.component.ts`, `order-lines-pc-group.component.ts`, `order-action-bar.component.ts`, `order-buyer-section.component.ts`, `order-finance-summary.component.ts`, `order-status-bar.component.ts`, `order-timeline-history.component.ts`, và toàn bộ 15 modal (`assemble-dialog`, `ship-dialog`, `confirm-cod-dialog`, `prepare-dialog`, `ready-for-pickup-dialog`, `complete-order-dialog`, `cancel-order-dialog`, `delivery-failed-dialog`, `redelivery-dialog`, `return-initiate-dialog`, `return-receive-dialog`, `manual-refund-dialog`, `resolve-hold-dialog`, `resolve-qr-discrepancy-dialog`, `pickup-to-delivery-amendment-dialog`).
  - Khuyến mãi, coupon, biểu phí vận chuyển: `admin-product-promotions-page.component.ts`, `promotion-form-dialog.component.ts`, `admin-coupons-page.component.ts`, `coupon-form-dialog.component.ts`, `coupon-redemption-sheet.component.ts`, `admin-shipping-fee-page.component.ts`, `delivery-fee-form-dialog.component.ts`.
  - Khách hàng, đánh giá và hộp thư thông báo: `admin-customers-page.component.ts`, `admin-customer-detail-page.component.ts`, `merge-customer-dialog.component.ts`, `admin-reviews-page.component.ts`, `review-detail-dialog.component.ts`, `admin-notification-outbox-page.component.ts`, `notification-detail-dialog.component.ts`.
- Chuẩn hóa normal text lên 14px (`text-sm`), xóa bỏ hoàn toàn các class font tùy tiện dưới 12px (`text-[9px]`, `text-[10px]`, `text-[11px]`), chỉ giữ `text-xs` (12px) cho thông tin mô tả phụ trợ.

### Dual-Pass Code Review

- Pass A (Functional):
  - Xác nhận toàn bộ thông tin mã đơn hàng, mã phiếu chuyển kho, mã sê-ri linh kiện, giá tiền, số lượng tồn kho và tiền cọc hiển thị sắc nét với phông sans-serif và độ rộng số cố định (`tabular`), không bị giật hay lệch cột dữ liệu.
  - Form và modal thao tác nghiệp vụ có kích thước chữ 14px dễ đọc, khoảng cách các nút và trường nhập liệu rõ ràng, đáp ứng tốt cho vận hành.
- Pass B (Convention):
  - Kiểm tra toàn bộ mã nguồn không chứa emoji, không chứa icon trang trí và không chứa chú thích đánh số thứ tự.
  - Lệnh kiểm tra `npm run check:fe` (tsc, build, eslint) đạt exit code 0 hoàn hảo.
- Verdict: Đạt yêu cầu.
