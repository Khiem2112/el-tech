# Task: TASK-75 - Chuẩn Hóa Phân Hệ Khuyến Mãi, Mã Giảm Giá, Đối Soát QR Và Hồ Sơ Khách Hàng

- Feature: Promotions, Coupons, Shipping Rules UI, QR Queue FQ36-A Compliance & Customer Merge Audit
- Governing Spec: [report/admin_subsystem_ui_ux_issues_report.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/report/admin_subsystem_ui_ux_issues_report.md) (Nhóm 1, 2, 3, 4, 5, 6), [report/admin_subsystem_business_logic_issues_report.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/report/admin_subsystem_business_logic_issues_report.md) (Mục 4), [docs/admin-portal-screens-and-modals.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/docs/admin-portal-screens-and-modals.md) (SCR-23 đến SCR-27, MOD-20, MOD-37)
- Scope: frontend
- Priority: P1 (High)
- Status: Complete

## Traceability & Graph Links

- Task Type: `ui-ux-fix`
- Issue References: UI/UX Nhóm 1-6 & FQ36-A
- Fixes Issues From:
  - [[TASK-38-ADMIN-PAYMENTS-QR-DISCREPANCY-AND-SUPPLIER-RETURNS-COMPLIANCE]]
  - [[TASK-57-ADMIN-PRODUCT-PROMOTIONS-HUB]]
  - [[TASK-58-ADMIN-ORDER-COUPONS-AND-REDEMPTION-HISTORY]]
  - [[TASK-60-ADMIN-CUSTOMER-PROFILES-AND-IDENTITY-MERGING]]

## Objective

Chuẩn hóa toàn diện giao diện Quản lý Khuyến mãi, Mã giảm giá, Biểu phí giao hàng, Hàng đợi đối soát sai lệch QR và Hồ sơ khách hàng:
1. Loại bỏ tiền tố mã tài liệu `SCR-23`, `SCR-24`, `SCR-25` khỏi thanh Tabs chuyển trang trên cả 3 trang Khuyến mãi, Coupons và Phí vận chuyển; thay bằng nhãn nghiệp vụ tiếng Việt thuần túy.
2. Sửa đổi nội dung hộp thoại MOD-20 ([resolve-qr-discrepancy-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/components/modals/resolve-qr-discrepancy-dialog.component.ts)): Loại bỏ phương án gợi ý nộp thêm tiền mặt tại quầy (vi phạm quyết định `FQ36-A` và quy tắc `PAY-001`, `PAY-017` vì MVP không có POS tiền mặt và mã VietQR là thanh toán một lần cố định). Thay vào đó, nếu chuyển thiếu tiền hoặc sai lệch không xử lý được, cung cấp hành động Hủy đơn và tạo lệnh hoàn trả 100% số tiền thực nhận vào hàng đợi `REFUND_PENDING`.
3. Trong giao diện Sáp nhập khách hàng MOD-37 ([merge-customer-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/customers/components/merge-customer-dialog.component.ts)): Bổ sung điều kiện kiểm tra tài khoản, vô hiệu hóa nút sáp nhập nếu hồ sơ khách hàng nguồn đã có tài khoản thành viên (`isRegistered` / `userId !== null`) và hiển thị lý do giải thích cho admin.
4. Chuyển đổi toàn bộ layout, card và bảng biểu sang giao diện nền sáng `bg-surface border-line text-foreground`, thay thẻ `<select>` bằng `app-select`, loại bỏ các cỡ chữ 10px-11px.

## Technical Context And Dependencies

- Pre-requisites: TASK-67, TASK-70, TASK-71
- Reusable Assets:
  - [fe/src/app/components/atoms/select/select.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms/select/select.component.ts)
  - [fe/src/app/components/atoms/badge/badge.directive.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms/badge/badge.directive.ts)
  - [fe/src/app/components/atoms/button/button.directive.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms/button/button.directive.ts)
  - [fe/src/app/components/atoms/input/input.directive.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms/input/input.directive.ts)
- Target Files:
  - `fe/src/app/features/admin/promotions/admin-product-promotions-page.component.ts`
  - `fe/src/app/features/admin/promotions/components/promotion-form-dialog.component.ts`
  - `fe/src/app/features/admin/coupons/admin-coupons-page.component.ts`
  - `fe/src/app/features/admin/coupons/components/coupon-form-dialog.component.ts`
  - `fe/src/app/features/admin/coupons/components/coupon-redemption-sheet.component.ts`
  - `fe/src/app/features/admin/shipping-fee/admin-shipping-fee-page.component.ts`
  - `fe/src/app/features/admin/shipping-fee/components/delivery-fee-form-dialog.component.ts`
  - `fe/src/app/features/admin/orders/components/modals/resolve-qr-discrepancy-dialog.component.ts`
  - `fe/src/app/features/admin/customers/admin-customers-page.component.ts`
  - `fe/src/app/features/admin/customers/admin-customer-detail-page.component.ts`
  - `fe/src/app/features/admin/customers/components/merge-customer-dialog.component.ts`

## Sub-agent Delegation Strategy

Thực hiện single-agent mode tuần tự theo quy trình task-runner, bảo đảm tuân thủ:
- Không dùng icon hoặc emoji trong toàn bộ mã nguồn, ghi chú và thông báo commit.
- Không dùng chuỗi bình luận đánh số thứ tự 1-2-3-4.
- Tuân thủ quy tắc kinh doanh FQ36-A và CUS-003.

## Checklist

- [x] Trong [admin-product-promotions-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/promotions/admin-product-promotions-page.component.ts), [admin-coupons-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/coupons/admin-coupons-page.component.ts) và [admin-shipping-fee-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/shipping-fee/admin-shipping-fee-page.component.ts):
  - Xóa bỏ tiền tố `SCR-23`, `SCR-24`, `SCR-25` trên tiêu đề trang H1 và trên các tab chuyển đổi liên kết.
  - Sử dụng nhãn tab thân thiện: `Chương Trình Khuyến Mãi`, `Mã Giảm Giá (Coupons)`, `Biểu Phí Giao Hàng`.
  - Thay thế các dropdown trạng thái và hình thức chiết khấu bằng `app-select`.
  - Chuyển giao diện sang nền sáng `bg-surface border-line text-foreground`.
- [x] Trong [resolve-qr-discrepancy-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/components/modals/resolve-qr-discrepancy-dialog.component.ts):
  - Cập nhật hộp thoại xử lý sai lệch VietQR (MOD-20): Loại bỏ hoàn toàn tùy chọn cho khách nộp thêm tiền mặt tại quầy.
  - Nếu số tiền thực nhận nhỏ hơn số tiền yêu cầu (`actualReceived < expectedAmount`), khóa nút khớp tay; cung cấp hành động rõ ràng: `Hủy đơn & Tạo lệnh hoàn 100% tiền thực nhận` đưa vào hàng đợi `REFUND_PENDING` tuân thủ quyết định `FQ36-A`.
  - Chuyển bảng đối soát sang nền sáng với `whitespace-nowrap tabular-nums`.
- [x] Trong [admin-customers-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/customers/admin-customers-page.component.ts) và [admin-customer-detail-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/customers/admin-customer-detail-page.component.ts):
  - Xóa bỏ `SCR-26`, `SCR-27`.
  - Trong hộp thoại sáp nhập hồ sơ MOD-37 ([merge-customer-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/customers/components/merge-customer-dialog.component.ts)): Kiểm tra cờ `isRegistered` của hồ sơ khách hàng nguồn. Nếu đã có tài khoản thành viên (`isRegistered === true` / `userId !== null`), vô hiệu hóa nút sáp nhập kèm dòng cảnh báo: "Không thể sáp nhập hồ sơ đã có tài khoản thành viên theo quy tắc CUS-003".
  - Định dạng bảng khách hàng, thẻ chi tiết, smart buttons trên nền sáng `bg-surface border-line text-foreground`.

## Acceptance Criteria

- Criterion 1: Thanh tab chuyển đổi giữa Khuyến mãi, Coupons và Phí ship hiển thị tiếng Việt thuần túy, sạch sẽ.
- Criterion 2: Hàng đợi đối soát sai lệch QR tuân thủ nghiêm ngặt quyết định FQ36-A, không tồn tại tùy chọn nộp tiền mặt tại quầy.
- Criterion 3: Thao tác sáp nhập khách hàng chặn đúng các trường hợp tài khoản thành viên.
- Criterion 4: Toàn bộ bảng biểu, form và dialog hiển thị trên nền sáng tinh tế, cỡ chữ tối thiểu 12px.
- Criterion 5: Lệnh `npm run check:fe` chạy thành công với exit code 0.

## Verification Commands

- Command 1: npm run check:fe
- Command 2: npm run check:be

## Code Completion Report

- Target Files Modified:
  - `fe/src/app/features/admin/promotions/admin-product-promotions-page.component.ts`: Đã gỡ bỏ mã SCR-23 khỏi tiêu đề và tab bar, chuẩn hóa sang nền sáng `bg-surface border-line text-foreground`, thay thế filter select bằng `app-select`, loại bỏ toàn bộ font `text-[10px]` và `text-[11px]`.
  - `fe/src/app/features/admin/promotions/components/promotion-form-dialog.component.ts`: Đã thêm thuộc tính `data-modal-id="MOD-33"`, gỡ bỏ nhãn `(MOD-33)` khỏi giao diện hiển thị, chuyển sang nền sáng, tích hợp `app-select` cho hình thức chiết khấu và danh mục/SKU.
  - `fe/src/app/features/admin/coupons/admin-coupons-page.component.ts`: Đã gỡ bỏ SCR-24, chuẩn hóa nhãn tab tiếng Việt, thay thế các dropdown bằng `app-select`, chuyển đổi bảng và card sang giao diện nền sáng.
  - `fe/src/app/features/admin/coupons/components/coupon-form-dialog.component.ts`: Đã gắn `data-modal-id="MOD-34"`, gỡ bỏ nhãn mã nội bộ khỏi tiêu đề, chuyển đổi sang nền sáng và tích hợp `app-select`.
  - `fe/src/app/features/admin/coupons/components/coupon-redemption-sheet.component.ts`: Đã gắn `data-modal-id="MOD-35"`, chuẩn hóa giao diện nền sáng và font size.
  - `fe/src/app/features/admin/shipping-fee/admin-shipping-fee-page.component.ts`: Đã gỡ bỏ SCR-25, chuẩn hóa các liên kết tab, chuyển đổi bảng sang nền sáng với `whitespace-nowrap tabular-nums`.
  - `fe/src/app/features/admin/shipping-fee/components/delivery-fee-form-dialog.component.ts`: Đã gắn `data-modal-id="MOD-36"`, chuẩn hóa nền sáng và loại bỏ mã nội bộ hiển thị.
  - `fe/src/app/features/admin/orders/components/modals/resolve-qr-discrepancy-dialog.component.ts`: Đã gắn `data-modal-id="MOD-20"`, loại bỏ tùy chọn nộp tiền mặt tại quầy, thực hiện khóa nút khớp thủ công khi số tiền thực nhận không đủ 100%, bổ sung quy trình hủy đơn và hoàn trả 100% số tiền sang hàng đợi `REFUND_PENDING` tuân thủ FQ36-A, bổ sung `whitespace-nowrap tabular-nums`.
  - `fe/src/app/features/admin/customers/admin-customers-page.component.ts`: Đã gỡ bỏ mã SCR-26, chuyển sang nền sáng, thay thế bộ lọc bằng `app-select`.
  - `fe/src/app/features/admin/customers/admin-customer-detail-page.component.ts`: Đã gỡ bỏ huy hiệu SCR-27, làm sạch các chuỗi rò rỉ mã màn hình, chuẩn hóa toàn diện KPI cards, chi tiết định danh và 3 bảng lịch sử sang nền sáng với cỡ chữ tối thiểu 12px.
  - `fe/src/app/features/admin/customers/components/merge-customer-dialog.component.ts`: Đã gắn `data-modal-id="MOD-37"`, gỡ bỏ nhãn MOD-37 hiển thị, tích hợp `app-select`, bổ sung kiểm tra cờ tài khoản theo quy tắc CUS-003 kèm thông báo cảnh báo và khóa nút xác nhận gộp nếu hồ sơ phụ là thành viên chính thức.

## Dual-Pass Review Report

### Pass A: Functional Review
- CUS-003 Account Merge Audit: Kiểm tra `selectedCandidate()?.isRegistered` chặn thành công thao tác sáp nhập khi hồ sơ nguồn đã có tài khoản thành viên hệ thống, hiển thị cảnh báo hướng dẫn rõ ràng.
- FQ36-A VietQR Discrepancy Compliance: Loại bỏ triệt để phương án nộp tiền mặt, chặn khớp thủ công khi thiếu tiền, hỗ trợ luồng hủy đơn chuyển hoàn 100% số tiền thực nhận sang trạng thái `REFUND_PENDING`.
- Navigation & Document Code Cleanup: Tất cả các tab điều hướng trên 3 phân hệ Khuyến mãi, Coupons và Biểu phí đã chuyển sang nhãn tiếng Việt sạch sẽ, xóa bỏ hoàn toàn các tiền tố SCR-23, SCR-24, SCR-25, SCR-26, SCR-27.
- Ket qua: PASS.

### Pass B: Convention Review
- Spartan Select Integration: Toàn bộ dropdown được thay bằng `app-select` từ thư mục atom chuẩn của dự án.
- Light Theme Palette: Tất cả card, modal, sheet và bảng sử dụng đúng token `bg-surface border-line text-foreground`, `bg-surface-alt`, `text-muted`.
- Typography & Numbers: Không còn class font chữ nhỏ hơn 12px; toàn bộ tiền tệ và số liệu đã áp dụng `whitespace-nowrap tabular-nums`.
- Cấm Icon/Emoji & Comment Numbering: Mã nguồn và tài liệu tuân thủ nghiêm ngặt quy tắc không dùng emoji/icon và không dùng chuỗi chú thích đánh số thứ tự.
- Ket qua: PASS.
