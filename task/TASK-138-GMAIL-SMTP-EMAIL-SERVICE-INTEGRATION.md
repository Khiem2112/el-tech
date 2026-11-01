# Task: TASK-138 - Tích Hợp Dịch Vụ Gửi Email Gmail SMTP Cho OTP Tra Cứu Và Thông Báo Đơn Hàng

- Feature: Backend Gmail SMTP Email Service Integration
- Governing Spec: Biến môi trường hệ thống tại [be/.env](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/.env), quy chuẩn thông báo tại [.agents/skills/business-logic/features/reviews-and-notifications.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/.agents/skills/business-logic/features/reviews-and-notifications.md) (NOT-001, NOT-002, NOT-005)
- Scope: backend
- Status: Complete
- Backlinks: [TASK-99](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/task/TASK-99-BACKEND-GUEST-ORDER-LOOKUP-AND-COMPLAINTS-API.md), [TASK-103](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/task/TASK-103-FRONTEND-ORDER-LOOKUP-OTP-AND-COMPLAINTS-HUB.md), [TASK-115](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/task/TASK-115-FRONTEND-ORDER-LOOKUP-FLEXIBLE-THREE-CRITERIA-AND-OTP.md), [TASK-137](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/task/TASK-137-ORDER-SUBMISSION-NOTIFICATION-DISPATCH-INTEGRATION.md)

## Objective

Xây dựng module dịch vụ gửi thư điện tử tập trung phía Backend thông qua giao thức SMTP của Gmail và tích hợp trực tiếp vào hai luồng nghiệp vụ cốt lõi:
- Đọc và cấu hình kết nối SMTP an toàn từ các biến môi trường khai báo tại [be/.env](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/.env):
  - `SMTP_HOST`: Máy chủ SMTP (ví dụ: `smtp.gmail.com`).
  - `SMTP_PORT`: Cổng kết nối (ví dụ: `465` hoặc `587`).
  - `SMTP_SECURE`: Chế độ bảo mật SSL/TLS (`true` với cổng 465).
  - `SMTP_USER`: Tài khoản hòm thư gửi của hệ thống.
  - `STMP_PASS`: Mật khẩu ứng dụng (Google App Password), có cơ chế dự phòng đọc thêm `SMTP_PASS`.
- Xây dựng module gửi mail dùng chung tại [be/src/lib/mailer.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/lib/mailer.ts) hỗ trợ tạo kết nối transporter, kiểm tra cấu hình kết nối và gửi thư định dạng HTML chuyên nghiệp kèm văn bản thuần túy.
- Tích hợp gửi Gmail cho luồng Tra cứu đơn hàng bằng mã OTP tại [order-lookup.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/order-lookup.service.ts):
  - Khi người dùng nhập Email và bấm yêu cầu gửi mã xác thực, backend tạo bản ghi `verification` và kích hoạt hàm gửi email thật đến địa chỉ Gmail của khách hàng với nội dung chứa mã OTP 6 chữ số và thông báo thời hạn hiệu lực 5 phút.
- Tích hợp gửi Gmail cho luồng Thông báo đặt hàng thành công tại [order.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/order.service.ts) kết hợp cùng [TASK-137](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/task/TASK-137-ORDER-SUBMISSION-NOTIFICATION-DISPATCH-INTEGRATION.md):
  - Sau khi giao dịch đặt hàng hoàn tất, tự động gửi thư xác nhận đặt hàng thành công tới `receiverEmail` của khách hàng với đầy đủ thông tin: Mã đơn hàng, tên người nhận, hình thức nhận hàng, địa chỉ/showroom, phương thức thanh toán, tổng tiền và đường dẫn tra cứu đơn hàng trực tiếp.
- Cơ chế chịu lỗi (Fault-tolerance & Fallback):
  - Bọc khối gửi thư bằng xử lý ngoại lệ an toàn, đảm bảo nếu dịch vụ mạng hoặc SMTP gặp sự cố thì giao dịch đặt hàng hoặc quy trình tra cứu không bị gián đoạn hay gây sập ứng dụng.
  - Tiếp tục duy trì log mã OTP ra terminal trong môi trường phát triển (development) để thuận tiện cho việc kiểm thử song song.

## Technical Context And Dependencies

- Pre-requisites: Các biến môi trường SMTP đã được cấu hình tại [be/.env](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/.env).
- Reusable Assets:
  - `be/src/services/order-lookup.service.ts`
  - `be/src/services/order.service.ts`
  - `be/prisma/schema.prisma` (Model `Verification`, `Notification`)
- Target Files:
  - `be/package.json`
  - `be/src/lib/mailer.ts` (Tạo mới)
  - `be/src/services/order-lookup.service.ts`
  - `be/src/services/order.service.ts`

## Checklist

- [x] Cài đặt các gói phụ thuộc cần thiết vào backend:
  - Cài đặt `nodemailer` cho dependencies và `@types/nodemailer` cho devDependencies trong [package.json](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/package.json).
- [x] Xây dựng dịch vụ gửi thư `mailer.ts` tại [mailer.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/lib/mailer.ts):
  - Trích xuất cấu hình từ biến môi trường: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `STMP_PASS` (kèm dự phòng `SMTP_PASS`).
  - Khởi tạo `nodemailer.createTransport` với cấu hình an toàn, hỗ trợ cơ chế pooling.
  - Xây dựng hàm `sendLookupOtpEmail(toEmail: string, otp: string)` tạo giao diện email HTML hiện đại, chuẩn nhận diện EL-TECH PC Store, nêu rõ mã OTP có hiệu lực trong 5 phút.
  - Xây dựng hàm `sendOrderConfirmationEmail(orderData: OrderConfirmationPayload)` tạo email hóa đơn tóm tắt gồm mã đơn, sản phẩm, tổng thanh toán và thông tin giao nhận.
  - Bọc khối gửi bằng try-catch an toàn, ghi nhận log lỗi mà không ném ngoại lệ làm gián đoạn quy trình chính.
- [x] Tích hợp gửi email OTP vào `orderLookupService` tại [order-lookup.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/order-lookup.service.ts):
  - Trong phương thức `requestGuestLookupOtp`, khi `contactType === 'EMAIL'`, gọi hàm `sendLookupOtpEmail` gửi mã OTP đến hòm thư người dùng.
  - Vẫn giữ log `console.info` khi `NODE_ENV !== 'production'` để phục vụ lập trình viên và kiểm thử nội bộ.
- [x] Tích hợp gửi email xác nhận đặt hàng vào `orderService.submit()` tại [order.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/order.service.ts):
  - Kích hoạt gửi email xác nhận đơn hàng tới `receiverEmail` sau khi khối giao dịch `prisma.$transaction` commit thành công.
  - Cập nhật nhật ký gửi thư `deliveryAttempts` và trường `publishedAt` vào bản ghi `Notification` tương ứng theo kiến trúc Outbox của [TASK-137](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/task/TASK-137-ORDER-SUBMISSION-NOTIFICATION-DISPATCH-INTEGRATION.md).
- [x] Chạy kiểm thử tự động `npm run check:be` đạt exit code 0, không có lỗi typecheck hay lint.

## Acceptance Criteria

- Criterion 1: Khi khách hàng yêu cầu tra cứu đơn hàng bằng Email trên trang `/tra-cuu-don`, mã OTP 6 chữ số được gửi trực tiếp đến địa chỉ Gmail của khách hàng từ hòm thư `SMTP_USER`.
- Criterion 2: Khi khách hàng hoàn tất đặt đơn hàng trên trang Checkout, một email tóm tắt xác nhận đơn hàng thành công được gửi đến địa chỉ `receiverEmail` của khách hàng.
- Criterion 3: Toàn bộ quá trình gửi thư sử dụng đúng các biến môi trường `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `STMP_PASS`.
- Criterion 4: Lỗi mạng hoặc lỗi kết nối SMTP không làm sập server và không làm gián đoạn luồng đặt đơn hàng hay tra cứu đơn.
- Criterion 5: Toàn bộ mã nguồn, tài liệu và log không chứa bất kỳ biểu tượng icon/emoji nào và không có chú thích đánh số thứ tự trong mã nguồn.

## Verification Commands

- Command 1: `npm run check:be`

