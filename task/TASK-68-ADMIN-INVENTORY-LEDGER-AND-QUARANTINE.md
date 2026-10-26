# Task: TASK-68 - Sổ Cái Tồn Kho, Kiểm Soát Dịch Chuyển Sê-Ri Và Luồng Cách Ly Hàng Lỗi

- Feature: Inventory Invariant Breach Detection, Serial Movement Ledger & Damaged Stock Quarantine Workflow
- Governing Spec: [report/admin_subsystem_business_logic_issues_report.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/report/admin_subsystem_business_logic_issues_report.md) (ISS-010, ISS-014, ISS-015), [INV-001, INV-002, INV-004, INV-005, INV-013, PUR-010](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/.agents/skills/business-logic/features/)
- Scope: backend
- Priority: P1 (High)
- Status: Complete

## Objective

Khắc phục 3 lỗi vi phạm tính bất biến và thiếu sót quy trình nghiệp vụ kho:
1. ISS-010: Sử dụng `Math.max(0, ...)` khi tính số lượng tồn kho khả dụng `available = onHand - reserved - quarantineDamaged` che giấu hiện tượng tồn khả dụng bị âm do lỗi bán vượt tồn (Overselling) hoặc trừ kho sai lệch, vi phạm quy tắc `INV-004`.
2. ISS-014: Phương thức `updateSerialStatus` trong `serial.service.ts` cho phép Admin đổi trạng thái và chuyển chi nhánh trực tiếp trên bản ghi `SerialUnit` mà không tạo phiếu kho `StockMove`, không ghi nhật ký dịch chuyển sê-ri `SerialMovement` và không cập nhật sổ cái `StockQuant`, làm lệch sổ sách với thực tế.
3. ISS-015: Thiếu hoàn toàn luồng nghiệp vụ cách ly linh kiện lỗi hỏng (`quarantineStock`) trong kho chi nhánh, khiến `quarantineDamaged` luôn bằng 0 và linh kiện hỏng vẫn hiển thị là tồn khả dụng để hệ thống tiếp tục giữ chỗ cho đơn mới.

## Technical Context And Dependencies

- Pre-requisites: TASK-64
- Reusable Assets:
  - [be/src/services/admin/inventory.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/admin/inventory.service.ts)
  - [be/src/services/admin/serial.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/admin/serial.service.ts)
  - [be/src/services/admin/supplier-return.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/admin/supplier-return.service.ts)
- Target Files:
  - `be/src/services/admin/inventory.service.ts`
  - `be/src/services/admin/serial.service.ts`

## Sub-agent Delegation Strategy

Giao nhiệm vụ cho sub-agent chuyên trách quản lý kho và sổ cái bất biến (`task-implementer`):
- Đảm bảo tính toán số học chính xác không che đậy số âm.
- Đảm bảo mọi dịch chuyển trạng thái sê-ri vật lý luôn đi kèm phiếu kho và bản ghi sổ cái trong cùng một transaction.

## Checklist

- [x] Trong phương thức tính toán số dư tồn kho tại [inventory.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/admin/inventory.service.ts#L178):
  - Loại bỏ hàm `Math.max(0, ...)` khi tính `available`. Trả về giá trị số học thực tế `onHand - reserved - quarantineDamaged`.
  - Nếu giá trị `available < 0`, tự động gắn cờ `hasInvariantBreach: true` trên bản ghi DTO trả về để báo cáo cảnh báo lệch sổ kho cho quản trị viên.
- [x] Trong phương thức `updateSerialStatus` tại [serial.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/admin/serial.service.ts#L473-L509):
  - Khóa hoàn toàn thao tác đổi chi nhánh `currentBranchId` trực tiếp trên sê-ri lẻ. Bắt buộc mọi thay đổi chi nhánh phải thông qua quy trình tạo phiếu điều chuyển kho `StockMoveType.TRANSFER`.
  - Khi đổi trạng thái sê-ri sang `QUARANTINED`, bắt buộc thực hiện đồng bộ với phương thức cách ly hàng lỗi để cập nhật số dư kho `StockQuant`.
- [x] Xây dựng phương thức nghiệp vụ mới `quarantineStock` trong [inventory.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/admin/inventory.service.ts):
  - Tiếp nhận `branchId`, `skuId`, `quantity`, danh sách `serialIds` (nếu SKU yêu cầu quản lý sê-ri), và lý do hỏng lỗi.
  - Thực hiện trong transaction: Kiểm tra tồn kho khả dụng đủ điều kiện cách ly; giảm số lượng khả dụng và tăng số lượng `quarantineDamaged` trên `StockQuant`; cập nhật trạng thái sê-ri sang `QUARANTINED`; tạo phiếu điều chuyển nội bộ và ghi nhận nhật ký dịch chuyển số cái `StockLedgerEntry`.

## Acceptance Criteria

- Criterion 1: Tồn kho khả dụng âm không bị che giấu thành 0; cờ `hasInvariantBreach` được bật khi xuất hiện số âm.
- Criterion 2: Không thể cập nhật trực tiếp chi nhánh của số sê-ri mà không qua phiếu chuyển kho.
- Criterion 3: Phương thức `quarantineStock` hoạt động trơn tru, khóa linh kiện lỗi khỏi số lượng giữ chỗ và cập nhật chính xác số dư `quarantineDamaged`.
- Criterion 4: Lệnh `npm run check:be` chạy thành công với exit code 0.

## Verification Commands

- Command 1: npm run check:be
