# Task: TASK-119 - Tái Cấu Trúc Backend Order Và Shipping: Bỏ Logic Đa Chi Nhánh Và Bỏ Chặn Giới Hạn Giao Lại

- Feature: Backend Order & Shipping Single Branch Refactoring
- Governing Spec: Sheet PHAN CONG - Task 1.0 (Dồn nghiệp vụ về 1 cửa hàng), Task 2.0 (Bỏ đặt cọc), Task 6.0 (Sửa sự cố giao nhận)
- Scope: backend
- Status: Complete
- Backlinks: [TASK-98](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/task/TASK-98-BACKEND-ORDER-LIFECYCLE-AND-PAYMENT-REFACTOR.md), [TASK-118](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/task/TASK-118-DATABASE-BRANCH-CONSOLIDATION-AND-PURGE.md)

## Objective

Tái cấu trúc triệt để tầng dịch vụ backend liên quan đến chi nhánh và giao nhận: Sửa phương thức tạo đơn hàng `submit()` trong `order.service.ts` để gán tự động vào showroom chính duy nhất (không còn ném lỗi `BRANCH_REQUIRED` khi khách chọn nhận tại quầy và xóa bỏ thuật toán quét đa chi nhánh `eligibleBranches`/`bestBranch` khi giao hàng); dọn dẹp các trường deposit còn sót trong `cancel()`; chuẩn hóa dữ liệu Kanban trả về cho 1 chi nhánh duy nhất; và gỡ bỏ giới hạn số lần giao lại (`redeliveryAttemptCount >= 2`) cùng phương thức trả hàng đa bước cũ trong `order-fulfillment-shipping.service.ts`.

## Technical Context And Dependencies

- Pre-requisites: Hoàn thành `TASK-118`.
- Reusable Assets: Prisma client tại `be/src/lib/prisma.ts`, error contract tại `be/src/contracts/domain-error.ts`.
- Target Files:
  - `be/src/services/order.service.ts`
  - `be/src/services/admin/order-fulfillment-shipping.service.ts`
  - `be/src/routes/order.routes.ts`

## Checklist

- [x] Cập nhật phương thức `submit` trong `be/src/services/order.service.ts`:
  - [x] Truy vấn bản ghi cửa hàng chính duy nhất (`code: STORE-MAIN` hoặc bản ghi đầu tiên có `isActive: true`).
  - [x] Xóa bỏ hoàn toàn nhánh kiểm tra bắt buộc `input.branchId` (`BRANCH_REQUIRED`, rule `CHK-004`) khi khách chọn nhận tại quầy (`PICKUP`). Đơn hàng tự động lấy thông tin của cửa hàng chính.
  - [x] Xóa bỏ thuật toán tìm kiếm và lọc chi nhánh phức tạp (`eligibleBranches`, `bestBranch`, lỗi `NO_FULFILLMENT_BRANCH`, rule `CHK-012`) khi giao hàng (`DELIVERY`). Đơn hàng tự động liên kết với cửa hàng chính.
  - [x] Kiểm tra tồn kho tập trung tại cửa hàng chính cho tất cả các linh kiện trong giỏ hàng.
  - [x] Gán `fulfillmentBranchId: branch.id` và tạo `branchSnapshot` cố định thông tin của cửa hàng chính.
- [x] Cập nhật phương thức `cancel` trong `be/src/services/order.service.ts`:
  - [x] Xóa bỏ tham chiếu `depositDisposition` khi hoàn tiền; trạng thái thanh toán chỉ theo dõi tiền thực nhận `totalReceived`.
- [x] Cập nhật phương thức lấy dữ liệu Kanban trong `be/src/services/order.service.ts`:
  - [x] Bỏ phân chia chi nhánh `branch: 'hn' : 'hcm'`. Trả về định dạng chi nhánh đồng nhất: `branch: 'store-main'`, `branchName: 'Showroom EL-TECH'`.
- [x] Cập nhật dịch vụ giao nhận `be/src/services/admin/order-fulfillment-shipping.service.ts`:
  - [x] Trong phương thức `scheduleRedelivery()`: Xóa bỏ điều kiện kiểm tra `if (order.redeliveryAttemptCount >= 2)` và bỏ lỗi `REDELIVERY_LIMIT_EXCEEDED` (rule `ORD-024`). Cho phép nhân viên tiếp tục hẹn giao lại không giới hạn lần giao từ trạng thái `DELIVERY_FAILED` về `SHIPPING`.
  - [x] Đã chuẩn hóa quy trình xử lý sự cố giao nhận sang giao lại hoặc hoàn hủy trực tiếp.
- [x] Chạy lệnh kiểm tra tính hợp lệ và type check backend: `npm run check:be`.

## Acceptance Criteria

- Criterion 1: Đơn hàng tạo với phương thức `PICKUP` mà không gửi `branchId` vẫn được tạo thành công 100%, không bị lỗi `BRANCH_REQUIRED`.
- Criterion 2: Đơn hàng tạo với phương thức `DELIVERY` được liên kết trực tiếp với Showroom chính mà không phụ thuộc vào `deliveryAreaCode` hay thuật toán so khớp đa chi nhánh.
- Criterion 3: Lệnh hẹn giao lại `scheduleRedelivery` thực thi thành công cho các đơn hàng có số lần giao thất bại lớn hơn hoặc bằng 2 mà không bị từ chối.
- Criterion 4: `npm run check:be` chạy thành công không có lỗi type hay lint.

## Verification Commands

- Command 1: `npm run check:be`
