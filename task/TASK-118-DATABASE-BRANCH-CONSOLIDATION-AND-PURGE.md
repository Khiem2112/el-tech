# Task: TASK-118 - Dồn Dữ Liệu Tồn Kho Về Chi Nhánh Chính Và Xóa Các Chi Nhánh Thừa

- Feature: Database Branch Consolidation & Extra Branch Purge
- Governing Spec: Sheet PHAN CONG - Task 1.0 (Bỏ phân chia chi nhánh, chỉ giữ 1 cửa hàng duy nhất), Yêu cầu cập nhật dữ liệu chi nhánh
- Scope: database
- Status: Complete

## Objective

Xây dựng và thực thi kịch bản chuyển đổi dữ liệu cơ sở dữ liệu để hợp nhất toàn bộ dữ liệu nghiệp vụ về duy nhất một chi nhánh chính (Showroom EL-TECH, mã `STORE-MAIN`). Không xóa lược đồ model `Branch` trong `schema.prisma`. Chuyển toàn bộ các bản ghi trong các bảng có khóa ngoại trỏ tới các chi nhánh thừa (gồm `Order`, `StockQuant`, `StockMove`, `SerialUnit`, `SerialMovement`, `PurchaseOrder`, `Coupon`) về chi nhánh chính. Đối với bảng tồn kho `StockQuant`, thực hiện cộng dồn số lượng tồn kho `onHand`, `reserved`, `quarantineDamaged` để không vi phạm ràng buộc duy nhất `[branchId, skuId]`. Sau khi chuyển đổi toàn bộ liên kết, xóa sạch các bản ghi chi nhánh thừa khỏi bảng `Branch`. Cập nhật kịch bản seed dữ liệu để duy trì duy nhất 1 chi nhánh trong hệ thống.

## Technical Context And Dependencies

- Pre-requisites: Hoàn thành `TASK-97`. Kết nối cơ sở dữ liệu PostgreSQL qua Prisma Client hoạt động bình thường.
- Reusable Assets: Prisma Client tại `be/src/lib/prisma.ts`.
- Target Files:
  - `be/scripts/consolidate_branches.ts`
  - `be/scripts/seed_demo_flow_data.ts`
  - `be/scripts/mock_catalog_meta.py`

## Checklist

- [x] Giữ nguyên định nghĩa model `Branch` trong `be/prisma/schema.prisma` (không xóa model `Branch`).
- [x] Tạo kịch bản TypeScript `be/scripts/consolidate_branches.ts` thực thi hợp nhất dữ liệu trong Prisma transaction:
  - [x] Tìm hoặc tạo bản ghi chi nhánh chính `STORE-MAIN` với tên "Showroom EL-TECH" và địa chỉ "280 Ba Tháng Hai, Phường 12, Quận 10, TP. Hồ Chí Minh".
  - [x] Lấy danh sách ID của tất cả các chi nhánh thừa cần dọn dẹp (`id != mainBranch.id`).
  - [x] Xử lý bảng `StockQuant`: Với mỗi bản ghi của chi nhánh thừa, kiểm tra nếu chi nhánh chính đã có bản ghi cùng `skuId` thì cộng dồn `onHand`, `reserved`, `quarantineDamaged`, cập nhật các bản ghi `StockLedgerEntry` trỏ sang `stockQuantId` của chi nhánh chính và xóa bản ghi `StockQuant` của chi nhánh thừa; nếu chi nhánh chính chưa có thì cập nhật `branchId = mainBranch.id`.
  - [x] Xử lý bảng `Order`: Cập nhật `fulfillmentBranchId = mainBranch.id` và cập nhật trường `branchSnapshot` thành thông tin của chi nhánh chính cho toàn bộ đơn hàng trỏ tới chi nhánh thừa.
  - [x] Xử lý bảng `StockMove`: Cập nhật `sourceBranchId = mainBranch.id` cho các move có nguồn là chi nhánh thừa; cập nhật `destinationBranchId = mainBranch.id` cho các move có đích là chi nhánh thừa.
  - [x] Xử lý bảng `SerialUnit`: Cập nhật `currentBranchId = mainBranch.id` cho các serial đang thuộc chi nhánh thừa.
  - [x] Xử lý bảng `SerialMovement`: Cập nhật `fromBranchId = mainBranch.id` và `toBranchId = mainBranch.id` khi tương ứng với chi nhánh thừa.
  - [x] Xử lý bảng `PurchaseOrder`: Cập nhật `receivingBranchId = mainBranch.id` cho các PO đang trỏ tới chi nhánh thừa.
  - [x] Xử lý bảng `Coupon`: Cập nhật `branchId = mainBranch.id` (hoặc `null` nếu áp dụng toàn hệ thống) cho các mã giảm giá trỏ tới chi nhánh thừa.
  - [x] Xóa toàn bộ các bản ghi chi nhánh thừa trong bảng `Branch`.
- [x] Cập nhật `be/scripts/mock_catalog_meta.py`: Đảm bảo mảng `BRANCHES_DATA` chỉ định nghĩa duy nhất 1 chi nhánh `STORE-MAIN`.
- [x] Cập nhật `be/scripts/seed_demo_flow_data.ts`: Đảm bảo quy trình seed chỉ khởi tạo và gán đơn hàng vào 1 chi nhánh duy nhất.
- [x] Thực thi kịch bản `consolidate_branches.ts` và kiểm tra số lượng chi nhánh còn lại trong cơ sở dữ liệu bằng đúng 1.

## Acceptance Criteria

- Criterion 1: Lược đồ Prisma không bị thay đổi hoặc xóa bỏ model `Branch`.
- Criterion 2: Số lượng bản ghi trong bảng `Branch` trong cơ sở dữ liệu sau khi chạy script chính xác bằng 1 (`code: STORE-MAIN`).
- Criterion 3: Không có bất kỳ bản ghi nào trong các bảng liên quan (`Order`, `StockQuant`, `StockMove`, `SerialUnit`, `PurchaseOrder`) bị mồ côi hoặc tham chiếu đến ID chi nhánh không tồn tại.
- Criterion 4: Tồn kho linh kiện của các chi nhánh thừa được bảo toàn và cộng dồn chính xác vào chi nhánh chính, không phát sinh lỗi trùng lặp `unique(branchId, skuId)`.

## Verification Commands

- Command 1: `cd be; npx tsx scripts/consolidate_branches.ts`
- Command 2: `npm run check:be`
