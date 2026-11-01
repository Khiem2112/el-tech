# Task: TASK-123 - Vòng Đời Đơn Hàng: Bỏ Treo Ngoại Lệ (ON_HOLD) Và Bỏ Chờ Xác Nhận COD

- Feature: Order Lifecycle Refactoring - Eliminate ON_HOLD & PENDING_COD_CONFIRMATION
- Governing Spec: Cập nhật vòng đời và quản lý trạng thái đơn hàng tinh gọn
- Scope: backend
- Status: Complete

## Objective

Tái cấu trúc luồng trạng thái đơn hàng phía backend: Loại bỏ bước trung gian chờ xác nhận COD (`PENDING_COD_CONFIRMATION`), khi khách đặt đơn chọn COD hệ thống chuyển thẳng đơn hàng sang trạng thái `CONFIRMED` và thực hiện giữ chỗ tồn kho ngay lập tức. Đồng thời loại bỏ hoàn toàn trạng thái treo ngoại lệ (`ON_HOLD`), không dừng đơn hàng ở trạng thái tạm giữ khi thanh toán có nghi vấn mà xử lý ngoại tuyến hoặc hủy đơn nếu quá hạn; gỡ bỏ các nghiệp vụ tạm giữ đơn hàng và giải quyết ngoại lệ.

## Technical Context And Dependencies

- Pre-requisites: Hoàn thành TASK-98, TASK-119.
- Target Files:
  - `be/src/services/order.service.ts`
  - `be/src/services/payment.service.ts`
  - `be/src/services/admin/order-detail.service.ts`
  - `be/src/services/admin/order-exception.service.ts`
  - `be/src/services/admin/order.service.ts`
  - `be/src/services/order-lookup.service.ts`
  - `be/src/validations/admin/order.schema.ts`
  - `.agents/skills/business-logic/features/orders-and-fulfillment.md`

## Checklist

- [x] Cập nhật phương thức `submit` trong `be/src/services/order.service.ts`:
  - Khi phương thức thanh toán là COD: Gán trạng thái `status = OrderStatus.CONFIRMED` ngay lập tức.
  - Ghi lịch sử trạng thái đơn hàng chuyển trực tiếp sang `CONFIRMED`.
  - Thực hiện giữ chỗ tồn kho (StockQuant reservation) tự động cho đơn COD vừa tạo.
- [x] Cập nhật `be/src/services/payment.service.ts`:
  - Khi giao dịch QR không khớp chính xác (underpaid / ambiguous): Không cập nhật đơn hàng sang `ON_HOLD`. Giữ nguyên đơn ở `PENDING_PAYMENT` chờ thanh toán đủ hoặc hết hạn tự hủy.
- [x] Cập nhật `be/src/services/admin/order-detail.service.ts`:
  - Loại bỏ các hành động nghiệp vụ `holdOrder` và `resolveHold` khỏi danh sách các thao tác khả dụng của đơn hàng.
- [x] Cập nhật `be/src/services/admin/order-exception.service.ts`:
  - Dọn dẹp các phương thức liên quan đến tạm giữ đơn `ON_HOLD` và giải quyết ngoại lệ.
- [x] Cập nhật tài liệu quy tắc nghiệp vụ `orders-and-fulfillment.md`:
  - Xóa bỏ `ON_HOLD` và `PENDING_COD_CONFIRMATION` khỏi danh sách trạng thái và biểu đồ Mermaid.

## Acceptance Criteria

- Criterion 1: Đơn hàng tạo với phương thức thanh toán COD chuyển thẳng sang trạng thái `CONFIRMED`, tồn kho linh kiện được giữ chỗ ngay.
- Criterion 2: Không còn logic nào chuyển trạng thái đơn hàng sang `ON_HOLD`.
- Criterion 3: Lệnh kiểm tra `npm run check:be` hoàn tất thành công.
