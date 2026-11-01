# Task: TASK-130 - Gỡ Bỏ Khối Điều Chuyển Đang Giao & Tinh Gọn Dashboard Admin

- Feature: Admin Operational Dashboard Single Store Streamlining & Transfers Cleanup
- Governing Spec: Quy tắc một cửa hàng Showroom EL-TECH, loại bỏ thẻ điều chuyển đang giao và bộ lọc chi nhánh trên Dashboard
- Scope: frontend & backend
- Status: Completed

## Objective

Hoàn tất tinh gọn trang tổng quan vận hành Admin (Dashboard) theo mô hình một cửa hàng duy nhất:
- Xử lý component **Phiếu Điều Chuyển Đang Giao** ([in-transit-transfers-card.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/dashboard/components/in-transit-transfers-card.component.ts)): gỡ bỏ hoàn toàn việc hiển thị component này khỏi trang Dashboard ([admin-dashboard-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/dashboard/admin-dashboard-page.component.ts)).
- Gỡ bỏ liên kết lối tắt "Lập Lệnh Điều Chuyển" trỏ sang `/admin/inventory/transfers` trong danh sách Lối Tắt Thao Tác Nhanh trên Dashboard.
- Điều chỉnh bố cục phần hiển thị: mở rộng thẻ Cảnh Báo Tồn Kho Thấp ([low-stock-alert-card.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/dashboard/components/low-stock-alert-card.component.ts)) sang chiều rộng đầy đủ, tránh để lại khoảng trống sau khi gỡ bỏ Phiếu Điều Chuyển Đang Giao.
- Xóa bỏ bộ lọc dropdown chi nhánh `branchOptions` và tín hiệu `selectedBranchValue` trên Dashboard; đảm bảo tất cả chỉ số KPI, phân bổ đơn hàng và cảnh báo phản ánh trực tiếp toàn bộ Showroom EL-TECH.
- Dọn dẹp signal `inTransitTransfers` trong [admin-dashboard.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/dashboard/services/admin-dashboard.service.ts) và hàm truy vấn tương ứng ở backend [dashboard.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/admin/dashboard.service.ts).
- Dọn dẹp cột hiển thị chi nhánh trong lịch sử đơn hàng tại trang chi tiết khách hàng [admin-customer-detail-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/customers/admin-customer-detail-page.component.ts).
- Lưu ý phạm vi: Màn hình quản lý chi nhánh `admin-branches-page.component.ts` dù vẫn tồn tại trong mã nguồn nhưng không còn bất kỳ đường dẫn nào trên thanh điều hướng trỏ tới, do đó giữ nguyên và không cần xóa hay chỉnh sửa.

## Technical Context And Dependencies

- Pre-requisites: Hoàn thành TASK-126, TASK-127, TASK-128, TASK-129.
- Target Files:
  - `fe/src/app/features/admin/dashboard/admin-dashboard-page.component.ts`
  - `fe/src/app/features/admin/dashboard/services/admin-dashboard.service.ts`
  - `fe/src/app/features/admin/dashboard/components/in-transit-transfers-card.component.ts`
  - `fe/src/app/features/admin/customers/admin-customer-detail-page.component.ts`
  - `be/src/services/admin/dashboard.service.ts`

## Checklist

- [x] Cập nhật [admin-dashboard-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/dashboard/admin-dashboard-page.component.ts):
  - Gỡ bỏ component `<app-in-transit-transfers-card>` khỏi template và mảng `imports`.
  - Gỡ bỏ thẻ liên kết lối tắt "Lập Lệnh Điều Chuyển" trỏ đến `/admin/inventory/transfers`.
  - Mở rộng vùng hiển thị thẻ `<app-low-stock-alert-card>` chiếm toàn bộ chiều rộng lưới (`grid-cols-1`) thay cho lưới 2 cột trước đây.
  - Xóa bỏ dropdown chọn chi nhánh `branchOptions`, hàm `onBranchSelect`, và tín hiệu `selectedBranchValue`.
- [x] Cập nhật [admin-dashboard.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/dashboard/services/admin-dashboard.service.ts):
  - Dọn dẹp signal `inTransitTransfers`, loại bỏ nạp dữ liệu điều chuyển không cần thiết.
- [x] Cập nhật [dashboard.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/admin/dashboard.service.ts):
  - Dọn dẹp truy vấn `getInTransitTransfers` trong API dữ liệu dashboard tổng hợp.
- [x] Cập nhật [admin-customer-detail-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/customers/admin-customer-detail-page.component.ts):
  - Xóa cột "Chi nhánh" trong bảng danh sách đơn hàng đã mua của khách hàng.
- [x] Chạy kiểm thử tự động toàn diện:
  - `npm run check:fe` đạt exit code 0.
  - `npm run check:be` đạt exit code 0.

## Acceptance Criteria

- Criterion 1: Component "Phiếu Điều Chuyển Đang Giao" và lối tắt điều chuyển được gỡ bỏ hoàn toàn khỏi Dashboard, thẻ cảnh báo tồn kho thấp mở rộng hài hòa.
- Criterion 2: Dashboard quản trị không còn dropdown lọc chi nhánh, toàn bộ dữ liệu phản ánh tập trung cho Showroom EL-TECH.
- Criterion 3: Màn hình `admin-branches-page` không bị tác động thừa; lịch sử đơn hàng của khách hàng không còn cột chi nhánh.
- Criterion 4: Kiểm thử tự động `npm run check:fe` và `npm run check:be` hoàn tất thành công với mã thoát 0.

## Verification Commands

- Command 1: `npm run check:fe`
- Command 2: `npm run check:be`
