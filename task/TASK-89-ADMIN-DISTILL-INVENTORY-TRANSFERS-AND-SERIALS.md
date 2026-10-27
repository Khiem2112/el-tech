# Task: TASK-89 - Tinh Gọn Quản Lý Tồn Kho, Điều Chuyển, Sổ Cái Và Sê-ri Bằng Impeccable Distill

- Feature: Admin Inventory Balances, Transfers, Stock Ledger, Serials & Branches Distillation
- Governing Spec: [MASTER.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/design-system/el-tech/MASTER.md), [SKILL.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/.agents/skills/impeccable/SKILL.md), [distill.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/.agents/skills/impeccable/reference/distill.md), [admin-portal-screens-and-modals.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/docs/admin-portal-screens-and-modals.md) (SCR-15, SCR-16, SCR-17, SCR-18, SCR-19)
- Scope: frontend
- Priority: P2 (Medium)
- Status: To Do

## Traceability & Graph Links

- Task Type: `ui-ux-distill`
- Issue References: Bảng tồn kho theo chi nhánh và sổ cái tồn kho có quá nhiều cột số liệu gây rối mắt; hộp thoại tạo phiếu điều chuyển kho có nhiều bước phức tạp không cần thiết; thẻ tra cứu sê-ri barcode cần được tối giản hóa thành một luồng tra cứu siêu tốc.
- Related Tasks:
  - [[TASK-49-ADMIN-INVENTORY-BALANCES-AND-IMMUTABLE-LEDGER]]
  - [[TASK-50-ADMIN-SERIAL-NUMBERS-AND-WARRANTY-LIFECYCLE]]
  - [[TASK-51-ADMIN-INTERNAL-TRANSFERS-MULTI-STEP-PIPELINE]]
  - [[TASK-72-ADMIN-INVENTORY-TABLES-AND-TRANSFERS]]
  - [[TASK-84-ADMIN-INVENTORY-QUARANTINE-AND-SERIALS-SCANNER-LOOKUP]]

## Objective

Thực hiện tinh gọn giao diện theo nguyên tắc Impeccable Distill cho toàn bộ phân hệ Kho vận và Linh kiện sê-ri:

1. Tinh gọn Trang tồn kho chi nhánh [admin-inventory-balances-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/inventory/admin-inventory-balances-page.component.ts):
   - Tối giản thẻ tóm tắt tồn kho theo cụm miền: thể hiện 3 số liệu cốt lõi (Tồn khả dụng, Đang giữ cho đơn, Cách ly lỗi) với độ tương phản cao, loại bỏ khung viền trang trí.
   - Tinh gọn bảng tồn kho SKU: các cột số lượng được căn phải nhất quán với `tabular-nums`.
   - [quarantine-stock-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/inventory/components/quarantine-stock-dialog.component.ts): Tối giản hộp thoại cách ly lỗi kho thành lựa chọn lý do nhanh và nhập số lượng rõ ràng.

2. Tinh gọn Sổ cái biến động tồn kho:
   - [admin-stock-ledger-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/inventory/admin-stock-ledger-page.component.ts)
   - [stock-ledger-sheet.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/inventory/components/stock-ledger-sheet.component.ts)
   - Tối giản giao diện nhật ký sổ cái bất biến: làm rõ chiều biến động (+ nhập, - xuất) bằng màu sắc tương phản tối giản, không cần sử dụng những huy hiệu quá màu mè.
   - Tinh gọn ngăn kéo (sheet) lịch sử biến động tồn kho cho từng SKU.

3. Tinh gọn Luồng điều chuyển nội bộ:
   - [admin-transfers-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/inventory/admin-transfers-page.component.ts)
   - [create-transfer-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/inventory/components/create-transfer-dialog.component.ts)
   - [dispatch-transfer-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/inventory/components/dispatch-transfer-dialog.component.ts)
   - [receive-transfer-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/inventory/components/receive-transfer-dialog.component.ts)
   - [cancel-transfer-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/inventory/components/cancel-transfer-dialog.component.ts)
   - Tinh gọn hộp thoại tạo phiếu điều chuyển: gom chọn kho xuất, kho nhận và danh sách SKU thành 1 màn hình gọn gàng, không bắt nhân viên phải chuyển qua lại nhiều tab.
   - Tinh gọn các hộp thoại xuất kho (dispatch), nhận hàng (receive) và hủy phiếu (cancel) về các thao tác xác nhận dứt khoát.

4. Tinh gọn Tra cứu sê-ri và vòng đời thiết bị:
   - [admin-serials-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/serials/admin-serials-page.component.ts)
   - [serial-detail-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/serials/components/serial-detail-dialog.component.ts)
   - Tối ưu thẻ quét barcode trung tâm: giảm khoảng trống thừa, thể hiện ngay kết quả tra cứu (hình ảnh, trạng thái bảo hành, lịch sử di chuyển) gọn đẹp như một thẻ căn cước thiết bị tinh tế.
   - Tinh gọn timeline di chuyển của sê-ri: loại bỏ các đường nối cồng kềnh, dùng trục thời gian thanh mảnh và dễ đọc.

5. Tinh gọn Quản lý Chi nhánh và Phạm vi phục vụ:
   - [admin-branches-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/branches/admin-branches-page.component.ts)
   - [branch-form-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/branches/components/branch-form-dialog.component.ts)
   - Đơn giản hóa danh sách chi nhánh và biểu mẫu thiết lập khu vực giao hàng.

## Technical Context And Dependencies

- Target Files:
  - [admin-inventory-balances-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/inventory/admin-inventory-balances-page.component.ts)
  - [admin-stock-ledger-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/inventory/admin-stock-ledger-page.component.ts)
  - [admin-transfers-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/inventory/admin-transfers-page.component.ts)
  - [create-transfer-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/inventory/components/create-transfer-dialog.component.ts)
  - [dispatch-transfer-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/inventory/components/dispatch-transfer-dialog.component.ts)
  - [receive-transfer-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/inventory/components/receive-transfer-dialog.component.ts)
  - [cancel-transfer-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/inventory/components/cancel-transfer-dialog.component.ts)
  - [quarantine-stock-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/inventory/components/quarantine-stock-dialog.component.ts)
  - [stock-ledger-sheet.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/inventory/components/stock-ledger-sheet.component.ts)
  - [admin-serials-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/serials/admin-serials-page.component.ts)
  - [serial-detail-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/serials/components/serial-detail-dialog.component.ts)
  - [admin-branches-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/branches/admin-branches-page.component.ts)
  - [branch-form-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/branches/components/branch-form-dialog.component.ts)

## Checklist

- [ ] Tinh gọn trang tồn kho chi nhánh và hộp thoại cách ly hàng lỗi.
- [ ] Tinh gọn bảng sổ cái biến động tồn kho và ngăn kéo chi tiết SKU.
- [ ] Tinh gọn luồng tạo, xuất và nhận phiếu điều chuyển nội bộ.
- [ ] Tinh gọn thẻ quét barcode sê-ri và dòng thời gian lịch sử di chuyển linh kiện.
- [ ] Tinh gọn danh sách và hộp thoại chi nhánh.
- [ ] Chạy kiểm tra `npm run check:fe` với exit code 0.
