# Task: TASK-129 - Danh Mục Biến Thể SKU, PC Bundles & Tra Cứu Serial Tập Trung

- Feature: Admin Catalog, PC Bundles & Serials Single Store Streamlining
- Governing Spec: Quy tắc một cửa hàng Showroom EL-TECH, loại bỏ lọc tồn kho đa chi nhánh trong quản lý danh mục và serial
- Scope: frontend
- Status: Pending

## Objective

Dọn dẹp triệt để các trường và giao diện lọc chi nhánh còn sót lại trong danh mục sản phẩm, cấu hình PC Bundles và tra cứu serial:
1. Màn hình PC Bundles ([admin-pc-bundles-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/pc-bundles/admin-pc-bundles-page.component.ts)): xóa bỏ bộ lọc chi nhánh `selectedBranchId`, gộp thông tin số bộ buildable thành 1 chỉ số duy nhất dựa trên tồn kho linh kiện BOM tại Showroom EL-TECH.
2. Màn hình Biến thể SKU ([admin-variants-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/variants/admin-variants-page.component.ts)) và Chi tiết mẫu sản phẩm ([admin-product-template-detail-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/templates/admin-product-template-detail-page.component.ts)): xóa bỏ modal/tooltip chia tồn theo từng chi nhánh; chỉ hiển thị tồn kho chi tiết tại Showroom EL-TECH.
3. Màn hình Quản lý Serial ([admin-serials-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/serials/admin-serials-page.component.ts)): bỏ bộ lọc theo chi nhánh; dọn dẹp cột chi nhánh thành trạng thái vị trí linh kiện (Kho hàng / Đang lắp ráp / Đã xuất đơn / Hàng lỗi cách ly).

## Technical Context And Dependencies

- Pre-requisites: Hoàn thành TASK-126.
- Target Files:
  - `fe/src/app/features/admin/pc-bundles/admin-pc-bundles-page.component.ts`
  - `fe/src/app/features/admin/variants/admin-variants-page.component.ts`
  - `fe/src/app/features/admin/templates/admin-product-template-detail-page.component.ts`
  - `fe/src/app/features/admin/serials/admin-serials-page.component.ts`

## Checklist

- [ ] Cập nhật [admin-pc-bundles-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/pc-bundles/admin-pc-bundles-page.component.ts):
  - Xóa bộ lọc chi nhánh `selectedBranchId`.
  - Hiển thị số bộ có thể ráp sẵn dựa trên tồn kho showroom chính.
- [ ] Cập nhật [admin-variants-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/variants/admin-variants-page.component.ts) & [admin-product-template-detail-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/templates/admin-product-template-detail-page.component.ts):
  - Xóa các tooltip/sheet chia tồn kho theo chi nhánh; hiển thị số lượng tồn kho khả dụng trực tiếp của showroom.
- [ ] Cập nhật [admin-serials-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/serials/admin-serials-page.component.ts):
  - Xóa bộ lọc `selectedBranchFilterId` và cột chi nhánh; hiển thị rõ trạng thái vị trí phần cứng.

## Acceptance Criteria

- Criterion 1: Màn hình PC Bundles hiển thị số lượng buildable tập trung, không còn dropdown lọc chi nhánh.
- Criterion 2: Màn hình biến thể SKU và mẫu sản phẩm hiển thị tồn kho chính xác của showroom.
- Criterion 3: Danh sách số serial linh kiện phản ánh đúng trạng thái thực tế không phân tán qua chi nhánh.
- Criterion 4: Kiểm thử tự động `npm run check:fe` hoàn tất thành công với mã thoát 0.

## Verification Commands

- Command 1: `npm run check:fe`

