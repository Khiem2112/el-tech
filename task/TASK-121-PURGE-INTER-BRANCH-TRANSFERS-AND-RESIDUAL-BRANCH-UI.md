# Task: TASK-121 - Dọn Dẹp Tính Năng Chuyển Kho Và Loại Bỏ Triệt Để Dấu Tích Đa Chi Nhánh

- Feature: Purge Inter-Branch Transfers & Residual Multi-Branch UI
- Governing Spec: Quy tắc 1 cửa hàng duy nhất (Showroom EL-TECH), bãi bỏ quy tắc TRF-001 đến TRF-006
- Scope: frontend & admin
- Status: Complete

## Objective

Loại bỏ toàn bộ các tính năng, thành phần giao diện và nội dung liên quan đến chuyển kho nội bộ giữa các chi nhánh (do hệ thống chỉ còn duy nhất 1 cửa hàng Showroom EL-TECH). Đồng thời dọn dẹp triệt để các câu chữ, bộ lọc chi nhánh còn sót lại tại modal tráo linh kiện PC Builder, giỏ hàng, chân trang storefront và màn hình quản lý tồn kho admin.

## Technical Context And Dependencies

- Pre-requisites: Hoàn thành TASK-118, TASK-119, TASK-120.
- Target Files:
  - `fe/src/app/features/pc-build/component-swap-modal.component.ts`
  - `fe/src/app/features/cart/cart-drawer.component.ts`
  - `fe/src/app/features/storefront/storefront-shell.component.html`
  - `fe/src/app/features/admin/inventory/admin-inventory-balances-page.component.ts`
  - `fe/src/app/features/admin/dashboard/admin-dashboard-page.component.ts`
  - `fe/src/app/features/admin/dashboard/components/in-transit-transfers-card.component.ts`
  - `fe/src/app/features/admin/admin.routes.ts`

## Checklist

- [x] Cập nhật `component-swap-modal.component.ts`: Xóa bỏ biến tín hiệu `selectedBranch`, mảng `branchOptions`, khối chọn chi nhánh kho trên template và điều kiện lọc theo kho `hn` / `hcm`.
- [x] Cập nhật `cart-drawer.component.ts`: Đổi câu chữ "Showroom Hà Nội & TP. HCM" thành "Showroom EL-TECH"; đổi thông tin cọc 10% thành thanh toán COD 100% khi nhận hàng không cần đặt cọc.
- [x] Cập nhật `storefront-shell.component.html`: Xóa bỏ dòng địa chỉ chi nhánh Hà Nội trong phần thông tin chân trang.
- [x] Cập nhật `admin-inventory-balances-page.component.ts`: Xóa bộ lọc chọn chi nhánh và nút điều chuyển kho; chỉ hiển thị tồn kho tập trung của Showroom EL-TECH.
- [x] Cập nhật `admin-dashboard-page.component.ts`: Gỡ bỏ thẻ điều chuyển kho đang vận chuyển (`InTransitTransfersCard`).
- [x] Cập nhật `admin.routes.ts`: Vô hiệu hóa hoặc chuyển hướng route `inventory/transfers` về `inventory/balances`.

## Acceptance Criteria

- Criterion 1: Modal tráo linh kiện PC Builder không còn dropdown lọc theo kho Hà Nội / TP.HCM.
- Criterion 2: Không còn bất kỳ câu chữ nhắc tới chi nhánh Hà Nội hay hai showroom trong giỏ hàng và chân trang.
- Criterion 3: Màn hình quản lý tồn kho và dashboard admin không còn hiển thị tính năng điều chuyển kho giữa các chi nhánh.
- Criterion 4: Lệnh kiểm tra `npm run check` hoàn tất thành công.
