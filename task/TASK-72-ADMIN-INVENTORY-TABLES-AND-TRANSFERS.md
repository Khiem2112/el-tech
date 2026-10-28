# Task: TASK-72 - Chuẩn Hóa Bảng Dữ Liệu Kho, Điều Chuyển, Tồn Kho Và Nhập Hàng PO

- Feature: Inventory & Procurement Table Layout, Whitespace-Nowrap, Spartan Select & Light Theme Alignment
- Governing Spec: [report/admin_subsystem_ui_ux_issues_report.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/report/admin_subsystem_ui_ux_issues_report.md) (Nhóm 1, 2, 3, 4, 5, 6), [docs/admin-portal-screens-and-modals.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/docs/admin-portal-screens-and-modals.md) (SCR-15 đến SCR-22)
- Scope: frontend
- Priority: P1 (High)
- Status: Complete

## Objective

Khắc phục toàn diện các lỗi hiển thị nghiêm trọng tại phân hệ Kho vận và Mua hàng (đã được ghi nhận chi tiết qua hình ảnh chụp thực tế màn hình Điều Chuyển Kho Nội Bộ):
1. Khắc phục hiện tượng vỡ layout bảng dữ liệu: Mã phiếu `TRF-2026-0006` bị ngắt thành 3 dòng, số lượng `2 chiếc` bị ngắt thành 2 dòng, huy hiệu trạng thái `ĐÃ NHẬN ĐỦ` bị bẻ thành 3 dòng, nút thao tác `Xuất kho` bị co nghẽn ngắt thành 2 dòng.
2. Thay thế 100% các thẻ `<select>` nguyên thủy thô sơ bằng component nguyên tử [SelectComponent](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms/select/select.component.ts) (`app-select`), kích hoạt tìm kiếm nhanh cho danh sách chi nhánh và nhà cung cấp, loại bỏ các chuỗi kỹ thuật in hoa thô như `(REQUESTED)`, `(IN_TRANSIT)`.
3. Chuyển đổi toàn bộ bảng biểu, thẻ card thống kê sang nền sáng `bg-surface border-line shadow-card text-foreground`.
4. Loại bỏ các mã tài liệu `SCR-18`, `SCR-15`, `SCR-16`, `SCR-17`, `SCR-20`, `SCR-21` và chuỗi đặc tả `(TRF-001 đến TRF-006, INV-003)` khỏi tiêu đề trang.

## Technical Context And Dependencies

- Pre-requisites: TASK-71
- Reusable Assets:
  - [fe/src/app/components/atoms/select/select.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms/select/select.component.ts)
  - [fe/src/app/components/atoms/badge/badge.directive.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms/badge/badge.directive.ts)
  - [fe/src/app/components/atoms/button/button.directive.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms/button/button.directive.ts)
  - [fe/src/app/components/atoms/input/input.directive.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms/input/input.directive.ts)
- Target Files:
  - `fe/src/app/features/admin/inventory/admin-transfers-page.component.ts`
  - `fe/src/app/features/admin/inventory/admin-inventory-balances-page.component.ts`
  - `fe/src/app/features/admin/inventory/admin-stock-ledger-page.component.ts`
  - `fe/src/app/features/admin/procurement/admin-purchase-orders-page.component.ts`
  - `fe/src/app/features/admin/serials/admin-serials-page.component.ts`
  - `fe/src/app/features/admin/suppliers/admin-suppliers-page.component.ts`
  - `fe/src/app/features/admin/inventory/components/dispatch-transfer-dialog.component.ts`

## Sub-agent Delegation Strategy

Giao nhiệm vụ cho sub-agent chuyên trách phân hệ Kho & Mua hàng (`task-implementer`):
- Bổ sung cấu trúc `min-w-[1000px]` và các lớp `whitespace-nowrap tabular-nums` trên tất cả các cột dữ liệu nhạy cảm.
- Chuyển đổi dữ liệu tùy chọn thành mảng `SelectOption[]` chuẩn để nạp vào `app-select`.
- Tách biệt hoàn toàn với các tệp thuộc phân hệ Đơn hàng hay Catalog.

## Checklist

- [x] Trong [admin-transfers-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/inventory/admin-transfers-page.component.ts):
  - Xóa bỏ huy hiệu `SCR-18` cạnh H1 và chuỗi mô tả `(TRF-001 đến TRF-006, INV-003)`.
  - Thay thế 4 thẻ `<select>` thô bằng `app-select` có tìm kiếm chi nhánh.
  - Thêm `min-w-[1000px]` vào thẻ `<table>`.
  - Thêm `whitespace-nowrap font-mono font-bold` cho cột Mã phiếu (`TRF-...`).
  - Thêm `whitespace-nowrap tabular-nums` cho cột Số lượng (`2 chiếc`).
  - Cột Trạng thái sử dụng `span[appBadge]` với `whitespace-nowrap`.
  - Cột Thao tác: Bọc trong `div` với `whitespace-nowrap shrink-0`, nút bấm sử dụng `button[appButton]` size `sm`, đảm bảo chữ `Xuất kho` không bị ngắt thành 2 dòng.
  - Chuyển đổi thẻ Card, thead (`bg-surface-alt border-b border-line text-muted font-semibold`), tbody (`border-b border-line hover:bg-surface-alt/70 text-foreground`) sang nền sáng.
- [x] Trong [admin-inventory-balances-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/inventory/admin-inventory-balances-page.component.ts):
  - Xóa bỏ `SCR-15`, thay thế các bộ lọc chi nhánh/danh mục/mức tồn bằng `app-select`.
  - Sửa lỗi class không hợp lệ `py-0.2`, nâng cỡ chữ badge `SN` từ 10px lên `text-xs font-semibold`.
  - Thêm `whitespace-nowrap font-mono` cho SKU, mã vạch và các cột số dư tồn kho (`onHand`, `reserved`, `available`).
  - Chuyển giao diện sang nền sáng `bg-surface border-line`.
- [x] Trong [admin-stock-ledger-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/inventory/admin-stock-ledger-page.component.ts):
  - Xóa bỏ `SCR-16`, tích hợp `app-select` cho bộ lọc loại chứng từ và chi nhánh.
  - Định dạng bảng sổ cái với `whitespace-nowrap tabular-nums`, hiển thị số dư rõ ràng trên nền sáng.
- [x] Trong [admin-purchase-orders-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/procurement/admin-purchase-orders-page.component.ts) và [admin-suppliers-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/suppliers/admin-suppliers-page.component.ts):
  - Xóa bỏ `SCR-20`, `SCR-19`.
  - Khắc phục ngắt dòng cột mã PO, mã số thuế, số điện thoại nhà cung cấp.
  - Sử dụng `app-select` và chuyển đổi sang nền sáng.
- [x] Trong [admin-serials-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/serials/admin-serials-page.component.ts):
  - Xóa bỏ `SCR-17`. Sửa sai lệch nghiệp vụ: Không hiển thị sê-ri ở trạng thái `RESERVED (ORD-xxx)` khi khách vừa đặt hàng online, chỉ hiển thị số sê-ri khả dụng `AVAILABLE` hoặc đã gán khi xuất kho `ASSIGNED` theo quy tắc `INV-007`.
- [x] Trong hộp thoại xuất chuyển kho [dispatch-transfer-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/inventory/components/dispatch-transfer-dialog.component.ts):
  - Xóa chuỗi `MOD-25:` trên tiêu đề hiển thị; chuyển sang nền sáng `bg-surface border-line text-foreground`.

## Acceptance Criteria

- Criterion 1: Mọi bảng dữ liệu kho hiển thị chuẩn xác, không bị co giật, không ngắt dòng bất thường ở mã phiếu, số lượng, trạng thái hay nút bấm.
- Criterion 2: 100% dropdown bộ lọc kho và mua hàng sử dụng `app-select` đồng bộ, không còn thẻ `<select>` nguyên thủy.
- Criterion 3: Không còn bất kỳ mã `SCR-xx`, `MOD-xx` hay chuỗi đặc tả `TRF-001` nào xuất hiện trên giao diện.
- Criterion 4: Giao diện toàn bộ phân hệ Kho hiển thị trên nền sáng tinh tế, tương phản cao.
- Criterion 5: Lệnh `npm run check:fe` chạy thành công với exit code 0.

## Verification Commands

- Command 1: npm run check:fe
