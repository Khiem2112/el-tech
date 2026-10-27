# Task: TASK-90 - Tinh Gọn Quản Lý Đơn Hàng, Chi Tiết Đơn Và 15 Hộp Thoại Xử Lý Bằng Impeccable Distill

- Feature: Admin Orders Pipeline, Order Detail Layout & Fulfillment Modals Distillation
- Governing Spec: [MASTER.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/design-system/el-tech/MASTER.md), [SKILL.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/.agents/skills/impeccable/SKILL.md), [distill.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/.agents/skills/impeccable/reference/distill.md), [admin-portal-screens-and-modals.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/docs/admin-portal-screens-and-modals.md) (SCR-20, SCR-21, MOD-07 đến MOD-21)
- Scope: frontend
- Priority: P1 (High)
- Status: To Do

## Traceability & Graph Links

- Task Type: `ui-ux-distill`
- Issue References: Màn hình chi tiết đơn hàng đang chứa rất nhiều lớp card lồng nhau (card-in-card); thanh tác vụ hành động bị phân mảnh giữa nhiều nút bấm cạnh tranh gây rối rắm khi xử lý đơn; 15 hộp thoại thao tác xử lý đơn có nội dung văn bản hướng dẫn quá dài và khung nhập chưa tối ưu hóa tốc độ.
- Related Tasks:
  - [[TASK-52-ADMIN-ORDERS-LIST-AND-SEGMENTED-PIPELINE]]
  - [[TASK-53-ADMIN-ORDER-DETAIL-LAYOUT-FINANCE-AND-AUDIT]]
  - [[TASK-73-ADMIN-ORDERS-OPERATIONS-AND-MODALS]]

## Objective

Thực hiện tinh gọn giao diện theo nguyên tắc Impeccable Distill cho toàn bộ phân hệ Đơn hàng và 15 Hộp thoại vận hành xử lý:

1. Tinh gọn Danh sách đơn hàng theo giai đoạn [admin-orders-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/admin-orders-page.component.ts):
   - Tối giản các thẻ tab pipeline: thể hiện số lượng đơn trên mỗi trạng thái một cách gọn gàng, không dùng màu sắc chói lọi.
   - Tinh gọn bảng danh sách: các cột mã đơn, khách hàng, chi nhánh, kênh thanh toán và tổng tiền được căn chỉnh thống nhất, áp dụng `tabular-nums`.

2. Tinh gọn Trang chi tiết đơn hàng [admin-order-detail-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/admin-order-detail-page.component.ts):
   - Xóa bỏ triệt để tình trạng thẻ card lồng trong thẻ card giữa trang detail và các thành phần con.
   - Tinh gọn Thanh trạng thái [order-status-bar.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/components/order-status-bar.component.ts): thể hiện rõ ràng trạng thái hiện tại và bước kế tiếp mà không làm rối bố cục.
   - Tinh gọn Thanh tác vụ hành động [order-action-bar.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/components/order-action-bar.component.ts):
     - Làm nổi bật duy nhất một nút hành động chính (Primary CTA) ứng với bước vận hành tiếp theo (Ví dụ: "Xác nhận COD", "Chuẩn bị hàng", "Lắp ráp", "Xuất kho giao").
     - Gom toàn bộ các hành động ngoại lệ (Hủy đơn, Giữ đơn, Đổi sang giao hàng, Hoàn tiền) vào một menu thả xuống phụ gọn gàng.

3. Tinh gọn Các khối thông tin đơn hàng:
   - [order-buyer-section.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/components/order-buyer-section.component.ts): Bố cục thông tin người mua thành lưới 2 cột tinh tế, bỏ các viền ngăn thừa.
   - [order-lines-pc-group.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/components/order-lines-pc-group.component.ts): Phân biệt rõ giữa dàn PC Build và linh kiện bán lẻ một cách trang nhã; hiển thị mã sê-ri được gán tinh tế.
   - [order-finance-summary.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/components/order-finance-summary.component.ts): Tối giản bảng tổng kết tài chính (tạm tính, giảm giá coupon, phí ship, đã thanh toán, còn phải thu).
   - [order-timeline-history.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/components/order-timeline-history.component.ts): Trục thời gian lịch sử gọn nhẹ, giảm khoảng trống dọc.

4. Tinh gọn 15 Hộp thoại vận hành đơn hàng (`fe/src/app/features/admin/orders/components/modals/`):
   - [confirm-cod-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/components/modals/confirm-cod-dialog.component.ts)
   - [prepare-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/components/modals/prepare-dialog.component.ts)
   - [assemble-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/components/modals/assemble-dialog.component.ts)
   - [ready-for-pickup-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/components/modals/ready-for-pickup-dialog.component.ts)
   - [ship-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/components/modals/ship-dialog.component.ts)
   - [delivery-failed-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/components/modals/delivery-failed-dialog.component.ts)
   - [redelivery-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/components/modals/redelivery-dialog.component.ts)
   - [complete-order-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/components/modals/complete-order-dialog.component.ts)
   - [cancel-order-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/components/modals/cancel-order-dialog.component.ts)
   - [return-initiate-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/components/modals/return-initiate-dialog.component.ts)
   - [return-receive-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/components/modals/return-receive-dialog.component.ts)
   - [manual-refund-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/components/modals/manual-refund-dialog.component.ts)
   - [resolve-hold-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/components/modals/resolve-hold-dialog.component.ts)
   - [resolve-qr-discrepancy-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/components/modals/resolve-qr-discrepancy-dialog.component.ts)
   - [pickup-to-delivery-amendment-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/components/modals/pickup-to-delivery-amendment-dialog.component.ts)
   - Quy chuẩn chung cho cả 15 hộp thoại:
     - Cắt bỏ toàn bộ đoạn văn bản thuyết minh giải thích thừa.
     - Dùng tiêu đề ngắn gọn, trực diện vào mục tiêu thao tác.
     - Tối ưu biểu mẫu nhập (chọn sê-ri, lý do, ghi chú, số tiền) với nhãn rõ ràng và tiêu điểm tự động.
     - Canh lề nút thao tác xác nhận và hủy đồng nhất trên toàn bộ các hộp thoại.

## Technical Context And Dependencies

- Target Files:
  - [admin-orders-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/admin-orders-page.component.ts)
  - [admin-order-detail-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/admin-order-detail-page.component.ts)
  - [order-status-bar.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/components/order-status-bar.component.ts)
  - [order-action-bar.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/components/order-action-bar.component.ts)
  - [order-buyer-section.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/components/order-buyer-section.component.ts)
  - [order-lines-pc-group.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/components/order-lines-pc-group.component.ts)
  - [order-finance-summary.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/components/order-finance-summary.component.ts)
  - [order-timeline-history.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/components/order-timeline-history.component.ts)
  - 15 hộp thoại modal trong thư mục `fe/src/app/features/admin/orders/components/modals/`

## Checklist

- [ ] Tinh gọn trang danh sách đơn hàng và các tab pipeline.
- [ ] Loại bỏ hiện tượng thẻ card lồng card trên trang chi tiết đơn hàng.
- [ ] Tinh gọn thanh trạng thái đơn và thiết kế lại thanh tác vụ chỉ giữ 1 Primary CTA duy nhất + menu phụ.
- [ ] Tinh gọn các khối thông tin người mua, dòng sản phẩm PC, tóm tắt tài chính và lịch sử.
- [ ] Chuẩn hóa và tinh gọn 15 hộp thoại xử lý đơn hàng về mẫu hộp thoại nhẹ nhàng, nhanh chóng.
- [ ] Chạy kiểm tra `npm run check:fe` với exit code 0.
