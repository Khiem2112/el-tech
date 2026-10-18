# 01 — Kiến trúc thông tin, route và shell khách hàng

## 1. Mô hình điều hướng

Website dùng `top navigation + content`, phù hợp storefront có catalog sâu. Checkout là focused flow nên ẩn mega-menu, chỉ giữ logo, nhãn “Thanh toán an toàn” và lối quay lại giỏ. Khu vực tài khoản dùng secondary navigation bên trái trên desktop và danh sách drill-down trên mobile.

### Header desktop

Thứ tự trái sang phải:

1. Logo EL-TECH về trang chủ.
2. `Sản phẩm` mở mega-menu theo cây Category.
3. `PC dựng sẵn`.
4. `Tự lắp PC`.
5. `Theo dõi đơn`.
6. Ô tìm kiếm toàn cục.
7. Notification icon khi có session được phép xem.
8. Account entry: `Đăng nhập` hoặc avatar menu.
9. Giỏ hàng kèm số lượng.

Mega-menu mở bằng click/tap, không phụ thuộc hover; đóng bằng Escape, click ngoài hoặc chọn item. Category có từ ba cấp trở lên dùng breadcrumb ở trang listing/detail.

### Header mobile

- App bar: menu, logo, search, cart.
- Bottom navigation tối đa 5 mục: `Trang chủ`, `Sản phẩm`, `Lắp PC`, `Đơn hàng`, `Tài khoản`.
- Mega-menu chuyển thành navigation drawer theo cây category.
- Search mở full-screen overlay có history entry; nút Back đóng search trước khi rời trang.
- Checkout ẩn bottom navigation.

### Footer

- Mua hàng: sản phẩm, PC dựng sẵn, tự lắp PC, tra cứu đơn.
- Hỗ trợ: hướng dẫn mua hàng, thanh toán, giao/nhận hàng, liên hệ.
- Chính sách: điều khoản, riêng tư, bảo hành (chỉ nội dung; không tạo flow RMA).
- Cửa hàng: danh sách địa chỉ và giờ mở cửa; không có bản đồ/nearest branch trong MVP.

## 2. Sitemap và route đề xuất

### Public storefront

- `/` — Trang chủ.
- `/san-pham` — Toàn bộ catalog.
- `/san-pham/:categorySlug` — Listing theo category.
- `/san-pham/:categorySlug/:productSlug` — Product Template detail, chọn Variant/SKU.
- `/tim-kiem?q=` — Kết quả tìm kiếm có URL giữ query/filter/sort.
- `/so-sanh?sku=` — So sánh các SKU cùng nhóm thông số.
- `/pc-dung-san` — Danh sách prebuilt PC.
- `/pc-dung-san/:slug` — Chi tiết BOM và lựa chọn dịch vụ lắp ráp.
- `/tu-lap-pc` — Custom Build wizard theo phiên làm việc hiện tại.
- `/gio-hang` — Giỏ hàng đầy đủ; cart drawer là entry nhanh desktop.

### Checkout và thanh toán

- `/thanh-toan/lien-he` — Xác minh email/điện thoại và người nhận.
- `/thanh-toan/nhan-hang` — Delivery hoặc pickup.
- `/thanh-toan/thanh-toan` — Chọn QR/COD hợp lệ.
- `/thanh-toan/xac-nhan` — Review bản tính server và đặt đơn.
- `/thanh-toan/:orderCode/qr` — QR cố định, số tiền cố định, countdown.
- `/dat-hang/:orderCode/thanh-cong` — Confirmation/next steps.

Mọi step checkout kiểm tra checkout session. Truy cập thẳng step sau khi thiếu dữ liệu phải chuyển về step sớm nhất chưa hoàn tất; Browser Back giữ toàn bộ dữ liệu đã nhập.

### Guest order access

- `/tra-cuu-don` — Nhập mã đơn và chọn email/phone nhận OTP.
- `/tra-cuu-don/xac-thuc` — OTP; không lộ thông tin đơn trước khi xác minh.
- `/don-hang/:orderCode` — Chi tiết đơn trong guest session bị giới hạn hoặc account session hợp lệ.

### Authentication

- `/dang-nhap`.
- `/dang-ky`.
- `/quen-mat-khau`.
- `/dat-lai-mat-khau`.
- `/xac-minh-email`.

### Account

- `/tai-khoan` — Tổng quan hồ sơ.
- `/tai-khoan/don-hang` — Lịch sử đơn.
- `/tai-khoan/thong-bao` — In-app notifications.
- `/tai-khoan/ho-so` — Tên và thông tin liên hệ.
- `/tai-khoan/bao-mat` — Mật khẩu và session.
- `/tai-khoan/tuy-chon-thong-bao` — Kênh theo nhóm sự kiện nếu backend hỗ trợ preference.

Không tạo route wishlist, saved build, return/RMA hay saved addresses trong MVP.

### Cửa hàng, hỗ trợ và nội dung chính sách

- `/cua-hang` — Danh sách chi nhánh, địa chỉ, giờ mở cửa và thông tin liên hệ; không có bản đồ/nearest-store.
- `/huong-dan-mua-hang` — Hướng dẫn guest/account, QR/COD, pickup/delivery và cách tra cứu đơn.
- `/ho-tro` — Các kênh hỗ trợ và FAQ; MVP không tạo ticket/chat workflow nếu chưa có nghiệp vụ.
- `/lien-he` — Hotline, email, giờ hỗ trợ và link tới chi nhánh.
- `/chinh-sach/thanh-toan`, `/chinh-sach/giao-nhan`, `/chinh-sach/bao-hanh`, `/chinh-sach/rieng-tu`, `/dieu-khoan` — Trang nội dung có version/effective date nếu đội pháp lý cung cấp.

Cấu trúc các trang nội dung: breadcrumb, H1, mô tả ngắn, mục lục anchor ở desktop/collapsible trên mobile, nội dung tối đa 65–75 ký tự mỗi dòng, “Cập nhật lần cuối”, CTA hỗ trợ liên quan. Trang bảo hành chỉ mô tả chính sách và kênh liên hệ, không tạo flow return/RMA trực tuyến ngoài scope.

## 3. Cấu trúc các shell

### Storefront shell

- System banner: mất mạng/sự cố dịch vụ nếu có.
- Sticky header 56–64px.
- Breadcrumb trực tiếp dưới header cho depth từ 3.
- Main content max 1280–1440px; catalog có thể full-width trong giới hạn này.
- Footer đầy đủ.
- Cart drawer trên desktop; mobile ưu tiên `/gio-hang` full screen.

### Checkout shell

- Compact header: logo, “Thanh toán an toàn”, nút quay lại giỏ.
- Main 2 cột desktop: form 640–720px và order summary 360–400px sticky.
- Tablet/mobile: một cột; order summary thành collapsible section; CTA nằm trong sticky bottom action bar.
- Step text rõ ràng, không phụ thuộc progress bar: `Bước 2/4 — Nhận hàng`.
- Không có footer dài hoặc navigation gây thoát flow.

### Account shell

- Desktop: sidebar 240–280px + content 640–960px.
- Mobile: `/tai-khoan` là danh sách nhóm; mỗi mục push sang route con.
- Nhóm: `Bạn`, `Đơn hàng`, `Thông báo`, `Bảo mật`.
- Không có danger zone xóa Customer trong MVP cho tới khi nghiệp vụ retention/merge được phê duyệt.

## 4. Danh mục modal, sheet, popover

### Global

- `SearchOverlay`: full-screen mobile; từ khóa, gợi ý category/product, recent searches, trạng thái không kết quả.
- `CategoryDrawer`: cây danh mục mobile.
- `CartDrawer`: sản phẩm, số lượng, tạm tính, cảnh báo giá/tồn chỉ là dự tính, CTA xem giỏ/checkout.
- `AccountMenuPopover`: hồ sơ, đơn hàng, thông báo, đăng xuất.
- `NotificationSheet`: tối đa các thông báo gần đây và link “Xem tất cả”. Chỉ mở khi session sở hữu dữ liệu.
- `BranchDetailSheet`: địa chỉ, giờ mở cửa, hotline và availability context; không có bản đồ hoặc nút “chi nhánh gần nhất”.

### Catalog

- `MobileFilterSheet`: filter theo specification schema của category, applied count, reset và apply.
- `VariantPickerDialog`: chỉ dùng khi add-to-cart từ listing cần chọn SKU; nếu nhiều thông tin thì điều hướng product detail.
- `CompareLimitDialog`: giải thích giới hạn so sánh và cho thay một SKU hiện tại.
- `AddToCartResult`: ưu tiên toast có `Xem giỏ`, không dùng modal chặn.

### Identity

- `ContactOtpDialog`: một contact mỗi lần, mã OTP, resend countdown, đổi contact; checkout gọi tuần tự email rồi phone.
- `SessionExpiredDialog`: đăng nhập lại tại chỗ, giữ nguyên checkout/profile form.
- `IdentityConflictDialog`: task-blocking, giải thích email và phone thuộc hai hồ sơ khác nhau, không cho merge tự động; CTA liên hệ hỗ trợ/quay lại sửa.

### Checkout/payment

- `CouponDialog` trên mobile hoặc inline box desktop: code, trạng thái eligibility, allocation summary.
- `PriceChangedDialog`: hiển thị bản cũ và bản server mới; CTA `Chấp nhận giá mới` hoặc `Quay lại giỏ`.
- `StockChangedDialog`: line bị thiếu/không còn bán; không tự thay thế; CTA sửa giỏ.
- `LeaveCheckoutDialog`: chỉ hiện khi dữ liệu dirty có nguy cơ mất; lựa chọn ở lại/rời.
- `QrExpiredDialog`: đơn đã cancel do timeout, reservation/coupon đã release; CTA quay về giỏ hoặc xem đơn.
- `PaymentReviewDialog`: không cho trả thêm; giải thích đang được kiểm tra thủ công.

### Order/review

- `CancelOrderDialog`: tên/mã đơn, trạng thái hiện tại, hậu quả refund/deposit, lý do, CTA an toàn được focus mặc định.
- `CancelNotAllowedDialog`: từ `PREPARING_COMPONENTS` trở đi chỉ giải thích và đưa kênh hỗ trợ; không gửi lệnh hủy.
- `AmendmentAcceptanceDialog`: xem địa chỉ mới, phí bổ sung, payment consequence trước khi chấp nhận.
- `ReviewDialog`: rating, nội dung, sản phẩm/order line đã xác minh; dùng create/edit mode.
- `ReviewHistorySheet`: lịch sử chỉnh sửa review nếu cần hiển thị cho khách.

## 5. Quy tắc navigation và history

- Filter, sort, page và compare selection phản ánh trong URL khi có thể.
- Sau login/checkout thành công dùng replace navigation để Back không resubmit.
- Deep link cần auth lưu `returnUrl` và quay lại đúng trang sau login.
- Dialog nhỏ không tạo history; full-screen search/filter mobile tạo history để Back đóng overlay.
- Page title trùng label navigation; breadcrumb hiện current page dưới dạng text, không self-link.

## 6. Trạng thái toàn cục

- Shell render ngay; content dùng skeleton đúng hình dạng, không full-page spinner.
- Offline: banner persistent, catalog cache có thể đọc; checkout submission/payment không optimistic.
- 404 giữ header, search và link về catalog/tra cứu đơn.
- 500 có reference ID, retry và cam kết dữ liệu hiện có không bị xóa nếu đúng.
- Access denied không được giả thành empty state.

## 7. Tiêu chí nghiệm thu IA

- Mọi tính năng MVP có đúng một route/entry chính và một đường quay lại rõ ràng.
- Không có quá 7 mục top navigation desktop hoặc 5 tab mobile.
- Mọi product/category/order có deep link ổn định.
- Checkout không mất dữ liệu khi Back giữa các bước.
- Không route/modal nào quảng bá tính năng ngoài scope.
- Keyboard có skip-to-content, focus visible và Escape đóng đúng overlay.
