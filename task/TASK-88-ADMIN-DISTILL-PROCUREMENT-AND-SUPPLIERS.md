# Task: TASK-88 - Tinh Gọn Quản Lý Mua Hàng, Nhập Kho PO Và Trả Hàng Nhà Cung Cấp Bằng Impeccable Distill

- Feature: Admin Procurement, Purchase Orders, Supplier Management & Returns Distillation
- Governing Spec: [MASTER.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/design-system/el-tech/MASTER.md), [SKILL.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/.agents/skills/impeccable/SKILL.md), [distill.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/.agents/skills/impeccable/reference/distill.md), [admin-portal-screens-and-modals.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/docs/admin-portal-screens-and-modals.md) (SCR-11, SCR-12, SCR-13, SCR-14, MOD-01, MOD-02, MOD-03, MOD-04, MOD-05, MOD-06)
- Scope: frontend
- Priority: P2 (Medium)
- Status: To Do

## Traceability & Graph Links

- Task Type: `ui-ux-distill`
- Issue References: Màn hình chi tiết đơn nhập hàng PO và các hộp thoại nghiệm thu nhập kho có nhiều phân đoạn thông tin bị phân mảnh; khu vực nhập sê-ri và xác nhận thiếu hàng có nhiều chú thích hướng dẫn dài dòng làm chậm thao tác của nhân viên thu mua.
- Related Tasks:
  - [[TASK-47-ADMIN-PURCHASE-ORDERS-INBOUND-AND-SERIAL-RECEIVING]]
  - [[TASK-48-ADMIN-SUPPLIER-RETURNS-AND-INBOUND-MOVE-AUDIT]]
  - [[TASK-72-ADMIN-INVENTORY-TABLES-AND-TRANSFERS]]

## Objective

Thực hiện tinh gọn giao diện theo nguyên tắc Impeccable Distill cho toàn bộ phân hệ Mua hàng và Nhà cung cấp:

1. Tinh gọn Trang chi tiết đơn đặt hàng mua [admin-purchase-order-detail-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/procurement/admin-purchase-order-detail-page.component.ts):
   - Làm phẳng bố cục: ghép khối thông tin nhà cung cấp, kho nhận và trạng thái thanh toán thành 1 hàng tóm tắt nhẹ nhàng thay vì chia thành nhiều thẻ card độc lập.
   - Tinh gọn bảng danh sách mặt hàng nhập: làm rõ số lượng đặt, số lượng đã nhận, giá nhập WAC và thành tiền với phông chữ số `tabular-nums`.
   - Loại bỏ các khung viền bao bọc thừa ở thanh tổng tiền cuối trang, giúp toàn bộ trang có luồng đọc liền mạch từ trên xuống dưới.

2. Tinh gọn Các hộp thoại nghiệm thu và nhập kho PO:
   - [confirm-po-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/procurement/components/confirm-po-dialog.component.ts): Đơn giản hóa xác nhận gửi đơn PO đến nhà cung cấp.
   - [validate-po-receipt-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/procurement/components/validate-po-receipt-dialog.component.ts): Tinh gọn khu vực quét/nhập mã sê-ri, loại bỏ văn bản hướng dẫn dài dòng, tập trung vào ô nhập nhanh và danh sách sê-ri hợp lệ.
   - [short-shipment-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/procurement/components/short-shipment-dialog.component.ts): Tối giản hộp thoại ghi nhận giao thiếu hàng, thể hiện trực quan số lượng thiếu hụt và phương án xử lý (hủy phần còn lại hoặc chờ giao bổ sung) một cách mạch lạc.

3. Tinh gọn Quản lý Trả hàng nhà cung cấp:
   - [admin-supplier-returns-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/procurement/admin-supplier-returns-page.component.ts)
   - [create-supplier-return-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/procurement/components/create-supplier-return-dialog.component.ts)
   - Tinh gọn luồng tạo phiếu trả hàng: chọn đơn PO, chọn linh kiện lỗi kèm mã sê-ri và lý do nhanh chóng mà không cần mở nhiều tầng modal chồng chéo.

4. Tinh gọn Danh bạ Nhà cung cấp:
   - [admin-suppliers-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/suppliers/admin-suppliers-page.component.ts)
   - [supplier-form-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/suppliers/components/supplier-form-dialog.component.ts)
   - Tối giản bảng nhà cung cấp với các cột thiết yếu: Tên công ty, mã số thuế, thông tin liên hệ chính, thời hạn thanh toán và trạng thái hoạt động.

## Technical Context And Dependencies

- Target Files:
  - [admin-suppliers-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/suppliers/admin-suppliers-page.component.ts)
  - [supplier-form-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/suppliers/components/supplier-form-dialog.component.ts)
  - [admin-purchase-orders-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/procurement/admin-purchase-orders-page.component.ts)
  - [admin-purchase-order-detail-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/procurement/admin-purchase-order-detail-page.component.ts)
  - [admin-supplier-returns-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/procurement/admin-supplier-returns-page.component.ts)
  - [confirm-po-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/procurement/components/confirm-po-dialog.component.ts)
  - [validate-po-receipt-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/procurement/components/validate-po-receipt-dialog.component.ts)
  - [short-shipment-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/procurement/components/short-shipment-dialog.component.ts)
  - [create-supplier-return-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/procurement/components/create-supplier-return-dialog.component.ts)

## Checklist

- [ ] Tinh gọn trang chi tiết PO: làm phẳng tổng quan nhà cung cấp/kho nhận và bảng hàng hóa.
- [ ] Tinh gọn hộp thoại nhận hàng và quét sê-ri PO: loại bỏ text hướng dẫn dài dòng, tối ưu ô nhập sê-ri.
- [ ] Tinh gọn hộp thoại ghi nhận giao thiếu hàng và tạo phiếu trả hàng nhà cung cấp.
- [ ] Đơn giản hóa bảng nhà cung cấp và biểu mẫu tạo/sửa nhà cung cấp.
- [ ] Chạy kiểm tra `npm run check:fe` với exit code 0.
