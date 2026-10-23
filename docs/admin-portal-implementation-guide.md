# Hướng Dẫn Triển Khai Phân Hệ Quản Trị (Admin Portal Implementation Guide)

- Tên dự án: EL-TECH Hardware - Nền tảng thương mại điện tử linh kiện PC và tư vấn lắp ráp PC
- Mã tài liệu: DOC-ADMIN-IMPLEMENTATION-GUIDE-V1
- Trạng thái: Đã đồng bộ với UI Demo, Quyết định khảo sát nghiệp vụ và Mô hình dữ liệu Prisma
- Ngày lập: 2026-10-23
- Tài liệu và mã nguồn tham chiếu:
  - Bản vẽ giao diện mẫu Admin: [ui-templates/admin-portal/index.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/admin-portal/index.html)
  - Danh mục chi tiết màn hình và modal: [docs/admin-portal-screens-and-modals.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/docs/admin-portal-screens-and-modals.md)
  - Tài liệu tổng hợp nghiệp vụ hệ thống: [SUMMARY.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/SUMMARY.md)
  - Mô hình dữ liệu cơ sở dữ liệu: [be/prisma/schema.prisma](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/prisma/schema.prisma)

---

## 1. Kiến Trúc Điều Hướng Giao Diện Và Ranh Giới Phạm Vi MVP

### 1.1. Phân định Menu Điều Hướng Thực Tế và Tab Mẫu Trên UI Demo

Trong bản demo giao diện tĩnh ([index.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/admin-portal/index.html)), các màn hình chi tiết được liệt kê trên thanh Sidebar để phục vụ mục đích duyệt và kiểm tra mẫu trực quan. Tuy nhiên, trong kiến trúc triển khai thực tế trên Angular, hệ thống áp dụng nguyên tắc phân tách Master-Detail nghiêm ngặt:

- Thanh điều hướng chính (Sidebar Navigation): Chỉ chứa các trang danh mục cấp 1 (Master / List Pages) có thể truy cập trực tiếp từ cấp cao nhất:
  - Bảng điều khiển vận hành (/admin/dashboard)
  - Danh mục ngành hàng (/admin/catalog/categories)
  - Thương hiệu (/admin/catalog/brands)
  - Mẫu sản phẩm (/admin/catalog/templates)
  - Biến thể SKU (/admin/catalog/variants)
  - Bộ máy tính dựng sẵn (/admin/catalog/pc-bundles)
  - Danh sách đơn hàng (/admin/orders)
  - Tồn kho chi nhánh (/admin/inventory/balances)
  - Sổ kho bất biến (/admin/inventory/ledger)
  - Tra cứu sê-ri (/admin/inventory/serials)
  - Điều chuyển kho (/admin/inventory/transfers)
  - Danh bạ nhà cung cấp (/admin/procurement/suppliers)
  - Đơn mua hàng PO (/admin/procurement/purchase-orders)
  - Chính sách khuyến mãi & phí ship (/admin/promotions)
  - Khách hàng (/admin/customers)
  - Kiểm duyệt đánh giá (/admin/reviews)
  - Chi nhánh & khu vực (/admin/settings/branches)
  - Hộp thư outbox (/admin/settings/notification-outbox)

- Các trang chi tiết (Detail Pages): Tuyệt đối không xuất hiện trên thanh Sidebar menu. Chúng chỉ được kích hoạt theo ngữ cảnh qua các sự kiện:
  - Nhấp chuột vào dòng dữ liệu (Row click) hoặc nút "Xem chi tiết" / "Chỉnh sửa" trên bảng danh sách.
  - Nhấp nút "Tạo mới" (Ví dụ: Từ danh sách mẫu sản phẩm chuyển sang form tạo mới tại `/admin/catalog/templates/new`).
  - Hỗ trợ Dynamic Route Parameters:
    - Chi tiết mẫu sản phẩm: `/admin/catalog/templates/:id` (SCR-06)
    - Chi tiết đơn hàng: `/admin/orders/:id` (SCR-10)
    - Chi tiết đơn mua hàng PO: `/admin/procurement/purchase-orders/:id` (SCR-21)
    - Hồ sơ chi tiết khách hàng: `/admin/customers/:id` (SCR-27)
  - Sử dụng thanh Breadcrumbs phía trên đầu màn hình để hỗ trợ người dùng quay ngược lại trang danh sách cha.

### 1.2. Các Trang Được Giảm Tải Cho Giai Đoạn MVP

Để tối ưu hóa nguồn lực và tập trung vào các luồng vận hành cốt lõi, các trang sau được đưa ra khỏi phạm vi triển khai trực tiếp của MVP:

- Nhóm Báo cáo BI Chuyên Sâu:
  - Báo Cáo Doanh Thu & Lợi Nhuận (BI-01 / report-revenue.html)
  - Phân Tích Sản Phẩm & Thương Hiệu (BI-02 / report-products.html)
  - Báo Cáo Tồn Kho & Luân Chuyển (BI-03 / report-inventory.html)
  Giai đoạn MVP chỉ hiển thị các khối số liệu thống kê khẩn cấp và việc cần xử lý ngay tại Trung Tâm Vận Hành (SCR-02 / dashboard).

- Nhóm Thanh Toán & Đối Soát Chuyên Biệt:
  - Tra Cứu Thanh Toán Toàn Hệ Thống (SCR-11 / payments.html)
  - Hàng Đợi Lệch QR Cần Xử Lý Trong 24h (SCR-12 / payment-review-queue.html)
  - Quản Lý Hoàn Tiền Thủ Công (SCR-13 / refunds.html)
  - Nhật Ký Thu Tiền Mặt COD (SCR-14 / cod-collections.html)
  Toàn bộ thao tác kiểm tra trạng thái thanh toán, xác nhận thu tiền mặt COD và ghi nhận lệnh hoàn tiền chuyển khoản thủ công được tích hợp trực tiếp ngay trong màn hình Chi Tiết Đơn Hàng (SCR-10 / order-detail) thay vì tách thành các trang riêng biệt.

---

## 2. Các Hành Động Cốt Lõi Và Các Model Cơ Sở Dữ Liệu Bị Tác Động

Mọi nghiệp vụ trong phân hệ quản lý đều tuân thủ các nguyên tắc bất biến: Sổ kho bất biến (Immutable Stock Ledger), Quyền quyết định thuộc Backend, Không bán âm kho và Xuất kho từ một chi nhánh duy nhất (Single-origin Invariant).

### 2.1. Hành Động 1: Điều Chuyển Kho Nội Bộ Giữa Các Chi Nhánh (Internal Stock Transfer)

Quy trình chuẩn hóa 3 bước: `REQUESTED` -> `IN_TRANSIT` -> `RECEIVED` (INV-003, TRF-001 đến TRF-006).

- Bước 1 - Lập phiếu yêu cầu điều chuyển (Draft / Requested):
  - Model StockMove: Tạo 1 bản ghi mới với `moveType = INTERNAL_TRANSFER`, `status = DRAFT` hoặc `RESERVED`, `sourceBranchId` (kho gửi), `destinationBranchId` (kho nhận), sinh mã `code` duy nhất.
  - Model StockMoveLine: Tạo các dòng chi tiết linh kiện cần chuyển kèm `skuId` và số lượng `quantity`.

- Bước 2 - Xác nhận xuất kho chuyển đi tại chi nhánh nguồn (In Transit):
  - Model StockMove: Cập nhật `status = IN_TRANSIT`, `dispatchedAt = now()`, `dispatchedById = adminId`.
  - Model StockQuant (tại chi nhánh nguồn): Giảm tồn thực tế `onHand = onHand - quantity`, tăng `version = version + 1`. Điều kiện ràng buộc: `onHand - reserved >= quantity`, tuyệt đối không cho phép âm kho.
  - Model StockLedgerEntry: Ghi 1 dòng nhật ký sổ kho bất biến với `entryType = TRANSFER_OUT`, `deltaOnHand = -quantity`, ghi nhận `onHandAfter`, liên kết tới `stockQuantId` và `stockMoveLineId`.
  - Model SerialUnit (đối với linh kiện có quản lý serial): Cập nhật `status = IN_TRANSIT`, tạm thời gán `currentBranchId = null`.
  - Model SerialMovement: Tạo bản ghi lưu vết hành trình với `resultingStatus = IN_TRANSIT`, `fromBranchId = sourceBranchId`, `toBranchId = destinationBranchId`.

- Bước 3 - Xác nhận nhập kho tại chi nhánh đích (Received / Validated):
  - Điều kiện: Chi nhánh đích kiểm đếm đủ 100% số lượng thực tế nhận được (không hỗ trợ nhận hàng từng phần).
  - Model StockMove: Cập nhật `status = VALIDATED`, `validatedAt = now()`, `validatedById = adminId`.
  - Model StockQuant (tại chi nhánh đích):
    - Tăng tồn thực tế: `onHand = onHand + quantity`.
    - Tính lại giá vốn bình quân gia quyền (`weightedAverageCost`) hòa nhập lô hàng điều chuyển vào kho đích.
    - Tăng `version = version + 1`.
  - Model StockLedgerEntry: Ghi dòng nhật ký sổ kho với `entryType = TRANSFER_IN`, `deltaOnHand = +quantity`, ghi nhận `onHandAfter`.
  - Model SerialUnit: Cập nhật `status = AVAILABLE`, gán `currentBranchId = destinationBranchId`.
  - Model SerialMovement: Ghi nhận `resultingStatus = AVAILABLE`, `toBranchId = destinationBranchId`.

### 2.2. Hành Động 2: Mua Hàng Và Nhập Kho Từ Nhà Cung Cấp (Purchase Order Inbound)

Tuân thủ nguyên tắc nhận hàng nguyên vẹn một lần duy nhất 100% (Exact Receipt Invariant, PUR-001 đến PUR-008). Nếu nhà cung cấp giao thiếu, hủy PO cũ và tạo PO mới theo số lượng thực nhận.

- Lập và phê duyệt PO:
  - Model PurchaseOrder: Tạo bản ghi PO ở trạng thái `DRAFT`, sau khi chốt giá chuyển sang `CONFIRMED`, lưu `supplierId`, `receivingBranchId`, `confirmedAt`.
  - Model PurchaseOrderLine: Chi tiết danh sách `skuId`, `quantity`, đơn giá thỏa thuận `agreedUnitCost`.

- Nhập kho thực tế 100%:
  - Model PurchaseOrder: Cập nhật `status = RECEIVED` rồi chuyển sang `CLOSED`, lưu `receivedAt`, `closedAt`.
  - Model StockMove: Tạo chứng từ nhập kho với `moveType = PURCHASE_RECEIPT`, `status = VALIDATED`, `destinationBranchId = receivingBranchId`, `purchaseOrderId = po.id`, lưu `validatedAt`.
  - Model StockMoveLine: Tạo các dòng chi tiết linh kiện nhập kho với `skuId`, `quantity`, `unitCost = agreedUnitCost`.
  - Model StockQuant (tại chi nhánh tiếp nhận):
    - Tăng tồn thực tế: `onHand = onHand + quantity`.
    - Tính lại giá vốn bình quân gia quyền: `weightedAverageCost = ((onHandCu * costCu) + (quantityMoi * agreedUnitCost)) / (onHandCu + quantityMoi)`.
  - Model StockLedgerEntry: Ghi nhận 1 dòng với `entryType = PURCHASE_RECEIPT`, `deltaOnHand = +quantity`, lưu `onHandAfter`.
  - Model SerialUnit: Khởi tạo các mã sê-ri mới được nạp vào kho với `status = AVAILABLE`, `currentBranchId = receivingBranchId`, `originStockMoveLineId = stockMoveLine.id`.
  - Model SerialMovement: Ghi nhận nguồn gốc nhập kho ban đầu của từng sê-ri.

### 2.3. Hành Động 3: Xử Lý Đơn Hàng & Vận Hành Xuất Kho (Order Fulfillment Lifecycle)

Vòng đời đơn hàng gồm 13 trạng thái chuẩn (ORD-001 đến ORD-026). Trừ tồn kho thực tế đúng thời điểm nghiệp vụ.

- Tiếp nhận và Khóa giữ hàng (Confirmed):
  - Chuyển trạng thái: `PENDING_COD_CONFIRMATION` hoặc `PENDING_PAYMENT` -> `CONFIRMED`.
  - Model Order: Cập nhật `status = CONFIRMED`, `confirmedAt = now()`.
  - Model OrderStatusHistory: Ghi nhận lịch sử chuyển trạng thái kèm tác nhân (`ADMIN` hoặc `SYSTEM`).
  - Model StockMove: Tạo chứng từ giữ chỗ với `moveType = ORDER_ISSUE`, `status = RESERVED`, `sourceBranchId = fulfillmentBranchId`, `orderId = order.id`.
  - Model StockMoveLine: Tạo các dòng SKU giữ hàng theo chi tiết đơn hàng.
  - Model StockQuant: Tăng tồn tạm giữ `reserved = reserved + quantity`. Tồn khả dụng `available = (onHand - reserved - quarantineDamaged)` giảm tương ứng.
  - Model StockLedgerEntry: Ghi nhận dòng kiểm toán `entryType = RESERVE`, `deltaReserved = +quantity`.

- Soạn linh kiện và Lắp ráp máy tính (Preparing -> Assembling):
  - Chuyển trạng thái: `CONFIRMED` -> `PREPARING_COMPONENTS` -> `ASSEMBLING` (đối với đơn có dịch vụ lắp ráp máy tính).
  - Quy tắc trừ kho: Đối với đơn PC có lắp ráp, trừ Tồn kho thực tế `onHand` ngay tại thời điểm chuyển sang `ASSEMBLING` vì linh kiện đã bị bóc seal bao bì để lắp vào khung máy.
  - Model Order: Cập nhật `status = ASSEMBLING`. Khóa vĩnh viễn quyền tự hủy đơn của khách hàng.
  - Model StockQuant: Trừ tồn thực tế `onHand = onHand - quantity`, đồng thời giải phóng giữ chỗ `reserved = reserved - quantity`.
  - Model StockLedgerEntry: Ghi nhận `entryType = ORDER_ISSUE`, `deltaOnHand = -quantity`, `deltaReserved = -quantity`.
  - Model SerialUnit: Gán các sê-ri đã lắp vào đơn hàng, chuyển `status = ISSUED`.
  - Model StockMove: Cập nhật `status = VALIDATED`, `validatedAt = now()`.

- Bàn giao giao hàng hoặc Chờ khách nhận tại showroom:
  - Đơn giao tận nơi: Chuyển sang `SHIPPING`. Đối với đơn hàng linh kiện lẻ không qua lắp ráp, bước bàn giao này mới thực hiện trừ `onHand` và `reserved` tương tự như trên.
  - Đơn nhận tại showroom: Chuyển sang `READY_FOR_PICKUP`. Tồn kho vẫn được bảo lưu ở mức `reserved` trong suốt thời hạn tối đa 14 ngày.
  - Model Order và OrderStatusHistory: Cập nhật trạng thái tương ứng.

- Xử lý sự cố giao thất bại và Chuyển hoàn về kho (Returning -> Returned):
  - Nghiệp vụ: Giao thất bại quá 2 lần hoặc khách từ chối nhận hàng -> `RETURNING` -> Kiện hàng chở quay về chi nhánh -> `RETURNED_TO_BRANCH`.
  - Phục hồi kho vật lý: Khi kiện hàng về đến chi nhánh và nhân viên kiểm đếm đủ 100% nguyên vẹn:
    - Model Order: Cập nhật `status = RETURNED_TO_BRANCH`.
    - Model StockMove: Tạo chứng từ nhập hoàn `moveType = ORDER_REVERSAL`, `reversalOfMoveId = stockMoveCu.id`, `status = VALIDATED`.
    - Model StockQuant: Phục hồi lại tồn thực tế `onHand = onHand + quantity`.
    - Model StockLedgerEntry: Ghi nhận `entryType = REVERSAL`, `deltaOnHand = +quantity`.
    - Model SerialUnit: Khôi phục `status = AVAILABLE`.
    - Sau khi hoàn kho xong, Admin thực hiện bấm Hủy đơn (`CANCELLED`). Nếu là đơn PC tự ráp chọn COD thì tiền đặt cọc bị tịch thu (`Payment.depositDisposition = FORFEITED`), phần tiền hàng trả trước (nếu có) được nhân viên chuyển khoản trả lại thủ công qua app ngân hàng bên ngoài và ghi nhận vào model `Refund`.

- Hoàn tất đơn hàng (Completed):
  - Điều kiện: Khách đã nhận hàng và cửa hàng thu đủ 100% tiền hàng.
  - Model Order: Cập nhật `status = COMPLETED`, `completedAt = now()`.
  - Model Payment: Cập nhật `state = PAID`, `codRemaining = 0`, `totalReceived = totalReceived + codRemaining`.
  - Model CodCollection: Tạo bản ghi nhật ký thu tiền mặt với `amount`, `actorId = adminId`.
  - Kích hoạt quyền gửi đánh giá (Review) cho khách hàng đối với từng dòng linh kiện trong đơn hàng.

### 2.4. Hành Động 4: Quản Lý Cấu Trúc Sản Phẩm, Thông Số Động Và Giá Bán

- Quản lý Danh mục (Categories):
  - Model Category: Quản lý cây danh mục phân cấp cha/con và cấu hình JSONB động `specificationSchema` (quy định các trường thông số kỹ thuật bắt buộc theo danh mục linh kiện).

- Quản lý Thương hiệu (Brands):
  - Model Brand: Quản lý danh sách hãng sản xuất phần cứng.

- Quản lý Mẫu sản phẩm (Product Templates):
  - Model ProductTemplate: Lưu tên mẫu, thương hiệu, danh mục, model, chipsetFamily, mô tả, media URLs và thông số kỹ thuật chung `commonSpec` dạng JSONB được render động theo schema của danh mục.

- Quản lý Biến thể SKU (Product Variants):
  - Model ProductVariant: Cấu hình mã SKU duy nhất, mã vạch barcode, giá niêm yết bán lẻ `sellingPrice`, cờ bắt buộc serial `serialRequired` và trạng thái vòng đời `lifecycleState`.

- Quản lý Bộ PC Dựng Sẵn (PC Prebuilt Bundles):
  - Model PcBundle và PcBundleItem: Quản lý danh sách linh kiện ảo (Virtual BOM). Không tạo mã tồn kho máy thành phẩm độc lập.

---

## 3. Thứ Tự Ưu Tiên Triển Khai Phân Hệ Admin (Phased Implementation Roadmap)

Lộ trình triển khai được sắp xếp nghiêm ngặt theo quan hệ phụ thuộc dữ liệu (Data Dependency):

```text
Giai đoạn 1: Dữ liệu nền tảng & Cấu trúc danh mục (Master Data & Catalog)
     ↓
Giai đoạn 2: Quản lý Mua hàng & Khởi tạo Tồn kho ban đầu (Procurement & Inbound)
     ↓
Giai đoạn 3: Quản trị Tồn kho đa chi nhánh & Điều chuyển nội bộ (Inventory & Transfers)
     ↓
Giai đoạn 4: Vận hành Đơn hàng, Xuất kho & Thanh toán tích hợp (Orders & Fulfillment)
     ↓
Giai đoạn 5: Chính sách Khuyến mãi, Tài khoản & Bảng điều khiển vận hành (Policies & Dashboard)
     ↓
Giai đoạn 6: Mở rộng sau MVP (Báo cáo BI & Phân hệ đối soát chuyên biệt)
```

### Giai Đoạn 1: Dữ Liệu Nền Tảng & Cấu Trúc Danh Mục (Master Data & Catalog)
- Mục tiêu: Xây dựng nền tảng danh mục hàng hóa và chi nhánh để làm cơ sở cho mọi giao dịch nhập - xuất - bán sau này.
- Danh sách màn hình triển khai:
  - SCR-29: Chi Nhánh & Khu Vực Phục Vụ (`/admin/settings/branches`)
  - SCR-03: Ngành Hàng & Thuộc Tính Động (`/admin/catalog/categories`)
  - SCR-04: Thương Hiệu & Hãng Sản Xuất (`/admin/catalog/brands`)
  - SCR-05: Danh Sách Mẫu Sản Phẩm (`/admin/catalog/templates`)
  - SCR-06: Chi Tiết Mẫu Sản Phẩm & Biến Thể (`/admin/catalog/templates/new` và `/:id`) - Truy cập qua nút Tạo mới hoặc click dòng từ SCR-05.
  - SCR-07: Biến Thể SKU Toàn Hệ Thống (`/admin/catalog/variants`)
  - SCR-08: Bộ Máy Tính Dựng Sẵn (`/admin/catalog/pc-bundles`)

### Giai Đoạn 2: Mua Hàng & Khởi Tạo Tồn Kho (Procurement & Inbound)
- Mục tiêu: Nạp hàng hóa vật lý và giá vốn thực tế vào kho các chi nhánh trước khi mở bán hoặc điều chuyển.
- Danh sách màn hình triển khai:
  - SCR-19: Danh Bạ Nhà Cung Cấp (`/admin/procurement/suppliers`)
  - SCR-20: Đơn Mua Hàng PO (`/admin/procurement/purchase-orders`)
  - SCR-21: Chi Tiết & Nhập Kho Đơn Mua PO (`/admin/procurement/purchase-orders/:id`) - Truy cập qua click từng PO từ SCR-20.

### Giai Đoạn 3: Quản Trị Tồn Kho Đa Chi Nhánh & Điều Chuyển Nội Bộ (Inventory & Transfers)
- Mục tiêu: Giám sát chính xác 4 trạng thái tồn kho (Thực tế, Tạm giữ, Cách ly, Khả dụng) và luân chuyển hàng giữa các showroom.
- Danh sách màn hình triển khai:
  - SCR-15: Tồn Kho Chi Nhánh (`/admin/inventory/balances`)
  - SCR-17: Tra Cứu Sê-ri & Lịch Sử Bảo Hành (`/admin/inventory/serials`)
  - SCR-16: Sổ Kho Bất Biến & Biến Động Tồn (`/admin/inventory/ledger`)
  - SCR-18: Điều Chuyển Kho Nội Bộ (`/admin/inventory/transfers`)

### Giai Đoạn 4: Vận Hành Đơn Hàng, Xuất Kho & Thanh Toán Tích Hợp (Orders & Fulfillment)
- Mục tiêu: Xử lý toàn bộ tiến trình bán lẻ từ khi khách đặt đơn, chuẩn bị hàng, lắp ráp PC, giao hàng đến hoàn tất hoặc xử lý chuyển hoàn.
- Danh sách màn hình triển khai:
  - SCR-09: Danh Sách Đơn Hàng (`/admin/orders`)
  - SCR-10: Chi Tiết & Vận Hành Đơn Hàng (`/admin/orders/:id`) - Truy cập qua click từng đơn hàng từ SCR-09. Màn hình này tích hợp luôn các thao tác:
    - Điều khiển các bước chuyển trạng thái vận hành.
    - Đối soát tiền chuyển khoản QR và ghi nhận thu COD.
    - Xử lý hoàn tiền thủ công qua tài khoản ngân hàng.

### Giai Đoạn 5: Chính Sách Khuyến Mãi, Khách Hàng & Bảng Điều Khiển (Policies, Customers & Dashboard)
- Mục tiêu: Hoàn thiện công cụ xúc tiến bán hàng, quản lý hồ sơ người mua và bảng cảnh báo việc cần làm khẩn cấp cho Quản trị viên.
- Danh sách màn hình triển khai:
  - SCR-23 / SCR-24 / SCR-25: Chính Sách Khuyến Mãi, Mã Giảm Giá & Biểu Phí Giao Hàng (`/admin/promotions`)
  - SCR-26: Danh Sách Khách Hàng (`/admin/customers`) và SCR-27: Chi Tiết Khách Hàng (`/admin/customers/:id`)
  - SCR-28: Kiểm Duyệt Đánh Giá Khách Hàng (`/admin/reviews`)
  - SCR-02: Bảng Điều Khiển Vận Hành (`/admin/dashboard`)
  - SCR-30: Nhật Ký Hộp Thư Outbox (`/admin/settings/notification-outbox`)

### Giai Đoạn 6: Mở Rộng Sau MVP (Post-MVP / Tạm thời giảm tải)
- Triển khai phân hệ Báo cáo phân tích chuyên sâu: Báo cáo doanh thu BI-01, Phân tích sản phẩm BI-02, Báo cáo tồn kho BI-03.
- Tách riêng phân hệ Thanh toán & Đối soát độc lập: SCR-11 (Payments), SCR-12 (Payment Review Queue), SCR-13 (Refunds), SCR-14 (COD Collections) khi phát sinh bộ phận kế toán riêng biệt.
