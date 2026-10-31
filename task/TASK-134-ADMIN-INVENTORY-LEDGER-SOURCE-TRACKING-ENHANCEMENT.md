# Task: TASK-134 - Nâng Cấp Sổ Biến Động Kho Phân Định Nguồn Gốc Đơn Bán & Đơn Mua

- Feature: Admin Stock Ledger Source Tracking & Movement Audit
- Governing Spec: Yêu cầu kiểm toán dòng hàng hóa: Xem chi tiết từng dòng dịch chuyển biến động kho của linh kiện, thể hiện rõ dòng dịch chuyển đó bắt nguồn từ đơn bán hàng, đơn mua nhà cung cấp hay kiểm định lỗi kho
- Scope: shared
- Status: Pending

## Objective

Nâng cấp màn hình Sổ kho bất biến ([admin-stock-ledger-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/inventory/admin-stock-ledger-page.component.ts)) và API sổ cái backend để mọi dòng biến động tồn kho (`StockLedgerEntry`) thể hiện rõ ràng và minh bạch nguồn gốc phát sinh chứng từ:
- Thể hiện rõ dòng dịch chuyển bắt nguồn từ:
  - Đơn bán hàng (gắn nhãn Đơn Bán, hiển thị mã đơn hàng `ORD-...` kèm đường dẫn nhấp chuột điều hướng trực tiếp sang `/admin/orders/:id`).
  - Đơn mua nhà cung cấp (gắn nhãn Đơn Mua PO, hiển thị mã đơn mua `PO-...` kèm đường dẫn sang `/admin/procurement/purchase-orders/:id`).
  - Cách ly lỗi / Kiểm định kho (gắn nhãn Nội Bộ / Kiểm Định Kho, hiển thị lý do cách ly kiểm định).
- Bổ sung bộ lọc nhanh "Nguồn chứng từ" trên thanh công cụ lọc của trang Sổ kho: Tất Cả Nguồn / Đơn Bán Hàng / Đơn Mua Nhà Cung Cấp / Kiểm Định Kho Nội Bộ.
- Cập nhật backend [inventory.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/admin/inventory.service.ts) để trả về tường minh các trường: `originType`, `originId`, `originCode`, `originUrl` và hỗ trợ lọc dữ liệu theo `originType`.

## Technical Context And Dependencies

- Pre-requisites: Hoàn thành TASK-126.
- Reusable Assets: `SelectComponent`, `ButtonDirective`, `BadgeDirective`, `StockLedgerEntryItem`, `AdminInventoryService`.
- Target Files:
  - `fe/src/app/features/admin/inventory/admin-stock-ledger-page.component.ts`
  - `fe/src/app/features/admin/inventory/services/admin-inventory.service.ts`
  - `be/src/services/admin/inventory.service.ts`
  - `be/src/validations/admin/inventory.schema.ts`

## Checklist

- [ ] Bổ sung trường `originType: 'ALL' | 'ORDER' | 'PURCHASE_ORDER' | 'QUARANTINE'` vào schema kiểm thực Zod [inventory.schema.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/validations/admin/inventory.schema.ts).
- [ ] Cập nhật hàm `getLedgerEntries` và `getQuantLedger` trong [inventory.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/admin/inventory.service.ts) để trích xuất chính xác `originType`, `originId`, `originCode` và lọc theo nguồn phát sinh chứng từ.
- [ ] Mở rộng kiểu dữ liệu `StockLedgerEntryItem` và `LedgerFilterParams` trong [admin-inventory.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/inventory/services/admin-inventory.service.ts).
- [ ] Bổ sung bộ chọn dropdown "Nguồn chứng từ" trên thanh công cụ lọc của [admin-stock-ledger-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/inventory/admin-stock-ledger-page.component.ts).
- [ ] Tái cấu trúc cột "Mã chứng từ & Nguồn gốc" trên bảng sổ kho: hiển thị huy hiệu loại nguồn phát sinh và liên kết nhấp chuột mở trang chi tiết tương ứng.
- [ ] Chạy kiểm thử tự động `npm run check:fe` và `npm run check:be` đạt exit code 0.

## Acceptance Criteria

- Criterion 1: Mọi dòng biến động tồn kho trên bảng Sổ kho đều phân biệt rõ ràng bắt nguồn từ đơn bán hàng, đơn mua PO hay kiểm định kho, có đường dẫn chuyển đến chi tiết chứng từ tương ứng.
- Criterion 2: Bộ lọc nguồn chứng từ hoạt động chuẩn xác, cho phép lọc riêng các giao dịch của đơn bán hàng hoặc đơn mua hàng PO.
- Criterion 3: Giao diện trực quan, định dạng số dạng `tabular tabular-nums`, tuân thủ chuẩn tương phản NVIDIA design tokens, không sử dụng icon/emoji.

## Verification Commands

- Command 1: `npm run check:fe`
- Command 2: `npm run check:be`

