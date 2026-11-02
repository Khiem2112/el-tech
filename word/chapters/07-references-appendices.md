# TÀI LIỆU THAM KHẢO VÀ PHỤ LỤC

## TÀI LIỆU THAM KHẢO

Tài liệu tham khảo được trình bày và sắp xếp theo quy chuẩn của Hiệp hội Tâm lý học Hoa Kỳ (American Psychological Association - APA 7th Edition), phân chia thành hai nhóm: Tài liệu tiếng Việt và Tài liệu tiếng Anh.

### Tài liệu tiếng Việt

1. Đỗ Trung Tuấn. (2018). *Giáo trình Phân tích và Thiết kế Hệ thống Thông tin*. Nhà xuất bản Đại học Quốc gia Hà Nội.
2. Nguyễn Văn Vỵ. (2017). *Phân tích Thiết kế Hệ thống Thông tin Quản lý*. Nhà xuất bản Thống kê.
3. Trần Đình Quế, & Nguyễn Trí Thành. (2019). *Cơ sở Dữ liệu Quan hệ và Công nghệ Web*. Nhà xuất bản Thông tin và Truyền thông.
4. Đoàn Văn Ban. (2020). *Giáo trình Công nghệ Phần mềm*. Nhà xuất bản Bách Khoa Hà Nội.

### Tài liệu tiếng Anh

5. Angular Development Team. (2024). *Angular documentation: Signals, reactive primitives, and standalone components*. Google LLC. https://angular.dev/
6. Bass, L., Clements, P., & Kazman, R. (2021). *Software architecture in practice* (4th ed.). Addison-Wesley Professional.
7. Evans, E. (2003). *Domain-driven design: Tackling complexity in the heart of software*. Addison-Wesley Professional.
8. Fowler, M. (2002). *Patterns of enterprise application architecture*. Addison-Wesley Professional.
9. Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (1994). *Design patterns: Elements of reusable object-oriented software*. Addison-Wesley.
10. Kleppmann, M. (2017). *Designing data-intensive applications: The big ideas behind reliable, scalable, and maintainable systems*. O'Reilly Media.
11. Object Management Group. (2013). *Business Process Model and Notation (BPMN) version 2.0.2*. OMG Document Number: formal/2013-12-09. https://www.omg.org/spec/BPMN/2.0.2/
12. Prisma Data Inc. (2024). *Prisma ORM documentation: Schema definition, relational modeling, and transactional consistency*. https://www.prisma.io/docs
13. Richardson, C. (2018). *Microservices patterns: With examples in Java*. Manning Publications.
14. Tailwind Labs Inc. (2024). *Tailwind CSS: Utility-first CSS framework documentation*. https://tailwindcss.com/docs
15. World Wide Web Consortium. (2018). *Web Content Accessibility Guidelines (WCAG) 2.1*. W3C Recommendation. https://www.w3.org/TR/WCAG21/

---

## PHỤ LỤC

### Phụ lục A: Danh mục API RESTful toàn hệ thống

Bảng dưới đây tổng hợp các điểm cuối giao tiếp API (Endpoints) chính giữa Frontend và Backend của nền tảng EL-TECH.

| Phương thức HTTP | Điểm cuối URL (Endpoint) | Chức năng nghiệp vụ | Phân quyền truy cập |
| :--- | :--- | :--- | :--- |
| `GET` | `/v1/catalog/categories` | Lấy danh sách cây ngành hàng linh kiện | Công khai (Public) |
| `GET` | `/v1/catalog/brands` | Lấy danh sách các thương hiệu phần cứng | Công khai (Public) |
| `GET` | `/v1/catalog/products` | Lấy danh sách linh kiện kèm bộ lọc và phân trang | Công khai (Public) |
| `GET` | `/v1/catalog/products/:category/:slug` | Lấy thông tin chi tiết một linh kiện và các SKU | Công khai (Public) |
| `GET` | `/v1/catalog/pc-bundles` | Lấy danh sách các bộ PC dựng sẵn (định mức linh kiện ảo (Virtual BOM)) | Công khai (Public) |
| `POST` | `/v1/catalog/pc-builds/preview` | Tính toán giá và kiểm tra tương thích cấu hình PC | Công khai (Public) |
| `GET` | `/v1/reviews/:skuId` | Lấy danh sách đánh giá nhận xét của một linh kiện | Công khai (Public) |
| `POST` | `/v1/reviews` | Gửi đánh giá tự do cho linh kiện (Không bắt buộc mua) | Công khai (Public) |
| `POST` | `/v1/checkout/orders` | Tạo đơn hàng mới (Chế độ khách vãng lai hoặc tài khoản) | Công khai (Public) |
| `POST` | `/v1/orders/lookup/request-otp` | Gửi yêu cầu nhận mã OTP tra cứu đơn hàng vãng lai | Khách vãng lai (Guest) |
| `POST` | `/v1/orders/lookup/verify-otp` | Xác thực mã OTP và lấy thông tin chi tiết đơn hàng | Khách vãng lai (Guest) |
| `GET` | `/v1/orders/kanban` | Lấy dữ liệu tiến độ đơn hàng trên thanh tiến trình | Công khai (Public) |
| `POST` | `/v1/complaints` | Gửi biểu mẫu tiếp nhận khiếu nại chất lượng hàng hóa | Công khai (Public) |
| `POST` | `/v1/auth/sign-in` | Đăng nhập tài khoản khách hàng thành viên | Công khai (Public) |
| `POST` | `/v1/auth/sign-up` | Đăng ký tài khoản khách hàng thành viên mới | Công khai (Public) |
| `GET` | `/v1/profile/orders` | Lấy lịch sử các đơn hàng do tài khoản sở hữu | Đã đăng nhập (Member) |
| `POST` | `/v1/admin/auth/login` | Đăng nhập quản trị viên hệ thống | Quản trị viên (Admin) |
| `GET` | `/v1/admin/bảng tổng quan` | Lấy số liệu thống kê doanh thu và cảnh báo tồn kho | Quản trị viên (Admin) |
| `GET/POST` | `/v1/admin/categories` | Quản lý thêm, sửa, xem danh mục ngành hàng | Quản trị viên (Admin) |
| `GET/POST` | `/v1/admin/brands` | Quản lý thêm, sửa, xem danh sách thương hiệu | Quản trị viên (Admin) |
| `GET/POST` | `/v1/admin/product-templates` | Quản lý mẫu sản phẩm và biến thể SKU | Quản trị viên (Admin) |
| `GET/POST` | `/v1/admin/pc-bundles` | Quản lý định nghĩa cấu hình và BOM bộ PC dựng sẵn | Quản trị viên (Admin) |
| `GET/PATCH` | `/v1/admin/orders` | Quản lý danh sách và cập nhật trạng thái đơn hàng | Quản trị viên (Admin) |
| `GET` | `/v1/admin/inventory/balances` | Xem số dư tồn kho (On-hand, Reserved, Available) | Quản trị viên (Admin) |
| `GET` | `/v1/admin/inventory/ledger` | Xem chi tiết lịch sử các bút toán trong Sổ kho | Quản trị viên (Admin) |
| `GET/POST` | `/v1/admin/purchase-orders` | Tạo và xác nhận nhập kho đơn hàng mua từ NCC | Quản trị viên (Admin) |
| `GET/PATCH` | `/v1/admin/reviews` | Xem hòm thư tiếp nhận đánh giá và khiếu nại | Quản trị viên (Admin) |
| `GET/POST` | `/v1/admin/promotions` | Cấu hình chương trình giảm giá và mã Coupon | Quản trị viên (Admin) |
| `GET/POST` | `/v1/admin/delivery-fees` | Cấu hình biểu phí vận chuyển theo khoảng cách | Quản trị viên (Admin) |

### Phụ lục B: Cấu trúc cơ sở dữ liệu lược đồ Prisma

Lược đồ cơ sở dữ liệu `be/prisma/schema.prisma` quản lý tổng cộng 43 bảng mô hình. Bảng dưới đây tóm tắt các mô hình dữ liệu cốt lõi nhất của hệ thống:

| Tên Mô hình Prisma | Tên Bảng SQL tương ứng | Ý nghĩa kỹ thuật và nghiệp vụ |
| :--- | :--- | :--- |
| `Category` | `categories` | Cây phân cấp ngành hàng linh kiện (CPU, VGA, RAM...) |
| `Brand` | `brands` | Thương hiệu sản xuất linh kiện chính hãng |
| `ProductTemplate` | `product_templates` | Mẫu sản phẩm tổng quát chứa thông số chung |
| `ProductVariant` | `product_variants` | Biến thể cụ thể gắn mã SKU duy nhất và giá niêm yết |
| `ProductMedia` | `product_media` | Thư viện hình ảnh của mẫu sản phẩm và biến thể |
| `PcBundle` | `pc_bundles` | Gói máy tính dựng sẵn được cấu hình từ các linh kiện rời |
| `PcBundleItem` | `pc_bundle_items` | Danh mục phụ tùng thành phần tạo nên bộ PC (BOM) |
| `StockQuant` | `stock_quants` | Bảng quản lý số dư tồn kho tức thời tại kho tổng |
| `StockMove` | `stock_moves` | Lệnh chuyển dịch kho hàng cho từng dòng SKU |
| `StockLedgerEntry` | `stock_ledger_entries` | Bút toán bất biến ghi nhận thay đổi số lượng trong Sổ kho |
| `SerialUnit` | `serial_units` | Quản lý số Serial Number cho từng linh kiện vật lý |
| `Supplier` | `suppliers` | Danh bạ các nhà phân phối cung cấp linh kiện phần cứng |
| `PurchaseOrder` | `purchase_orders` | Đơn đặt hàng nhập kho với nhà cung cấp |
| `PurchaseOrderItem`| `purchase_order_items` | Chi tiết số lượng và giá nhập thỏa thuận trong đơn PO |
| `Order` | `orders` | Đơn đặt hàng của khách hàng với 9 trạng thái giao dịch |
| `OrderItem` | `order_items` | Chi tiết các linh kiện hoặc gói PC trong đơn hàng |
| `Payment` | `payments` | Giao dịch thanh toán (VietQR hoặc COD 100%) |
| `Review` | `reviews` | Đánh giá nhận xét sản phẩm công khai của cộng đồng |
| `User` | `users` | Tài khoản người dùng (Khách hàng thành viên và Quản trị) |
| `Session` | `sessions` | Phiên làm việc bảo mật của người dùng đăng nhập |
| `ProductPromotion` | `product_promotions` | Chương trình chiết khấu hạ giá sản phẩm |
| `Coupon` | `coupons` | Mã phiếu mua hàng giảm giá có giới hạn số lần |
| `DeliveryFeeRule` | `delivery_fee_rules` | Quy tắc tính cước vận chuyển và chính sách Freeship |

### Phụ lục C: Hướng dẫn cài đặt và cấu hình môi trường

Nhằm hỗ trợ quá trình nghiệm thu và kiểm thử độc lập, phần này trình bày chi tiết các bước thiết lập và khởi chạy toàn bộ nền tảng EL-TECH trên môi trường máy trạm cục bộ.

#### Yêu cầu phần mềm tiên quyết
- Môi trường thực thi Node.js: Phiên bản v20.x trở lên (khuyến nghị Node.js v22.x LTS).
- Trình quản lý gói: npm phiên bản v10.x trở lên.
- Hệ quản trị cơ sở dữ liệu: PostgreSQL phiên bản v15.x trở lên (hoặc kết nối đám mây thông qua dịch vụ Supabase).
- Trình duyệt web hiện đại: Google Chrome, Microsoft Edge hoặc Mozilla Firefox phiên bản mới nhất.

#### Thiết lập cấu hình biến môi trường
Tạo tệp cấu hình `.env` tại thư mục gốc của phân hệ Backend (`be/.env`) với các tham số mẫu:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres_password@localhost:5432/eltech_db?schema=public"
CORS_ORIGIN="http://localhost:4200"
JWT_SECRET="el_tech_secret_key_development_only_2026"
```

Tạo tệp cấu hình `.env` hoặc cập nhật `environment.ts` tại phân hệ Frontend (`fe/src/environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/v1',
  adminApiUrl: 'http://localhost:3000/v1/admin',
};
```

#### Các lệnh khởi chạy hệ thống
Cài đặt phụ thuộc cho toàn bộ dự án từ thư mục gốc:
```bash
npm install
```

Khởi tạo và đồng bộ cấu trúc cơ sở dữ liệu Prisma:
```bash
cd be
npx prisma generate
npx prisma db push
node prisma/seed.js
```

Khởi chạy đồng thời cả hai phân hệ dịch vụ:
- Khởi chạy Backend Express API (cổng 3000):
```bash
npm run dev:be
```
- Khởi chạy Frontend Angular (cổng 4200):
```bash
npm run dev:fe
```

Sau khi hoàn tất, mở trình duyệt và truy cập:
- Phân hệ kênh bán hàng trực tuyến dành cho khách hàng: `http://localhost:4200/`
- Phân hệ Quản trị cổng quản trị: `http://localhost:4200/admin/bảng tổng quan` (đăng nhập bằng tài khoản quản trị mặc định: `admin@eltech.vn`).

