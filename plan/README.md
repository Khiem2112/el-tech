# Kế hoạch triển khai tính năng khách hàng — EL-TECH

## 1. Trạng thái tài liệu

- Trạng thái: `Draft — chờ phê duyệt trước khi triển khai`.
- Phạm vi: toàn bộ trải nghiệm dành cho khách vãng lai và khách có tài khoản trên website bán PC/linh kiện.
- Ngày lập: 2026-10-18.
- Nguồn nghiệp vụ: `.agents/skills/business-logic/` và các quyết định đã chuẩn hóa trong các rule `CUS`, `CAT`, `PCB`, `PRC`, `PRO`, `CHK`, `PAY`, `ORD`, `INV`, `REV`, `NOT`.
- Nguồn kiến trúc: `AGENTS.md`, `TECH_STACK.md`, Angular standalone components, Signals, Reactive Forms + Zod, Spartan UI, Node.js, Prisma và PostgreSQL.

Tài liệu này là kế hoạch triển khai, không phải xác nhận thay đổi nghiệp vụ. Bất kỳ thay đổi nào về actor, tiền, tồn kho, quyền sở hữu, state machine hoặc phạm vi MVP phải đưa đặc tả liên quan về `Draft` và thực hiện QA nghiệp vụ trước khi code.

## 2. Mục tiêu sản phẩm phía khách hàng

Khách có thể hoàn thành trọn vẹn hành trình sau mà không cần kiến thức phần cứng chuyên sâu:

1. Khám phá và tìm đúng linh kiện/PC dựng sẵn.
2. Xem thông số, biến thể, giá, khuyến mãi và khả năng mua.
3. Tự chọn linh kiện tạo Custom Build hoặc mua PC dựng sẵn.
4. Dùng giỏ hàng khi chưa đăng nhập.
5. Checkout bằng email và số điện thoại đã xác minh; đăng nhập là tùy chọn.
6. Chọn giao hàng hoặc nhận tại chi nhánh, QR hoặc COD theo điều kiện đơn.
7. Theo dõi tách biệt trạng thái đơn và trạng thái thanh toán.
8. Hủy đơn khi còn đủ điều kiện, xử lý các ngoại lệ thanh toán/giao nhận, và đánh giá sản phẩm sau khi hoàn tất.

## 3. Nguyên tắc phạm vi bắt buộc

- Guest được duyệt catalog, tìm kiếm, lọc, dùng giỏ và Custom Build mà không đăng nhập (`CUS-001`).
- Better-Auth `User` và hồ sơ nghiệp vụ `Customer` là hai khái niệm khác nhau. Đơn guest vẫn tạo/resolve `Customer` trong transaction tạo đơn (`CUS-005`, `CUS-007`).
- Checkout bắt buộc xác minh độc lập cả email và điện thoại; checkbox “đã xác minh” trong prototype phải được thay bằng OTP thực (`CUS-002`).
- Frontend chỉ hiển thị dự toán. Backend tính lại giá, khuyến mãi, coupon, phí, tồn và chi nhánh trước khi tạo đơn (`PRC-002`, `CHK-004`).
- Giỏ hàng không giữ tồn (`CHK-001`). Một đơn chỉ được cấp phát từ đúng một chi nhánh (`CHK-006`).
- Trạng thái Payment và Order phải hiển thị riêng; không suy diễn cái này từ cái kia (`PAY-005`, `ORD-001`).
- Các thao tác tạo đơn, giữ tồn, dùng coupon, callback thanh toán, hủy đơn và transition phải idempotent.
- UI không được hứa kiểm tra tương thích phần cứng tự động trong MVP (`PCB-006`). Có thể hiển thị ghi chú tư vấn không chặn checkout.

## 4. Ngoài phạm vi MVP

Không đưa các tính năng sau vào backlog triển khai MVP nếu chưa có quyết định nghiệp vụ mới:

- Wishlist/yêu thích, loyalty, marketplace, POS, đa tiền tệ.
- Lưu hoặc chia sẻ Custom Build.
- Tự động kiểm tra socket, BIOS, PSU, kích thước case hoặc số lượng linh kiện.
- Quy trình assembly work order/QC chi tiết.
- Đổi trả khách hàng, RMA, bảo hành trực tuyến.
- Tích hợp hãng vận chuyển, tracking tự động, bản đồ/chi nhánh gần nhất.
- Backorder, giao một đơn từ nhiều chi nhánh, giao từng phần.

## 5. Hiện trạng và khoảng cách cần xử lý

Frontend hiện là prototype đơn trang trong `fe/src/app/app.ts` và `app.html`:

- `app.routes.ts` chưa có route.
- Dữ liệu sản phẩm là mock trong `data/product.data.ts`.
- `CartService` chỉ giữ state trong memory, chưa có opaque cart token hoặc đồng bộ server.
- Catalog, cart drawer, checkout và success nằm chung một component.
- Checkout dùng checkbox giả lập xác minh liên hệ.
- Chưa có trang đăng nhập/đăng ký, chi tiết sản phẩm, PC Builder, tài khoản, tra cứu/theo dõi đơn, review hoặc notification center.
- Backend mới có Prisma schema và seed scripts, chưa có lớp REST API triển khai.

Do đó không mở rộng trực tiếp component gốc. Cần tách shell, routing, feature services và shared UI trước khi phát triển tính năng.

### Khoảng trống dữ liệu đầu vào

- Dự án không có `PRODUCT.md`, trong khi skill lập flow tham chiếu tài liệu này. Kế hoạch dùng `AGENTS.md`, `TECH_STACK.md`, Prisma schema và bộ business-rule đã duyệt làm nguồn thay thế.
- Chưa có dữ liệu nghiên cứu người dùng, funnel, search log, tỷ lệ rớt checkout hoặc support tickets. Vì vậy thứ tự ưu tiên dựa trên dependency nghiệp vụ/rủi ro, chưa phải kết luận định lượng về hành vi khách.
- Chưa có service/API implementation để xác minh latency, provider OTP/payment và khả năng gửi email/SMS. Loading threshold và retry policy trong kế hoạch là baseline cần kiểm chứng ở staging.
- Hai quyết định còn cần chốt trước implementation là liên kết User–Customer sau guest purchase và notification preference có thuộc MVP hay không.

## 6. Bộ tài liệu trong thư mục này

- `01-information-architecture.md`: sitemap, route, điều hướng, shell responsive và danh mục modal/sheet.
- `02-auth-and-identity.md`: đăng nhập, đăng ký, khôi phục mật khẩu, xác minh liên hệ và guest order access.
- `03-catalog-and-pc-shopping.md`: trang chủ, catalog, tìm kiếm/lọc, chi tiết sản phẩm, so sánh, PC dựng sẵn và Custom Build.
- `04-cart-checkout-payment.md`: giỏ hàng, coupon, checkout, chi nhánh, QR/COD, lỗi giá/tồn và kết quả đặt hàng.
- `05-orders-account-reviews.md`: tra cứu đơn, lịch sử đơn, chi tiết/tracking, hủy đơn, hồ sơ, thông báo và đánh giá.
- `06-delivery-roadmap.md`: thứ tự triển khai, dependency, kiểm thử và tiêu chí hoàn thành.
- `07-cross-cutting-contracts.md`: state dùng chung, lỗi, loading/empty, accessibility, analytics và hợp đồng FE–BE.

## 7. Quy ước mô tả giao diện

Mỗi chức năng trong các file chi tiết phải có:

- Actor và điều kiện truy cập.
- Route hoặc điểm mở.
- Mục tiêu của màn hình.
- Cấu trúc trang theo thứ tự từ trên xuống.
- Modal/sheet/popover liên quan và điều kiện mở.
- Trạng thái loading, empty, error, stale và success.
- Quy tắc nghiệp vụ/rule ID liên quan.
- Tiêu chí nghiệm thu quan sát được.

Quy ước chọn bề mặt:

- Routed page: luồng nhiều bước, cần URL ổn định, nhiều hơn 8–10 trường hoặc cần deep link.
- Dialog: thao tác nguyên tử tối đa khoảng 4–5 trường, xác nhận hoặc OTP.
- Sheet/drawer: giỏ hàng, bộ lọc mobile, notification center hoặc xem nhanh trong khi giữ ngữ cảnh trang hiện tại.
- Popover: gợi ý tìm kiếm, chọn nhanh biến thể, account menu; không chứa luồng nghiệp vụ dài.

## 8. Cổng phê duyệt

Trước khi bắt đầu Phase 1, chủ dự án cần xác nhận:

- Sitemap và tên route.
- Danh mục tính năng MVP/out-of-scope.
- Cấu trúc checkout 4 bước và cơ chế OTP hai kênh.
- Cách liên kết tài khoản Better-Auth với Customer đã từng mua guest.
- Bộ trạng thái/CTA khách hàng nhìn thấy trên trang theo dõi đơn.

Sau khi được duyệt, cập nhật phần này thành:

- Trạng thái: `Approved`.
- Người duyệt: `<tên>`.
- Ngày duyệt: `<yyyy-mm-dd>`.
