# Task: TASK-87 - Tinh Gọn Danh Mục Sản Phẩm, Biến Thể Và PC Bundles Bằng Impeccable Distill

- Feature: Admin Catalog, Product Templates, Variants, Bundles, Categories & Brands Distillation
- Governing Spec: [MASTER.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/design-system/el-tech/MASTER.md), [SKILL.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/.agents/skills/impeccable/SKILL.md), [distill.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/.agents/skills/impeccable/reference/distill.md), [admin-portal-screens-and-modals.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/docs/admin-portal-screens-and-modals.md) (SCR-03, SCR-04, SCR-05, SCR-06, SCR-07, SCR-08)
- Scope: frontend
- Priority: P2 (Medium)
- Status: To Do

## Traceability & Graph Links

- Task Type: `ui-ux-distill`
- Issue References: Màn hình chi tiết mẫu sản phẩm và bộ cấu hình PC Bundle bị chia cắt bởi quá nhiều thẻ container phụ; bảng đặc tả động có nhiều khung viền lồng nhau làm giảm khả năng đọc lướt nhanh thông số kỹ thuật.
- Related Tasks:
  - [[TASK-33-ADMIN-TEMPLATE-DETAIL-ERGONOMIC-LAYOUT-AND-STRUCTURED-VARIANT-FORM]]
  - [[TASK-43-ADMIN-PRODUCT-TEMPLATES-LIST-AND-DYNAMIC-DETAIL]]
  - [[TASK-45-ADMIN-PC-BUNDLES-AND-VIRTUAL-BOM]]
  - [[TASK-74-ADMIN-CATALOG-AND-PC-BUNDLES-UI]]

## Objective

Thực hiện tinh gọn giao diện theo nguyên tắc Impeccable Distill cho toàn bộ phân hệ Danh mục và Mẫu sản phẩm linh kiện:

1. Tinh gọn Trang chi tiết mẫu sản phẩm [admin-product-template-detail-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/templates/admin-product-template-detail-page.component.ts):
   - Loại bỏ tình trạng lặp thông tin: không lặp lại tên danh mục, tên thương hiệu trên 3-4 vị trí khác nhau (breadcrumb, huy hiệu tiêu đề, thẻ thông tin chung).
   - Tinh gọn thanh tác vụ trên cùng: gom nhóm các nút hành động phụ vào menu thả xuống tinh tế, làm nổi bật nút tác vụ chính.
   - Bỏ các thẻ card lồng bên trong card (flatten structure) ở khu vực thông tin cơ bản và danh sách biến thể SKU.

2. Tinh gọn Thành phần hiển thị thông số động [dynamic-spec-renderer.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/templates/components/dynamic-spec-renderer.component.ts):
   - Thay thế các ô bọc viền dày bằng bố cục danh sách key-value gọn nhẹ, sắc nét theo hàng (`border-b border-line/50 py-2`).
   - Đơn giản hóa các nhãn thông số (CPU Socket, RAM Bus, TDP, Dimensions) để kỹ thuật viên dễ dàng tra cứu mà không bị phân tâm bởi khung viền đậm.

3. Tinh gọn Hộp thoại biến thể và vòng đời sản phẩm:
   - [variant-form-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/templates/components/variant-form-dialog.component.ts): Tinh gọn biểu mẫu nhập biến thể, gom nhóm các trường giá vốn, giá niêm yết, SKU và barcode thành các khối hợp lý, bỏ các mô tả trợ giúp dài dòng.
   - [lifecycle-transition-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/templates/components/lifecycle-transition-dialog.component.ts): Tinh gọn hộp thoại chuyển đổi trạng thái (DRAFT -> ACTIVE -> END_OF_LIFE) thành các lựa chọn rõ ràng, thao tác trong một cú nhấp.

4. Tinh gọn Danh sách mẫu sản phẩm và biến thể:
   - [admin-product-templates-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/templates/admin-product-templates-page.component.ts)
   - [admin-variants-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/variants/admin-variants-page.component.ts)
   - Tối giản bộ lọc (filter bar), giảm thiểu các ô chọn thừa và giữ lại bộ lọc danh mục, thương hiệu, trạng thái cùng ô tìm kiếm chính.
   - Tối ưu bảng dữ liệu với khoảng đệm thoáng đãng, bổ sung `tabular-nums` cho các cột giá tiền và số lượng tồn kho.

5. Tinh gọn Quản lý Danh mục, Thương hiệu và PC Bundles:
   - [admin-categories-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/categories/admin-categories-page.component.ts), [category-form-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/categories/components/category-form-dialog.component.ts), [spec-schema-sheet.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/categories/components/spec-schema-sheet.component.ts)
   - [admin-brands-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/brands/admin-brands-page.component.ts), [brand-form-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/brands/components/brand-form-dialog.component.ts)
   - [admin-pc-bundles-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/pc-bundles/admin-pc-bundles-page.component.ts), [pc-bundle-sheet.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/pc-bundles/components/pc-bundle-sheet.component.ts)
   - Tinh gọn ngăn kéo cấu hình Virtual BOM của PC Bundle: thể hiện rõ tổng giá linh kiện lẻ, giá trọn gói sau chiết khấu và danh sách linh kiện được chọn mà không cần các khung thẻ lồng nhau.

## Technical Context And Dependencies

- Target Files:
  - [admin-product-templates-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/templates/admin-product-templates-page.component.ts)
  - [admin-product-template-detail-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/templates/admin-product-template-detail-page.component.ts)
  - [dynamic-spec-renderer.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/templates/components/dynamic-spec-renderer.component.ts)
  - [lifecycle-transition-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/templates/components/lifecycle-transition-dialog.component.ts)
  - [variant-form-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/templates/components/variant-form-dialog.component.ts)
  - [admin-variants-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/variants/admin-variants-page.component.ts)
  - [admin-categories-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/categories/admin-categories-page.component.ts)
  - [category-form-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/categories/components/category-form-dialog.component.ts)
  - [spec-schema-sheet.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/categories/components/spec-schema-sheet.component.ts)
  - [admin-brands-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/brands/admin-brands-page.component.ts)
  - [brand-form-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/brands/components/brand-form-dialog.component.ts)
  - [admin-pc-bundles-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/pc-bundles/admin-pc-bundles-page.component.ts)
  - [pc-bundle-sheet.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/pc-bundles/components/pc-bundle-sheet.component.ts)

## Checklist

- [ ] Tinh gọn trang chi tiết mẫu sản phẩm: xóa bỏ thông tin lặp và làm phẳng bố cục card.
- [ ] Tối giản dynamic-spec-renderer thành danh sách thông số gọn đẹp, dễ đọc lướt nhanh.
- [ ] Tinh gọn biểu mẫu nhập biến thể và hộp thoại chuyển đổi vòng đời sản phẩm.
- [ ] Đơn giản hóa bộ lọc và bảng dữ liệu trên trang templates và variants.
- [ ] Tinh gọn các biểu mẫu và ngăn kéo danh mục, thương hiệu, PC Bundle BOM drawer.
- [ ] Chạy kiểm tra `npm run check:fe` với exit code 0.
