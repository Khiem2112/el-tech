# Task: TASK-128 - Vận Hành Đơn Hàng, Lắp Ráp & Giao Nhận Cửa Hàng Tập Trung

- Feature: Admin Orders, Assembly & Fulfillment Single Store Streamlining
- Governing Spec: Quy tắc một cửa hàng Showroom EL-TECH, loại bỏ lọc và phân bổ chi nhánh đơn hàng
- Scope: shared
- Status: Complete

## Objective

Đồng bộ toàn diện luồng quản lý đơn hàng, lắp ráp PC và giao vận về một trung tâm vận hành duy nhất:
- Danh sách đơn hàng ([admin-orders-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/admin-orders-page.component.ts)): xóa bỏ bộ lọc `selectedBranchId`, xóa tùy chọn gom nhóm `groupMode = 'branch'`, xóa cột chi nhánh trên bảng danh sách đơn hàng.
- Chi tiết đơn hàng ([admin-order-detail-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/admin-order-detail-page.component.ts)): cố định điểm thực hiện là Showroom EL-TECH; dọn dẹp các cảnh báo khác chi nhánh giữa địa chỉ giao và kho xuất.
- Các hộp thoại vận hành: Soạn hàng, Lắp ráp PC (`ASSEMBLING`), Nhận tại quầy (`READY_FOR_PICKUP`), và Bàn giao vận chuyển (`SHIPPING`) đều vận hành trơn tru xoay quanh kho và trạm kỹ thuật duy nhất của Showroom EL-TECH.

## Technical Context And Dependencies

- Pre-requisites: Hoàn thành TASK-119, TASK-123, TASK-124.
- Target Files:
  - `fe/src/app/features/admin/orders/admin-orders-page.component.ts`
  - `fe/src/app/features/admin/orders/admin-order-detail-page.component.ts`
  - `be/src/services/admin/order-detail.service.ts`

## Checklist

- [x] Cập nhật [admin-orders-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/admin-orders-page.component.ts):
  - Xóa bộ lọc chi nhánh `selectedBranchId` và danh sách `branchOptions`.
  - Xóa chế độ gom nhóm theo chi nhánh `groupMode = 'branch'`.
  - Xóa cột "Chi nhánh" trên bảng danh sách đơn hàng.
- [x] Cập nhật [admin-order-detail-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/admin-order-detail-page.component.ts):
  - Hiển thị cố định "Cơ sở xử lý: Showroom EL-TECH".
  - Xóa bỏ cảnh báo lệch chi nhánh giao nhận.
- [x] Cập nhật [order-detail.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/admin/order-detail.service.ts):
  - Đảm bảo dữ liệu chi tiết đơn hàng trả về địa chỉ Showroom EL-TECH cố định và không yêu cầu tra cứu nhiều chi nhánh.

## Acceptance Criteria

- Criterion 1: Danh sách đơn hàng hiển thị gọn gàng, không có dropdown lọc chi nhánh hay cột chi nhánh thừa.
- Criterion 2: Toàn bộ quy trình vận hành (Soạn hàng, Lắp ráp, Nhận tại quầy, Giao hàng) xoay quanh Showroom EL-TECH.
- Criterion 3: Kiểm thử tự động `npm run check:fe` và `npm run check:be` hoàn tất thành công với mã thoát 0.

## Review And Fix Log

- Code Reviewer Subagent: Passed dual-pass review (functional and convention).
- Verification Gates: `npm run check:be` and `npm run check:fe` exited with code 0.

## Verification Commands

- Command 1: `npm run check:fe`
- Command 2: `npm run check:be`

