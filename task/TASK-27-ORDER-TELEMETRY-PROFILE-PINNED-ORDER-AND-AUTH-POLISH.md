# Task: TASK-27 - Hoàn Thiện Telemetry Theo Dõi Đơn Hàng, Đơn Ghim Trang Profile Và Tinh Chỉnh Form Auth

- Feature: Order Tracking SLA & FurMark Metrics, Kanban Assembly Telemetry, Pinned Profile Order & Auth Extras
- Governing Spec: [ui-templates/store-front/order-tracking.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/order-tracking.html), [order-kanban-view.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/order-kanban-view.html), [profile-page.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/profile-page.html) và [auth.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/auth.html)
- Scope: frontend
- Priority: P2 (Major) & P3 (Minor)
- Status: Completed

## Objective

Nâng cấp các màn hình quản lý sau bán hàng và hỗ trợ khách hàng bao gồm Tra cứu đơn hàng [fe/src/app/features/orders/order-lookup-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/orders/order-lookup-page.component.ts), Kanban đơn hàng [fe/src/app/features/orders/order-kanban-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/orders/order-kanban-page.component.ts), Trang hồ sơ cá nhân [fe/src/app/features/profile/profile-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/profile/profile-page.component.ts) và Modal đăng nhập/đăng ký [fe/src/app/features/auth/auth-modal.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/auth/auth-modal.component.ts). Bổ sung khối cam kết SLA 120 phút, thông tin kỹ thuật viên và chứng nhận nhiệt độ FurMark trong tiến trình xử lý đơn; bổ sung telemetry chỉ số nhiệt độ trên Kanban; ghim thẻ tóm tắt đơn hàng đang xử lý với mã OTP số lớn ở đầu trang Profile; và bổ sung checkbox ghi nhớ đăng nhập cùng liên kết quên mật khẩu trong Auth Modal.

## Technical Context And Dependencies

- Pre-requisites: TASK-07, TASK-09, TASK-15, TASK-16
- Reusable Assets:
  - [fe/src/app/features/orders/order-lookup-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/orders/order-lookup-page.component.ts)
  - [fe/src/app/features/orders/order-kanban-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/orders/order-kanban-page.component.ts)
  - [fe/src/app/features/profile/profile-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/profile/profile-page.component.ts)
  - [fe/src/app/features/auth/auth-modal.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/auth/auth-modal.component.ts)
  - [fe/src/app/components/atoms](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms)
- Target Files:
  - `fe/src/app/features/orders/order-lookup-page.component.ts`
  - `fe/src/app/features/orders/order-kanban-page.component.ts`
  - `fe/src/app/features/profile/profile-page.component.ts`
  - `fe/src/app/features/auth/auth-modal.component.ts`

## Checklist

- [x] Nâng cấp thông tin chi tiết trên trang Tra cứu đơn hàng (TR-01, TR-02):
  - Bổ sung khối cam kết SLA dịch vụ: "SLA chuẩn bị & lắp ráp 120 phút", "Hỗ trợ kỹ thuật 7 ngày/tuần", "Đóng gói tiêu chuẩn chống sốc chuyên dụng".
  - Trong giai đoạn Lắp ráp / Kiểm định của timeline, bổ sung thông tin kỹ thuật viên thực hiện (Họ tên, mã chuyên viên kỹ thuật phần cứng) và thẻ chứng nhận kết quả bài kiểm tra nhiệt độ FurMark & Cinebench (Ví dụ: "FurMark GPU Max: 64°C, Cinebench Multi-Core Ổn định").
- [x] Bổ sung khối Telemetry trên thẻ Kanban giai đoạn Lắp ráp (KB-01):
  - Hiển thị thông số nhiệt độ stress test trực tiếp trên thẻ đơn hàng tại cột Lắp ráp (ví dụ: `FurMark 64°C · Fan 55% · Đạt chuẩn`).
- [x] Bổ sung thẻ Đơn hàng mới nhất ghim nổi bật ở đầu trang Profile (PR-01):
  - Thiết kế thẻ Hero Order Card đặt ở đầu trang hồ sơ cá nhân khi người dùng có đơn hàng đang trong tiến trình xử lý.
  - Hiển thị mã OTP nhận máy tại quầy dạng số lớn nổi bật (ví dụ: `489-102`) để khách hàng trình cho nhân viên showroom khi tới nhận máy.
  - Tích hợp mini-timeline 4 bước tóm tắt tiến độ đơn hàng (Đã tiếp nhận -> Đang lắp ráp -> Kiểm thử -> Sẵn sàng bàn giao).
- [x] Bổ sung các tùy chọn tiện ích trong Auth Modal (AU-01):
  - Thêm checkbox "Ghi nhớ đăng nhập trên thiết bị này" trong form đăng nhập.
  - Thêm liên kết "Quên mật khẩu?" với chỉ dẫn hỗ trợ khôi phục qua email.

## Acceptance Criteria

- Criterion 1: Màn hình Tra cứu đơn hàng thể hiện rõ ràng huy hiệu cam kết SLA và thẻ chứng nhận stress test nhiệt độ.
- Criterion 2: Kanban view hiển thị thuộc tính metrics kỹ thuật trên các thẻ đơn hàng thuộc cột Lắp ráp.
- Criterion 3: Khách hàng đăng nhập vào trang Profile thấy thẻ đơn hàng đang xử lý được ghim ở đầu trang kèm mã OTP nhận máy cỡ lớn.
- Criterion 4: Auth Modal hiển thị đầy đủ checkbox ghi nhớ tài khoản và liên kết quên mật khẩu theo đúng mẫu thiết kế.

## Verification Commands

- Command 1: npm run check:fe
