# Task: TASK-126 - Quản Trị Tồn Kho Tập Trung & Dọn Dẹp Phân Hệ Chuyển Kho Admin

- Feature: Admin Inventory Single Store Consolidation & Transfers Cleanup
- Governing Spec: Quy tắc một cửa hàng tập trung duy nhất (Showroom EL-TECH), loại bỏ phân mảnh đa chi nhánh trong quản trị kho
- Scope: shared
- Status: Complete

## Objective

Chuyển đổi toàn diện phân hệ quản trị tồn kho admin sang mô hình một cửa hàng Showroom EL-TECH tập trung:
1. Tinh gọn màn hình Tồn kho chi nhánh ([admin-inventory-balances-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/inventory/admin-inventory-balances-page.component.ts)): xóa bỏ logic gom cụm vùng miền (`cluster.branchCodes`, `regionClusters`, `regionKey`), xóa bỏ cột chi nhánh và các bộ lọc chi nhánh không còn cần thiết; hiển thị bảng tồn kho phẳng tập trung với 4 chỉ số: On-hand, Reserved, Available, Quarantine.
2. Cập nhật trang Sổ cái biến động kho ([admin-stock-ledger-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/inventory/admin-stock-ledger-page.component.ts)): dọn dẹp bộ lọc chi nhánh, toàn bộ biến động kho đều ghi nhận trực tiếp cho showroom chính.
3. Vô hiệu hóa hoặc ẩn giao diện điều chuyển kho ([admin-transfers-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/inventory/admin-transfers-page.component.ts)) cùng các dialog chuyển kho; cập nhật [admin.routes.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/admin.routes.ts) chuyển hướng route `inventory/transfers` sang `inventory/balances`.
4. Cập nhật backend [inventory.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/admin/inventory.service.ts) để tự động mặc định chi nhánh Showroom EL-TECH cho mọi thao tác tồn kho và cách ly lỗi.

## Technical Context And Dependencies

- Pre-requisites: Hoàn thành TASK-118, TASK-121.
- Target Files:
  - `fe/src/app/features/admin/inventory/admin-inventory-balances-page.component.ts`
  - `fe/src/app/features/admin/inventory/admin-stock-ledger-page.component.ts`
  - `fe/src/app/features/admin/admin.routes.ts`
  - `be/src/services/admin/inventory.service.ts`

## Checklist

- [x] Cập nhật [admin-inventory-balances-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/inventory/admin-inventory-balances-page.component.ts):
  - Tiêu đề trang đổi thành "Quản Lý Tồn Kho Tập Trung", phụ đề "Giám sát số dư tồn kho đa trạng thái và giá vốn WAC tại Showroom EL-TECH".
  - Loại bỏ các kiểu dữ liệu và biến liên quan đến phân cụm vùng miền (`InventoryRegionCluster`, `isGroupByRegion`, `regionClusters`).
  - Xóa cột "Chi nhánh" trên thead và tbody, thay bằng thông tin vị trí lưu trữ/trạng thái hàng.
  - Bảng hiển thị danh sách phẳng trực tiếp từ `inventoryService.balances()`.
- [x] Cập nhật [admin-stock-ledger-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/inventory/admin-stock-ledger-page.component.ts):
  - Xóa dropdown lọc theo `branchId` khỏi thanh công cụ lọc.
  - Xóa cột "Chi nhánh" hoặc gán nhãn cố định Showroom EL-TECH.
- [x] Cập nhật [admin.routes.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/admin.routes.ts):
  - Tuyến đường `inventory/transfers` chuyển thành redirect về `inventory/balances`.
- [x] Cập nhật [inventory.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/admin/inventory.service.ts):
  - Tự động lấy chi nhánh showroom duy nhất khi `branchId` không được truyền trong `quarantineStock` và truy vấn số dư kho.
  - Đảm bảo các hàm truy vấn sổ cái và tồn kho hoạt động trơn tru không lỗi.

## Acceptance Criteria

- Criterion 1: Màn hình Quản lý tồn kho hiển thị bảng phẳng tập trung của Showroom EL-TECH với đầy đủ số liệu tồn kho (On-hand, Reserved, Quarantine, Available) không còn nhãn phân cụm vùng miền hay cột chi nhánh thừa.
- Criterion 2: Màn hình Sổ cái kho không còn bộ lọc chi nhánh thừa, phản ánh đúng toàn bộ biến động nhập xuất kho của showroom.
- Criterion 3: Route `admin/inventory/transfers` tự động chuyển hướng người dùng về `admin/inventory/balances`.
- Criterion 4: Kiểm thử tự động `npm run check:fe` và `npm run check:be` hoàn tất thành công với mã thoát 0.

## Verification Commands

- Command 1: `npm run check:fe`
- Command 2: `npm run check:be`

## Review & Fix Log

- Dual-Pass Review:
  - Pass A (Functional): PASS - Đáp ứng đầy đủ 4 tiêu chí nghiệm thu.
  - Pass B (Convention): PASS - Tuân thủ OnPush change detection, signals, zero emojis/icons, zero numbered comments.
- Remediation: Không có khiếm khuyết cần khắc phục.
- Final Gate:
  - `npm run check:be`: exit code 0.
  - `npm run check:fe`: exit code 0.
  - Review Verdict: PASS.

