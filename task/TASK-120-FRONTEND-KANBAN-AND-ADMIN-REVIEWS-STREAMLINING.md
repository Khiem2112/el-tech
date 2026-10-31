# Task: TASK-120 - Tinh Gọn Frontend: Bỏ Lọc Chi Nhánh Kanban, Ẩn Menu Chi Nhánh Và Bỏ Khâu Kiểm Duyệt Đánh Giá

- Feature: Frontend Kanban & Admin Reviews Streamlining
- Governing Spec: Sheet PHAN CONG - Task 1.0 (Bỏ phân chia chi nhánh), Task 5.0 (Bỏ admin kiểm duyệt và ẩn đánh giá thủ công)
- Scope: frontend
- Status: Complete
- Backlinks: [TASK-104](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/task/TASK-104-FRONTEND-ADMIN-OPERATIONS-AND-SYSTEM-VERIFICATION.md), [TASK-119](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/task/TASK-119-BACKEND-ORDER-AND-SHIPPING-SINGLE-BRANCH-REFACTOR.md)

## Objective

Tinh gọn giao diện phía Frontend đồng bộ với các quyết định nghiệp vụ: Xóa bỏ bộ lọc dropdown chi nhánh (Hub Hà Nội / Hub TP.HCM) trên trang Kanban đơn hàng để phản ánh mô hình 1 cửa hàng duy nhất; gỡ bỏ liên kết quản lý chi nhánh khỏi thanh điều hướng Admin; và loại bỏ tính năng ẩn bài/kiểm duyệt đánh giá thủ công trong phân hệ Admin Reviews, chuyển giao diện đánh giá sang chế độ chỉ đọc để theo dõi phản hồi người dùng (xác định việc can thiệp nội dung đánh giá là Out of Scope trên hệ thống).

## Technical Context And Dependencies

- Pre-requisites: Hoàn thành `TASK-119`.
- Reusable Assets: Spartan UI button, badge, select components tại `fe/src/app/components/atoms/`.
- Target Files:
  - `fe/src/app/features/orders/order-kanban-page.component.ts`
  - `fe/src/app/features/admin/constants/admin-navigation.constants.ts`
  - `fe/src/app/features/admin/reviews/admin-reviews-page.component.ts`
  - `fe/src/app/features/admin/reviews/components/review-detail-dialog.component.ts`

## Checklist

- [x] Cập nhật trang Kanban `fe/src/app/features/orders/order-kanban-page.component.ts`:
  - [x] Xóa bỏ mảng tùy chọn `branchOptions` (gồm Hub TP.HCM, Hub Hà Nội, Giao tận nơi).
  - [x] Xóa bỏ khối dropdown `<app-select>` lọc theo chi nhánh trên thanh công cụ lọc nhanh; điều chỉnh lại độ rộng cột grid tìm kiếm và loại đơn hàng cho cân đối.
  - [x] Xóa bỏ điều kiện lọc `order.branch !== branch` trong hàm tính toán `filteredOrders`.
  - [x] Cập nhật hiển thị nhãn chi nhánh trên từng thẻ Kanban thành "Showroom EL-TECH".
- [x] Cập nhật thanh điều hướng Admin `fe/src/app/features/admin/constants/admin-navigation.constants.ts`:
  - [x] Xóa bỏ mục "SCR-29: Chi Nhánh & Khu Vực" (`settings/branches`) khỏi nhóm `mod-settings`.
  - [x] Đổi tên mục "SCR-28: Kiểm Duyệt Đánh Giá" thành "Theo Dõi Đánh Giá" thuộc nhóm `mod-customers`.
- [x] Cập nhật màn hình Admin Reviews `fe/src/app/features/admin/reviews/admin-reviews-page.component.ts`:
  - [x] Đổi phụ đề trang từ "Kiểm duyệt và quản lý hiển thị đánh giá từ khách hàng" thành "Theo dõi ý kiến phản hồi và đánh giá sản phẩm từ người dùng".
  - [x] Đổi tiêu đề cột thao tác từ "Chi tiết & Kiểm duyệt" thành "Xem chi tiết".
  - [x] Dọn dẹp liên kết đóng modal chi tiết sau khi loại bỏ luồng ẩn bài thủ công.
- [x] Cập nhật dialog chi tiết review `fe/src/app/features/admin/reviews/components/review-detail-dialog.component.ts`:
  - [x] Đổi tiêu đề hộp thoại thành "Chi Tiết Đánh Giá Sản Phẩm".
  - [x] Xóa bỏ hoàn toàn khối nhập "Lý do ẩn đánh giá", "Ghi chú khi bỏ ẩn", nút "Ẩn Đánh Giá Khỏi Gian Hàng" và nút "Hiện Lại Đánh Giá".
  - [x] Chuyển hộp thoại thành modal chỉ đọc (read-only), chỉ còn nút bấm "Đóng".
- [x] Chạy lệnh kiểm tra tính hợp lệ và type check frontend: `npm run check:fe`.

## Acceptance Criteria

- Criterion 1: Trang Kanban đơn hàng không còn hiển thị bộ lọc lựa chọn chi nhánh, hiển thị trơn tru trên tất cả các độ phân giải màn hình.
- Criterion 2: Thanh điều hướng Admin không còn liên kết tới trang quản lý chi nhánh.
- Criterion 3: Trang đánh giá sản phẩm của Admin không còn nút ẩn bài hoặc kiểm duyệt bài thủ công.
- Criterion 4: `npm run check:fe` chạy thành công không có lỗi type hay lint.

## Verification Commands

- Command 1: `npm run check:fe`
- Command 2: `npm run check:be`
