# Danh Mục Chi Tiết Các Màn Hình Và Hộp Thoại Phân Hệ Quản Trị (Admin Portal)

- Tên dự án: EL-TECH Hardware - Nền tảng thương mại điện tử linh kiện PC và tư vấn lắp ráp PC
- Mã tài liệu: DOC-ADMIN-SCREENS-AND-MODALS-V1
- Trạng thái: Đã đồng bộ với quyết định khảo sát nghiệp vụ và quy tắc nghiệp vụ dự án
- Ngày lập: 2026-10-22
- Tài liệu quy tắc nghiệp vụ tham chiếu:
  - Quy tắc nghiệp vụ lõi: [business-logic/SKILL.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/.agents/skills/business-logic/SKILL.md)
  - Quyết định nghiệp vụ đã duyệt: [QA-el-tech-business-logic.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/QA/QA-el-tech-business-logic.md)
  - Mô hình dữ liệu cơ sở dữ liệu: [schema.prisma](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/prisma/schema.prisma)
  - Chuẩn tương tác giao diện: [interaction-patterns-v1.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/docs/frontend-standards/interaction-patterns-v1.md)
  - Hệ thống thiết kế chuẩn: [design-system/el-tech/MASTER.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/design-system/el-tech/MASTER.md)

---

## 1. Bối Cảnh, Mục Tiêu Và Phạm Vi Quản Trị Trong Giai Đoạn MVP

### Mục tiêu vận hành
Phân hệ quản trị cung cấp cho người vận hành góc nhìn tập trung, tức thời về hành động cần xử lý tiếp theo, chi nhánh chịu trách nhiệm và tác động tồn kho của từng hành động (theo quyết định Q03 và quy tắc CORE-001 tại [core-scope.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/.agents/skills/business-logic/features/core-scope.md)).

### Phân quyền người dùng
- Hệ thống MVP áp dụng duy nhất một vai trò quản trị `Admin` toàn hệ thống (không có tài khoản nhân viên Staff phân quyền theo chi nhánh, không có phân quyền RBAC đa cấp, theo quyết định Q66/FQ18 và CUS-018).
- Tài khoản Admin có quyền truy cập toàn bộ dữ liệu danh mục, sản phẩm, giá bán, khuyến mãi, đơn hàng, kho hàng của mọi chi nhánh, đối soát thanh toán và cài đặt hệ thống.

### Các phạm vi loại trừ (Non-goals) trong MVP
Các phân hệ sau không thuộc phạm vi triển khai của giai đoạn hiện tại:
- Không có phần mềm bán hàng tại quầy (POS).
- Không có phân hệ kế toán công nợ và sổ cái tài chính.
- Không có chương trình khách hàng thân thiết (Loyalty).
- Không tích hợp sàn thương mại điện tử hoặc dropshipping.
- Không tích hợp API tự động với các đơn vị vận chuyển (trạng thái giao hàng do Admin cập nhật thủ công).
- Không có công cụ tối ưu hóa lộ trình giao hàng hay bản đồ định vị.
- Không có quy trình đổi trả hàng từ phía khách hàng (Customer Return/RMA).
- Không có phiên kiểm kê kho vật lý định kỳ (Stock counting sessions).

---

## 2. Cấu Trúc Điều Hướng URL Phân Hệ Quản Trị

Tất cả các trang thuộc phân hệ Admin được định tuyến dưới tiền tố `/admin` và được bảo vệ bởi bộ lọc xác thực `role === 'ADMIN'`:

```text
/admin
  ├── /dashboard                          (Bảng điều khiển vận hành & danh sách cảnh báo khẩn)
  ├── /catalog
  │     ├── /categories                   (Quản lý danh mục & schema thông số kỹ thuật động)
  │     ├── /brands                       (Quản lý thương hiệu/hãng sản xuất)
  │     ├── /templates                    (Quản lý mẫu sản phẩm Product Template)
  │     ├── /templates/new                (Tạo mới mẫu sản phẩm)
  │     ├── /templates/:id                (Chi tiết và cập nhật mẫu sản phẩm)
  │     ├── /variants                     (Danh mục biến thể SKU toàn hệ thống)
  │     └── /pc-bundles                   (Quản lý cấu hình bộ PC dựng sẵn - Virtual BOM)
  ├── /orders
  │     ├── (danh sách đơn hàng)          (Bộ lọc đa chiều và danh sách đơn hàng)
  │     └── /:id                          (Chi tiết đơn, tiến trình vận hành, chứng từ kho & phụ lục)
  ├── /payments
  │     ├── (danh sách thanh toán)        (Tra cứu trạng thái thu tiền và mã tham chiếu)
  │     ├── /review-queue                 (Hàng đợi đối soát giao dịch QR lệch / nghi vấn)
  │     ├── /refunds                      (Danh sách và xử lý hoàn tiền thủ công)
  │     └── /cod-collections              (Nhật ký thu tiền mặt COD khi giao nhận)
  ├── /inventory
  │     ├── /balances                     (Bảng tồn kho tổng thể và theo từng chi nhánh)
  │     ├── /ledger                       (Sổ kho bất biến ghi nhận biến động tăng/giảm tồn)
  │     ├── /serials                      (Quản lý định danh số Serial linh kiện)
  │     └── /transfers                    (Quản lý điều chuyển hàng giữa các chi nhánh)
  ├── /procurement
  │     ├── /suppliers                    (Quản lý danh bạ nhà cung cấp)
  │     ├── /purchase-orders              (Quản lý đơn đặt mua hàng PO)
  │     ├── /purchase-orders/new          (Tạo đơn mua hàng dự thảo)
  │     ├── /purchase-orders/:id          (Chi tiết PO và giao diện đối soát nhập kho)
  │     └── /supplier-returns             (Phiếu xuất trả hàng cho nhà cung cấp)
  ├── /promotions
  │     ├── /product-promotions           (Chương trình giảm giá tự động theo sản phẩm/danh mục)
  │     ├── /coupons                      (Quản lý mã giảm giá cấp đơn hàng và hạn mức quota)
  │     └── /shipping-fee                 (Cấu hình biểu phí giao hàng và ngưỡng freeship)
  ├── /customers
  │     ├── (danh sách khách hàng)        (Tra cứu khách hàng, phân biệt User và Guest Profile)
  │     └── /:id                          (Hồ sơ chi tiết, lịch sử mua hàng và liên lạc)
  ├── /reviews                            (Kiểm duyệt đánh giá sản phẩm từ người mua đã hoàn thành đơn)
  └── /settings
        ├── /branches                     (Quản lý chi nhánh và khu vực phục vụ giao hàng)
        └── /notification-outbox          (Nhật ký phát thông báo hệ thống In-app/Email/SMS)
```

---

## 3. Danh Mục Chi Tiết Các Màn Hình Chính (Routed Pages - SURFACE-001)

### Phân hệ 1: Khung Ứng Dụng Và Bảng Điều Khiển

#### SCR-01: Màn hình Đăng nhập Quản trị
- Tuyến đường: `/admin/login`
- Phân loại: Routed Page (SURFACE-001)
- Mục đích: Xác thực tài khoản Admin vào trang quản trị qua Better-Auth.
- Dữ liệu hiển thị: Form đăng nhập gồm trường email, mật khẩu, cờ ghi nhớ phiên đăng nhập.
- Hành động: Gửi thông tin xác thực, điều hướng đến `/admin/dashboard` khi thành công, hiển thị lỗi khi sai thông tin hoặc tài khoản không có quyền Admin (`role !== 'ADMIN'`).

#### SCR-02: Bảng Điều khiển Vận hành (Operational Dashboard)
- Tuyến đường: `/admin/dashboard`
- Phân loại: Routed Page (SURFACE-001)
- Mục đích: Trung tâm theo dõi các cảnh báo và việc cần làm ngay của Admin (theo Q03, FQ69).
- Dữ liệu hiển thị:
  - Khối Hàng đợi khẩn cấp: Số đơn COD chờ xác nhận, số đơn QR cần đối soát trong 24 giờ (`PAYMENT_REVIEW`), số đơn nhận tại shop quá hạn 14 ngày (`PICKUP_EXPIRED`), số đơn giao hàng thất bại cần xử lý hẹn giao lại hoặc hoàn kho.
  - Khối Tóm tắt trạng thái đơn hàng theo chi nhánh: Phân bổ số lượng đơn theo các bước `CONFIRMED`, `PREPARING_COMPONENTS`, `ASSEMBLING`, `READY_FOR_PICKUP`, `SHIPPING`.
  - Khối Cảnh báo tồn kho: Danh sách các SKU có số lượng khả dụng (`available`) bằng 0 hoặc dưới ngưỡng an toàn tại từng chi nhánh.
- Hành động: Bộ lọc chọn chi nhánh làm việc (hoặc xem toàn hệ thống), các nút bấm liên kết nhanh trực tiếp vào từng danh sách tương ứng.

---

### Phân hệ 2: Quản Lý Danh Mục, Sản Phẩm Và PC Dựng Sẵn

#### SCR-03: Màn hình Danh mục Ngành hàng (Categories)
- Tuyến đường: `/admin/catalog/categories`
- Phân loại: Routed Page (SURFACE-001)
- Mục đích: Quản lý cây phân cấp danh mục linh kiện (Mainboard, CPU, GPU, RAM,...) và cấu trúc thông số kỹ thuật động (Dynamic Specification Schema theo CAT-001, CAT-006).
- Dữ liệu hiển thị: Bảng danh mục dạng cây cha/con, mã định danh slug, phiên bản schema hiện tại (`specificationSchemaVersion`), số lượng mẫu sản phẩm liên kết, trạng thái kích hoạt.
- Hành động: Mở Modal thêm/sửa danh mục, mở Sheet cấu hình schema thông số kỹ thuật, bật/tắt trạng thái kích hoạt danh mục.

#### SCR-04: Màn hình Thương hiệu (Brands)
- Tuyến đường: `/admin/catalog/brands`
- Phân loại: Routed Page (SURFACE-001)
- Mục đích: Quản lý danh sách các nhà sản xuất linh kiện phần cứng (ASUS, MSI, Gigabyte, Intel, AMD,...) theo CAT-004.
- Dữ liệu hiển thị: Bảng thương hiệu, mã slug, mô tả tóm tắt, số lượng sản phẩm liên kết, trạng thái kích hoạt.
- Hành động: Mở Modal thêm/sửa thương hiệu, kích hoạt hoặc tạm dừng hoạt động thương hiệu.

#### SCR-05: Màn hình Danh sách Mẫu Sản phẩm (Product Templates)
- Tuyến đường: `/admin/catalog/templates`
- Phân loại: Routed Page (SURFACE-001)
- Mục đích: Quản lý các mẫu sản phẩm thương mại độc lập của từng hãng theo mô hình Odoo Product Template (CAT-002, FQ03).
- Dữ liệu hiển thị: Bảng mẫu sản phẩm, hình ảnh đại diện, tên mẫu, thương hiệu, danh mục, model, dòng vi xử lý (chipsetFamily), số lượng biến thể SKU trực thuộc, trạng thái vòng đời (`DRAFT`, `ACTIVE`, `PAUSED`, `DISCONTINUED`).
- Bộ lọc và tìm kiếm: Lọc theo danh mục, lọc theo thương hiệu, lọc theo trạng thái vòng đời, tìm kiếm theo tên hoặc mã model.
- Hành động: Điều hướng đến trang tạo mới mẫu sản phẩm, bấm vào dòng để chuyển đến trang chi tiết, nút thao tác nhanh đổi trạng thái vòng đời.

#### SCR-06: Màn hình Chi tiết và Chỉnh sửa Mẫu Sản phẩm (Template Detail & Edit)
- Tuyến đường: `/admin/catalog/templates/new` và `/admin/catalog/templates/:id`
- Phân loại: Routed Page (SURFACE-001)
- Mục đích: Tạo mới hoặc cấu hình chi tiết thông tin mẫu sản phẩm, thông số kỹ thuật động và các biến thể SKU đi kèm (CAT-007, CAT-010).
- Dữ liệu hiển thị:
  - Khối Thông tin chung: Tên mẫu, slug, thương hiệu, danh mục, model, dòng chipset, mô tả chi tiết, danh sách URL hình ảnh media.
  - Khối Thông số kỹ thuật chung (`commonSpec`): Tự động kết xuất các trường nhập liệu tương ứng dựa trên `specificationSchema` của danh mục đã chọn (ví dụ: kích thước form factor, socket, số khe cắm RAM).
  - Khối Danh sách Biến thể SKU liên kết: Bảng các SKU trực thuộc mẫu sản phẩm, mã SKU duy nhất, mã vạch barcode, nhãn biến thể, giá bán lẻ niêm yết (VND), quy định bắt buộc serial (`serialRequired`), số lượng tồn kho khả dụng hiện tại.
- Hành động: Lưu thông tin mẫu sản phẩm, mở Modal thêm biến thể SKU, mở Modal chuyển trạng thái vòng đời của mẫu sản phẩm hoặc từng biến thể SKU.

#### SCR-07: Màn hình Danh mục Biến thể SKU Toàn hệ thống (Variants & SKUs)
- Tuyến đường: `/admin/catalog/variants`
- Phân loại: Routed Page (SURFACE-001)
- Mục đích: Cho phép nhân viên tra cứu trực tiếp theo từng mã SKU, mã vạch barcode hoặc nhãn biến thể mà không cần duyệt qua cây danh mục (CAT-003, CAT-005).
- Dữ liệu hiển thị: Mã SKU, barcode, tên mẫu sản phẩm cha, nhãn biến thể, giá bán lẻ, trạng thái bắt buộc serial, tổng tồn khả dụng toàn hệ thống, trạng thái vòng đời.
- Hành động: Tìm kiếm nhanh theo máy quét barcode hoặc bàn phím, điều hướng nhanh tới trang mẫu sản phẩm tương ứng.

#### SCR-08: Màn hình Quản lý Bộ PC Dựng Sẵn (PC Prebuilt Offers)
- Tuyến đường: `/admin/catalog/pc-bundles`
- Phân loại: Routed Page (SURFACE-001)
- Mục đích: Quản lý danh mục cấu hình máy tính lắp sẵn đóng vai trò là BOM ảo linh kiện (PCB-001, PCB-004, FQ05).
- Dữ liệu hiển thị: Bảng cấu hình bộ PC dựng sẵn, tên bộ máy, slug, giá dự kiến (tổng giá linh kiện cấu thành trừ khuyến mại bundle), số lượng linh kiện cấu thành, trạng thái kích hoạt.
- Hành động: Mở Sheet tạo mới hoặc chỉnh sửa BOM linh kiện ảo của bộ PC dựng sẵn.

---

### Phân hệ 3: Quản Lý Đơn Hàng Và Vận Hành Giao Hàng

#### SCR-09: Màn hình Danh sách Đơn hàng (Order Management List)
- Tuyến đường: `/admin/orders`
- Phân loại: Routed Page (SURFACE-001)
- Mục đích: Quản lý toàn bộ danh sách đơn hàng và trạng thái xử lý trên toàn hệ thống (ORD-001, ORD-003).
- Dữ liệu hiển thị:
  - Bộ lọc trạng thái: Các tab trạng thái (`Tất cả`, `Chờ xác nhận COD`, `Đã xác nhận/Giữ hàng`, `Đang soạn linh kiện`, `Đang lắp ráp`, `Sẵn sàng lấy hàng`, `Đang giao hàng`, `Giao thất bại`, `Đang chuyển hoàn`, `Đã hoàn về kho`, `Hoàn tất`, `Tạm giữ ngoại lệ ON_HOLD`, `Đã hủy`).
  - Thanh lọc chi nhánh xuất kho, phương thức nhận hàng (Nhận tại shop / Giao tận nơi), phương thức thanh toán (QR / COD), khoảng ngày tạo đơn.
  - Ô tìm kiếm: Mã đơn hàng, số điện thoại, email, họ tên người nhận.
  - Bảng dữ liệu: Mã đơn, thời gian gửi, tên người nhận, chi nhánh xử lý, hình thức nhận hàng, hình thức thanh toán, tổng tiền đơn hàng, trạng thái hiện tại, nút xem chi tiết.

#### SCR-10: Màn hình Chi tiết Đơn hàng (Order Detail & Operations)
- Tuyến đường: `/admin/orders/:id`
- Phân loại: Routed Page (SURFACE-001)
- Mục đích: Trung tâm xử lý thông tin, theo dõi trạng thái, thực hiện chuyển bước vận hành và truy vết kiểm toán của một đơn hàng cụ thể (ORD-002, ORD-003, ORD-004 đến ORD-026).
- Dữ liệu hiển thị:
  - Khối Header: Mã đơn hàng, ngày giờ gửi, trạng thái hiện tại (kèm nhãn lý do nếu `ON_HOLD`), chi nhánh phụ trách, nút hành động chuyển trạng thái tương ứng.
  - Khối Người mua & Người nhận: Hồ sơ khách hàng liên kết, số điện thoại và email đã xác thực, địa chỉ giao hàng chụp lại (snapshot), ghi chú đơn hàng.
  - Khối Dòng hàng & Cấu hình PC: Danh sách sản phẩm mua lẻ hoặc nhóm linh kiện theo từng bộ PC (kèm chỉ báo có dịch vụ lắp ráp hay không), số lượng, đơn giá chụp lại, tiền giảm giá sản phẩm, tiền phân bổ voucher, thành tiền ròng.
  - Khối Tóm tắt Tài chính: Tạm tính, giảm giá sản phẩm, giảm giá voucher, phí giao hàng ban đầu, phụ phí điều chỉnh (amendment), điều chỉnh làm tròn, tổng tiền cuối cùng, số tiền đã nhận qua QR, số tiền COD còn phải thu.
  - Khối Chứng từ Liên quan: Mã phiếu kho `StockMove` (giữ tồn / xuất kho / hoàn kho), mã giao dịch thanh toán `PaymentCharge`, danh sách phụ lục đơn hàng `OrderAmendment`.
  - Khối Lịch sử Trạng thái (Timeline Audit Log): Toàn bộ các bước chuyển trạng thái đã diễn ra kèm người thực hiện, thời điểm, trạng thái trước/sau và lý do ghi chú.
- Hành động: Kích hoạt các Modal chuyển trạng thái vận hành tương ứng với trạng thái hiện tại của đơn hàng.

---

### Phân hệ 4: Quản Lý Thanh Toán, Đối Soát Và Hoàn Tiền

#### SCR-11: Màn hình Danh sách Thanh toán Toàn hệ thống (Payments List)
- Tuyến đường: `/admin/payments`
- Phân loại: Routed Page (SURFACE-001)
- Mục đích: Tra cứu trạng thái thanh toán của toàn bộ các đơn hàng (PAY-005, PAY-006).
- Dữ liệu hiển thị: Bảng giao dịch thanh toán, mã đơn hàng, phương thức thanh toán (QR/COD), trạng thái xử lý tiền cọc (`depositDisposition`), tổng tiền đã nhận, số tiền COD còn lại, trạng thái thanh toán (`UNPAID`, `PENDING`, `PARTIALLY_PAID`, `PAID`, `FAILED`, `EXPIRED`, `REFUND_PENDING`, `REFUNDED`).
- Hành động: Lọc theo trạng thái, tìm kiếm theo mã đơn hoặc mã giao dịch, xem chi tiết chứng từ thanh toán.

#### SCR-12: Màn hình Hàng đợi Đối soát Giao dịch Lệch QR (Payment Review Queue)
- Tuyến đường: `/admin/payments/review-queue`
- Phân loại: Routed Page (SURFACE-001)
- Mục đích: Xử lý các giao dịch chuyển khoản ngân hàng không khớp hoàn toàn với số tiền yêu cầu (chuyển thiếu, chuyển thừa, sai cú pháp tham chiếu, giao dịch tới trễ sau thời gian giữ hàng 30 phút theo PAY-003, PAY-017, FQ36-A).
- Dữ liệu hiển thị: Bảng các khoản thanh toán nghi vấn, mã tham chiếu ngân hàng, số tiền dự kiến, số tiền thực nhận từ webhook, thời gian nhận, đồng hồ đếm ngược thời hạn tối đa 24 giờ (`reviewDeadlineAt`).
- Hành động: Mở Modal xử lý đối soát giao dịch nghi vấn (khớp thủ công hoặc hủy đơn hoàn trả tiền thực nhận).

#### SCR-13: Màn hình Quản lý Hoàn tiền Thủ công (Refunds Management)
- Tuyến đường: `/admin/payments/refunds`
- Phân loại: Routed Page (SURFACE-001)
- Mục đích: Quản lý danh sách các lệnh hoàn trả tiền cho khách hàng (`REFUND_PENDING`) do đơn bị hủy hoặc giao dịch lệch (PAY-016, FQ26).
- Dữ liệu hiển thị: Bảng các khoản cần hoàn tiền, mã đơn hàng, tên khách hàng, thông tin tài khoản nhận lại, số tiền cần hoàn, lý do hoàn tiền, trạng thái (`PENDING`, `CONFIRMED`, `FAILED`).
- Hành động: Mở Modal xác nhận đã hoàn tiền thủ công sau khi chuyển khoản ngân hàng trả khách.

#### SCR-14: Màn hình Nhật ký Thu tiền COD (COD Collections Log)
- Tuyến đường: `/admin/payments/cod-collections`
- Phân loại: Routed Page (SURFACE-001)
- Mục đích: Theo dõi và đối soát toàn bộ các khoản tiền mặt COD đã thu khi hoàn tất giao hàng hoặc giao nhận tại quầy (PAY-020).
- Dữ liệu hiển thị: Bảng lịch sử thu tiền COD, mã đơn hàng, số tiền thực thu, người xác nhận thu tiền (`actorId`), thời điểm thu (`occurredAt`).
- Hành động: Tìm kiếm theo mã đơn hàng, lọc theo khoảng thời gian và chi nhánh phụ trách.

---

### Phân hệ 5: Quản Lý Kho Hàng, Số Serial Và Điều Chuyển

#### SCR-15: Màn hình Bảng Tồn kho Tổng thể và Chi nhánh (Inventory Balances)
- Tuyến đường: `/admin/inventory/balances`
- Phân loại: Routed Page (SURFACE-001)
- Mục đích: Giám sát số lượng tồn kho theo từng cặp `SKU + Chi nhánh` (INV-001, INV-002, INV-004).
- Dữ liệu hiển thị: Bảng dữ liệu ma trận gồm mã SKU, tên linh kiện, chi nhánh, số lượng thực tế trong kho (`onHand`), số lượng đang giữ cho đơn hàng (`reserved`), số lượng hàng lỗi/cách ly (`quarantineDamaged`), số lượng khả dụng cho phép bán (`available = onHand - reserved - quarantineDamaged`), giá vốn bình quân gia quyền (`weightedAverageCost`).
- Hành động: Lọc theo chi nhánh, danh mục, tìm kiếm theo tên hoặc mã SKU, mở Sheet xem nhanh lịch sử biến động sổ kho của dòng linh kiện đó.

#### SCR-16: Màn hình Sổ kho Bất biến (Stock Ledger Audit)
- Tuyến đường: `/admin/inventory/ledger`
- Phân loại: Routed Page (SURFACE-001)
- Mục đích: Nhật ký kiểm toán toàn diện tất cả các biến động tăng/giảm tồn kho (`StockLedgerEntry`), tuyệt đối không cho phép sửa số tồn trực tiếp (INV-005).
- Dữ liệu hiển thị: Bảng lịch sử biến động, thời điểm phát sinh, chi nhánh, SKU, loại biến động (`RESERVE`, `RELEASE_RESERVATION`, `PURCHASE_RECEIPT`, `ORDER_ISSUE`, `TRANSFER_OUT`, `TRANSFER_IN`, `SUPPLIER_RETURN`, `REVERSAL`), độ lệch tồn (`deltaOnHand`, `deltaReserved`), số dư sau biến động, mã chứng từ liên kết, người thao tác.
- Hành động: Lọc đa chiều theo chi nhánh, khoảng thời gian, loại giao dịch và mã SKU.

#### SCR-17: Màn hình Quản lý Định danh Số Serial Linh kiện (Serials Management)
- Tuyến đường: `/admin/inventory/serials`
- Phân loại: Routed Page (SURFACE-001)
- Mục đích: Quản lý vòng đời và vị trí của từng con chip, mainboard, card màn hình có số serial bắt buộc (INV-011 đến INV-014).
- Dữ liệu hiển thị: Bảng số serial, chuỗi serial định danh, mã SKU và tên linh kiện liên kết, chi nhánh hiện tại, trạng thái (`AVAILABLE`, `RESERVED`, `ISSUED`, `IN_TRANSIT`, `QUARANTINED`, `RETURNED_TO_SUPPLIER`).
- Hành động: Tìm kiếm theo chuỗi số serial, mở Modal xem chi tiết vòng đời và lịch sử di chuyển của serial đó.

#### SCR-18: Màn hình Quản lý Điều chuyển Hàng Nội bộ (Branch Transfers)
- Tuyến đường: `/admin/inventory/transfers`
- Phân loại: Routed Page (SURFACE-001)
- Mục đích: Quản lý việc chuyển linh kiện giữa các chi nhánh để gom hàng phục vụ đơn hoặc cân đối tồn kho (TRF-001, TRF-002, TRF-003, FQ12).
- Dữ liệu hiển thị: Danh sách các phiếu điều chuyển với trạng thái (`REQUESTED`, `IN_TRANSIT`, `RECEIVED`, `CANCELLED`), mã phiếu, chi nhánh gửi, chi nhánh nhận, thời gian xuất, thời gian nhận.
- Hành động: Tạo mới yêu cầu điều chuyển, mở Modal xuất kho chuyển hàng (Dispatch), mở Modal nhận hàng điều chuyển (Receive), mở Modal hủy phiếu điều chuyển.

---

### Phân hệ 6: Mua Hàng, Nhà Cung Cấp Và Xuất Trả NCC

#### SCR-19: Màn hình Danh bạ Nhà cung cấp (Suppliers)
- Tuyến đường: `/admin/procurement/suppliers`
- Phân loại: Routed Page (SURFACE-001)
- Mục đích: Quản lý danh sách các đối tác cung cấp linh kiện PC (PUR-001).
- Dữ liệu hiển thị: Bảng nhà cung cấp, mã đối tác, tên công ty, số điện thoại, email, địa chỉ, người liên hệ, trạng thái hoạt động.
- Hành động: Mở Modal thêm mới hoặc chỉnh sửa thông tin nhà cung cấp.

#### SCR-20: Màn hình Danh sách Đơn mua hàng PO (Purchase Orders)
- Tuyến đường: `/admin/procurement/purchase-orders`
- Phân loại: Routed Page (SURFACE-001)
- Mục đích: Theo dõi toàn bộ các đơn đặt mua linh kiện từ nhà cung cấp về các chi nhánh (PUR-002, PUR-003, PUR-004).
- Dữ liệu hiển thị: Bảng đơn mua hàng PO, mã PO, nhà cung cấp, chi nhánh nhận hàng, trạng thái (`DRAFT`, `CONFIRMED`, `RECEIVED`, `CLOSED`, `CANCELLED`), tổng giá trị dự kiến, ngày tạo.
- Hành động: Điều hướng đến trang tạo mới PO dự thảo, bấm vào dòng để chuyển đến trang chi tiết và đối soát nhập kho.

#### SCR-21: Màn hình Chi tiết và Đối soát Nhập kho Đơn mua hàng PO (PO Detail & Receipt Validation)
- Tuyến đường: `/admin/procurement/purchase-orders/new` và `/admin/procurement/purchase-orders/:id`
- Phân loại: Routed Page (SURFACE-001)
- Mục đích: Soạn thảo đơn đặt hàng, xác nhận đơn và thực hiện thủ tục nhập kho đối soát (PUR-005 đến PUR-010, PUR-015, PUR-016).
- Dữ liệu hiển thị:
  - Khối Thông tin chung: Nhà cung cấp, chi nhánh nhận hàng duy nhất, ghi chú, trạng thái đơn, mã PO thay thế liên kết nếu có (`supersedesPurchaseOrderId`).
  - Bảng Dòng hàng PO: Danh sách SKU, số lượng đặt, đơn giá thỏa thuận chưa/có VAT.
- Hành động: Lưu thông tin PO dự thảo, kích hoạt Modal xác nhận PO (`Confirm PO`), kích hoạt Modal nhập kho đối soát 100% (`Validate PO Receipt`), kích hoạt Modal xử lý nhà cung cấp giao thiếu hàng (`Short-Shipment Replacement PO`), đóng PO hoặc hủy PO.

#### SCR-22: Màn hình Quản lý Trả hàng Nhà cung cấp (Supplier Returns)
- Tuyến đường: `/admin/procurement/supplier-returns`
- Phân loại: Routed Page (SURFACE-001)
- Mục đích: Quản lý các phiếu xuất trả lại linh kiện lỗi hoặc không đạt chuẩn cho nhà cung cấp (PUR-011, PUR-012, PUR-013).
- Dữ liệu hiển thị: Bảng phiếu xuất trả hàng, mã phiếu, nhà cung cấp nhận lại, đơn PO gốc liên kết, chi nhánh xuất trả, số lượng linh kiện, ngày xuất.
- Hành động: Mở Modal tạo mới phiếu xuất trả hàng từ đơn PO đã nhập kho.

---

### Phân hệ 7: Quản Lý Khuyến Mãi, Mã Giảm Giá Và Phí Giao Hàng

#### SCR-23: Màn hình Chương trình Khuyến mãi Sản phẩm (Product Promotions)
- Tuyến đường: `/admin/promotions/product-promotions`
- Phân loại: Routed Page (SURFACE-001)
- Mục đích: Cấu hình giảm giá tự động cho sản phẩm/danh mục mà khách không cần nhập mã (PRO-001, PRO-004).
- Dữ liệu hiển thị: Danh sách chương trình khuyến mãi, loại giảm (phần trăm / số tiền cố định), giá trị giảm, cờ độc quyền (`isExclusive`), thời gian hiệu lực từ ngày - đến ngày, phạm vi áp dụng (theo SKU hoặc theo Category), trạng thái kích hoạt.
- Hành động: Mở Modal thêm mới hoặc chỉnh sửa chương trình khuyến mãi sản phẩm, bật/tắt kích hoạt chương trình.

#### SCR-24: Màn hình Quản lý Mã Giảm giá (Coupons)
- Tuyến đường: `/admin/promotions/coupons`
- Phân loại: Routed Page (SURFACE-001)
- Mục đích: Quản lý các voucher giảm giá cấp đơn hàng có giới hạn số lượng và điều kiện đi kèm (PRO-002, PRO-006, PRO-007, PRO-008).
- Dữ liệu hiển thị: Danh sách coupon, mã code, tên coupon, mức giảm, giá trị đơn hàng tối thiểu, mức giảm tối đa, quota toàn hệ thống, quota mỗi khách hàng, phương thức thanh toán yêu cầu (nếu có), chi nhánh áp dụng, thời gian hiệu lực, số lượng đã sử dụng.
- Hành động: Mở Modal thêm/sửa mã giảm giá coupon, mở Sheet xem lịch sử sử dụng của mã coupon đó.

#### SCR-25: Màn hình Cài đặt Biểu phí Giao hàng (Delivery Fee Config)
- Tuyến đường: `/admin/promotions/shipping-fee`
- Phân loại: Routed Page (SURFACE-001)
- Mục đích: Cấu hình mức phí giao hàng cố định và ngưỡng đơn hàng được miễn phí giao hàng toàn hệ thống (PRC-006, PRC-007).
- Dữ liệu hiển thị: Biểu phí đang áp dụng hiện tại (phí ship cố định, ngưỡng đơn hàng freeship, thời gian bắt đầu hiệu lực), lịch sử các đợt cấu hình biểu phí trước đây.
- Hành động: Mở Modal cập nhật biểu phí vận chuyển mới có hiệu lực trong tương lai.

---

### Phân hệ 8: Quản Lý Khách Hàng Và Định Danh

#### SCR-26: Màn hình Danh sách Khách hàng (Customers Management)
- Tuyến đường: `/admin/customers`
- Phân loại: Routed Page (SURFACE-001)
- Mục đích: Quản lý hồ sơ định danh người mua, phân biệt giữa tài khoản đã đăng ký User và hồ sơ khách mua vãng lai Guest Profile (CUS-003, CUS-007, CUS-015, FQ37).
- Dữ liệu hiển thị: Bảng khách hàng, họ tên, email, số điện thoại, ngày giờ xác thực email/sđt, trạng thái liên kết tài khoản User (Có/Không), số lượng đơn hàng đã đặt, tổng chi tiêu tích lũy.
- Hành động: Lọc theo trạng thái tài khoản, tìm kiếm theo tên, email hoặc số điện thoại, điều hướng đến trang chi tiết hồ sơ khách hàng.

#### SCR-27: Màn hình Chi tiết Hồ sơ Khách hàng (Customer Profile Detail)
- Tuyến đường: `/admin/customers/:id`
- Phân loại: Routed Page (SURFACE-001)
- Mục đích: Xem toàn diện hành trình mua hàng, lịch sử đơn, giỏ hàng hiện tại, các đánh giá đã viết và lịch sử gộp hồ sơ nếu có (CUS-006, CUS-008, CUS-009, CUS-010).
- Dữ liệu hiển thị: Khối thông tin liên lạc, danh sách đơn hàng đã mua, danh sách mã coupon đã dùng, danh sách đánh giá sản phẩm.
- Hành động: Mở Modal gộp hồ sơ khách hàng, mở Modal giải quyết xung đột định danh.

---

### Phân hệ 9: Kiểm Duyệt Đánh Giá Sản Phẩm

#### SCR-28: Màn hình Quản lý Đánh giá Sản phẩm (Reviews Moderation)
- Tuyến đường: `/admin/reviews`
- Phân loại: Routed Page (SURFACE-001)
- Mục đích: Kiểm duyệt, giám sát các đánh giá từ khách hàng đã mua và nhận hàng thành công (REV-001, REV-002, REV-003, REV-005).
- Dữ liệu hiển thị: Bảng đánh giá, tên sản phẩm/SKU, tên khách hàng, số sao (1 đến 5), nội dung nhận xét, mã đơn hàng đã hoàn tất liên kết, trạng thái hiển thị (`isVisible`), ngày đăng.
- Hành động: Lọc theo số sao, lọc theo trạng thái hiển thị, mở Modal xem chi tiết và ẩn đánh giá kèm lý do kiểm toán.

---

### Phân hệ 10: Quản Lý Chi Nhánh Và Nhật Ký Hệ Thống

#### SCR-29: Màn hình Quản lý Chi nhánh Cửa hàng (Branches Settings)
- Tuyến đường: `/admin/settings/branches`
- Phân loại: Routed Page (SURFACE-001)
- Mục đích: Quản lý danh sách các chi nhánh kho kiêm cửa hàng nhận hàng của EL-TECH.
- Dữ liệu hiển thị: Bảng chi nhánh, mã chi nhánh (code), tên chi nhánh, địa chỉ vật lý, giờ mở cửa, độ ưu tiên phục vụ giao hàng (`deliveryPriority`), danh sách các mã khu vực phục vụ (`deliveryAreaCodes`), trạng thái hoạt động.
- Hành động: Mở Modal thêm mới hoặc chỉnh sửa thông tin chi nhánh.

#### SCR-30: Màn hình Nhật ký Thông báo Hệ thống (Notification Outbox Logs)
- Tuyến đường: `/admin/settings/notification-outbox`
- Phân loại: Routed Page (SURFACE-001)
- Mục đích: Giám sát việc phát thông báo transactional tới khách hàng qua các kênh (In-app, Email, SMS) theo mô hình Transactional Outbox (NOT-001, NOT-004, NOT-005, NOT-006).
- Dữ liệu hiển thị: Bảng thông báo, mã đơn hàng liên kết, khách hàng nhận, loại sự kiện (`eventType`), tiêu đề, kênh gửi, thời điểm xuất bản (`publishedAt`), thời điểm gửi cuối cùng, số lần đã thử lại (retry count), thông báo lỗi nếu việc gửi email/SMS gặp sự cố.
- Hành động: Lọc theo kênh gửi, loại sự kiện, khoảng thời gian gửi, tìm kiếm theo mã đơn hoặc người nhận.

---

## 4. Danh Mục Chi Tiết Các Hộp Thoại Tương Tác (Modals/Dialogs/Sheets)

### Nhóm Danh Mục & Sản Phẩm (Catalog Modals)

#### MOD-01: Modal Thêm/Sửa Danh Mục Ngành Hàng
- Phân loại: Dialog (SURFACE-002)
- Màn hình kích hoạt: SCR-03
- Dữ liệu nhập: Tên danh mục, mã định danh slug (tự động gợi ý từ tên), chọn danh mục cha (nếu là danh mục cấp con), mô tả ngắn.
- Điều kiện kiểm tra: Slug không được trùng lặp, không cho phép chọn chính danh mục đó làm cha của nó.

#### MOD-02: Sheet Cấu Hình Schema Thông Số Kỹ Thuật Động
- Phân loại: Sheet/Drawer (SURFACE-003)
- Màn hình kích hoạt: SCR-03
- Dữ liệu cấu hình: Danh sách các thuộc tính kỹ thuật (key định danh, nhãn tiếng Việt, kiểu dữ liệu text/number/boolean/select, đơn vị đo MHz/GB/W, cờ bắt buộc, cờ cho phép lọc `filterable`, cờ cho phép so sánh `comparable`, danh sách các giá trị định sẵn).
- Quy tắc kiểm tra (CAT-009): Khóa cứng không cho xóa hoặc đổi kiểu dữ liệu đối với các trường thông số kỹ thuật đã có mẫu sản phẩm đang sử dụng. Chỉ cho phép đánh dấu ngưng kích hoạt (`deprecated`).

#### MOD-03: Modal Thêm/Sửa Thương Hiệu
- Phân loại: Dialog (SURFACE-002)
- Màn hình kích hoạt: SCR-04
- Dữ liệu nhập: Tên thương hiệu, mã slug, mô tả tóm tắt thương hiệu.
- Điều kiện kiểm tra: Tên và slug không được trùng lặp.

#### MOD-04: Modal Thêm/Sửa Biến Thể SKU
- Phân loại: Dialog (SURFACE-002)
- Màn hình kích hoạt: SCR-06
- Dữ liệu nhập: Mã SKU định danh duy nhất toàn hệ thống, mã vạch barcode (tùy chọn nhưng phải là duy nhất nếu nhập), nhãn biến thể (ví dụ: Màu trắng, Bản Overclocked), cờ quản lý số serial (`serialRequired`), giá bán niêm yết đã bao gồm VAT (`sellingPrice`), trường ghi đè thông số biến thể (`variantSpec`).
- Điều kiện kiểm tra (CAT-008, PRC-004): Mã SKU không trùng, giá bán phải là số nguyên dương VND không có phần thập phân.

#### MOD-05: Modal Chuyển Trạng Thái Vòng Đời Sản Phẩm/SKU
- Phân loại: Dialog (SURFACE-002)
- Màn hình kích hoạt: SCR-05, SCR-06
- Dữ liệu nhập: Chọn trạng thái mục tiêu (`DRAFT`, `ACTIVE`, `PAUSED`, `DISCONTINUED`), lý do chuyển trạng thái.
- Điều kiện kiểm tra (CAT-010, CAT-014): Muốn chuyển sang `ACTIVE`, mẫu sản phẩm bắt buộc phải điền đầy đủ các thông số bắt buộc do danh mục quy định và phải sở hữu ít nhất một biến thể SKU đang hoạt động. Không cho phép xóa cứng các SKU đã phát sinh giao dịch.

#### MOD-06: Sheet Cấu Hình BOM Bộ PC Dựng Sẵn
- Phân loại: Sheet/Drawer (SURFACE-003)
- Màn hình kích hoạt: SCR-08
- Dữ liệu cấu hình: Tên bộ PC dựng sẵn, mã slug, mô tả, ảnh đại diện, danh sách các dòng linh kiện SKU cấu thành, số lượng yêu cầu của từng linh kiện, thứ tự hiển thị sắp xếp (`sortOrder`).
- Quy tắc kiểm tra (PCB-001, PCB-002): Mỗi dòng linh kiện phải trỏ tới một SKU đang ở trạng thái `ACTIVE`. Không tạo tồn kho ảo cho cả bộ PC.

---

### Nhóm Vận Hành Đơn Hàng (Order & Fulfillment Modals)

#### MOD-07: Modal Xác Nhận Đơn Hàng COD
- Phân loại: Dialog (SURFACE-002)
- Màn hình kích hoạt: SCR-10
- Trạng thái chuyển dịch: `PENDING_COD_CONFIRMATION -> CONFIRMED`
- Quy tắc kiểm tra (ORD-006, CHK-010, INV-006): Hệ thống tự động kiểm tra và khóa giữ tồn kho (`reserved`) nguyên tử cho toàn bộ linh kiện trong đơn tại chi nhánh phụ trách. Nếu bất kỳ linh kiện nào bị thiếu tồn khả dụng, hành động bị chặn và báo lỗi rõ SKU thiếu hàng.

#### MOD-08: Modal Bắt Đầu Soạn Hàng Linh Kiện
- Phân loại: Dialog (SURFACE-002)
- Màn hình kích hoạt: SCR-10
- Trạng thái chuyển dịch: `CONFIRMED -> PREPARING_COMPONENTS`
- Nghiệp vụ (ORD-007): Chuyển đơn sang khâu soạn hàng thực tế tại kho. Từ thời điểm này trở đi, khách hàng không còn quyền tự hủy đơn trên giao diện người dùng (`ORD-015`).

#### MOD-09: Modal Chuyển Bàn Lắp Ráp Máy Tính
- Phân loại: Dialog (SURFACE-002)
- Màn hình kích hoạt: SCR-10
- Trạng thái chuyển dịch: `PREPARING_COMPONENTS -> ASSEMBLING`
- Quy tắc kiểm tra (ORD-008, INV-019, PCB-008): Chỉ áp dụng cho đơn hàng có lựa chọn dịch vụ lắp ráp máy tính. Thao tác này sẽ tự động xác thực việc trừ tồn kho thực tế (`onHand`) và giải phóng số lượng giữ (`reserved`) của toàn bộ linh kiện cấu thành trong một giao dịch duy nhất.

#### MOD-10: Modal Báo Sẵn Sàng Nhận Hàng Tại Quầy
- Phân loại: Dialog (SURFACE-002)
- Màn hình kích hoạt: SCR-10
- Trạng thái chuyển dịch: `PREPARING_COMPONENTS -> READY_FOR_PICKUP` (hoặc `ASSEMBLING -> READY_FOR_PICKUP`)
- Quy tắc kiểm tra (ORD-008, ORD-022, INV-019): Dùng cho đơn nhận tại cửa hàng. Kích hoạt phát thông báo tự động cho khách đến nhận. Bắt đầu tính thời hạn 14 ngày chờ nhận hàng.

#### MOD-11: Modal Xuất Kho Giao Hàng Cho Đơn Vị Vận Chuyển
- Phân loại: Dialog (SURFACE-002)
- Màn hình kích hoạt: SCR-10
- Trạng thái chuyển dịch: `PREPARING_COMPONENTS -> SHIPPING` (hoặc `ASSEMBLING -> SHIPPING`)
- Dữ liệu nhập: Tên đơn vị giao vận, mã vận đơn đối soát nội bộ.
- Quy tắc kiểm tra (ORD-008, INV-019): Đối với đơn không qua lắp ráp, bước này sẽ tự động trừ tồn kho thực tế (`onHand`) và giải phóng `reserved`. Bắt buộc toàn bộ các khoản phụ phí điều chỉnh (amendment) nếu có phải được thanh toán trước khi xuất kho (`PRC-008`, `PAY-019`).

#### MOD-12: Modal Ghi Nhận Giao Hàng Thất Bại
- Phân loại: Dialog (SURFACE-002)
- Màn hình kích hoạt: SCR-10
- Trạng thái chuyển dịch: `SHIPPING -> DELIVERY_FAILED`
- Dữ liệu nhập: Chọn lý do giao hàng thất bại (khách không bắt máy, sai thông tin địa chỉ, khách từ chối nhận hàng).
- Quy tắc kiểm tra (ORD-024, INV-022): Tuyệt đối không khôi phục tồn kho hay sinh phiếu đảo ngược kho tại bước này.

#### MOD-13: Modal Lên Lịch Hẹn Giao Lại (Redelivery)
- Phân loại: Dialog (SURFACE-002)
- Màn hình kích hoạt: SCR-10
- Trạng thái chuyển dịch: `DELIVERY_FAILED -> SHIPPING`
- Dữ liệu nhập: Ngày hẹn giao lại, ghi chú liên hệ khách hàng, tùy chọn tính phụ phí giao lại (tạo `OrderAmendment`).
- Quy tắc kiểm tra (ORD-024, FQ34): Kiểm tra số lần giao lại hiện tại phải nhỏ hơn 2 (`redeliveryAttemptCount < 2`). Khi xác nhận, số lần đếm tự động tăng thêm 1.

#### MOD-14: Modal Chuyển Hàng Hoàn Về Kho Chi Nhánh
- Phân loại: Dialog (SURFACE-002)
- Màn hình kích hoạt: SCR-10
- Trạng thái chuyển dịch: `DELIVERY_FAILED -> RETURNING`
- Nghiệp vụ (ORD-025): Ghi nhận kiện hàng đang trên đường vận chuyển ngược về kho do khách từ chối nhận hoặc vượt quá số lần giao lại cho phép.

#### MOD-15: Modal Xác Nhận Hàng Hoàn Đã Về Đến Kho Chi Nhánh
- Phân loại: Dialog (SURFACE-002)
- Màn hình kích hoạt: SCR-10
- Trạng thái chuyển dịch: `RETURNING -> RETURNED_TO_BRANCH`
- Dữ liệu nhập: Bảng kiểm đếm số lượng thực tế nhận lại theo từng dòng SKU, quét/chọn lại các số serial đã xuất đi.
- Quy tắc kiểm tra (ORD-025, INV-022, FQ21): Phải khớp đủ 100% linh kiện/serial của đơn. Hệ thống tự động kích hoạt phiếu kho đảo ngược (`linked reverse stock move`) để cộng lại tồn kho thực tế `onHand`. Sau khi hoàn kho xong, Admin mới được phép hủy đơn hàng.

#### MOD-16: Modal Hoàn Tất Đơn Hàng (Complete Order)
- Phân loại: Dialog (SURFACE-002)
- Màn hình kích hoạt: SCR-10
- Trạng thái chuyển dịch: `SHIPPING -> COMPLETED` hoặc `READY_FOR_PICKUP -> COMPLETED`
- Dữ liệu nhập: Trường hợp đơn COD, hiển thị ô xác nhận đã thu đủ số tiền mặt COD còn lại kèm người thu tiền.
- Quy tắc kiểm tra (ORD-010, PAY-020): Đối với đơn COD, bắt buộc phải ghi nhận đã thu đủ toàn bộ số tiền còn thiếu trước khi đơn được đánh dấu hoàn tất. Đối với đơn nhận tại shop chưa qua lắp ráp, hệ thống tự động trừ tồn `onHand` tại thời điểm bàn giao hàng.

#### MOD-17: Modal Hủy Đơn Hàng (Cancel Order)
- Phân loại: Dialog (SURFACE-002)
- Màn hình kích hoạt: SCR-10
- Trạng thái chuyển dịch: Chuyển sang `CANCELLED`
- Dữ liệu nhập: Lý do hủy đơn bắt buộc.
- Quy tắc kiểm tra (ORD-012, ORD-013, ORD-014, ORD-017, ORD-021, PAY-014):
  - Nếu đơn đã xuất kho thực tế, chặn không cho hủy trực tiếp mà bắt buộc phải qua bước nhập hàng hoàn kho trước.
  - Tự động giải phóng số lượng giữ tồn kho (`reserved`) và hoàn trả quota sử dụng voucher coupon một lần duy nhất.
  - Nếu là đơn COD PC Custom đã bước qua trạng thái `PREPARING_COMPONENTS`, khoản tiền cọc 10% sẽ bị tịch thu và chuyển sang `depositDisposition = FORFEITED`.
  - Nếu đơn đã trả tiền trước qua QR đủ điều kiện hoàn tiền, hệ thống tự động sinh bản ghi `REFUND_PENDING` tương ứng toàn bộ số tiền thực nhận.

#### MOD-18: Modal Xử Lý Ngoại Lệ Đơn Hàng Tạm Giữ (Resolve ON_HOLD)
- Phân loại: Dialog (SURFACE-002)
- Màn hình kích hoạt: SCR-10
- Trạng thái chuyển dịch: Xử lý đơn ở trạng thái `ON_HOLD`
- Xử lý theo từng nguyên nhân:
  - `PAYMENT_REVIEW`: Đối soát tiền lệch, khớp thủ công để chuyển sang `CONFIRMED` hoặc hủy đơn hoàn tiền nếu hết hạn 24 giờ (`PAY-003`, `PAY-017`).
  - `PAID_BUT_OUT_OF_STOCK`: Khách trả tiền trễ dẫn đến hết hàng, chọn hoàn tiền hoặc thỏa thuận đổi SKU khác (`PAY-004`).
  - `PICKUP_EXPIRED`: Đơn nhận tại quầy quá 14 ngày. Chọn tiếp tục giữ chờ liên hệ hoặc tạo phụ lục đổi sang giao hàng tận nơi (`ORD-022`, FQ31-B).

#### MOD-19: Modal Tạo Phụ Lục Chuyển Sang Giao Hàng Tận Nơi (Pickup to Delivery Amendment)
- Phân loại: Dialog (SURFACE-002)
- Màn hình kích hoạt: SCR-10
- Dữ liệu nhập: Địa chỉ giao hàng chi tiết, thông tin người nhận, tính toán phụ phí giao hàng áp dụng theo cấu hình biểu phí hiện hành.
- Quy tắc kiểm tra (ORD-023, PRC-008, PAY-019): Tạo bản ghi `OrderAmendment` loại `PICKUP_TO_DELIVERY`. Không ghi đè lên snapshot giá ban đầu của đơn hàng. Với đơn trả trước, sinh mã QR phụ phí giao hàng; với đơn COD, cộng khoản phụ phí này vào số tiền COD còn phải thu.

---

### Nhóm Thanh Toán & Đối Soát (Payment Modals)

#### MOD-20: Modal Xử Lý Đối Soát Giao Dịch Nghi Vấn QR
- Phân loại: Dialog (SURFACE-002)
- Màn hình kích hoạt: SCR-12
- Dữ liệu hiển thị: Thông tin chi tiết mã đơn, số tiền dự kiến, số tiền thực nhận từ tài khoản ngân hàng, mã tham chiếu thô từ webhook.
- Hành động lựa chọn:
  - Khớp thủ công nếu có chứng từ chứng minh giao dịch hợp lệ.
  - Hủy đơn và chuyển toàn bộ số tiền thực nhận sang trạng thái `REFUND_PENDING` để hoàn trả cho khách hàng (không hỗ trợ chuyển bù tiền qua QR theo FQ36-A, PAY-017).

#### MOD-21: Modal Xác Nhận Đã Hoàn Tiền Thủ Công
- Phân loại: Dialog (SURFACE-002)
- Màn hình kích hoạt: SCR-13
- Dữ liệu nhập: Mã giao dịch chuyển khoản ngân hàng (`transactionReference`), ngân hàng thực hiện, ngày giờ hoàn tất (`occurredAt`).
- Nghiệp vụ (PAY-016): Đánh dấu bản ghi hoàn tiền thành `CONFIRMED`, chuyển trạng thái thanh toán của đơn hàng sang `REFUNDED`. Thao tác mang tính lũy nghiệm (idempotent).

---

### Nhóm Quản Lý Kho & Điều Chuyển (Inventory Modals)

#### MOD-22: Sheet Xem Lịch Sử Biến Động Tồn Kho Của SKU
- Phân loại: Sheet/Drawer (SURFACE-003)
- Màn hình kích hoạt: SCR-15
- Dữ liệu hiển thị: Danh sách các dòng `StockLedgerEntry` gần nhất của SKU tại chi nhánh đã chọn, thể hiện chi tiết loại biến động, số lượng thay đổi và tồn dư sau biến động.

#### MOD-23: Modal Xem Chi Tiết Vòng Đời Số Serial
- Phân loại: Dialog (SURFACE-002)
- Màn hình kích hoạt: SCR-17
- Dữ liệu hiển thị: Lịch sử các bước di chuyển của số serial (`SerialMovement`): nhập kho từ PO nào, chuyển qua chi nhánh nào, xuất cho đơn hàng nào, hoặc xuất trả nhà cung cấp.

#### MOD-24: Modal Tạo Yêu Cầu Điều Chuyển Hàng Nội Bộ
- Phân loại: Dialog (SURFACE-002)
- Màn hình kích hoạt: SCR-18
- Dữ liệu nhập: Chi nhánh nguồn, chi nhánh đích, danh sách các SKU và số lượng cần điều chuyển.
- Quy tắc kiểm tra (TRF-001, TRF-002): Chi nhánh nguồn và chi nhánh đích phải khác nhau. Số lượng yêu cầu không vượt quá số lượng khả dụng hiện có tại chi nhánh nguồn.

#### MOD-25: Modal Xuất Kho Điều Chuyển (Dispatch Transfer)
- Phân loại: Dialog (SURFACE-002)
- Màn hình kích hoạt: SCR-18
- Dữ liệu nhập: Đối với các SKU bắt buộc serial, thực hiện quét hoặc chọn chính xác từng số serial xuất đi.
- Nghiệp vụ (TRF-003): Giảm số lượng `onHand` tại chi nhánh nguồn, tăng số lượng `in_transit`, chuyển trạng thái phiếu sang `IN_TRANSIT`.

#### MOD-26: Modal Xác Nhận Nhận Hàng Điều Chuyển (Receive Transfer)
- Phân loại: Dialog (SURFACE-002)
- Màn hình kích hoạt: SCR-18
- Nghiệp vụ (TRF-005, FQ12): Chi nhánh đích xác nhận nhận toàn bộ số lượng hàng. Giảm số lượng `in_transit`, tăng tồn kho `onHand` tại chi nhánh đích, chuyển trạng thái phiếu sang `RECEIVED`. Hệ thống tin tưởng số lượng nhận đủ, không quản lý chênh lệch nhận thiếu trong MVP.

#### MOD-27: Modal Hủy Yêu Cầu Điều Chuyển
- Phân loại: Dialog (SURFACE-002)
- Màn hình kích hoạt: SCR-18
- Điều kiện kiểm tra (TRF-002): Chỉ cho phép hủy khi phiếu điều chuyển đang ở trạng thái `REQUESTED` và chưa được xuất kho (`dispatched`).

---

### Nhóm Mua Hàng & Nhà Cung Cấp (Procurement Modals)

#### MOD-28: Modal Thêm/Sửa Nhà Cung Cấp
- Phân loại: Dialog (SURFACE-002)
- Màn hình kích hoạt: SCR-19
- Dữ liệu nhập: Mã đối tác nhà cung cấp (code), tên công ty, số điện thoại, email, địa chỉ kho xuất hàng, họ tên người liên hệ đại diện.
- Điều kiện kiểm tra: Mã đối tác phải là duy nhất.

#### MOD-29: Modal Xác Nhận Đơn Mua Hàng PO (Confirm PO)
- Phân loại: Dialog (SURFACE-002)
- Màn hình kích hoạt: SCR-21
- Trạng thái chuyển dịch: `DRAFT -> CONFIRMED`
- Nghiệp vụ (PUR-003, PUR-005): Khóa toàn bộ thông tin nhà cung cấp, chi nhánh nhận hàng, danh sách SKU, số lượng đặt và đơn giá thỏa thuận. Sau khi xác nhận, không cho phép sửa đổi dòng hàng trực tiếp.

#### MOD-30: Modal Đối Soát Và Nhập Kho PO (Validate PO Receipt)
- Phân loại: Dialog (SURFACE-002)
- Màn hình kích hoạt: SCR-21
- Trạng thái chuyển dịch: `CONFIRMED -> RECEIVED`
- Dữ liệu nhập: Bảng kiểm đếm dòng hàng thực nhận, ô quét/nhập số serial duy nhất cho các SKU có cờ bắt buộc serial.
- Quy tắc kiểm tra (PUR-006, PUR-007, PUR-008, PUR-009):
  - Số lượng và SKU thực tế phải khớp đúng 100% với đơn PO đã xác nhận. Chặn nhập kho nếu thiếu, thừa hoặc sai SKU.
  - Số serial không được trùng lặp với bất kỳ serial nào đang tồn tại trên toàn hệ thống.
  - Khi xác nhận thành công: Tăng tồn kho thực tế `onHand` tại chi nhánh nhận, ghi nhận các số serial, tự động tính lại giá vốn bình quân gia quyền của SKU tại chi nhánh đó.

#### MOD-31: Modal Xử Lý Nhà Cung Cấp Giao Thiếu Hàng (PO Shortage Replacement)
- Phân loại: Dialog (SURFACE-002)
- Màn hình kích hoạt: SCR-21
- Nghiệp vụ (PUR-015, PUR-016, FQ30): Áp dụng khi nhà cung cấp thực tế giao thiếu hàng so với PO đã `CONFIRMED`. Hệ thống hủy PO hiện tại với lý do `SUPPLIER_SHORT_SHIPMENT`, tự động tạo một PO mới clone lại chính xác số lượng thực nhận liên kết qua `supersedesPurchaseOrderId`. PO mới này sau đó sẽ được xác nhận và nhập kho theo quy trình chuẩn.

#### MOD-32: Modal Tạo Phiếu Xuất Trả Hàng Nhà Cung Cấp
- Phân loại: Dialog (SURFACE-002)
- Màn hình kích hoạt: SCR-22
- Dữ liệu nhập: Chọn đơn PO gốc đã nhận kho, chọn SKU và số lượng cần trả, chọn các số serial cụ thể cần xuất trả.
- Quy tắc kiểm tra (PUR-011, PUR-012, PUR-013): Số lượng trả không được vượt quá số lượng đã nhận trừ các lần trả trước đó. Giảm tồn kho thực tế `onHand` hoặc `quarantineDamaged` tại chi nhánh tương ứng.

---

### Nhóm Khuyến Mãi & Cài Đặt (Promotions & Settings Modals)

#### MOD-33: Modal Thêm/Sửa Khuyến Mãi Sản Phẩm
- Phân loại: Dialog (SURFACE-002)
- Màn hình kích hoạt: SCR-23
- Dữ liệu nhập: Tên chương trình, loại giảm (phần trăm / số tiền cố định), giá trị giảm, cờ độc quyền (`isExclusive`), thời gian bắt đầu và kết thúc, danh sách các SKU hoặc Danh mục được áp dụng.

#### MOD-34: Modal Thêm/Sửa Mã Giảm Giá Coupon
- Phân loại: Dialog (SURFACE-002)
- Màn hình kích hoạt: SCR-24
- Dữ liệu nhập: Mã coupon, tên mô tả, kiểu giảm giá, mức giảm, ngưỡng giá trị đơn hàng tối thiểu, mức giảm tối đa, quota toàn hệ thống, quota mỗi khách, phương thức thanh toán áp dụng, danh mục/SKU áp dụng hoặc loại trừ.

#### MOD-35: Sheet Xem Lịch Sử Sử Dụng Coupon
- Phân loại: Sheet/Drawer (SURFACE-003)
- Màn hình kích hoạt: SCR-24
- Dữ liệu hiển thị: Danh sách các đơn hàng đã áp dụng mã coupon, khách hàng sử dụng, trạng thái giữ mã (`RESERVED`), trạng thái chốt dùng (`CONSUMED`), hoặc giải phóng khi hủy đơn (`RELEASED`).

#### MOD-36: Modal Cập Nhật Biểu Phí Vận Chuyển Mới
- Phân loại: Dialog (SURFACE-002)
- Màn hình kích hoạt: SCR-25
- Dữ liệu nhập: Mức phí giao hàng cố định (VND nguyên số), ngưỡng giá trị đơn hàng được miễn phí giao hàng, thời điểm bắt đầu có hiệu lực.

#### MOD-37: Modal Gộp Hồ Sơ Khách Hàng (Merge Customers)
- Phân loại: Dialog (SURFACE-002)
- Màn hình kích hoạt: SCR-27
- Dữ liệu nhập: Chọn hồ sơ khách hàng phụ cần gộp vào hồ sơ chính hiện tại, lý do gộp bắt buộc.
- Quy tắc kiểm tra (CUS-009, CUS-010): Chuyển toàn bộ các đơn hàng, lượt sử dụng coupon và đánh giá sản phẩm sang hồ sơ chính. Đánh dấu hồ sơ phụ liên kết qua trường `mergedIntoCustomerId` và ghi nhận nhật ký kiểm toán.

#### MOD-38: Modal Chi Tiết Và Ẩn Đánh Giá Sản Phẩm
- Phân loại: Dialog (SURFACE-002)
- Màn hình kích hoạt: SCR-28
- Dữ liệu nhập: Xem nội dung đầy đủ và lịch sử chỉnh sửa của khách. Nếu ẩn đánh giá, bắt buộc nhập lý do vào `hiddenReason`.
- Quy tắc kiểm tra (REV-005): Lưu vết kiểm toán người thực hiện ẩn đánh giá, không xóa vật lý bản ghi đánh giá khỏi cơ sở dữ liệu.

#### MOD-39: Modal Thêm/Sửa Chi Nhánh Cửa Hàng
- Phân loại: Dialog (SURFACE-002)
- Màn hình kích hoạt: SCR-29
- Dữ liệu nhập: Mã chi nhánh (code), tên chi nhánh, địa chỉ vật lý, cấu hình giờ mở cửa theo ngày trong tuần, độ ưu tiên phục vụ giao hàng (`deliveryPriority`), danh sách mã khu vực phục vụ (`deliveryAreaCodes`).

---

## 5. Ma Trận Chuyển Đổi Trạng Thái Đơn Hàng Và Tác Động Tồn Kho

Bảng dưới đây chuẩn hóa các bước chuyển trạng thái trên giao diện Admin và hành động kho tương ứng:

| Trạng thái trước | Thao tác trên giao diện | Trạng thái sau | Modal kích hoạt | Tác động Tồn kho & Sổ kho | Tác động Thanh toán & Cọc |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `PENDING_COD_CONFIRMATION` | Bấm Xác nhận đơn | `CONFIRMED` | MOD-07 | Tăng `reserved` toàn bộ linh kiện tại chi nhánh | Không đổi |
| `CONFIRMED` | Bấm Soạn hàng | `PREPARING_COMPONENTS` | MOD-08 | Không đổi số lượng tồn kho | Khóa quyền tự hủy của khách |
| `PREPARING_COMPONENTS` | Bấm Bắt đầu lắp ráp (Đơn có lắp ráp) | `ASSEMBLING` | MOD-09 | Giảm `onHand`, giải phóng `reserved` linh kiện | Không đổi |
| `PREPARING_COMPONENTS` | Bấm Sẵn sàng nhận (Đơn pickup không lắp) | `READY_FOR_PICKUP` | MOD-10 | Giữ nguyên trạng thái `reserved` | Không đổi (Chờ khách tới quầy) |
| `ASSEMBLING` | Bấm Sẵn sàng nhận (Đơn pickup có lắp) | `READY_FOR_PICKUP` | MOD-10 | Không di chuyển kho (Linh kiện đã trừ lúc trước) | Không đổi |
| `PREPARING_COMPONENTS` | Bấm Xuất kho giao hàng (Đơn ship không lắp) | `SHIPPING` | MOD-11 | Giảm `onHand`, giải phóng `reserved` linh kiện | Bắt buộc phụ phí (nếu có) đã trả |
| `ASSEMBLING` | Bấm Xuất kho giao hàng (Đơn ship có lắp) | `SHIPPING` | MOD-11 | Không di chuyển kho (Linh kiện đã trừ lúc trước) | Bắt buộc phụ phí (nếu có) đã trả |
| `SHIPPING` | Bấm Báo giao thất bại | `DELIVERY_FAILED` | MOD-12 | Không phục hồi tồn kho | Không đổi |
| `DELIVERY_FAILED` | Bấm Hẹn giao lại | `SHIPPING` | MOD-13 | Không đổi tồn kho (Tăng số đếm giao lại) | Áp dụng phụ phí nếu có thỏa thuận |
| `DELIVERY_FAILED` | Bấm Chuyển hoàn về kho | `RETURNING` | MOD-14 | Không đổi tồn kho | Không đổi |
| `RETURNING` | Bấm Xác nhận hàng về kho | `RETURNED_TO_BRANCH` | MOD-15 | Kích hoạt phiếu kho đảo ngược, tăng lại `onHand` | Cho phép thực hiện hủy đơn |
| `SHIPPING` | Bấm Hoàn tất đơn | `COMPLETED` | MOD-16 | Không đổi (Hàng đã trừ lúc xuất kho) | Thu đủ tiền COD nếu còn thiếu |
| `READY_FOR_PICKUP` | Bấm Hoàn tất đơn (Pickup không lắp) | `COMPLETED` | MOD-16 | Giảm `onHand`, giải phóng `reserved` lúc giao máy | Thu đủ tiền COD nếu còn thiếu |
| `READY_FOR_PICKUP` | Bấm Hoàn tất đơn (Pickup có lắp) | `COMPLETED` | MOD-16 | Không đổi (Hàng đã trừ lúc lắp) | Thu đủ tiền COD nếu còn thiếu |
| Bất kỳ trạng thái hợp lệ | Bấm Hủy đơn hàng | `CANCELLED` | MOD-17 | Giải phóng `reserved` nếu chưa xuất kho | Sinh `REFUND_PENDING` nếu có tiền trả trước; giữ cọc PC nếu đã qua soạn hàng |

---

## 6. Thống Kê Tổng Hợp Số Lượng Màn Hình Và Hộp Thoại

| Phân hệ chức năng | Số lượng Màn hình (Routed Pages) | Số lượng Hộp thoại (Modals/Dialogs/Sheets) |
| :--- | :---: | :---: |
| 1. Khung ứng dụng & Bảng điều khiển | 2 (SCR-01, SCR-02) | 0 |
| 2. Danh mục, Sản phẩm & PC dựng sẵn | 6 (SCR-03 đến SCR-08) | 6 (MOD-01 đến MOD-06) |
| 3. Quản lý Đơn hàng & Vận hành | 2 (SCR-09, SCR-10) | 13 (MOD-07 đến MOD-19) |
| 4. Thanh toán, Đối soát & Hoàn tiền | 4 (SCR-11 đến SCR-14) | 2 (MOD-20, MOD-21) |
| 5. Kho hàng, Serial & Điều chuyển | 4 (SCR-15 đến SCR-18) | 6 (MOD-22 đến MOD-27) |
| 6. Mua hàng PO & Nhà cung cấp | 4 (SCR-19 đến SCR-22) | 5 (MOD-28 đến MOD-32) |
| 7. Khuyến mãi, Giảm giá & Biểu phí | 3 (SCR-23 đến SCR-25) | 4 (MOD-33 đến MOD-36) |
| 8. Khách hàng & Hồ sơ Định danh | 2 (SCR-26, SCR-27) | 1 (MOD-37) |
| 9. Kiểm duyệt Đánh giá Sản phẩm | 1 (SCR-28) | 1 (MOD-38) |
| 10. Chi nhánh & Nhật ký Outbox | 2 (SCR-29, SCR-30) | 1 (MOD-39) |
| **Tổng cộng toàn bộ phân hệ Admin** | **30 Màn hình chính** | **39 Hộp thoại / Dialog / Sheet** |

---

## 7. Kiến Trúc Liên Kết Đa Chiều & Luồng Tương Tác Theo Phong Cách Odoo

Nhằm giải quyết triệt để vấn đề phân mảnh trải nghiệm và giúp người vận hành không phải quay về menu chính để tìm kiếm thủ công, hệ thống EL-TECH áp dụng trọn vẹn mô hình tương tác liên kết sâu (Deep Linked Interaction Model) lấy cảm hứng từ nền tảng Odoo.

### 7.1. Bốn Thành Phần Tương Tác Nòng Cốt (Odoo Core UX Patterns)

1. Đường dẫn Ngữ cảnh Động (Dynamic Breadcrumbs):
   - Mọi màn hình chi tiết đều hiển thị đầy đủ chuỗi phân cấp điều hướng ở thanh tiêu đề phía trên.
   - Ví dụ: `Danh mục: Bo mạch chủ / ASUS ROG Maximus Z790 Hero / Biến thể: ROG-Z790-HERO-W (Màu trắng) / Tồn kho chi nhánh`.
   - Mỗi thành phần trên breadcrumb là một liên kết có thể nhấp chuột, giúp người dùng nhảy ngược lại cấp cha ngay lập tức mà không làm mất bộ lọc tìm kiếm đang áp dụng.

2. Hệ thống Nút Thống Kê Thông Minh (Smart Buttons / Stat Buttons):
   - Bố trí ở góc trên bên phải của các màn hình Chi tiết (Form View).
   - Mỗi nút thông minh là một khối thẻ trực quan hiển thị một chỉ số đo lường (KPI Badge) kèm nhãn nghiệp vụ (ví dụ: `28 Sản phẩm`, `14 Tồn kho On-hand`, `3 Đơn hàng`).
   - Khi nhấp vào nút thông minh, hệ thống sẽ mở ra danh sách đối tượng liên quan tương ứng với bộ lọc tự động trỏ về bản ghi hiện tại.

3. Thanh Trạng Thái Tuyến Tính & Nút Tác Vụ Nhanh (Status Bar & Contextual Action Bar):
   - Nằm ngay dưới thanh tiêu đề của màn hình Chi tiết.
   - Bên trái là các nút hành động chính (Action Buttons) được tô màu nổi bật theo chuẩn NVIDIA Green (`#76b900`), chỉ hiển thị các tác vụ hợp lệ tương ứng với trạng thái hiện tại của bản ghi (ví dụ: nút `Chuyển kho`, `Xác nhận COD`, `Bàn giao lắp ráp`, `Xuất kho giao hàng`).
   - Bên phải là dải trạng thái quy trình (Process Status Bar) dạng mũi tên chevron hiển thị trực quan các bước: bước hiện tại được làm nổi bật, các bước đã qua có màu xám đậm, các bước tương lai có màu xám nhạt.

4. Bộ Chuyển Đổi Chế Độ Xem (View Switchers: List View & Kanban View):
   - Nằm ở góc trên bên phải của các màn hình danh sách đối tượng (Catalog, Variants, Orders, Inventory).
   - `List View` (Chế độ xem bảng): hỗ trợ tính năng Gom nhóm (Group By) theo Danh mục, Thương hiệu, Chi nhánh hoặc Trạng thái; hiển thị các dòng tổng cộng số lượng và giá trị tồn kho.
   - `Kanban View` (Chế độ xem thẻ trực quan): hiển thị thẻ card có hình ảnh, giá bán, nhãn biến thể, chỉ báo mức tồn kho bằng màu sắc (xanh khi đủ hàng, cam khi sắp hết, đỏ khi hết hàng), và các nút hành động nhanh (Quick Action Chips) như nút `Chuyển kho ngay`, `Cập nhật giá`, `Đổi trạng thái`.

---

### 7.2. Cấu Hình Nút Thông Minh (Smart Buttons) Trên Từng Màn Hình Form View

#### Trên Form Danh Mục Ngành Hàng (Category Form - SCR-03)
- Smart Button 1 - `Sản phẩm liên kết (Products)`: Hiển thị tổng số mẫu sản phẩm thuộc danh mục này. Nhấp vào sẽ mở `SCR-05` với bộ lọc tự động `categoryId = current`.
- Smart Button 2 - `Tổng tồn kho (On Hand)`: Hiển thị tổng số lượng linh kiện thực tế đang có trong kho của toàn bộ các sản phẩm thuộc danh mục này. Nhấp vào sẽ mở Bảng tồn kho `SCR-15` lọc theo danh mục này.
- Smart Button 3 - `Phiếu điều chuyển kho (Transfers)`: Hiển thị số lượng phiếu điều chuyển kho đang hoạt động có chứa linh kiện thuộc danh mục này. Nhấp vào sẽ mở `SCR-18` lọc theo danh mục.

#### Trên Form Mẫu Sản Phẩm (Product Template Form - SCR-06)
- Smart Button 1 - `Biến thể SKU (Variants)`: Hiển thị số lượng biến thể (ví dụ: `3 SKUs`). Nhấp vào sẽ mở bảng biến thể SKU `SCR-07` lọc theo mẫu sản phẩm này.
- Smart Button 2 - `Tồn kho thực tế (On Hand)`: Hiển thị tổng số lượng tồn kho vật lý của mọi biến thể trên toàn hệ thống. Nhấp vào mở `SCR-15` lọc theo mẫu sản phẩm.
- Smart Button 3 - `Tồn khả dụng (Available)`: Hiển thị số lượng có thể bán ngay (`onHand - reserved - quarantineDamaged`) kèm tooltip phân bổ theo từng chi nhánh (ví dụ: Hà Nội: 2, TP.HCM: 7, Đà Nẵng: 2).
- Smart Button 4 - `Biến động kho (Stock Moves)`: Hiển thị tổng số lượt nhập/xuất/chuyển kho. Nhấp vào sẽ mở Sổ kho bất biến `SCR-16` lọc theo các SKU của sản phẩm này.
- Smart Button 5 - `Lịch sử mua hàng (Purchased)`: Hiển thị số lượng đơn PO đã nhập mẫu hàng này. Nhấp vào mở `SCR-20` lọc theo sản phẩm.
- Smart Button 6 - `Lịch sử bán hàng (Sold)`: Hiển thị số lượng đơn đặt hàng từ khách hàng có chứa mẫu này. Nhấp vào mở `SCR-09` lọc theo sản phẩm.
- Action Button nhanh trên đầu form: Nút `Chuyển kho (Transfer Stock)` -> Mở ngay Modal `MOD-24` tạo lệnh điều chuyển giữa các chi nhánh cho sản phẩm này.

#### Trên Form Đơn Hàng (Order Form - SCR-10)
- Smart Button 1 - `Khách hàng (Customer)`: Hiển thị tên và mã khách hàng. Nhấp vào mở thẳng Hồ sơ khách hàng `SCR-27`.
- Smart Button 2 - `Phiếu kho xuất/giữ (Delivery / Stock Move)`: Hiển thị mã phiếu xuất kho `StockMove` và trạng thái giữ/xuất kho của đơn hàng. Nhấp vào xem chi tiết phiếu kho liên kết.
- Smart Button 3 - `Thanh toán (Payment)`: Hiển thị trạng thái thanh toán (`UNPAID`, `PARTIALLY_PAID`, `PAID`, `REFUND_PENDING`) và số tiền đã nhận. Nhấp vào mở chứng từ thanh toán tại `SCR-11`.
- Smart Button 4 - `Phụ lục đơn hàng (Amendments)`: Hiển thị số lượng phụ lục đổi hình thức giao hàng hoặc hẹn giao lại (`OrderAmendment`). Nhấp vào mở danh sách chi tiết phụ lục.
- Smart Button 5 - `Thông báo Outbox (Notifications)`: Hiển thị số lượng thông báo In-app/Email/SMS đã phát cho đơn hàng này. Nhấp vào mở nhật ký thông báo tại `SCR-30`.

#### Trên Form Đơn Mua Hàng (Purchase Order Form - SCR-21)
- Smart Button 1 - `Nhà cung cấp (Supplier)`: Hiển thị mã và tên nhà cung cấp. Nhấp vào mở danh bạ đối tác `SCR-19`.
- Smart Button 2 - `Phiếu nhập kho (Receipt)`: Hiển thị trạng thái phiếu nhập kho `StockMove` (1 PO tương ứng duy nhất 1 phiếu nhận hàng). Nhấp vào mở giao diện đối soát nhập kho `MOD-30`.
- Smart Button 3 - `Số Serial đã gán (Serials)`: Hiển thị số lượng định danh serial đã nhập từ PO này (ví dụ: `15 Serials`). Nhấp vào mở danh mục serial `SCR-17` lọc theo PO này.
- Smart Button 4 - `PO Thay thế / PO Gốc`: Hiển thị liên kết chéo nếu PO này từng phát sinh thiếu hàng và được tạo tự động để thay thế đơn cũ theo quy tắc `supersedesPurchaseOrderId` (PUR-015).

#### Trên Form Phiếu Điều Chuyển Kho (Branch Transfer Form - SCR-18)
- Smart Button 1 - `Sổ kho biến động (Ledger Entries)`: Hiển thị các bút toán trừ kho nguồn và cộng kho đích. Nhấp vào mở `SCR-16` lọc theo mã phiếu chuyển này.
- Smart Button 2 - `Số Serial di chuyển (Serials in Transit)`: Hiển thị danh sách các con chip/card màn hình cụ thể đang nằm trên đường vận chuyển. Nhấp vào mở `SCR-17`.

#### Trên Form Hồ Sơ Khách Hàng (Customer Profile Form - SCR-27)
- Smart Button 1 - `Đơn hàng đã đặt (Orders)`: Hiển thị tổng số đơn hàng của khách. Nhấp vào mở `SCR-09` lọc theo khách hàng này.
- Smart Button 2 - `Tổng chi tiêu (Total Spent)`: Hiển thị tổng số tiền tích lũy từ các đơn `COMPLETED`.
- Smart Button 3 - `Voucher đã dùng (Coupons)`: Hiển thị số lượng mã giảm giá đã áp dụng. Nhấp vào mở danh sách `CouponRedemption`.
- Smart Button 4 - `Đánh giá sản phẩm (Reviews)`: Hiển thị số bài đánh giá đã gửi. Nhấp vào mở `SCR-28` lọc theo khách hàng này.

---

### 7.3. Chi Tiết Năm Kịch Bản Hành Trình Tương Tác Thực Tế (Operational Scenarios)

#### Kịch bản 1: Từ Xem Danh Mục Ngành Hàng Đến Phiếu Điều Chuyển Kho Tức Thì

Mô tả luồng tương tác thực tế từ khâu kiểm tra danh mục đến khi hoàn tất một phiếu chuyển kho giữa hai chi nhánh:

1. Bước 1 - Xem cây Danh mục:
   - Admin truy cập `SCR-03` (Danh mục ngành hàng).
   - Tìm đến dòng danh mục `Card màn hình (VGA / GPU)`. Trên dòng này hiển thị Smart Badge `42 Mẫu sản phẩm`, `128 Linh kiện tồn kho`.
   - Admin nhấp trực tiếp vào biểu tượng `42 Mẫu sản phẩm`.
2. Bước 2 - Xem danh sách Mẫu sản phẩm theo Danh mục (List & Kanban View):
   - Hệ thống tự động chuyển sang `SCR-05` (Danh sách Mẫu sản phẩm) với bộ lọc áp sẵn `Category = Card màn hình`.
   - Breadcrumb hiển thị: `Danh mục / Card màn hình`.
   - Admin chuyển sang chế độ `Kanban View`. Mỗi thẻ sản phẩm hiển thị hình ảnh card, thương hiệu ASUS/MSI/Gigabyte, khoảng giá và thanh chỉ báo tồn kho.
   - Thấy mẫu `ASUS Dual GeForce RTX 5060 Ti OC 16GB` có thanh chỉ báo tồn kho màu vàng (sắp hết tại một số chi nhánh), Admin nhấp vào thẻ này.
3. Bước 3 - Kiểm tra chi tiết Mẫu sản phẩm & Tồn kho từng Biến thể:
   - Hệ thống điều hướng đến `SCR-06` (Chi tiết Mẫu sản phẩm).
   - Breadcrumb hiển thị: `Danh mục / Card màn hình / ASUS Dual RTX 5060 Ti`.
   - Dải Smart Buttons phía trên hiển thị: `3 Biến thể SKU`, `Tồn On-hand: 14`, `Tồn Khả dụng: 11`. Tooltip chi tiết chỉ rõ: `Hà Nội: 0, TP.HCM: 9, Đà Nẵng: 2`.
   - Admin nhấp vào Smart Button `3 Biến thể SKU` để cuộn xuống bảng biến thể.
   - Nhìn thấy biến thể SKU `ASUS-5060TI-DUAL-O16G-WHT` (Bản màu trắng) tại Chi nhánh Hà Nội đang có tồn khả dụng bằng 0, trong khi tại Kho TP.HCM đang có 9 chiếc.
4. Bước 4 - Kích hoạt Điều chuyển kho ngay tại chỗ:
   - Ngay trên dòng biến thể Bản màu trắng (hoặc bấm nút `Chuyển kho` trên Action Bar đầu trang), Admin nhấp nút tác vụ nhanh `Chuyển kho (Transfer)`.
   - Hộp thoại `MOD-24` (Modal Tạo yêu cầu điều chuyển) bật lên:
     - Hệ thống tự động điền sẵn SKU: `ASUS-5060TI-DUAL-O16G-WHT` - Tên: `ASUS Dual RTX 5060 Ti OC 16GB White`.
     - Admin chọn Chi nhánh nguồn: `Kho TP.HCM` (hệ thống gợi ý sẵn số khả dụng: 9).
     - Admin chọn Chi nhánh đích: `Kho Hà Nội`.
     - Nhập số lượng cần chuyển: `3`.
     - Nhập ghi chú: `Bổ sung hàng cho chi nhánh Hà Nội phục vụ đơn PC Custom`.
     - Bấm nút `Xác nhận tạo phiếu chuyển`.
5. Bước 5 - Chuyển sang Phiếu điều chuyển kho:
   - Modal đóng lại, hệ thống hiển thị thông báo thành công kèm nút bấm nổi bật: `Mở phiếu chuyển kho TRF-202610-0015`.
   - Admin nhấp vào nút này, hệ thống điều hướng thẳng đến `SCR-18` (Chi tiết Phiếu điều chuyển).
   - Breadcrumb hiển thị: `Kho hàng / Điều chuyển / TRF-202610-0015`.
   - Trạng thái phiếu hiện tại là `REQUESTED`.
6. Bước 6 - Xuất kho và Nhận hàng tại chi nhánh đích:
   - Nhân viên tại kho TP.HCM mở phiếu này, bấm nút tác vụ `Xuất kho chuyển hàng (Dispatch)` -> Mở `MOD-25`.
   - Do GPU là linh kiện bắt buộc quản lý số serial (`serialRequired = true`), nhân viên dùng máy quét mã vạch quét đủ 3 số serial thực tế xuất đi.
   - Bấm xác nhận: Phiếu chuyển sang `IN_TRANSIT`, 3 chiếc GPU này lập tức chuyển sang trạng thái serial `IN_TRANSIT` và tồn kho TP.HCM giảm 3 đơn vị.
   - Khi kiện hàng chuyển đến Hà Nội, thủ kho Hà Nội bấm nút `Xác nhận nhận hàng (Receive)` -> Mở `MOD-26`.
   - Bấm xác nhận: Phiếu chuyển sang `RECEIVED`. Tồn kho Hà Nội lập tức tăng từ 0 lên 3 chiếc.
7. Bước 7 - Kiểm tra vết kiểm toán:
   - Ngay tại phiếu chuyển kho đã hoàn thành, Admin bấm vào Smart Button `Sổ kho biến động (Ledger)` -> Hệ thống mở `SCR-16` hiển thị chính xác 2 dòng bút toán đối ứng: 1 dòng `TRANSFER_OUT` tại TP.HCM và 1 dòng `TRANSFER_IN` tại Hà Nội.
   - Nhấp vào Breadcrumb `ASUS Dual RTX 5060 Ti` để quay ngược trở lại trang sản phẩm ban đầu: chỉ số tồn kho khả dụng tại Hà Nội đã tự động cập nhật thành 3 chiếc.

---

#### Kịch bản 2: Từ Tiếp Nhận Đơn Hàng Lắp Ráp PC Đến Thu Tiền COD Và Quyết Toán

1. Tiếp nhận và kiểm tra tồn:
   - Khách đặt một bộ PC Custom chọn nhận tại shop và thanh toán cọc 10% qua QR, phần còn lại thanh toán COD khi nhận máy.
   - Khách thanh toán cọc thành công, đơn hàng tự động chuyển sang `CONFIRMED` tại `SCR-09`.
   - Admin bấm vào đơn hàng để mở `SCR-10` (Chi tiết Đơn hàng).
   - Breadcrumb: `Đơn hàng / ORD-202610-0892`.
   - Dải Smart Buttons hiển thị: `Khách hàng: Nguyễn Văn A`, `Tiền cọc: Đã thu 10% (HELD)`, `Phiếu xuất kho: RESERVED`.
2. Bắt đầu chuẩn bị linh kiện:
   - Admin bấm nút `Soạn hàng` trên Action Bar -> Đơn chuyển sang `PREPARING_COMPONENTS` (`MOD-08`). Khách hàng không thể tự hủy đơn.
3. Bàn giao sang bàn kỹ thuật lắp ráp PC:
   - Admin bấm nút `Chuyển lắp ráp PC` -> Kích hoạt `MOD-09`.
   - Hệ thống tự động thực thi việc trừ tồn kho thực tế `onHand` của toàn bộ các linh kiện CPU, RAM, Mainboard, GPU, Nguồn trong đơn và giải phóng số lượng giữ `reserved` (theo quy tắc ORD-008, INV-019).
   - Đơn chuyển trạng thái sang `ASSEMBLING`. Khách hàng nhận thông báo máy tính đang được lắp ráp.
4. Báo máy sẵn sàng lấy tại cửa hàng:
   - Khi kỹ thuật viên dựng xong máy, Admin bấm nút `Báo sẵn sàng nhận tại shop` -> Kích hoạt `MOD-10`.
   - Đơn chuyển sang `READY_FOR_PICKUP`. Bắt đầu tính thời hạn 14 ngày nhận máy. Linh kiện đã trừ lúc trước nên không có bút toán kho nào bị lặp lại.
5. Khách đến nhận máy và thu tiền COD:
   - Khách hàng đến showroom kiểm tra máy và nhận toàn bộ vỏ hộp linh kiện.
   - Admin bấm nút `Hoàn tất đơn hàng` -> Kích hoạt `MOD-16`.
   - Hộp thoại hiển thị rõ số tiền COD còn phải thu: `90% giá trị đơn hàng`.
   - Admin nhập xác nhận đã thu đủ tiền mặt từ khách.
   - Hệ thống thực hiện nguyên tử:
     - Đơn hàng chuyển sang `COMPLETED`.
     - Trạng thái thanh toán chuyển sang `PAID`.
     - Khoản tiền cọc chuyển từ trạng thái `HELD` sang `APPLIED` (PAY-012, PAY-020).
     - Ghi nhận một bản ghi thu tiền mặt `CodCollection`.
6. Truy vết sau hoàn tất:
   - Bấm vào Smart Button `Thanh toán` -> Mở `SCR-11` xem biên lai thanh toán đã tất toán 100%.
   - Bấm vào Smart Button `Khách hàng` -> Mở `SCR-27` thấy hồ sơ khách hàng đã ghi nhận thêm 1 đơn hoàn tất, quyền viết đánh giá sản phẩm đã được kích hoạt (REV-002).

---

#### Kịch bản 3: Từ Đơn Mua Hàng PO Đến Quét Số Serial Và Tính Lại Giá Vốn Bình Quân

1. Soạn thảo đơn mua hàng:
   - Admin vào `SCR-20` bấm `Tạo đơn mua hàng mới` -> Điều hướng đến `SCR-21`.
   - Breadcrumb: `Mua hàng / PO-202610-0045`.
   - Chọn Nhà cung cấp: `Công ty Phân phối Công nghệ Viễn Sơn`.
   - Chọn Chi nhánh nhận hàng: `Kho TP.HCM`.
   - Thêm dòng hàng: 10 chiếc `Card màn hình ASUS RTX 5060 Ti`, đơn giá thỏa thuận `11.500.000 VND / chiếc`.
   - Bấm nút `Xác nhận đơn PO` -> Kích hoạt `MOD-29`. Đơn chuyển sang `CONFIRMED`.
2. Đối soát và quét Serial nhập kho:
   - Khi xe tải của nhà cung cấp giao hàng đến cửa kho, thủ kho bấm nút `Đối soát nhập kho` -> Mở `MOD-30`.
   - Bảng kiểm đếm yêu cầu đối soát đủ 10 chiếc.
   - Do sản phẩm bắt buộc serial, thủ kho dùng máy quét barcode quét lần lượt 10 mã serial duy nhất dán trên vỏ hộp. Hệ thống tự động kiểm tra tính duy nhất toàn cầu (INV-014), chặn ngay nếu phát hiện số serial đã từng xuất hiện trong hệ thống.
   - Sau khi quét đủ 10 serial hợp lệ, thủ kho bấm `Xác nhận nhập kho`.
3. Tác động nguyên tử của hệ thống:
   - PO chuyển sang trạng thái `RECEIVED`.
   - Phiếu kho `StockMove` chuyển sang `VALIDATED`.
   - Tồn kho `onHand` của SKU tại Kho TP.HCM tăng thêm 10 đơn vị.
   - 10 bản ghi `SerialUnit` được khởi tạo với trạng thái `AVAILABLE` tại Kho TP.HCM.
   - Giá vốn bình quân gia quyền (`weightedAverageCost`) của SKU tại Kho TP.HCM được tính toán lại tự động theo công thức bình quân gia quyền (INV-017, PUR-009).
4. Kiểm tra liên kết Odoo:
   - Ngay trên trang PO, hàng Smart Buttons cập nhật: `1 Phiếu kho (VALIDATED)`, `10 Số Serial (AVAILABLE)`.
   - Bấm vào Smart Button `10 Số Serial` -> Nhảy thẳng sang `SCR-17` hiển thị danh sách 10 số serial vừa nhập kèm vị trí hiện tại là Kho TP.HCM.

---

#### Kịch bản 4: Xử Lý Giao Hàng Thất Bại, Hàng Hoàn Về Kho Và Quyết Toán Cọc

1. Giao hàng thất bại:
   - Đơn hàng giao tận nơi đang ở trạng thái `SHIPPING`. Shipper báo khách không nghe máy sau 3 cuộc gọi.
   - Admin vào `SCR-10`, bấm nút `Báo giao thất bại` -> Kích hoạt `MOD-12`.
   - Nhập lý do: `Khách thuê bao không liên lạc được`. Đơn chuyển sang `DELIVERY_FAILED`. Tồn kho không thay đổi (INV-022).
2. Lên lịch giao lại lần 1:
   - Ngày hôm sau nhân viên liên hệ được với khách, khách xin giao lại vào cuối tuần.
   - Admin bấm nút `Lên lịch hẹn giao lại` -> Kích hoạt `MOD-13`.
   - Kiểm tra `redeliveryAttemptCount = 0 < 2`. Xác nhận giao lại: số đếm tăng lên 1, đơn chuyển lại về `SHIPPING`.
3. Giao hàng thất bại lần 2 và chuyển hoàn:
   - Cuối tuần shipper giao tiếp tục không gặp khách, khách báo bận đi công tác từ chối nhận.
   - Admin vào đơn hàng, bấm `Báo giao thất bại` -> Đơn chuyển sang `DELIVERY_FAILED` (số lần thử đã bằng 1).
   - Admin quyết định không giao lại, bấm nút `Chuyển hoàn về kho` -> Kích hoạt `MOD-14`.
   - Đơn chuyển sang `RETURNING`. Kiện hàng theo đơn vị vận chuyển quay ngược về chi nhánh xuất phát.
4. Xác nhận hàng hoàn về đến kho:
   - Khi kiện hàng về đến kho chi nhánh, thủ kho mở đơn hàng bấm nút `Xác nhận hàng về kho` -> Kích hoạt `MOD-15`.
   - Thủ kho kiểm đếm mở hộp kiểm tra đúng nguyên vẹn linh kiện, quét lại số serial.
   - Bấm hoàn tất: Hệ thống tự động kích hoạt phiếu kho đảo ngược (`linked reverse stock move`), cộng lại tồn kho thực tế `onHand`. Đơn chuyển sang `RETURNED_TO_BRANCH`.
5. Hủy đơn và quyết toán tiền cọc:
   - Sau khi hàng đã hoàn kho thành công, Admin bấm nút `Hủy đơn hàng` -> Kích hoạt `MOD-17`.
   - Đơn hàng chuyển sang `CANCELLED`.
   - Xử lý tiền cọc: Do đây là bộ PC Custom đã bước qua giai đoạn soạn hàng (`PREPARING_COMPONENTS`), toàn bộ khoản tiền cọc 10% bị tịch thu theo quy tắc FQ24/PAY-014, trạng thái cọc chuyển thành `depositDisposition = FORFEITED`.
   - Bấm vào Smart Button `Thanh toán` -> Mở `SCR-11` thấy rõ khoản cọc được ghi nhận tịch thu do khách hủy đơn sau khi đã lắp ráp.

---

#### Kịch bản 5: Xử Lý Ngoại Lệ Giao Dịch QR Lệch Tiền Và Hoàn Tiền Thủ Công

1. Phát sinh giao dịch lệch:
   - Khách đặt đơn linh kiện trị giá `5.200.000 VND`. Khách quét mã VietQR/SePay nhưng lại chuyển nhầm số tiền `5.000.000 VND` (thiếu 200.000 VND).
   - Webhook ngân hàng bắn về với số tiền `5.000.000 VND`. Hệ thống đối soát thấy lệch tiền so với `expectedAmount`.
   - Hệ thống tự động:
     - Dừng đồng hồ đếm ngược 30 phút của mã QR.
     - Giữ nguyên số lượng tồn kho đã khóa (`reserved`) trong tối đa 24 giờ.
     - Chuyển đơn hàng sang `ON_HOLD` với lý do `holdReason = PAYMENT_REVIEW` (PAY-003, FQ25).
     - Đưa bản ghi vào hàng đợi đối soát khẩn cấp tại `SCR-12`.
2. Admin tiếp nhận tại Hàng Đợi Đối Soát:
   - Admin vào Dashboard `SCR-02` thấy cảnh báo `1 Giao dịch QR cần đối soát trong 24 giờ`.
   - Bấm vào cảnh báo -> Hệ thống điều hướng thẳng đến Hàng đợi đối soát `SCR-12`.
   - Bảng hiển thị đơn hàng `ORD-202610-0931`, số tiền thiếu `200.000 VND`, đồng hồ đếm ngược còn `18 giờ 30 phút`.
   - Theo quy tắc nghiệp vụ đã chốt FQ36-A: Hệ thống không có luồng chuyển bổ sung (không tạo QR top-up). Admin liên hệ khách hàng thông báo đơn bị hủy do chuyển sai số tiền và sẽ hoàn trả lại 100% số tiền 5.000.000 VND đã nhận.
3. Kích hoạt hủy đơn và hoàn tiền:
   - Tại `SCR-12`, Admin bấm nút `Hủy đơn và hoàn tiền` -> Kích hoạt `MOD-20`.
   - Hệ thống thực thi:
     - Đơn hàng chuyển sang `CANCELLED` với lý do `PAYMENT_REVIEW_TIMEOUT / INVALID_AMOUNT`.
     - Tồn kho giữ (`reserved`) của các linh kiện lập tức được giải phóng về khả dụng cho khách khác mua.
     - Tạo một bản ghi hoàn tiền mới tại `SCR-13` với số tiền đúng bằng `5.000.000 VND`, trạng thái `REFUND_PENDING`.
4. Thực hiện chuyển khoản hoàn tiền thủ công:
   - Admin vào `SCR-13` (Màn hình Quản lý Hoàn tiền), lọc các lệnh `REFUND_PENDING`.
   - Thấy lệnh hoàn tiền của khách hàng trên, Admin dùng tài khoản ngân hàng công ty chuyển trả 5.000.000 VND về số tài khoản khách đã cung cấp.
   - Chuyển xong, Admin bấm nút `Xác nhận đã hoàn tiền` -> Mở `MOD-21`.
   - Admin nhập mã giao dịch ngân hàng: `FT26295891823120`, ngày giờ thực hiện: `2026-10-22 14:30:00`.
   - Bấm xác nhận: Bản ghi hoàn tiền chuyển sang `CONFIRMED`, trạng thái thanh toán của đơn hàng chính thức chuyển sang `REFUNDED` (PAY-016). Khách hàng nhận được thông báo qua email xác nhận đã hoàn tiền thành công.
