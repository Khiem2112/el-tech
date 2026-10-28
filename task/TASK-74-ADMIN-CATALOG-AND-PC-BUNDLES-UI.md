# Task: TASK-74 - Chuẩn Hóa Giao Diện Danh Mục, Thương Hiệu, Mẫu Sản Phẩm, Biến Thể Và PC Bundles

- Feature: Catalog Master Data UI, Dynamic Spec Schema Form, Variant Grid & PC Bundle Pricing Alignment
- Governing Spec: [report/admin_subsystem_ui_ux_issues_report.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/report/admin_subsystem_ui_ux_issues_report.md) (Nhóm 1, 2, 3, 4, 5, 6), [docs/admin-portal-screens-and-modals.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/docs/admin-portal-screens-and-modals.md) (SCR-03 đến SCR-08)
- Scope: frontend
- Priority: P1 (High)
- Status: Complete

## Traceability & Graph Links

- Task Type: `ui-ux-fix`
- Issue References: UI/UX Nhóm 1-6 (Danh mục & PC Bundles)
- Fixes Issues From:
  - [[TASK-41-ADMIN-CATEGORIES-AND-DYNAMIC-SPEC-SCHEMA]]
  - [[TASK-42-ADMIN-BRANDS-MANAGEMENT]]
  - [[TASK-43-ADMIN-PRODUCT-TEMPLATES-LIST-AND-DYNAMIC-DETAIL]]
  - [[TASK-44-ADMIN-VARIANTS-SYSTEM-CATALOG]]
  - [[TASK-45-ADMIN-PC-BUNDLES-AND-VIRTUAL-BOM]]

## Objective

Chuẩn hóa toàn diện giao diện Quản lý danh mục ngành hàng, thương hiệu, mẫu sản phẩm, danh mục biến thể SKU và bộ máy tính dựng sẵn (PC Bundles):
1. Xóa bỏ hoàn toàn mã màn hình `SCR-03`, `SCR-04`, `SCR-05`, `SCR-06`, `SCR-07`, `SCR-08` và các chuỗi đặc tả kỹ thuật `(CAT-001, CAT-006, CAT-009)` khỏi tiêu đề trang.
2. Chuyển đổi toàn bộ layout, card và bảng biểu sang giao diện nền sáng `bg-surface border-line text-foreground` đồng bộ với Storefront.
3. Thay thế các thẻ `<select>` lọc danh mục và trạng thái sản phẩm bằng component [SelectComponent](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms/select/select.component.ts) (`app-select`).
4. Khắc phục hiện tượng vỡ layout trên bảng biến thể SKU: thêm `whitespace-nowrap font-mono` cho mã SKU, mã vạch Barcode, và giá bán.
5. Trên màn hình quản lý PC Bundles: Bổ sung trường nhập số tiền chiết khấu bộ combo (`discountAmount`) thay thế hoàn toàn cho việc gộp mã vào mô tả văn bản, kết nối với backend đã được cập nhật tại TASK-64.

## Technical Context And Dependencies

- Pre-requisites: TASK-64, TASK-71
- Reusable Assets:
  - [fe/src/app/components/atoms/select/select.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms/select/select.component.ts)
  - [fe/src/app/components/atoms/badge/badge.directive.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms/badge/badge.directive.ts)
  - [fe/src/app/components/atoms/button/button.directive.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms/button/button.directive.ts)
  - [fe/src/app/components/atoms/input/input.directive.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms/input/input.directive.ts)
- Target Files:
  - `fe/src/app/features/admin/categories/admin-categories-page.component.ts`
  - `fe/src/app/features/admin/brands/admin-brands-page.component.ts`
  - `fe/src/app/features/admin/templates/admin-product-templates-page.component.ts`
  - `fe/src/app/features/admin/templates/admin-product-template-detail-page.component.ts`
  - `fe/src/app/features/admin/variants/admin-variants-page.component.ts`
  - `fe/src/app/features/admin/pc-bundles/admin-pc-bundles-page.component.ts`

## Sub-agent Delegation Strategy

Giao nhiệm vụ cho sub-agent chuyên trách phân hệ Danh mục & Sản phẩm (`task-implementer`):
- Tập trung vào các thư mục `categories/`, `brands/`, `templates/`, `variants/`, `pc-bundles/`.
- Đảm bảo form nhập liệu thông số kỹ thuật động (Dynamic Spec Schema) hiển thị sạch sẽ trên nền sáng.

## Checklist

- [x] Trong [admin-categories-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/categories/admin-categories-page.component.ts):
  - Xóa bỏ huy hiệu `SCR-03` cạnh H1 và chuỗi `(CAT-001, CAT-006, CAT-009)`.
  - Chuyển cây danh mục và bảng ngành hàng sang nền sáng `bg-surface border-line text-foreground`.
  - Thay thế dropdown cấp cha bằng `app-select`.
- [x] Trong [admin-brands-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/brands/admin-brands-page.component.ts):
  - Xóa bỏ `SCR-04`, chuyển đổi thẻ hãng sản xuất sang nền sáng và áp dụng `button[appButton]`.
- [x] Trong [admin-product-templates-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/templates/admin-product-templates-page.component.ts) và [admin-product-template-detail-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/templates/admin-product-template-detail-page.component.ts):
  - Xóa bỏ `SCR-05`, `SCR-06`.
  - Nâng các nhãn `text-[11px]` lên `text-xs font-semibold`.
  - Chuyển bố cục 2 cột sang nền sáng `bg-surface border-line text-foreground`.
  - Thay thế bộ chọn danh mục, thương hiệu, trạng thái vòng đời sản phẩm bằng `app-select`.
- [x] Trong [admin-variants-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/variants/admin-variants-page.component.ts):
  - Xóa bỏ `SCR-07`.
  - Nâng cỡ chữ các dòng dữ liệu biến thể từ 10px-11px lên chuẩn 12px-14px.
  - Bổ sung `whitespace-nowrap font-mono` cho cột SKU, Barcode, Giá niêm yết và Giá bán.
  - Thêm `min-w-[1000px]` vào thẻ `<table>`.
- [x] Trong [admin-pc-bundles-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/pc-bundles/admin-pc-bundles-page.component.ts):
  - Xóa bỏ `SCR-08`.
  - Cập nhật Form quản lý PC Bundle: Bổ sung trường nhập số tiền chiết khấu `Số tiền giảm giá combo (VND)` kiểu số `discountAmount`, hiển thị trực quan tổng tiền sau chiết khấu.
  - Chuyển giao diện Virtual BOM và danh sách cấu hình sang nền sáng `bg-surface border-line text-foreground`.

## Acceptance Criteria

- Criterion 1: Toàn bộ phân hệ Danh mục, Sản phẩm và PC Bundles chuyển sang nền sáng nhất quán.
- Criterion 2: Không còn mã `SCR-xx` hay chuỗi kỹ thuật đặc tả trên tiêu đề các trang.
- Criterion 3: Bảng biến thể SKU hiển thị thẳng hàng, không ngắt dòng mã SKU hay giá tiền.
- Criterion 4: Giao diện PC Bundles hỗ trợ nhập và hiển thị rõ ràng số tiền chiết khấu combo.
- Criterion 5: Lệnh `npm run check:fe` chạy thành công với exit code 0.

## Verification Commands

- Command 1: npm run check:fe
