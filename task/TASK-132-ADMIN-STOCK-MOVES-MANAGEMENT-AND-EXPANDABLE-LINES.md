# Task: TASK-132 - Quản Lý Phiếu Kho & Mở Rộng Dropdown Dòng Dịch Chuyển Linh Kiện

- Feature: Admin Inventory Stock Moves Management
- Governing Spec: Yêu cầu quản lý phiếu kho: Quản lý tập trung các phiếu kho (Stock Moves), mỗi dòng phiếu kho có thể mở rộng (expand/dropdown) để xem chi tiết danh sách linh kiện (StockMoveLine) bên trong
- Scope: shared
- Status: Pending

## Objective

Xây dựng giao diện danh sách phiếu kho chuyên biệt tại tuyến đường `/admin/inventory/moves` nhằm quản lý tập trung toàn bộ các phiếu luân chuyển kho (Stock Moves) trong hệ thống:
- Cung cấp API backend `GET /v1/admin/inventory/moves` với đầy đủ bộ lọc theo loại phiếu (`moveType`: `PURCHASE_RECEIPT`, `ORDER_ISSUE`, `TRANSFER`, `RETURN_IN`, `RETURN_OUT`, `QUARANTINE`, ...), trạng thái (`status`: `DRAFT`, `RESERVED`, `ASSIGNED`, `DONE`, `CANCELLED`, `VALIDATED`), tìm kiếm mã phiếu và phân trang.
- Trên giao diện Admin: Xây dựng bảng danh sách phiếu kho dạng Master-Detail. Mỗi hàng đại diện cho một phiếu kho (Mã phiếu, loại phiếu, trạng thái, mã chứng từ liên kết đơn bán/đơn mua, ngày tạo, người lập, lý do).
- Cho phép người dùng nhấp vào nút mũi tên mở rộng (expand/dropdown) trên từng hàng để hiển thị ngay bảng con bên dưới chứa toàn bộ danh sách các dòng dịch chuyển (`StockMoveLine`: Mã SKU, tên linh kiện, số lượng kế hoạch, số lượng thực tế, giá vốn, danh sách mã sê-ri liên kết nếu có).
- Bổ sung mục điều hướng "Phiếu Kho" vào sidebar quản trị kho trong [admin-navigation.constants.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/constants/admin-navigation.constants.ts) và đăng ký tuyến đường trong [admin.routes.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/admin.routes.ts).

## Technical Context And Dependencies

- Pre-requisites: Hoàn thành TASK-126.
- Reusable Assets: `ButtonDirective`, `SelectComponent`, `BadgeDirective`, `AdminApiService`, Prisma models `StockMove`, `StockMoveLine`.
- Target Files:
  - `fe/src/app/features/admin/inventory/admin-stock-moves-page.component.ts` (Tạo mới)
  - `fe/src/app/features/admin/inventory/services/admin-stock-move.service.ts` (Tạo mới)
  - `fe/src/app/features/admin/admin.routes.ts`
  - `fe/src/app/features/admin/constants/admin-navigation.constants.ts`
  - `be/src/routes/admin/inventory.routes.ts`
  - `be/src/services/admin/inventory.service.ts`
  - `be/src/validations/admin/inventory.schema.ts`

## Checklist

- [ ] Định nghĩa schema kiểm thực Zod cho truy vấn danh sách phiếu kho (`queryStockMovesSchema`) tại [inventory.schema.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/validations/admin/inventory.schema.ts) với các tham số: `search`, `moveType`, `status`, `page`, `limit`.
- [ ] Triển khai hàm `getStockMoves` trong [inventory.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/admin/inventory.service.ts) để truy vấn bảng `StockMove` kèm `lines` (`StockMoveLine`), thông tin SKU `productVariant`, đơn mua hàng `purchaseOrder`, đơn bán hàng `order` và người thực hiện.
- [ ] Đăng ký route `GET /moves` trong [inventory.routes.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/routes/admin/inventory.routes.ts) dưới sự bảo vệ của middleware xác thực admin.
- [ ] Xây dựng dịch vụ Angular [admin-stock-move.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/inventory/services/admin-stock-move.service.ts) quản lý tín hiệu danh sách phiếu kho, phân trang, bộ lọc và trạng thái mở rộng dòng.
- [ ] Xây dựng component giao diện [admin-stock-moves-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/inventory/admin-stock-moves-page.component.ts) hiển thị bảng phiếu kho kèm nút mở rộng dropdown xem chi tiết các `StockMoveLine`.
- [ ] Đăng ký tuyến đường `inventory/moves` vào [admin.routes.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/admin.routes.ts) và thêm liên kết "Phiếu Kho" vào menu Quản Lý Kho trong [admin-navigation.constants.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/constants/admin-navigation.constants.ts).
- [ ] Chạy kiểm thử tự động `npm run check:fe` và `npm run check:be` đạt exit code 0.

## Acceptance Criteria

- Criterion 1: Quản trị viên truy cập được màn hình `/admin/inventory/moves`, lọc và tìm kiếm được phiếu kho theo mã phiếu, loại phiếu (`moveType`) và trạng thái (`status`).
- Criterion 2: Nhấn nút mở rộng (expand/dropdown) trên bất kỳ hàng phiếu kho nào sẽ hiển thị tức thì danh sách các dòng linh kiện bên trong (`StockMoveLine`) gồm SKU, tên linh kiện, số lượng kế hoạch/thực tế, giá vốn và sê-ri liên quan mà không cần reload trang.
- Criterion 3: Component tuân thủ OnPush change detection, Angular Signals, không sử dụng icon/emoji và không chứa chú thích đánh số thứ tự trong mã nguồn.

## Verification Commands

- Command 1: `npm run check:fe`
- Command 2: `npm run check:be`

