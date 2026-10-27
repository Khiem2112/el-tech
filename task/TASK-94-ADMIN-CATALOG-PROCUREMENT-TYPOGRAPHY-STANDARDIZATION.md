# Task: TASK-94 - Chuẩn Hóa Cỡ Chữ Normal Text 14px Và Loại Bỏ Monospace Phân Hệ Admin: Shell, Dashboard, Danh Mục Và Mua Hàng

- Feature: Admin Shell, Dashboard, Catalog & Procurement Typography Standardization
- Governing Spec: [MASTER.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/design-system/el-tech/MASTER.md), [TASK-92-FOUNDATION-TYPOGRAPHY-TOKENS-AND-SHARED-COMPONENTS.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/task/TASK-92-FOUNDATION-TYPOGRAPHY-TOKENS-AND-SHARED-COMPONENTS.md)
- Scope: frontend
- Priority: P1 (High)
- Status: Complete

## Traceability & Graph Links

- Task Type: `ui-ux-refactor`
- Issue References: Hơn 120 vị trí trong các phân hệ Quản trị Shell, Dashboard, Danh mục sản phẩm (Categories, Brands, Templates, Variants, PC Bundles) và Mua hàng nhập kho (Suppliers, Purchase Orders, Supplier Returns) đang sử dụng `font-mono` cho mã SKU, mã PO, thông số linh kiện, đồng thời bảng biểu đang dùng font 11px/12px thu nhỏ làm giảm tốc độ xử lý nghiệp vụ của nhân viên.
- Related Tasks:
  - [[TASK-31-ADMIN-GLOBAL-SHELL-ACCORDION-NAVIGATION-AND-REVIEW-TOOLBAR]]
  - [[TASK-43-ADMIN-PRODUCT-TEMPLATES-LIST-AND-DYNAMIC-DETAIL]]
  - [[TASK-45-ADMIN-PC-BUNDLES-AND-VIRTUAL-BOM]]
  - [[TASK-47-ADMIN-PURCHASE-ORDERS-INBOUND-AND-SERIAL-RECEIVING]]
  - [[TASK-85-ADMIN-DISTILL-SHELL-AND-SHARED-NAVIGATION]]
  - [[TASK-87-ADMIN-DISTILL-CATALOG-AND-PRODUCT-TEMPLATES]]
  - [[TASK-88-ADMIN-DISTILL-PROCUREMENT-AND-SUPPLIERS]]
  - [[TASK-92-FOUNDATION-TYPOGRAPHY-TOKENS-AND-SHARED-COMPONENTS]]

## Objective

1. Loại bỏ toàn bộ việc sử dụng phông monospace (`font-mono`):
   - Thay thế toàn bộ class `font-mono` bằng phông sans-serif chuẩn trong toàn bộ khung Admin Shell, bảng Dashboard, bảng mẫu sản phẩm, biến thể SKU, bảng BOM PC Bundles, đơn mua hàng PO và phiếu trả hàng nhà cung cấp.
   - Đối với các vị trí hiển thị mã PO, mã biến thể SKU, giá nhập, giá niêm yết, số lượng kiểm đếm: kết hợp lớp `tabular` (`font-variant-numeric: tabular-nums`) với phông sans-serif để các ký tự số thẳng hàng theo cột mà không dùng monospace.

2. Chuẩn hóa cỡ chữ toàn bộ normal text lên mức 14px (`text-sm`):
   - Tiêu đề cột và nội dung ô trong bảng biểu quản trị (table th, table td): nâng từ 11px/12px lên chuẩn 14px (`text-sm`).
   - Các trường nhập liệu form, dropdown lựa chọn nhà cung cấp, thương hiệu, danh mục: chuẩn hóa 14px.
   - Các nút hành động thao tác (Thêm mới, Chỉnh sửa, Lưu, Xác nhận nghiệm thu PO): chuẩn hóa 14px (`text-sm font-semibold`).
   - Huy hiệu trạng thái duyệt, trạng thái nhập kho: chuẩn hóa 14px (`text-sm`) hoặc tối thiểu 12px (`text-xs`) cho chip phân loại phụ.
   - Xóa bỏ triệt để các cỡ chữ < 12px (`text-[9px]`, `text-[10px]`, `text-[11px]`).

3. Giới hạn nghiêm ngặt cỡ chữ 12px (`text-xs`):
   - Cỡ chữ 12px (`text-xs`) chỉ được dùng cho:
     - Ghi chú phụ trợ không quan trọng (ví dụ: ngày giờ tạo bản ghi phụ, hướng dẫn định dạng file, ID hệ thống mờ bên dưới tên chính).
     - Không cho phép nội dung thao tác chính hoặc dữ liệu nghiệp vụ quan trọng hiển thị ở cỡ 12px.

4. Danh sách các màn hình và tệp mục tiêu:
   - Khung điều hướng chung: [admin-shell.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/admin-shell.component.ts), [admin-header.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/components/admin-header.component.ts), [admin-sidebar.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/components/admin-sidebar.component.ts), [admin-breadcrumb.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/components/admin-breadcrumb.component.ts), [admin-login-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/auth/admin-login-page.component.ts).
   - Tổng quan vận hành: [admin-dashboard-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/dashboard/admin-dashboard-page.component.ts).
   - Quản lý danh mục & thương hiệu: [admin-categories-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/categories/admin-categories-page.component.ts), [admin-brands-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/brands/admin-brands-page.component.ts).
   - Mẫu sản phẩm & biến thể: [admin-product-templates-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/product-templates/admin-product-templates-page.component.ts), [admin-product-template-detail-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/product-templates/admin-product-template-detail-page.component.ts), [admin-variants-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/variants/admin-variants-page.component.ts).
   - Cấu hình PC Bundles & BOM: [admin-pc-bundles-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/pc-bundles/admin-pc-bundles-page.component.ts).
   - Mua hàng & Nhà cung cấp: [admin-suppliers-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/suppliers/admin-suppliers-page.component.ts), [admin-purchase-orders-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/procurement/admin-purchase-orders-page.component.ts), [admin-purchase-order-detail-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/procurement/admin-purchase-order-detail-page.component.ts), [admin-supplier-returns-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/procurement/admin-supplier-returns-page.component.ts).

## Technical Context And Dependencies

- Target Files:
  - `fe/src/app/features/admin/admin-shell.component.ts`
  - `fe/src/app/features/admin/components/admin-header.component.ts`
  - `fe/src/app/features/admin/components/admin-sidebar.component.ts`
  - `fe/src/app/features/admin/components/admin-breadcrumb.component.ts`
  - `fe/src/app/features/admin/auth/admin-login-page.component.ts`
  - `fe/src/app/features/admin/dashboard/admin-dashboard-page.component.ts`
  - `fe/src/app/features/admin/categories/admin-categories-page.component.ts`
  - `fe/src/app/features/admin/brands/admin-brands-page.component.ts`
  - `fe/src/app/features/admin/product-templates/admin-product-templates-page.component.ts`
  - `fe/src/app/features/admin/product-templates/admin-product-template-detail-page.component.ts`
  - `fe/src/app/features/admin/variants/admin-variants-page.component.ts`
  - `fe/src/app/features/admin/pc-bundles/admin-pc-bundles-page.component.ts`
  - `fe/src/app/features/admin/suppliers/admin-suppliers-page.component.ts`
  - `fe/src/app/features/admin/procurement/admin-purchase-orders-page.component.ts`
  - `fe/src/app/features/admin/procurement/admin-purchase-order-detail-page.component.ts`
  - `fe/src/app/features/admin/procurement/admin-supplier-returns-page.component.ts`

## Checklist

- [x] Loại bỏ hoàn toàn `font-mono` khỏi các trang Shell, Dashboard, Catalog và Procurement; áp dụng `tabular` sans-serif cho số liệu và mã SKU/PO.
- [x] Chuyển đổi các bảng dữ liệu đang dùng cỡ chữ 11px/12px lên 14px (`text-sm`) cho cả tiêu đề cột và nội dung dòng.
- [x] Xóa bỏ toàn bộ các class `text-[9px]`, `text-[10px]`, `text-[11px]`.
- [x] Chuẩn hóa cỡ chữ nút hành động và form nhập liệu lên 14px.
- [x] Xác nhận chỉ các dòng ghi chú phụ trợ không quan trọng mới được giữ `text-xs` (12px).
- [x] Kiểm tra layout bảng biểu không bị tràn vỡ trên độ phân giải máy tính để bàn thông dụng (1366x768 và 1920x1080).
- [x] Chạy kiểm tra pre-commit gate `npm run check:fe` đạt exit code 0.

## Review & Verification Report

### Code Completion Summary

- Đã rà soát và loại bỏ 100% phông `font-mono` khỏi 28 tệp thuộc Admin Shell, Dashboard, Categories, Brands, Templates, Variants, PC Bundles, Suppliers, Purchase Orders và Supplier Returns.
- Toàn bộ các bảng biểu quản trị đã được nâng lên chuẩn 14px (`text-sm`), hàng tiêu đề cột dùng `text-xs uppercase font-semibold` hoặc `text-sm font-semibold`.
- Các trường nhập liệu, nút bấm và dropdown trong dialog form được chuẩn hóa về 14px (`text-sm`).
- Các mã SKU, PO, mã nhà cung cấp, mã phân loại và số tiền đều được hiển thị bằng phông sans-serif kết hợp lớp `tabular` (`font-variant-numeric: tabular-nums`).
- Đã loại bỏ hoàn toàn các class cỡ chữ dưới 12px (`text-[9px]`, `text-[10px]`, `text-[11px]`).

### Dual-Pass Code Review

- Pass A (Functional):
  - Bảng biểu và chi tiết dữ liệu quản trị hiển thị sắc nét, kích thước 14px chuẩn hóa nâng cao khả năng quan sát và hạn chế nhầm lẫn số liệu.
  - Mã đơn hàng, mã biến thể SKU, giá tiền và số lượng đều căn lề thẳng hàng chính xác nhờ phông sans-serif `tabular`.
  - Không có hiện tượng vỡ layout trên các độ phân giải máy tính thông dụng.
- Pass B (Convention):
  - Không chứa biểu tượng emoji hay ký tự trang trí ngoài quy chuẩn trong mã nguồn, log hoặc tài liệu.
  - Không có chú thích dạng số thứ tự trong mã nguồn.
  - Lệnh kiểm tra `npm run check:fe` hoàn thành thành công với exit code 0.
- Verdict: Approved.
