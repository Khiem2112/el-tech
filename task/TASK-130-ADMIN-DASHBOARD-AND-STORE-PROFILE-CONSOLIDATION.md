# Task: TASK-130 - Tinh Gọn Dashboard Admin & Chuyển Đổi Trang Chi Nhánh Thành Hồ Sơ Showroom

- Feature: Admin Operational Dashboard & Store Profile Consolidation
- Governing Spec: Quy tắc một cửa hàng Showroom EL-TECH, loại bỏ lọc chi nhánh trên Dashboard và chuyển đổi quản lý chi nhánh sang hồ sơ showroom
- Scope: frontend
- Status: Pending

## Objective

Hoàn tất giai đoạn hợp nhất phân hệ quản trị một cửa hàng:
1. Màn hình Dashboard ([admin-dashboard-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/dashboard/admin-dashboard-page.component.ts)): xóa thanh dropdown chọn chi nhánh trên Dashboard; đảm bảo tất cả biểu đồ và thẻ số liệu thống kê phản ánh toàn bộ hoạt động của Showroom EL-TECH.
2. Màn hình Quản lý chi nhánh ([admin-branches-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/branches/admin-branches-page.component.ts)): chuyển màn hình quản lý chi nhánh thành trang thông tin Showroom (quản trị địa chỉ, điện thoại, email hỗ trợ, giờ làm việc), ẩn nút thêm chi nhánh mới.
3. Chi tiết khách hàng ([admin-customer-detail-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/customers/admin-customer-detail-page.component.ts)): xóa cột hiển thị chi nhánh trong lịch sử mua hàng của khách hàng.

## Technical Context And Dependencies

- Pre-requisites: Hoàn thành TASK-126, TASK-127, TASK-128, TASK-129.
- Target Files:
  - `fe/src/app/features/admin/dashboard/admin-dashboard-page.component.ts`
  - `fe/src/app/features/admin/branches/admin-branches-page.component.ts`
  - `fe/src/app/features/admin/customers/admin-customer-detail-page.component.ts`

## Checklist

- [ ] Cập nhật [admin-dashboard-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/dashboard/admin-dashboard-page.component.ts):
  - Xóa dropdown chọn chi nhánh `branchOptions` và tín hiệu `selectedBranchId`.
  - Toàn bộ KPI và hàng đợi khẩn cấp phản ánh hoạt động tập trung của Showroom EL-TECH.
- [ ] Cập nhật [admin-branches-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/branches/admin-branches-page.component.ts):
  - Chuyển tiêu đề thành "Cấu Hình Thông Tin Showroom".
  - Ẩn nút tạo chi nhánh mới; chỉ cho phép chỉnh sửa thông tin liên hệ và giờ mở cửa của Showroom chính.
- [ ] Cập nhật [admin-customer-detail-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/customers/admin-customer-detail-page.component.ts):
  - Xóa cột "Chi nhánh" trong bảng lịch sử đơn hàng của khách hàng.

## Acceptance Criteria

- Criterion 1: Dashboard vận hành quản trị hiển thị thống kê tập trung không có lọc chi nhánh.
- Criterion 2: Trang chi nhánh chuyển thành hồ sơ thông tin Showroom EL-TECH duy nhất.
- Criterion 3: Lịch sử mua hàng của khách hàng hiển thị sạch sẽ, không có cột chi nhánh thừa.
- Criterion 4: Kiểm thử tự động `npm run check:fe` hoàn tất thành công với mã thoát 0.

## Verification Commands

- Command 1: `npm run check:fe`

