# Task: TASK-133 - Tích Hợp Xem Phiếu Kho Từ Đơn Bán Hàng & Đơn Mua Hàng Nhà Cung Cấp

- Feature: Admin Orders & Procurement Stock Moves Inspection
- Governing Spec: Yêu cầu đối soát luân chuyển hàng: Cho phép xem ngay các phiếu kho ứng với đơn bán hàng khi bấm nút "Phiếu Kho", đồng thời xem phiếu kho và chi tiết các dòng sản phẩm trong đơn mua hàng nhà cung cấp (PO)
- Scope: shared
- Status: Pending

## Objective

Tích hợp tính năng truy xuất và xem trực quan toàn bộ phiếu kho (`StockMove`) cùng các dòng sản phẩm (`StockMoveLine`) trực tiếp từ hai màn hình giao dịch cốt lõi:
- Màn hình Chi tiết đơn hàng bán ([admin-order-detail-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/admin-order-detail-page.component.ts)): Bổ sung nút bấm hành động "Phiếu Kho" nổi bật trên thanh tác vụ của trang chi tiết. Khi bấm nút, mở modal hộp thoại chuyên biệt hiển thị danh sách tất cả các phiếu kho liên kết với đơn (phiếu giữ chỗ tồn kho `RESERVED`, phiếu xuất kho bán hàng `ORDER_ISSUE`, phiếu hoàn/hủy kho...), kèm thông tin chi tiết từng dòng linh kiện (`StockMoveLine`), số lượng và danh sách mã sê-ri đã xuất kho.
- Màn hình Chi tiết đơn mua hàng nhà cung cấp ([admin-purchase-order-detail-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/procurement/admin-purchase-order-detail-page.component.ts)): Nâng cấp khu vực xem phiếu nhập kho (`receiptMove`), bổ sung modal hoặc khối chi tiết hiển thị trực quan thông tin phiếu kho nhập hàng, đối chiếu số lượng đặt mua ban đầu so với số lượng thực nhận, giá vốn nhập thực tế và danh sách sê-ri linh kiện đã kích hoạt kho.
- Nâng cấp các service backend tương ứng để cung cấp đầy đủ thông tin dòng `lines` và sê-ri liên kết.

## Technical Context And Dependencies

- Pre-requisites: Hoàn thành TASK-127, TASK-128, TASK-132.
- Reusable Assets: `ButtonDirective`, `BadgeDirective`, `AdminOrderDetailService`, `AdminPurchaseOrderService`, Prisma models `StockMove`, `StockMoveLine`.
- Target Files:
  - `fe/src/app/features/admin/orders/admin-order-detail-page.component.ts`
  - `fe/src/app/features/admin/orders/components/order-stock-moves-modal.component.ts` (Tạo mới)
  - `fe/src/app/features/admin/orders/services/admin-order-detail.service.ts`
  - `fe/src/app/features/admin/procurement/admin-purchase-order-detail-page.component.ts`
  - `fe/src/app/features/admin/procurement/components/po-stock-move-modal.component.ts` (Tạo mới)
  - `fe/src/app/features/admin/procurement/services/admin-purchase-order.service.ts`
  - `be/src/services/admin/order-detail.service.ts`
  - `be/src/services/admin/purchase-order.service.ts`

## Checklist

- [ ] Cập nhật [order-detail.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/admin/order-detail.service.ts) để truy vấn kèm `lines` (`StockMoveLine`) và `receivedSerialUnits` trong danh sách `stockMoves` của đơn hàng.
- [ ] Cập nhật [purchase-order.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/admin/purchase-order.service.ts) để nạp đầy đủ thông tin các dòng `lines`, `sku`, `quantity`, `agreedUnitCost` và danh sách sê-ri trong `receiptMove`.
- [ ] Mở rộng kiểu dữ liệu `stockMoves` trong [admin-order-detail.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/services/admin-order-detail.service.ts) và `receiptMove` trong [admin-purchase-order.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/procurement/services/admin-purchase-order.service.ts).
- [ ] Xây dựng component hộp thoại [order-stock-moves-modal.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/components/order-stock-moves-modal.component.ts) hiển thị danh sách phiếu kho và bảng chi tiết các dòng sản phẩm của đơn hàng bán.
- [ ] Thêm nút bấm "Phiếu Kho" trên thanh tác vụ của trang chi tiết đơn hàng [admin-order-detail-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/orders/admin-order-detail-page.component.ts), kích hoạt mở modal xem phiếu kho.
- [ ] Xây dựng component hộp thoại [po-stock-move-modal.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/procurement/components/po-stock-move-modal.component.ts) hiển thị chi tiết phiếu kho nhập hàng của đơn PO kèm các dòng linh kiện và sê-ri đối soát.
- [ ] Tích hợp nút xem chi tiết phiếu kho vào khối thông tin tiếp nhận hàng trong trang [admin-purchase-order-detail-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/procurement/admin-purchase-order-detail-page.component.ts).
- [ ] Kiểm thử tự động `npm run check:fe` và `npm run check:be` đạt exit code 0.

## Acceptance Criteria

- Criterion 1: Khi quản trị viên xem chi tiết đơn bán hàng, nhấp nút "Phiếu Kho" sẽ hiển thị ngay modal liệt kê đầy đủ các phiếu kho liên kết, trạng thái từng phiếu và bảng chi tiết từng dòng linh kiện kèm số lượng.
- Criterion 2: Khi xem đơn mua hàng PO đã nhập kho, người dùng nhấp xem phiếu nhập sẽ thấy modal thông tin phiếu kho cùng các dòng sản phẩm thực nhận và mã sê-ri tương ứng.
- Criterion 3: Giao diện modal hỗ trợ đóng nhanh bằng phím Escape, click backdrop hoặc nút đóng, hiển thị trạng thái tải và dữ liệu trống rõ ràng khi chưa có phiếu kho.

## Verification Commands

- Command 1: `npm run check:fe`
- Command 2: `npm run check:be`

