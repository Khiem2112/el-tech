# Task: TASK-69 - Tích Hợp Mã Giảm Giá Coupon Vào Luồng Đặt Hàng Và Thu Hồi Hạn Mức Quá Hạn

- Feature: Storefront Checkout Coupon Validation, Reservation & Overdue Expiration Release
- Governing Spec: [report/admin_subsystem_business_logic_issues_report.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/report/admin_subsystem_business_logic_issues_report.md) (ISS-012, ISS-018), [PRO-001 đến PRO-009, CHK-006 đến CHK-009](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/.agents/skills/business-logic/features/)
- Scope: backend
- Priority: P0 (Blocker)
- Status: Complete

## Objective

Khắc phục 2 lỗ hổng lớn khiến toàn bộ hệ thống khuyến mại và mã giảm giá chỉ hoạt động trên giao diện admin mà không kết nối với khách hàng:
1. ISS-012: Phân hệ Admin đã có dịch vụ quản lý mã giảm giá [coupon.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/admin/coupon.service.ts) và khuyến mãi [promotion.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/admin/promotion.service.ts), nhưng tại luồng Storefront Checkout ([checkout.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/checkout.service.ts) và [order.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/order.service.ts)), kiểu dữ liệu `QuoteInput` và `SubmitOrderInput` hoàn toàn thiếu trường `couponCode`, không gọi kiểm tra điều kiện mã và không bao giờ tạo bản ghi `CouponRedemption`.
2. ISS-018: Phương thức tự động hủy đơn quá hạn thanh toán 30 phút `expireOrderIfOverdue` trong `order.service.ts` bỏ quên việc thu hồi/giải phóng lượt dùng Coupon của khách hàng (`CouponRedemptionStatus.RELEASED`), khiến khách hàng bị mất lượt sử dụng coupon dù đơn hàng chưa hề hoàn tất thanh toán.

## Technical Context And Dependencies

- Pre-requisites: TASK-64
- Reusable Assets:
  - [be/src/services/checkout.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/checkout.service.ts)
  - [be/src/services/order.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/order.service.ts)
  - [be/src/services/admin/coupon.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/admin/coupon.service.ts)
  - [be/src/services/admin/promotion.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/admin/promotion.service.ts)
- Target Files:
  - `be/src/services/checkout.service.ts`
  - `be/src/services/order.service.ts`
  - `be/src/routes/order.routes.ts`

## Sub-agent Delegation Strategy

Giao nhiệm vụ cho sub-agent chuyên trách luồng checkout và khuyến mãi (`task-implementer`):
- Đảm bảo logic kiểm tra hạn mức sử dụng (Quota) và thời gian hiệu lực của Coupon chạy chính xác trong transaction tạo đơn hàng.
- Đảm bảo tính toán chiết khấu đúng theo quy tắc `PRO-006` đến `PRO-009`.

## Checklist

- [x] Trong [be/src/services/checkout.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/checkout.service.ts):
  - Mở rộng `QuoteInput` thêm trường `couponCode?: string`.
  - Trong phương thức `quote`: Tích hợp logic kiểm tra tính hợp lệ của mã giảm giá (thời gian hiệu lực, đơn hàng tối thiểu, giới hạn sử dụng toàn hệ thống và theo khách hàng), tính toán số tiền giảm giá và trả về `discountAmount`, `couponCode` trong kết quả báo giá.
- [x] Trong [be/src/services/order.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/order.service.ts):
  - Mở rộng `SubmitOrderInput` thêm trường `couponCode?: string`.
  - Trong phương thức `submit`: Trong transaction tạo đơn hàng, nếu có `couponCode`, tiến hành kiểm tra lại tính hợp lệ, trừ số tiền chiết khấu vào `grandTotal`, và tạo mới bản ghi `CouponRedemption` với trạng thái `RESERVED` gắn với đơn hàng vừa tạo.
- [x] Trong phương thức `expireOrderIfOverdue` tại [be/src/services/order.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/order.service.ts#L346-L425):
  - Bổ sung `couponRedemption` vào truy vấn đơn hàng: `include: { ..., couponRedemption: true }`.
  - Nếu đơn hàng có `couponRedemption` ở trạng thái `RESERVED`, cập nhật trạng thái sang `CouponRedemptionStatus.RELEASED` đồng thời giảm `usedCount` trên `Coupon` (nếu có đếm lượt giữ chỗ), giải phóng lượt dùng cho khách hàng.
- [x] Cập nhật controller và schema xác thực tại [be/src/routes/order.routes.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/routes/order.routes.ts) để cho phép nhận trường `couponCode`.

## Acceptance Criteria

- Criterion 1: Khách hàng nhập mã giảm giá tại màn hình checkout nhận được báo giá chiết khấu chuẩn xác theo cấu hình của Admin.
- Criterion 2: Khi đặt đơn thành công, hệ thống tạo bản ghi `CouponRedemption` trạng thái `RESERVED`.
- Criterion 3: Đơn hàng thanh toán QR bị quá hạn 30 phút tự động chuyển sang `EXPIRED`, giải phóng tồn kho giữ chỗ và hoàn trả lượt dùng coupon về trạng thái `RELEASED`.
- Criterion 4: Lệnh `npm run check:be` chạy thành công với exit code 0.

## Verification Commands

- Command 1: npm run check:be
