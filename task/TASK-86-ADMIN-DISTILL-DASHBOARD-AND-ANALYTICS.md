# Task: TASK-86 - Tinh Gọn Bảng Điều Khiển Vận Hành Và Phân Tích BI Bằng Impeccable Distill

- Feature: Admin Operational Dashboard, Urgent Queues & Analytics Distillation
- Governing Spec: [MASTER.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/design-system/el-tech/MASTER.md), [SKILL.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/.agents/skills/impeccable/SKILL.md), [distill.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/.agents/skills/impeccable/reference/distill.md), [dashboard.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/admin-portal/dashboard.html)
- Scope: frontend
- Priority: P1 (High)
- Status: To Do

## Traceability & Graph Links

- Task Type: `ui-ux-distill`
- Issue References: Dashboard vận hành hiện tại có mật độ thông tin dày đặc, một số thẻ widget bị lồng thẻ (card-in-card), màu sắc huy hiệu phân mảnh làm giảm tốc độ quét mắt của người quản lý vận hành.
- Related Tasks:
  - [[TASK-62-ADMIN-OPERATIONAL-DASHBOARD-AND-URGENT-QUEUES]]
  - [[TASK-76-FRONTEND-COLOR-PALETTE-STANDARDIZATION-AND-AI-SLOP-REMOVAL]]
  - [[TASK-83-ADMIN-DASHBOARD-BI-CARDS-AND-IN-TRANSIT-TRANSFERS-GRID]]

## Objective

Thực hiện tinh gọn giao diện theo nguyên tắc Impeccable Distill cho phân hệ Bảng điều khiển Dashboard:

1. Tinh gọn Khối chỉ số thông minh [smart-bi-analytics-cards.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/dashboard/components/smart-bi-analytics-cards.component.ts):
   - Loại bỏ các đường viền trang trí thừa giữa các dòng chỉ số phụ bên trong thẻ card.
   - Tập trung vào con số then chốt (doanh thu, tỷ trọng, tốc độ vòng quay kho) kèm chỉ số chênh lệch (delta) rõ nét.
   - Đồng bộ toàn bộ định dạng số tiền và số lượng về lớp `tabular-nums` để chống rung giật khi dữ liệu cập nhật theo thời gian thực.

2. Tinh gọn Lưới hàng đợi khẩn cấp [urgent-queues-grid.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/dashboard/components/urgent-queues-grid.component.ts):
   - Xóa bỏ sự cạnh tranh màu sắc quá mức (quá nhiều sắc thái cam, đỏ, vàng làm loãng sự tập trung).
   - Chỉ nhấn mạnh bằng màu đỏ/vàng cho những mục thực sự cần hành động ngay lập tức (đơn chờ xác nhận, đơn lệch thanh toán QR).
   - Tinh gọn các thẻ con để hiển thị thông số ngắn gọn nhất, giảm chiều cao khối giao diện.

3. Tinh gọn Bảng hàng tồn kho thấp [low-stock-alert-card.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/dashboard/components/low-stock-alert-card.component.ts) và Bảng hàng đang điều chuyển [in-transit-transfers-card.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/dashboard/components/in-transit-transfers-card.component.ts):
   - Tối giản các cột phụ, tập trung vào mã SKU, tên linh kiện, số lượng khả dụng còn lại và nút hành động nhanh.
   - Loại bỏ các lớp card bao bọc bên trong hàng của bảng (flatten table row structure).
   - Chuẩn hóa trạng thái rỗng (empty state) khi không có cảnh báo thành thông điệp ngắn gọn, thanh lịch.

4. Tinh gọn Bảng phân bổ đơn theo chi nhánh [order-status-distribution.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/dashboard/components/order-status-distribution.component.ts):
   - Tối giản thanh tiến độ (progress bar) giúp nhìn rõ tỷ lệ đơn đang xử lý so với đơn hoàn tất.
   - Đơn giản hóa các nhãn vùng phục vụ để không làm che khuất hoặc rối dòng tên chi nhánh.

5. Đồng bộ toàn diện Bố cục trang chủ [admin-dashboard-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/dashboard/admin-dashboard-page.component.ts):
   - Chuẩn hóa khoảng cách giữa các khối về hệ thống khoảng cách nhất quán (`gap-6`).
   - Loại bỏ các đoạn văn bản hướng dẫn giải thích rườm rà phía trên tiêu đề trang.

## Technical Context And Dependencies

- Target Files:
  - [admin-dashboard-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/dashboard/admin-dashboard-page.component.ts)
  - [smart-bi-analytics-cards.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/dashboard/components/smart-bi-analytics-cards.component.ts)
  - [urgent-queues-grid.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/dashboard/components/urgent-queues-grid.component.ts)
  - [low-stock-alert-card.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/dashboard/components/low-stock-alert-card.component.ts)
  - [in-transit-transfers-card.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/dashboard/components/in-transit-transfers-card.component.ts)
  - [order-status-distribution.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/dashboard/components/order-status-distribution.component.ts)

## Checklist

- [ ] Đánh giá mức độ gây rối thị giác trên Dashboard và loại bỏ tình trạng thẻ lồng trong thẻ.
- [ ] Tinh gọn các thẻ BI Analytics Cards, áp dụng tabular-nums và loại bỏ đường viền thừa.
- [ ] Tinh gọn hàng đợi khẩn cấp Urgent Queues để nhân viên tập trung vào đúng vấn đề cần giải quyết ngay.
- [ ] Tinh gọn 2 bảng cảnh báo tồn thấp và điều chuyển in-transit theo phong cách bảng dữ liệu nhẹ nhàng.
- [ ] Căn chỉnh khoảng cách nhất quán trên toàn bộ trang Dashboard.
- [ ] Chạy kiểm tra `npm run check:fe` với exit code 0.
