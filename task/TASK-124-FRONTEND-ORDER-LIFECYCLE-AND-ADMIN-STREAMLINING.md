# Task: TASK-124 - Đồng Bộ Giao Diện Theo Vòng Đời Đơn Hàng Tinh Gọn

- Feature: Frontend Order Lifecycle & Admin Operations Streamlining
- Governing Spec: Bỏ chờ xác nhận COD, bỏ treo ngoại lệ ON_HOLD, bỏ tiền cọc
- Scope: frontend
- Status: Complete

## Objective

Cập nhật toàn bộ các màn hình quản trị Admin và Storefront để đồng bộ với vòng đời đơn hàng mới: Xóa bỏ các tab "Chờ xác nhận COD" và "Treo ngoại lệ ON_HOLD", xóa bỏ các nút thao tác xác nhận COD hoặc giải quyết ngoại lệ; cập nhật các bộ lọc và thanh tiến trình đơn hàng của khách hàng; đồng thời loại bỏ toàn bộ các nhãn tiền cọc còn sót lại trên giao diện admin và trang tra cứu đơn hàng.

## Technical Context And Dependencies

- Pre-requisites: Hoàn thành TASK-123.
- Target Files:
  - `fe/src/app/features/admin/orders/admin-orders-page.component.ts`
  - `fe/src/app/features/admin/orders/admin-order-detail-page.component.ts`
  - `fe/src/app/features/admin/orders/components/order-status-bar.component.ts`
  - `fe/src/app/features/admin/dashboard/components/urgent-queues-grid.component.ts`
  - `fe/src/app/features/admin/dashboard/components/order-status-distribution.component.ts`
  - `fe/src/app/features/profile/profile-page.component.ts`
  - `fe/src/app/features/orders/order-lookup-page.component.ts`
  - `fe/src/app/features/orders/order-cancel-modal.component.ts`

## Checklist

- [x] Cập nhật `admin-orders-page.component.ts`:
  - Xóa tab `PENDING_COD_CONFIRMATION` ("Chờ xác nhận COD") và tab `ON_HOLD` ("Treo ngoại lệ ON_HOLD").
  - Xóa bỏ nút và logic mở modal xử lý ngoại lệ ON_HOLD.
- [x] Cập nhật `admin-order-detail-page.component.ts`:
  - Xóa bỏ các nút thao tác "Tạm giữ đơn hàng" và "Giải quyết ngoại lệ".
  - Dọn dẹp nhãn tiền cọc: hiển thị phương thức thanh toán trực tiếp (QR hoặc COD) và trạng thái thu tiền (Đã thanh toán / Thu khi nhận hàng).
- [x] Cập nhật `urgent-queues-grid.component.ts` & `order-status-distribution.component.ts`:
  - Gỡ bỏ hàng đợi khẩn cấp cho COD confirmation và ON_HOLD.
- [x] Cập nhật `profile-page.component.ts`:
  - Xóa bỏ trạng thái `PENDING_COD_CONFIRMATION` khỏi bộ lọc danh sách đơn hàng.
- [x] Cập nhật `order-lookup-page.component.ts`:
  - Điều chỉnh hàm tính toán bước tiến trình stepper (bỏ qua `PENDING_COD_CONFIRMATION`).
  - Xóa bỏ dòng thông tin "Trạng thái đặt cọc: ...".
- [x] Cập nhật `order-cancel-modal.component.ts`:
  - Cập nhật thông điệp hướng dẫn hủy đơn cho các trạng thái hợp lệ (`PENDING_PAYMENT`, `CONFIRMED`).

## Acceptance Criteria

- Criterion 1: Giao diện Admin Orders không còn tab "Chờ xác nhận COD" hay "Treo ngoại lệ ON_HOLD".
- Criterion 2: Không còn xuất hiện chữ "cọc" hay "đặt cọc" trên chi tiết đơn hàng admin và tra cứu khách hàng.
- Criterion 3: Lệnh kiểm tra `npm run check:fe` hoàn tất thành công.
