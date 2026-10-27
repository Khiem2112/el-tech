# Task: TASK-91 - Tinh Gọn Khuyến Mãi, Biểu Phí, Khách Hàng, Đánh Giá Và Thông Báo Bằng Impeccable Distill

- Feature: Admin Promotions, Governance, Customer Profiles, Reviews & Outbox Distillation
- Governing Spec: [MASTER.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/design-system/el-tech/MASTER.md), [SKILL.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/.agents/skills/impeccable/SKILL.md), [distill.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/.agents/skills/impeccable/reference/distill.md), [admin-portal-screens-and-modals.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/docs/admin-portal-screens-and-modals.md) (SCR-22 đến SCR-30, MOD-22 đến MOD-31)
- Scope: frontend
- Priority: P2 (Medium)
- Status: To Do

## Traceability & Graph Links

- Task Type: `ui-ux-distill`
- Issue References: Các trang quản lý chương trình khuyến mãi, mã giảm giá, biểu phí vận chuyển, hồ sơ khách hàng, duyệt đánh giá và hộp thư thông báo có mật độ biểu mẫu dày đặc, nhiều khung viền trang trí chưa đồng bộ với chế độ vận hành Operate Mode.
- Related Tasks:
  - [[TASK-37-ADMIN-UNIFIED-PROMOTIONS-COUPONS-AND-SHIPPING-RULES-HUB]]
  - [[TASK-57-ADMIN-PRODUCT-PROMOTIONS-HUB]]
  - [[TASK-58-ADMIN-ORDER-COUPONS-AND-REDEMPTION-HISTORY]]
  - [[TASK-59-ADMIN-DELIVERY-FEE-CONFIG-AND-FREESHIP-RULES]]
  - [[TASK-60-ADMIN-CUSTOMER-PROFILES-AND-IDENTITY-MERGING]]
  - [[TASK-61-ADMIN-REVIEW-MODERATION-AND-NOTIFICATION-OUTBOX]]
  - [[TASK-75-ADMIN-PROMOTIONS-PAYMENTS-AND-CUSTOMERS]]
  - [[TASK-82-ADMIN-DOUBLE-HEADER-FIX-AND-THEME-TOKEN-STANDARDIZATION]]

## Objective

Thực hiện tinh gọn giao diện theo nguyên tắc Impeccable Distill cho các phân hệ Khuyến mãi, Khách hàng, Đánh giá và Thông báo:

1. Tinh gọn Quản lý Khuyến mãi và Mã giảm giá (Coupons):
   - [admin-product-promotions-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/promotions/admin-product-promotions-page.component.ts)
   - [promotion-form-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/promotions/components/promotion-form-dialog.component.ts)
   - [admin-coupons-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/coupons/admin-coupons-page.component.ts)
   - [coupon-form-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/coupons/components/coupon-form-dialog.component.ts)
   - [coupon-redemption-sheet.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/coupons/components/coupon-redemption-sheet.component.ts)
   - Tối giản bảng coupon: hiển thị mã code, loại giảm giá, hạn mức đã dùng và thời hạn một cách sắc nét.
   - Tinh gọn form tạo coupon: xếp trường dữ liệu theo luồng logic đơn giản, bỏ thuyết minh thừa.
   - Tinh gọn sheet lịch sử sử dụng mã giảm giá.

2. Tinh gọn Cấu hình Phí giao hàng và Freeship:
   - [admin-shipping-fee-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/shipping-fee/admin-shipping-fee-page.component.ts)
   - [delivery-fee-form-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/shipping-fee/components/delivery-fee-form-dialog.component.ts)
   - Tinh gọn bảng quy tắc vận chuyển theo khoảng cách và giá trị đơn hàng.
   - Hộp thoại tạo quy tắc phí được tinh gọn về các tham số cốt lõi.

3. Tinh gọn Hồ sơ Khách hàng và Hợp nhất danh tính:
   - [admin-customers-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/customers/admin-customers-page.component.ts)
   - [admin-customer-detail-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/customers/admin-customer-detail-page.component.ts)
   - [merge-customer-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/customers/components/merge-customer-dialog.component.ts)
   - Trang chi tiết khách hàng: gom nhóm thông tin liên hệ, địa chỉ giao hàng và lịch sử mua sắm thành một bố cục gọn gàng, không thẻ lồng thẻ.
   - Tinh gọn hộp thoại hợp nhất khách hàng: làm rõ tài khoản nguồn và tài khoản đích với cảnh báo súc tích.

4. Tinh gọn Kiểm duyệt Đánh giá sản phẩm và Hộp thư Thông báo:
   - [admin-reviews-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/reviews/admin-reviews-page.component.ts)
   - [review-detail-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/reviews/components/review-detail-dialog.component.ts)
   - [admin-notification-outbox-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/notifications/admin-notification-outbox-page.component.ts)
   - [notification-detail-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/notifications/components/notification-detail-dialog.component.ts)
   - Tinh gọn giao diện đánh giá: làm nổi bật nội dung đánh giá, số sao và 2 nút tác vụ "Duyệt" / "Ẩn" gọn gàng.
   - Tinh gọn nhật ký gửi thông báo (outbox): bảng dữ liệu gọn nhẹ và hộp thoại xem chi tiết payload thông báo JSON tinh tế.

## Technical Context And Dependencies

- Target Files:
  - [admin-product-promotions-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/promotions/admin-product-promotions-page.component.ts)
  - [promotion-form-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/promotions/components/promotion-form-dialog.component.ts)
  - [admin-coupons-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/coupons/admin-coupons-page.component.ts)
  - [coupon-form-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/coupons/components/coupon-form-dialog.component.ts)
  - [coupon-redemption-sheet.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/coupons/components/coupon-redemption-sheet.component.ts)
  - [admin-shipping-fee-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/shipping-fee/admin-shipping-fee-page.component.ts)
  - [delivery-fee-form-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/shipping-fee/components/delivery-fee-form-dialog.component.ts)
  - [admin-customers-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/customers/admin-customers-page.component.ts)
  - [admin-customer-detail-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/customers/admin-customer-detail-page.component.ts)
  - [merge-customer-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/customers/components/merge-customer-dialog.component.ts)
  - [admin-reviews-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/reviews/admin-reviews-page.component.ts)
  - [review-detail-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/reviews/components/review-detail-dialog.component.ts)
  - [admin-notification-outbox-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/notifications/admin-notification-outbox-page.component.ts)
  - [notification-detail-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/notifications/components/notification-detail-dialog.component.ts)

## Checklist

- [ ] Tinh gọn quản lý khuyến mãi, mã coupon và sheet nhật ký sử dụng.
- [ ] Tinh gọn trang biểu phí vận chuyển và hộp thoại cấu hình quy tắc.
- [ ] Tinh gọn trang danh sách/chi tiết khách hàng và hộp thoại hợp nhất tài khoản.
- [ ] Tinh gọn trang đánh giá sản phẩm và hộp thoại kiểm duyệt.
- [ ] Tinh gọn trang outbox thông báo và hộp thoại xem chi tiết log.
- [ ] Chạy kiểm tra `npm run check:fe` với exit code 0.
