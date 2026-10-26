# Task: TASK-73 - Chuẩn Hóa Phân Hệ Đơn Hàng, Chi Tiết Đơn Và Toàn Bộ Hộp Thoại Thao Tác (Modals)

- Feature: Orders Operations, Modal Title Sanitization, Barcode/Serial Scanning & OTP/QR Fee Integration
- Governing Spec: [report/admin_subsystem_ui_ux_issues_report.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/report/admin_subsystem_ui_ux_issues_report.md) (Nhóm 1, 2, 3, 4, 5, 6), [report/admin_subsystem_business_logic_issues_report.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/report/admin_subsystem_business_logic_issues_report.md) (Mục 4), [docs/admin-portal-screens-and-modals.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/docs/admin-portal-screens-and-modals.md) (SCR-09, SCR-10, MOD-07 đến MOD-21)
- Scope: frontend
- Priority: P1 (High)
- Status: Complete

## Traceability & Graph Links

- Task Type: `ui-ux-fix`
- Issue References: UI/UX Nhóm 1-6, MOD-07 đến MOD-21
- Fixes Issues From:
  - [[TASK-52-ADMIN-ORDERS-LIST-AND-SEGMENTED-PIPELINE]]
  - [[TASK-53-ADMIN-ORDER-DETAIL-LAYOUT-FINANCE-AND-AUDIT]]
  - [[TASK-54-ADMIN-ORDER-OPERATIONS-CONFIRM-PREPARE-ASSEMBLE-PICKUP]]
  - [[TASK-55-ADMIN-ORDER-OPERATIONS-SHIPPING-DELIVERY-FAILED-AND-RETURNS]]
  - [[TASK-56-ADMIN-ORDER-OPERATIONS-COMPLETION-CANCELLATION-AND-HOLD-RESOLUTION]]

## Objective

Chuẩn hóa toàn diện giao diện Danh sách đơn hàng (SCR-09), Chi tiết đơn hàng (SCR-10) và hơn 15 hộp thoại thao tác (MOD-07 đến MOD-21):
1. Xóa bỏ hoàn toàn mã màn hình `SCR-09`, `SCR-10` và chuỗi kỹ thuật `(ORD-001, ORD-003)` khỏi tiêu đề trang.
2. Xóa bỏ tiền tố mã tài liệu `(MOD-07)`, `(MOD-09)`, `(MOD-10)`, `(MOD-11)`, `(MOD-17)`, `(MOD-18)`, `(MOD-19)` khỏi tiêu đề hiển thị của tất cả các modals/sheets; lưu vết kỹ thuật bằng thuộc tính `data-modal-id`.
3. Bổ sung các bước thao tác nghiệp vụ còn thiếu đã được chỉ ra trong báo cáo logic:
   - Trong MOD-09 (Chuyển lắp ráp) và MOD-11 (Xuất kho giao vận): Bổ sung giao diện quét mã vạch hoặc bộ chọn danh sách sê-ri vật lý đối với các linh kiện yêu cầu quản lý sê-ri (`serialRequired === true`) theo quy tắc `INV-013` và `INV-019`.
   - Trong MOD-19 (Phụ lục chuyển sang giao tận nơi): Bổ sung trường nhập mã xác thực OTP từ khách hàng và hiển thị mã VietQR thu phụ phí giao hàng trước khi hoàn tất tạo phụ lục theo quy tắc `PRC-008` và `PAY-019`.
4. Chuyển đổi toàn bộ bảng đơn hàng, thẻ tóm tắt tài chính và các hộp thoại sang giao diện nền sáng `bg-surface border-line text-foreground`, thay `<select>` bằng `app-select`, và nâng cỡ chữ tối thiểu lên 12px.

## Technical Context And Dependencies

- Pre-requisites: TASK-71
- Reusable Assets:
  - [fe/src/app/components/atoms/select/select.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms/select/select.component.ts)
  - [fe/src/app/components/atoms/badge/badge.directive.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms/badge/badge.directive.ts)
  - [fe/src/app/components/atoms/button/button.directive.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms/button/button.directive.ts)
  - [fe/src/app/components/atoms/input/input.directive.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms/input/input.directive.ts)
- Target Files:
  - `fe/src/app/features/admin/orders/admin-orders-page.component.ts`
  - `fe/src/app/features/admin/orders/admin-order-detail-page.component.ts`
  - Các modal tại `fe/src/app/features/admin/orders/components/modals/`

## Sub-agent Delegation Strategy

Giao nhiệm vụ cho sub-agent chuyên trách phân hệ Đơn hàng (`task-implementer`):
- Tập trung vào các trang và hộp thoại thuộc thư mục `orders/`.
- Đảm bảo các form Reactive Forms trong modals hoạt động trơn tru với các trường sê-ri và OTP mới.

## Checklist

- [x] Trong [admin-orders-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/admin-orders-page.component.ts):
  - Xóa bỏ huy hiệu `SCR-09` cạnh H1 và chuỗi `(ORD-001, ORD-003)`.
  - Nâng cỡ chữ các tab trạng thái từ `text-[11px]` lên `text-xs font-semibold`.
  - Thay thế 4 thẻ `<select>` lọc bằng `app-select` (bộ lọc chi nhánh, hình thức nhận hàng, trạng thái thanh toán, cờ lắp ráp PC).
  - Khắc phục class không hợp lệ `py-0.2`, thêm `whitespace-nowrap` trên badge `Lắp ráp PC` và `Linh kiện lẻ`.
  - Thêm `whitespace-nowrap` cho cột Mã đơn, Khách hàng, Tổng tiền, Trạng thái và Thao tác.
  - Chuyển đổi toàn bộ layout sang nền sáng `bg-surface border-line text-foreground`.
- [x] Trong [admin-order-detail-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/admin-order-detail-page.component.ts):
  - Xóa bỏ `SCR-10`.
  - Chuyển đổi toàn bộ các card chi tiết sản phẩm, nhóm combo PC Build, khối thông tin giao vận, tóm tắt tài chính và nhật ký kiểm toán sang nền sáng `bg-surface border-line shadow-card text-foreground`.
  - Định dạng bảng linh kiện với `whitespace-nowrap font-mono tabular-nums`, loại bỏ các cỡ chữ 10px-11px.
- [x] Trong các tệp hộp thoại tại `fe/src/app/features/admin/orders/components/modals/`:
  - [confirm-cod-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/components/modals/confirm-cod-dialog.component.ts): Đổi tiêu đề từ `Xác Nhận Đơn Hàng COD (MOD-07)` thành `Xác Nhận Đơn Hàng COD`.
  - [assemble-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/components/modals/assemble-dialog.component.ts): Đổi tiêu đề từ `Chuyển Lắp Ráp Máy Tính (MOD-09)` thành `Chuyển Lắp Ráp Máy Tính`; bổ sung danh sách chọn/quét số sê-ri cho các linh kiện có `serialRequired`.
  - [shipping-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/components/modals/shipping-dialog.component.ts): Đổi tiêu đề từ `Xuất Kho Giao Hàng (MOD-11)` thành `Xuất Kho Giao Hàng`; bổ sung kiểm tra sê-ri vật lý khi bàn giao đơn vị vận chuyển.
  - [cancel-order-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/components/modals/cancel-order-dialog.component.ts): Đổi tiêu đề từ `Hủy Đơn Hàng (MOD-17)` thành `Hủy Đơn Hàng`.
  - [amendment-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/components/modals/amendment-dialog.component.ts): Đổi tiêu đề từ `Tạo Phụ Lục Chuyển Đổi Phương Thức (MOD-19)` thành `Chuyển Đổi Sang Giao Hàng Tận Nơi`; bổ sung ô nhập mã OTP xác nhận của khách hàng và khối hiển thị mã QR thanh toán phụ cước vận chuyển.
  - Chuyển đổi 100% modal container sang nền sáng: `bg-surface border-line text-foreground shadow-xl`.

## Acceptance Criteria

- Criterion 1: Toàn bộ tiêu đề modal hiển thị tiếng Việt thuần túy, sạch sẽ, không còn các chuỗi `(MOD-xx)`.
- Criterion 2: Có bước chọn sê-ri linh kiện khi lắp ráp và xuất kho giao hàng.
- Criterion 3: Có bước xác thực OTP và mã QR phụ phí khi tạo phụ lục chuyển đổi sang giao tận nơi.
- Criterion 4: Bảng đơn hàng hiển thị không bị ngắt dòng, nút bấm và badge thẳng hàng trên nền sáng.
- Criterion 5: Lệnh `npm run check:fe` chạy thành công với exit code 0.

## Verification Commands

- Command 1: npm run check:fe
