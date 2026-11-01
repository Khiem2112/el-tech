# Task: TASK-129 - Danh Mục Biến Thể SKU, PC Bundles & Tra Cứu Serial Tập Trung

- Feature: Admin Catalog, PC Bundles & Serials Single Store Streamlining
- Governing Spec: Quy tắc một cửa hàng Showroom EL-TECH, loại bỏ lọc tồn kho đa chi nhánh trong quản lý danh mục và serial
- Scope: frontend
- Status: Complete

## Objective

Dọn dẹp triệt để các trường và giao diện lọc chi nhánh còn sót lại trong danh mục sản phẩm, cấu hình PC Bundles và tra cứu serial:
- Màn hình PC Bundles ([admin-pc-bundles-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/pc-bundles/admin-pc-bundles-page.component.ts)): xóa bỏ bộ lọc chi nhánh `selectedBranchId`, gộp thông tin số bộ buildable thành một chỉ số duy nhất dựa trên tồn kho linh kiện BOM tại Showroom EL-TECH.
- Màn hình Biến thể SKU ([admin-variants-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/variants/admin-variants-page.component.ts)) và Chi tiết mẫu sản phẩm ([admin-product-template-detail-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/templates/admin-product-template-detail-page.component.ts)): xóa bỏ modal hoặc tooltip chia tồn theo từng chi nhánh; chỉ hiển thị trực tiếp tồn kho khả dụng tại Showroom EL-TECH.
- Màn hình Quản lý Serial ([admin-serials-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/serials/admin-serials-page.component.ts)): bỏ bộ lọc theo chi nhánh; đổi cột hiển thị chi nhánh thành trạng thái vị trí linh kiện (Kho hàng / Đang lắp ráp / Đã xuất đơn / Hàng lỗi cách ly).

## Technical Context And Dependencies

- Pre-requisites: Hoàn thành TASK-126.
- Target Files:
  - `fe/src/app/features/admin/pc-bundles/admin-pc-bundles-page.component.ts`
  - `fe/src/app/features/admin/variants/admin-variants-page.component.ts`
  - `fe/src/app/features/admin/templates/admin-product-template-detail-page.component.ts`
  - `fe/src/app/features/admin/serials/admin-serials-page.component.ts`

## Checklist

- [x] Cập nhật [admin-pc-bundles-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/pc-bundles/admin-pc-bundles-page.component.ts):
  - Xóa bộ lọc chi nhánh `selectedBranchId` và mảng `branchOptions`.
  - Hiển thị số bộ có thể ráp sẵn dựa trên tồn kho showroom duy nhất, thay vì hiển thị danh sách lặp theo từng chi nhánh.
- [x] Cập nhật [admin-variants-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/variants/admin-variants-page.component.ts):
  - Chuyển đổi sheet chi tiết tồn kho `openBranchStockSheet` từ hiển thị danh sách các chi nhánh sang hiển thị phân rã tồn kho (Tồn thực tế, Tạm giữ, Khả dụng) của Showroom EL-TECH.
- [x] Cập nhật [admin-product-template-detail-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/templates/admin-product-template-detail-page.component.ts):
  - Xóa bỏ tooltip chia chi nhánh `getAvailableBranchTooltip()`, hiển thị trực tiếp số lượng tồn khả dụng của showroom.
- [x] Cập nhật [admin-serials-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/serials/admin-serials-page.component.ts):
  - Xóa bộ lọc `selectedBranchFilterId` và mảng `branchOptions`.
  - Dọn dẹp cột chi nhánh thành hiển thị trạng thái vị trí phần cứng thực tế.
- [x] Chạy kiểm thử tự động `npm run check:fe` đạt exit code 0.

## Acceptance Criteria

- Criterion 1: Màn hình PC Bundles hiển thị số lượng buildable tập trung, không còn dropdown lọc chi nhánh.
- Criterion 2: Màn hình biến thể SKU và mẫu sản phẩm hiển thị tồn kho chính xác của Showroom EL-TECH.
- Criterion 3: Danh sách số serial linh kiện phản ánh đúng trạng thái thực tế không phân tán qua các chi nhánh.
- Criterion 4: Kiểm thử tự động `npm run check:fe` hoàn tất thành công với mã thoát 0.

## Review And Fix Log

- Code Reviewer Subagent: Passed dual-pass review with advisory findings.
- Applied cleanups: Removed dead method `getAvailableBranchTooltip`, aligned tooltip copy on product template detail page, and purged unreferenced `@Input() branches` from serial detail dialog and serials page.
- Verification Gates: `npm run check:fe` exited with code 0.

## Verification Commands

- Command 1: `npm run check:fe`
