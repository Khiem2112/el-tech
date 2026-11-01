# Task: TASK-137 - Tích Hợp Luồng Gửi Thông Báo Đơn Hàng Đã Đặt Thành Công (Transactional Outbox)

- Feature: Order Submission Notification Dispatch & Outbox Integration
- Governing Spec: [.agents/skills/business-logic/features/reviews-and-notifications.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/.agents/skills/business-logic/features/reviews-and-notifications.md) (NOT-001, NOT-002, NOT-004, NOT-005, NOT-006, NOT-007)
- Scope: fullstack
- Status: Complete
- Backlinks: [TASK-06](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/task/TASK-06-CHECKOUT-AND-ORDER-SUCCESS.md), [TASK-61](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/task/TASK-61-ADMIN-REVIEW-MODERATION-AND-NOTIFICATION-OUTBOX.md)

## Objective

Xây dựng và tích hợp luồng gửi thông báo tự động khi khách hàng đặt hàng thành công:
- Tích hợp tạo bản ghi thông báo `Notification` (Transactional Outbox) ngay trong khối giao dịch cơ sở dữ liệu (`prisma.$transaction`) tại thời điểm tạo đơn hàng (`orderService.submit`), đảm bảo tính nguyên tử, không làm thất thoát dữ liệu và chống trùng lặp thông báo qua khóa duy nhất (`deduplicationKey`).
- Thiết lập nội dung thông báo chuẩn hóa theo loại sự kiện `ORDER_SUBMITTED`: Tiêu đề xác nhận đơn, tóm tắt người nhận, số điện thoại, email, địa chỉ giao hàng / nhận tại showroom, tổng tiền thanh toán và phương thức thanh toán.
- Thiết lập các kênh phát hành thông báo (`channels`): Hỗ trợ kênh `EMAIL` và `IN_APP` theo quy định nghiệp vụ `NOT-001`.
- Xây dựng cơ chế phát hành / gửi thông báo (Notification Dispatcher) để ghi nhận kết quả gửi, lưu vết lịch sử thử gửi (`deliveryAttempts`), cập nhật thời điểm xuất bản (`publishedAt`) hoặc ghi nhận lỗi (`lastDeliveryError`) nếu gửi thất bại.
- Đảm bảo bản ghi thông báo hiển thị đầy đủ trên màn hình quản trị Hộp thư thông báo Outbox (`AdminNotificationOutboxPageComponent`), cho phép quản trị viên theo dõi trạng thái `SENT`, `PENDING`, `FAILED` và thực hiện thử lại (retry) khi cần thiết.

## Technical Context And Dependencies

- Pre-requisites: Hoàn thành `TASK-06`, `TASK-61`, Prisma model `Notification`.
- Reusable Assets:
  - `be/src/services/order.service.ts`
  - `be/src/services/admin/notification.service.ts`
  - `fe/src/app/features/admin/notifications/admin-notification-outbox-page.component.ts`
  - `fe/src/app/features/checkout/order-success-page.component.ts`
- Target Files:
  - `be/src/services/order.service.ts`
  - `be/src/services/notification-dispatcher.service.ts` (Tạo mới hoặc tích hợp trong notification service)
  - `be/src/services/admin/notification.service.ts`
  - `fe/src/app/features/admin/notifications/admin-notification-outbox-page.component.ts`

## Checklist

- [x] Thiết lập logic tạo bản ghi `Notification` trong transaction `orderService.submit()` tại [order.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/order.service.ts):
  - Khởi tạo bản ghi với `customerId`, `orderId: order.id`, `eventType: 'ORDER_SUBMITTED'`.
  - Khóa chống trùng lặp `deduplicationKey: 'order_submitted:' + order.id`.
  - Tiêu đề thông báo: `Đặt hàng thành công - Đơn hàng #${order.code}`.
  - Nội dung tóm tắt: Đơn hàng đã được đặt thành công, tổng tiền, phương thức nhận hàng và hình thức thanh toán.
  - Danh sách kênh: `[NotificationChannel.IN_APP, NotificationChannel.EMAIL]`.
  - Dữ liệu chi tiết (`payload`): Bao gồm mã đơn, tên khách hàng, email, số điện thoại, hình thức nhận hàng, địa chỉ, tổng tiền thanh toán và danh sách linh kiện tóm tắt.
- [x] Xây dựng dịch vụ phát hành thông báo (Notification Dispatcher) tại [notification-dispatcher.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/notification-dispatcher.service.ts):
  - Xử lý gửi thông báo ngay sau khi transaction tạo đơn hàng hoàn tất hoặc qua background outbox handler.
  - Mô phỏng hoặc thực thi gửi email thông báo xác nhận đơn hàng tới `receiverEmail` của khách hàng.
  - Ghi nhận nhật ký lịch sử gửi vào `deliveryAttempts` (kênh, thời điểm, trạng thái, chi tiết).
  - Cập nhật trường `publishedAt` khi gửi thành công hoặc `lastDeliveryError` nếu phát sinh sự cố.
- [x] Đồng bộ hóa với phân hệ quản trị Outbox Admin tại [notification.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/admin/notification.service.ts):
  - Đảm bảo khi quản trị viên bấm nút Thử lại (retry) thông báo đơn hàng, hàm `retryNotification` sẽ gọi lại cơ chế phát hành và cập nhật trạng thái mới nhất.
- [x] Kiểm thử hiển thị trên giao diện Admin Outbox tại [admin-notification-outbox-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/notifications/admin-notification-outbox-page.component.ts):
  - Xác nhận bản ghi thông báo sự kiện `ORDER_SUBMITTED` xuất hiện chính xác trên bảng Outbox với đầy đủ thông tin mã đơn, khách hàng nhận, kênh phát và trạng thái.
- [x] Chạy kiểm thử tự động `npm run check:be` và `npm run check:fe` đạt exit code 0.


## Acceptance Criteria

- Criterion 1: Khi khách hàng hoàn tất đặt đơn hàng trên Storefront (COD hoặc VietQR), hệ thống tự động sinh bản ghi `Notification` gắn với `orderId` và `customerId` tương ứng trong cơ sở dữ liệu.
- Criterion 2: Không xảy ra trùng lặp thông báo nếu cùng một đơn hàng được xử lý lại hoặc người dùng gửi lại yêu cầu nhờ `deduplicationKey`.
- Criterion 3: Màn hình Admin Notification Outbox hiển thị chính xác bản ghi thông báo của đơn hàng vừa tạo kèm lịch sử gửi `deliveryAttempts`.
- Criterion 4: Toàn bộ mã nguồn không sử dụng biểu tượng icon/emoji và không chứa chú thích đánh số thứ tự trong mã nguồn.

## Verification Commands

- Command 1: `npm run check:be`
- Command 2: `npm run check:fe`

