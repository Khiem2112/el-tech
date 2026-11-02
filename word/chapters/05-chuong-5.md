# CHƯƠNG 5. THIẾT KẾ GIAO DIỆN UI/UX VÀ HIỆN THỰC WEBSITE

Chương 5 trình bày toàn diện quá trình chuyển giao từ mô hình phân tích, đặc tả kiến trúc dữ liệu và quy trình nghiệp vụ sang không gian giao diện người dùng tương tác trực quan (UI/UX) của nền tảng thương mại điện tử EL-TECH. Mục tiêu cốt lõi của chương là chứng minh tính khả thi kỹ thuật và sự mạch lạc trong trải nghiệm khách hàng thông qua hệ thống nhận diện thương hiệu công nghệ, sitemap điều hướng tối ưu hóa cho mô hình một cửa hàng vật lý kiêm kho tổng, cùng hệ thống giao diện thực tế đã được lập trình và vận hành trên môi trường trình duyệt.

Hệ thống giao diện được phân tách thành hai phân hệ độc lập: phân hệ giao diện khách hàng phục vụ người mua hàng cá nhân và phân hệ quản trị phục vụ vận hành quản trị nội bộ. Toàn bộ các màn hình hiển thị trong chương được đối chiếu trực tiếp giữa thiết kế mục tiêu và ảnh chụp giao diện thực tế thu thập từ ứng dụng đang chạy ở cổng mặc định (Frontend tại localhost:4200 và Backend tại localhost:3000), đồng thời công khai chỉ rõ các giới hạn triển khai và trạng thái hoàn thiện tính đến thời điểm hiện tại.

## 5.1. Bộ nhận diện và thiết kế thương hiệu EL-TECH

Thiết kế thương hiệu EL-TECH được xây dựng nhằm phản ánh bản sắc kỹ thuật cao cấp, hiệu năng mạnh mẽ và tính chuẩn xác của ngành bán lẻ linh kiện máy tính và máy tính dựng sẵn chuyên nghiệp. Thay vì sử dụng phong cách thương mại tiêu dùng đại trà, ngôn ngữ thiết kế của EL-TECH lấy cảm hứng từ nhận diện thương hiệu công nghệ phần cứng hàng đầu (đặc trưng bởi sắc xanh NVIDIA High-Contrast Neon Green trên nền tối màu đá đen trầm), mang lại sự tin cậy về chuyên môn kỹ thuật và cảm giác phấn khích thị giác cho cộng đồng đam mê phần cứng PC (những người đam mê phần cứng máy tính).

Hệ thống nhận diện cốt lõi bao gồm logo biểu trưng với ký tự EL lồng ghép góc cạnh mạch điện cách điệu, kết hợp typography kiểu chữ không chân hiện đại (Inter và Roboto Sans) giúp tối ưu hóa khả năng đọc thông số kỹ thuật dày đặc trên màn hình độ phân giải cao. Màu chủ đạo (Màu chủ đạo nhấn mạnh) được thiết lập cố định ở mã màu lục neon `#76B900` (NVIDIA Green) kết hợp màu xanh ngọc bổ trợ `#10B981` (Emerald Tech), nổi bật trên nền giao diện tối màu sâu thẳm gồm Slate Dark `#0B0F19` cho nền ứng dụng tổng thể và màu xanh biển thẫm `#111827` cho các khối card giao diện, viền ngăn cách đạt chuẩn tương phản cao `#1F2937`.

![Hình 5.1.1. Bộ nhận diện EL-TECH và quy chuẩn màu](drawio/hinh-5-1-1-brand-guideline.png)

*Hình 5.1.1. Bộ nhận diện EL-TECH và quy chuẩn màu*

Quy chuẩn màu sắc thể hiện trên Hình 5.1.1 tuân thủ nghiêm ngặt chuẩn tiếp cận thị giác Web Content Accessibility Guidelines (WCAG 2.1 AA). Đối với văn bản hiển thị trên nền tối, hệ thống áp dụng màu trắng ngọc `#F9FAFB` cho tiêu đề và các thông số kỹ thuật then chốt nhằm đạt tỷ lệ tương phản tối thiểu 12.5:1, vượt xa yêu cầu 4.5:1 của tiêu chuẩn chuẩn hóa. Các nhãn phụ và thông tin hỗ trợ sử dụng màu xám sáng `#9CA3AF` đạt tỷ lệ tương phản 6.2:1, hạn chế tối đa hiện tượng mỏi mắt cho người dùng khi xem danh mục sản phẩm trong thời gian dài.

Màu sắc trạng thái nghiệp vụ được chuẩn hóa nhằm hỗ trợ phân biệt tức thời các giai đoạn giao dịch: màu xanh lá `#22C55E` biểu thị trạng thái hoàn tất hoặc linh kiện còn hàng, màu cam hổ phách `#F59E0B` cảnh báo trạng thái xử lý tạm dừng hoặc cảnh báo tương thích phần cứng, màu xanh dương `#3B82F6` biểu thị quá trình trung chuyển giao hàng, và màu đỏ thẫm `#EF4444` chỉ định tình trạng từ chối, hết hàng hoặc hủy đơn. Sự phân tầng màu sắc chức năng này loại bỏ sự phụ thuộc vào trực giác cá nhân, tạo phản xạ thị giác nhất quán xuyên suốt toàn bộ hành trình trải nghiệm.

## 5.2. Sitemap và cấu trúc điều hướng

Cấu trúc sitemap của hệ thống EL-TECH được tái cấu trúc triệt để theo phạm vi giới hạn đã cam kết: mô hình vận hành tập trung tại một cửa hàng vật lý duy nhất, loại bỏ hoàn toàn các phân nhánh đa chi nhánh, loại bỏ danh mục thiết bị di động (laptop, điện thoại) để tập trung duy nhất vào linh kiện máy tính rời và bộ PC dựng sẵn, đồng thời tinh giản quy trình tài chính khi chỉ chấp nhận thanh toán đủ 100% bằng quét mã QR hoặc nhận hàng trả tiền mặt COD (loại bỏ hoàn toàn tính năng đặt cọc từng phần và cổng hoàn tiền trực tuyến trên website).

### 5.2.1. Sitemap phía khách hàng

Sitemap phía khách hàng được tổ chức với cấu trúc phẳng, hạn chế độ sâu điều hướng không quá 3 cấp nhằm tối ưu hóa tốc độ tìm kiếm và đặt hàng. Người dùng có thể tiếp cận mọi linh kiện phần cứng hoặc bộ máy dựng sẵn chỉ trong vòng 2 cú nhấp chuột từ thanh điều hướng chính (trình đơn đa cột mở rộng).

![Hình 5.2.1. Sitemap khách hàng EL-TECH mục tiêu](drawio/hinh-5-2-1-sitemap-khach-hang.png)

*Hình 5.2.1. Sitemap khách hàng EL-TECH mục tiêu*

Phân tích tuyến điều hướng trên Hình 5.2.1 chỉ ra hai hành trình trải nghiệm song song nhưng thống nhất về đích đến:
- Hành trình mua linh kiện lẻ: Khách hàng truy cập từ Danh mục linh kiện, sử dụng bộ lọc đa tiêu chí (Socket, Chipset, Dung lượng, Công suất, Kích thước) tại màn hình danh mục để thu hẹp kết quả, xem chi tiết sản phẩm, đọc và gửi đánh giá tự do, sau đó đưa vào giỏ hàng.
- Hành trình cấu hình máy tính: Khách hàng có thể chọn bộ máy cấu hình sẵn tại trang PC Dựng sẵn (được định nghĩa qua bảng BOM phụ tùng ảo), hoặc tự lắp ráp tại trang tự lắp ráp máy tính (PC Builder) thông qua 8 ngăn chọn linh kiện tiêu chuẩn. Cả hai luồng cấu hình đều kết chuyển toàn bộ danh sách phụ tùng thành các mục hợp lệ trong giỏ hàng chung.

Sau khi đặt hàng thành công tại trang đặt hàng và thanh toán, khách hàng được điều hướng tới màn hình xác nhận đơn hàng chứa thông tin mã tra cứu và hướng dẫn thanh toán. Đối với khách hàng vãng lai (Guest), hệ thống cung cấp tuyến tra cứu độc lập tại route `/tra-cuu-don` kết hợp mã xác thực OTP bảo mật gửi qua Email hoặc SMS, cho phép xem tiến độ chuẩn bị và giao hàng trực quan trên thanh tiến trình 9 trạng thái. Khách hàng đã đăng nhập có thể theo dõi danh sách đơn hàng đã mua trực tiếp trong trang tài khoản cá nhân.

Bảng 5.2.1 tổng hợp toàn diện danh mục route, phân quyền người dùng và trạng thái triển khai thực tế trên phân hệ giao diện khách hàng.

*Bảng 5.2.1. Danh mục route và quyền truy cập phía khách hàng*

| Route URL | Tên màn hình / Chức năng | Đối tượng tác nhân | Tác vụ nghiệp vụ chính | Trạng thái triển khai |
| :--- | :--- | :--- | :--- | :--- |
| `/` | Trang chủ giao diện khách hàng | Khách vãng lai, Thành viên | Banner công nghệ, lối tắt danh mục 8 nhóm linh kiện, PC dựng sẵn tiêu biểu | Đã hoàn thiện (Current) |
| `/san-pham` | Danh mục và bộ lọc linh kiện | Khách vãng lai, Thành viên | Lọc theo ngành hàng, thương hiệu, mức giá, thông số kỹ thuật động, sắp xếp | Đã hoàn thiện (Current) |
| `/san-pham/:category/:slug` | Chi tiết sản phẩm linh kiện | Khách vãng lai, Thành viên | Xem hình ảnh, thông số kỹ thuật chi tiết, giá bán, biến thể SKU, gửi đánh giá tự do | Đã hoàn thiện (Current) |
| `/pc-dung-san` | Danh sách PC dựng sẵn | Khách vãng lai, Thành viên | Xem danh mục cấu hình máy ráp sẵn, giải mã danh sách linh kiện thành phần (BOM) | Đã hoàn thiện (Current) |
| `/tu-lap-pc` | Công cụ tự lắp ráp PC Builder | Khách vãng lai, Thành viên | Chọn 8 linh kiện phần cứng theo slot, kiểm tra tương thích và tính tổng công suất nguồn | Đã hoàn thiện (Current) |
| `/gio-hang` | Giỏ hàng mua sắm | Khách vãng lai, Thành viên | Điều chỉnh số lượng SKU, kiểm tra tồn kho sẵn sàng (ATP), áp dụng mã giảm giá | Đã hoàn thiện (Current) |
| `/checkout` | Đặt hàng và thanh toán | Khách vãng lai, Thành viên | Nhập địa chỉ giao hàng, chọn phương thức thanh toán 100% QR hoặc 100% COD | Đã hoàn thiện (Current) |
| `/dat-hang-thanh-cong/:code` | Xác nhận đơn hàng thành công | Khách vãng lai, Thành viên | Hiển thị mã đơn, thông tin chuyển khoản VietQR, hướng dẫn nhận hàng | Đã hoàn thiện (Current) |
| `/tra-cuu-don` | Cổng tra cứu đơn vãng lai | Khách vãng lai (Guest) | Nhập mã đơn, số điện thoại, nhận và xác thực mã OTP để mở khóa dữ liệu đơn | Đã hoàn thiện (Current) |
| `/tien-do-don` | Theo dõi tiến độ đơn hàng | Khách vãng lai, Thành viên | Hiển thị tiến trình chuẩn bị hàng, lắp ráp và vận chuyển qua 9 trạng thái | Đã hoàn thiện (Current) |
| `/admin/login` | Cổng đăng nhập quản trị | Nhân viên quản trị | Đăng nhập tài khoản quản trị hệ thống, cấp phiên làm việc bảo mật | Đã hoàn thiện (Current) |
| `/tai-khoan` | Hồ sơ cá nhân và lịch sử | Khách hàng thành viên | Quản lý sổ địa chỉ, đổi mật khẩu, xem lịch sử các đơn hàng do tài khoản sở hữu | Đã hoàn thiện (Current) |
| `/chinh-sach` | Chính sách và liên hệ | Khách vãng lai, Thành viên | Xem thông tin quy định bảo hành, đổi trả tĩnh và biểu mẫu tiếp nhận khiếu nại | Đã hoàn thiện (Current) |

### 5.2.2. Sitemap quản trị

Sitemap phân hệ quản trị (cổng quản trị) được thiết kế theo cấu trúc tổng quan - chi tiết (Master-Detail) hiện đại với thanh điều hướng cố định bên trái (Thanh điều hướng bên cạnh) phân định rõ các khối nghiệp vụ chuyên biệt: Báo cáo tổng quan, Quản lý danh mục hàng hóa, Quản lý giao dịch bán hàng, Quản trị chuỗi cung ứng và kho vận, Tiếp nhận phản hồi và Cấu hình biểu phí.

![Hình 5.2.2. Sitemap quản trị một cửa hàng](drawio/hinh-5-2-2-sitemap-quan-tri.png)

*Hình 5.2.2. Sitemap quản trị một cửa hàng*

Theo kiến trúc điều hướng trên Hình 5.2.2, toàn bộ các chức năng dư thừa đã được triệt tiêu khỏi menu điều hành:
- Loại bỏ hoàn toàn phân hệ điều chuyển kho (`/admin/inventory/transfers`) và quản lý chi nhánh (`/admin/settings/branches`) do hệ thống đã khóa phạm vi ở mô hình kho tập trung duy nhất tại cơ sở chính.
- Loại bỏ quy trình trả hàng nhà cung cấp (`/admin/procurement/supplier-returns`) để giữ chu trình PO tập trung vào 3 trạng thái căn bản (Draft -> Confirmed -> Received).
- Tích hợp cổng tiếp nhận khiếu nại (`/admin/reviews`) đóng vai trò hộp thư tiếp nhận (Intake Inbox) thông tin phản ánh về tình trạng hàng hóa, loại bỏ quy trình hoàn tiền tự động on-screen để chuyển giao cho nhân sự chăm sóc khách hàng giải quyết ngoại tuyến theo thỏa thuận thực tế.

Bảng 5.2.2 đối chiếu cụ thể các quyết định tinh chỉnh route quản trị nhằm đảm bảo sự thống nhất giữa thiết kế tài liệu và mã nguồn hệ thống.

*Bảng 5.2.2. Danh mục route quản trị giữ, loại và bổ sung*

| Route hiện hữu trong mã nguồn | Quyết định điều chỉnh | Route mục tiêu | Lý do kỹ thuật và nghiệp vụ | Bằng chứng mã nguồn |
| :--- | :--- | :--- | :--- | :--- |
| `/admin/bảng tổng quan` | Giữ nguyên (Retain) | `/admin/bảng tổng quan` | Giám sát KPI doanh thu, số lượng đơn hàng cần xử lý và cảnh báo tồn kho tối thiểu | Đã liên kết API thống kê |
| `/admin/catalog/categories` | Giữ nguyên (Retain) | `/admin/catalog/categories` | Quản lý cây phân cấp 8 ngành hàng linh kiện cốt lõi, thuộc tính kỹ thuật đặc thù | Đã vận hành đầy đủ CRUD |
| `/admin/catalog/brands` | Giữ nguyên (Retain) | `/admin/catalog/brands` | Quản lý danh sách các thương hiệu phần cứng được ủy quyền phân phối | Đã vận hành đầy đủ CRUD |
| `/admin/catalog/templates` | Giữ nguyên (Retain) | `/admin/catalog/templates` | Quản lý mẫu sản phẩm cha và định nghĩa các biến thể phần cứng SKU con | Tích hợp bảng biến thể đa thông số |
| `/admin/catalog/pc-bundles` | Giữ nguyên (Retain) | `/admin/catalog/pc-bundles` | Quản lý gói cấu hình PC dựng sẵn, liên kết linh kiện thành phần qua bảng BOM ảo | Đồng bộ tồn kho theo linh kiện con |
| `/admin/orders` | Giữ nguyên (Retain) | `/admin/orders` | Điều phối đơn hàng qua 9 trạng thái giao dịch, hỗ trợ giao diện Kanban trực quan | Cập nhật trạng thái tự động |
| `/admin/inventory/balances` | Giữ nguyên (Retain) | `/admin/inventory/balances` | Quản lý tồn kho một kho duy nhất, đối soát giữa tồn thực tế, tạm giữ và khả dụng | Tính toán tự động từ Sổ kho |
| `/admin/inventory/transfers` | Loại bỏ (Remove) | N/A | Không áp dụng do hệ thống chỉ vận hành một cửa hàng và một kho hàng duy nhất | Chuyển hướng về balances |
| `/admin/procurement/purchase-orders` | Giữ nguyên (Retain) | `/admin/procurement/purchase-orders` | Quản lý đơn đặt hàng nhập kho với nhà cung cấp, cập nhật giá nhập giá vốn bình quân gia quyền (WAC) tự động | Hỗ trợ 3 trạng thái PO chuẩn |
| `/admin/procurement/supplier-returns` | Loại bỏ (Remove) | N/A | Quy trình đổi trả nhà cung cấp được thực hiện ngoại tuyến, không hỗ trợ trên web | Loại khỏi menu điều hướng |
| `/admin/reviews` | Giữ nguyên (Retain) | `/admin/reviews` | Tiếp nhận đánh giá công khai tự do và đóng vai trò tiếp nhận thông tin khiếu nại | Lưu trữ và hiển thị nội dung |
| `/admin/promotions/products` | Giữ nguyên (Retain) | `/admin/promotions/products` | Quản lý các chương trình hạ giá bán lẻ trực tiếp trên từng SKU hoặc ngành hàng | Tính toán chiết khấu tự động |
| `/admin/promotions/shipping-fee` | Giữ nguyên (Retain) | `/admin/promotions/shipping-fee` | Cấu hình bảng cước vận chuyển theo khoảng cách địa lý và chính sách miễn phí | Áp dụng tại bước đặt hàng và thanh toán |

## 5.3. Quy trình và tiêu chí thiết kế UI/UX

Trải nghiệm người dùng trên nền tảng EL-TECH được thiết kế xoay quanh nguyên tắc tối đa hóa mật độ thông tin kỹ thuật, hạn chế thao tác thừa và bảo đảm sự rõ ràng minh bạch trong từng khâu xử lý giao dịch thương mại.

### 5.3.1. Thiết kế luồng và hệ thống thành phần giao diện

Hệ thống thành phần giao diện (UI Components) được xây dựng theo kiến trúc Atomic Design, sử dụng thư viện Spartan UI kết hợp Tailwind CSS. Các khối thành phần tương tác chính bao gồm:
- Thanh điều hướng trên cùng (thanh điều hướng cố định trên cùng): Tích hợp thanh tìm kiếm thông minh có gợi ý tự động (tìm kiếm gợi ý tự động theo ký tự), biểu tượng giỏ hàng với huy hiệu (badge) hiển thị số lượng theo thời gian thực (Angular Signals), và menu danh mục dạng thả xuống nhiều cột.
- Bảng lọc thuộc tính đa diện (bộ lọc thuộc tính đa tiêu chí): Cho phép lọc kết hợp nhiều tiêu chí mà không gây tải lại toàn trang nhờ cơ chế Reactive State, hỗ trợ dải trượt giá (Dual Price Range Slider) và các hộp kiểm động sinh theo danh mục.
- Thẻ sản phẩm kỹ thuật cao (Hardware Product Card): Trình bày rõ ràng hình ảnh sắc nét, tên sản phẩm chuẩn hóa, giá niêm yết, giá khuyến mãi, trạng thái tồn kho tức thời (Còn hàng / Tạm hết hàng) và các thông số kỹ thuật then chốt dạng vi nhãn (vi nhãn thông số kỹ thuật).
- Hộp thoại tương tác (hộp thoại tương tác và ngăn kéo trượt): Được sử dụng trong công cụ tự lắp ráp máy tính (PC Builder) để lựa chọn linh kiện theo từng nhóm slot phần cứng, giúp người dùng tập trung vào tác vụ lựa chọn mà không đánh mất ngữ cảnh của toàn bộ cấu hình máy tính đang xây dựng dở dang.

![Hình 5.3.1. Luồng UX mua linh kiện và sau mua](drawio/hinh-5-3-1-user-flow.png)

*Hình 5.3.1. Luồng UX mua linh kiện và sau mua*

Luồng trải nghiệm người dùng trên Hình 5.3.1 thể hiện sự xuyên suốt và loại bỏ hoàn toàn các rào cản phức tạp. Sau khi hoàn tất lựa chọn sản phẩm hoặc cấu hình PC, khách hàng chuyển thẳng tới bước đặt hàng và thanh toán mà không bị ép buộc phải đăng ký tài khoản thành viên. Tại bước thanh toán, khách hàng chỉ cần lựa chọn giữa hai phương thức thanh toán toàn phần 100%:
- Phương thức Chuyển khoản VietQR: Hiển thị mã QR động chuẩn Napas 247 kèm số tiền chính xác và nội dung chuyển khoản mã hóa mã đơn hàng, loại bỏ nguy cơ sai sót khi nhập thủ công.
- Phương thức Thanh toán khi nhận hàng (COD): Cho phép người mua thanh toán toàn bộ giá trị đơn hàng bằng tiền mặt cho nhân viên giao hàng khi nhận và kiểm tra kiện hàng.

Sau bước đặt hàng, khách hàng có thể tra cứu đơn hàng vãng lai bất kỳ lúc nào bằng số điện thoại kết hợp mã OTP. Khi đơn hàng hoàn tất, khách hàng có quyền gửi nhận xét đánh giá tự do trực tiếp trên trang chi tiết sản phẩm mà không bị hệ thống chặn bởi điều kiện đã mua hàng, giúp xây dựng cộng đồng đánh giá mở và trung thực. Trường hợp phát sinh khiếu nại, khách hàng gửi nội dung qua biểu mẫu tiếp nhận tại trang chính sách để nhân viên CSKH chủ động liên hệ xử lý theo quy trình bảo hành phần cứng tiêu chuẩn.

### 5.3.2. Khả năng sử dụng, responsive và trạng thái trống

Hệ thống giao diện được tối ưu hóa cho hiển thị thích ứng đa màn hình (Responsive Web Design) dựa trên hệ thống điểm ngắt chuẩn của Tailwind CSS: Điện thoại di động (Mobile `< 640px`), Máy tính bảng (Tablet `640px - 1024px`) và Màn hình máy tính để bàn (Desktop `> 1024px`).

Nhằm loại bỏ hiện tượng giật cục thị giác (Content Layout Shift) và cảm giác chờ đợi thụ động, EL-TECH áp dụng triệt để các trạng thái giao diện đặc thù:
- Trạng thái tải dữ liệu (trạng thái đang tải dữ liệu & khung xương giao diện): Hiển thị khung xương giao diện chuyển động phát sáng (Shimmering khung xương giao diện chờ tải) có cấu trúc trùng khớp với lưới sản phẩm và bảng dữ liệu thực tế thay vì sử dụng vòng xoay đơn điệu.
- Trạng thái dữ liệu trống (trạng thái dữ liệu trống): Trình bày các hình minh họa công nghệ trực quan và gợi ý hành động khắc phục cụ thể khi giỏ hàng trống, khi không tìm thấy linh kiện phù hợp với bộ lọc, hoặc khi tra cứu không có lịch sử đơn hàng.
- Trạng thái thông báo tức thời (thông báo nổi tức thời): Hiển thị ở góc trên bên phải màn hình để phản hồi kết quả thao tác (Thêm vào giỏ hàng thành công, Áp dụng mã giảm giá, Cập nhật số lượng) với thời gian tự biến mất sau 3.5 giây.

Bảng 5.3.2 tổng hợp danh mục kiểm tra khả năng sử dụng và mức độ tương thích responsive trên các phân hệ.

*Bảng 5.3.2. Checklist UX và responsive*

| Phân hệ / Nhóm trang | Điểm ngắt thử nghiệm | Nội dung kiểm tra UX | Bằng chứng kiểm thử thực tế | Kết quả đánh giá |
| :--- | :--- | :--- | :--- | :--- |
| Thanh điều hướng đầu trang khách hàng & Menu | Mobile (390px, 414px) | Menu thu gọn thành biểu tượng Hamburger Drawer, thanh tìm kiếm hiển thị dạng icon bung rộng | Kiểm tra trên thiết bị di động thực tế | Đạt chuẩn tiện dụng |
| Trang danh mục & lọc | Mobile & Tablet (768px) | Bộ lọc biến đổi thành nút trượt bảng trượt từ đáy màn hình, lưới sản phẩm chuyển từ 4 cột sang 2 cột | Kiểm tra thao tác chạm ngón tay | Đạt chuẩn tiếp cận |
| Trang PC Builder | Desktop & Tablet | Bảng 8 slot hiển thị dạng danh sách thẻ, nút chọn mở hộp thoại danh mục với bộ lọc tương thích | Thao tác chọn 8 linh kiện thành công | Đạt chuẩn thông tin |
| Giỏ hàng & Checkout | Mobile (390px) | Bảng giỏ hàng chuyển sang dạng thẻ vuốt đứng, nút đặt hàng cố định tại đáy màn hình (Sticky Bottom Bar) | Nhập liệu form và đặt hàng suôn sẻ | Đạt chuẩn thao tác |
| Bảng tổng quan quản trị & Tables | Desktop (1440px, 1920px) | Sidebar gập mở linh hoạt, các bảng dữ liệu hỗ trợ cuộn ngang mượt mà, phân trang cố định | Hiển thị trọn vẹn dữ liệu và bộ lọc | Đạt chuẩn vận hành |

## 5.4. Hiện thực giao diện phía khách hàng

Mục này trình bày chi tiết 14 giao diện trực quan của phân hệ giao diện khách hàng, được chụp thực tế từ ứng dụng Angular đang hoạt động tại cổng `http://localhost:4200`.

### 5.4.1. Trang chủ

Trang chủ là cổng giao tiếp đầu tiên với khách hàng, được xây dựng theo phong cách công nghệ cao với dải biểu ngữ động (biểu ngữ nổi bật đầu trang) giới thiệu các linh kiện phần cứng thế hệ mới và các cấu hình PC Gaming tiêu biểu.

![Hình 5.4.1. Ảnh giao diện trang chủ và menu linh kiện](images/storefront/hinh-5-4-1-trang-chu.png)

*Hình 5.4.1. Ảnh giao diện trang chủ và menu linh kiện*

Giao diện trang chủ thể hiện thanh điều hướng chính phía trên với đầy đủ các lối tắt dẫn tới Danh mục linh kiện, PC Dựng sẵn, Tự lắp PC, Tra cứu đơn hàng và Chính sách bảo hành. Khu vực nội dung trung tâm bao gồm các phân đoạn sản phẩm nổi bật, linh kiện giảm giá sốc và khối giới thiệu dịch vụ lắp ráp máy tính chuyên nghiệp tại cửa hàng.

Khách hàng có thể thực hiện tìm kiếm nhanh thông qua thanh tìm kiếm thông minh hoặc nhấp chọn trực tiếp vào các biểu tượng ngành hàng linh kiện để chuyển hướng ngay tới màn hình danh mục với bộ lọc tương ứng được kích hoạt sẵn.

### 5.4.2. Trang Linh kiện PC và tìm kiếm/lọc sản phẩm

Trang Linh kiện PC cung cấp khả năng khám phá kho linh kiện đồ sộ thông qua bố cục hai cột kinh điển: cột bên trái là hệ thống bộ lọc đa tiêu chí và cột bên phải là lưới hiển thị sản phẩm tương ứng.

![Hình 5.4.2. Ảnh giao diện trang danh mục và tìm kiếm/lọc](images/storefront/hinh-5-4-2-danh-muc-loc.png)

*Hình 5.4.2. Ảnh giao diện trang danh mục và tìm kiếm/lọc*

Bộ lọc thông minh hỗ trợ thu hẹp phạm vi sản phẩm theo Ngành hàng (CPU, Mainboard, RAM, VGA, SSD, Nguồn, Case, Tản nhiệt), Thương hiệu chính hãng (ASUS, MSI, Gigabyte, Corsair, Kingston...), khoảng giá linh hoạt và các thuộc tính thông số kỹ thuật động (DDR4/DDR5, Socket LGA1700/AM5, Chuẩn nguồn 80 Plus).

Khu vực lưới hiển thị sản phẩm hỗ trợ sắp xếp theo giá tăng dần, giá giảm dần, sản phẩm mới nhất và mức độ phổ biến. Mỗi thẻ sản phẩm cung cấp nút Thêm vào giỏ hàng nhanh giúp người dùng đưa hàng vào giỏ ngay tại trang danh mục mà không làm gián đoạn việc xem hàng.

### 5.4.3. Trang Chi tiết sản phẩm và Giao diện gửi đánh giá sản phẩm tự do

Trang Chi tiết sản phẩm là nơi cung cấp đầy đủ thông số kỹ thuật chuyên sâu, tình trạng kho hàng theo biến thể SKU và phản hồi cộng đồng về chất lượng linh kiện.

![Hình 5.4.3.1. Ảnh giao diện trang chi tiết sản phẩm](images/storefront/hinh-5-4-3-1-chi-tiet-sp.png)

*Hình 5.4.3.1. Ảnh giao diện trang chi tiết sản phẩm*

Giao diện chi tiết sản phẩm trình bày thư viện ảnh độ phân giải cao bên trái và thông tin thương mại bên phải bao gồm: tên sản phẩm chuẩn xác, mã sản phẩm, thương hiệu, giá niêm yết, các nút chọn biến thể (phiên bản màu sắc, dung lượng) và bộ đếm số lượng mua. Bên dưới là bảng thông số kỹ thuật chi tiết trình bày dưới dạng bảng lưới rõ ràng.

![Hình 5.4.3.2. Ảnh giao diện giao diện gửi đánh giá sản phẩm tự do](images/storefront/hinh-5-4-3-2-danh-gia-tu-do.png)

*Hình 5.4.3.2. Ảnh giao diện giao diện gửi đánh giá sản phẩm tự do*

Khu vực đánh giá sản phẩm (Hình 5.4.3.2) hiện thực hóa cam kết nghiệp vụ mở: cho phép mọi khách hàng gửi xếp hạng số sao (1 đến 5 sao), tiêu đề nhận xét và nội dung cảm nhận thực tế hoàn toàn tự do. Hệ thống không thiết lập rào cản kiểm tra lịch sử đã mua hàng, giúp khuyến khích cộng đồng đam mê phần cứng đóng góp các đánh giá khách quan về hiệu năng và độ ổn định của thiết bị.

### 5.4.4. Trang PC Builder

Trang PC Builder là công cụ cốt lõi hỗ trợ khách hàng tự do cấu hình một bộ máy tính hoàn chỉnh từ các linh kiện rời rạc với sự trợ giúp của thuật toán kiểm tra tính tương thích phần cứng theo thời gian thực.

![Hình 5.4.4. Ảnh giao diện trang tự lắp ráp máy tính (PC Builder)](images/storefront/hinh-5-4-4-pc-builder.png)

*Hình 5.4.4. Ảnh giao diện trang tự lắp ráp máy tính (PC Builder)*

Giao diện công cụ được tổ chức thành 8 ngăn (slot) linh kiện chuẩn mực: Bộ vi xử lý (CPU), Bo mạch chủ (Mainboard), Bộ nhớ trong (RAM), Card đồ họa (VGA), Ổ cứng lưu trữ (SSD/HDD), Nguồn máy tính (PSU), Vỏ máy tính (Case) và Tản nhiệt (Cooling). Khách hàng nhấp nút "Chọn linh kiện" tại từng slot để mở hộp thoại lọc danh mục thông minh.

Hệ thống tự động tính toán tổng số tiền của cấu hình và ước tính tổng công suất tiêu thụ điện (Total TDP) của toàn hệ thống, từ đó đưa ra cảnh báo nếu công suất bộ nguồn được chọn chưa đạt ngưỡng an toàn khuyến nghị. Sau khi cấu hình ưng ý, khách hàng có thể in bảng báo giá hoặc nhấn nút "Thêm toàn bộ cấu hình vào giỏ hàng".

### 5.4.5. Trang Giỏ hàng

Trang Giỏ hàng đóng vai trò điểm tập kết các linh kiện đơn lẻ và các gói PC đã chọn trước khi tiến hành thanh toán chính thức.

![Hình 5.4.5. Ảnh giao diện trang giỏ hàng](images/storefront/hinh-5-4-5-gio-hang.png)

*Hình 5.4.5. Ảnh giao diện trang giỏ hàng*

Mỗi mục hàng trong giỏ hiển thị rõ ràng hình ảnh thu nhỏ, tên linh kiện, mã biến thể SKU, đơn giá, bộ điều chỉnh số lượng và tổng tiền từng dòng. Người dùng có thể xóa từng linh kiện hoặc làm trống toàn bộ giỏ hàng với thao tác một chạm.

Cột tổng kết bên phải thể hiện số tiền tạm tính, ô nhập mã giảm giá (Coupon Code) và nút chuyển hướng đến trang Đặt hàng (Checkout). Dữ liệu giỏ hàng được đồng bộ liên tục vào LocalStorage giúp người dùng không bị mất giỏ hàng khi tải lại trang hoặc quay lại sau nhiều ngày.

### 5.4.6. Trang Checkout QR/COD

Trang Checkout là nơi thu thập thông tin nhận hàng và xác lập phương thức thanh toán dứt điểm giữa khách hàng và cửa hàng.

![Hình 5.4.6. Ảnh giao diện trang checkout QR/COD](images/storefront/hinh-5-4-6-checkout.png)

*Hình 5.4.6. Ảnh giao diện trang checkout QR/COD*

Giao diện thanh toán phân chia thành hai khu vực: biểu mẫu thông tin khách hàng bên trái (Họ tên, Số điện thoại, Địa chỉ giao hàng chi tiết, Tỉnh/Thành phố, Ghi chú đơn hàng) và khu vực chọn phương thức thanh toán kèm tóm tắt đơn hàng bên phải.

Hệ thống chỉ cung cấp 2 phương thức thanh toán toàn phần:
- Thanh toán chuyển khoản ngân hàng qua mã VietQR (thanh toán 100% trước khi xử lý đơn).
- Thanh toán khi nhận hàng COD (thanh toán 100% tiền mặt cho shipper).

Hệ thống hoàn toàn không có lựa chọn đặt cọc từng phần, giúp loại bỏ các phức tạp về kế toán và tranh chấp hoàn cọc.

### 5.4.7. Trang Xác nhận đặt hàng và thanh toán

Sau khi gửi biểu mẫu đặt hàng thành công, hệ thống điều hướng khách hàng tới màn hình xác nhận giao dịch chứa toàn bộ chỉ dẫn thanh toán và thông tin đơn hàng.

![Hình 5.4.7. Ảnh giao diện trang xác nhận đặt hàng và thanh toán](images/storefront/hinh-5-4-7-xac-nhan-dat-hang.png)

*Hình 5.4.7. Ảnh giao diện trang xác nhận đặt hàng và thanh toán*

Đối với phương thức thanh toán chuyển khoản, màn hình hiển thị mã VietQR động được tạo tự động chứa đầy đủ số tài khoản thụ hưởng của EL-TECH, tên ngân hàng thương mại, số tiền thanh toán chính xác đến từng đồng và nội dung chuyển tiền chứa tiền tố mã đơn hàng (ví dụ: `ELTECH ORD-20261102-001`).

Khách hàng chỉ cần sử dụng ứng dụng Mobile Banking quét mã để hoàn tất chuyển khoản trong vòng vài giây mà không cần nhập liệu thủ công. Màn hình đồng thời hiển thị hướng dẫn lưu lại mã tra cứu đơn hàng để theo dõi tiến độ xử lý.

### 5.4.8. Trang Tra cứu đơn vãng lai

Trang Tra cứu đơn vãng lai cung cấp cổng tra cứu thông tin giao dịch độc lập dành cho các khách hàng không tạo tài khoản hoặc mua hàng ở chế độ khách vãng lai.

![Hình 5.4.8. Ảnh giao diện trang tra cứu đơn vãng lai](images/storefront/hinh-5-4-8-tra-cuu-vang-lai.png)

*Hình 5.4.8. Ảnh giao diện trang tra cứu đơn vãng lai*

Để bảo vệ bí mật thông tin giao dịch của khách hàng, hệ thống áp dụng cơ chế xác thực hai bước: khách hàng nhập Mã đơn hàng và Số điện thoại đã đặt hàng, sau đó nhấn "Nhận mã OTP". Hệ thống gửi mã xác thực gồm 6 chữ số đến số điện thoại/email đăng ký.

Sau khi nhập đúng mã OTP hợp lệ trong thời gian quy định, hệ thống giải mã và mở khóa quyền truy cập chi tiết thông tin đơn hàng, danh sách linh kiện đã đặt và liên kết trực tiếp tới trang theo dõi tiến độ đơn hàng.

### 5.4.9. Trang Theo dõi tiến độ đơn

Trang Theo dõi tiến độ đơn hàng trực quan hóa trạng thái thực tế của đơn hàng thông qua thanh tiến trình 9 trạng thái giao dịch tiêu chuẩn đã được định nghĩa tại Chương 3 và Chương 4.

![Hình 5.4.9. Ảnh giao diện trang theo dõi tiến độ đơn](images/storefront/hinh-5-4-9-theo-doi-tien-do.png)

*Hình 5.4.9. Ảnh giao diện trang theo dõi tiến độ đơn*

Thanh tiến trình thể hiện rõ ràng các mốc xử lý: Đang chờ thanh toán -> Đã thanh toán -> Đang chuẩn bị hàng -> Đang lắp ráp (đối với đơn PC dựng sẵn) -> Đang kiểm tra chất lượng (QC) -> Sẵn sàng bàn giao -> Đang giao hàng -> Đã giao thành công (hoặc Đã hủy đơn hàng).

Tại mỗi mốc thời gian, giao diện ghi nhận dấu thời gian (dấu thời gian ghi nhận) thực tế khi nhân viên kho vận hoặc điều phối cập nhật trạng thái trên hệ thống quản trị, giúp khách hàng hoàn toàn yên tâm về tiến độ chuẩn bị chiếc máy tính hoặc gói linh kiện của mình.

### 5.4.10. Trang Đăng ký/đăng nhập tài khoản

Trang Đăng nhập và Đăng ký tài khoản cung cấp cơ chế xác thực an toàn cho người dùng thành viên và đội ngũ nhân sự quản trị.

![Hình 5.4.10. Ảnh giao diện trang đăng ký/đăng nhập tài khoản](images/storefront/hinh-5-4-10-auth.png)

*Hình 5.4.10. Ảnh giao diện trang đăng ký/đăng nhập tài khoản*

Giao diện đăng nhập được thiết kế tinh gọn trên nền tối với các trường nhập liệu Email và Mật khẩu có xác thực định dạng tại chỗ (kiểm thực dữ liệu phía trình duyệt với Zod). Nút "Ghi nhớ phiên đăng nhập" cho phép lưu trữ token đăng nhập an toàn trong Cookie HttpOnly hoặc LocalStorage.

Hệ thống bảo vệ phân hệ bằng cơ chế chống tấn công dò quét mật khẩu (kiểm soát giới hạn tần suất truy cập) và phân quyền tự động dựa trên vai trò người dùng (Role-based Access Control), tự động chuyển hướng quản trị viên đến trang Bảng tổng quan và khách hàng thành viên đến trang Hồ sơ cá nhân.

### 5.4.11. Trang Hồ sơ và lịch sử đơn thành viên

Khách hàng thành viên sau khi đăng nhập có thể quản lý thông tin tài khoản và xem lại toàn bộ lịch sử các giao dịch đã thực hiện trên trang Hồ sơ cá nhân.

![Hình 5.4.11. Ảnh giao diện trang hồ sơ và lịch sử đơn thành viên](images/storefront/hinh-5-4-11-ho-so-lich-su.png)

*Hình 5.4.11. Ảnh giao diện trang hồ sơ và lịch sử đơn thành viên*

Màn hình hồ sơ cho phép cập nhật họ tên, số điện thoại, địa chỉ nhận hàng mặc định và đổi mật khẩu bảo mật. Khu vực "Lịch sử mua hàng" liệt kê toàn bộ các đơn hàng do tài khoản sở hữu kèm theo trạng thái xử lý hiện tại, ngày đặt hàng, tổng tiền thanh toán và nút xem lại chi tiết từng đơn hàng.

Nhờ việc liên kết trực tiếp giữa mã tài khoản người dùng và đơn hàng, khách hàng thành viên không cần phải thực hiện xác thực OTP khi xem lại các đơn hàng cũ như quy trình của khách vãng lai.

### 5.4.12. Trang Chính sách và gửi yêu cầu khiếu nại

Trang Chính sách cung cấp thông tin minh bạch về điều khoản bảo hành linh kiện, quy định kiểm hàng khi nhận và biểu mẫu tiếp nhận phản ánh khiếu nại chất lượng dịch vụ.

![Hình 5.4.12.1. Ảnh giao diện các trang thông tin liên hệ và chính sách dùng](images/storefront/hinh-5-4-12-1-chinh-sach.png)

*Hình 5.4.12.1. Ảnh giao diện các trang thông tin liên hệ và chính sách dùng*

Nội dung chính sách khẳng định rõ cam kết bảo hành chính hãng theo tem nhà phân phối, quy định đổi mới trong vòng 7 ngày đối với lỗi phần cứng từ nhà sản xuất, và hướng dẫn liên hệ trực tiếp tại địa chỉ cửa hàng duy nhất của EL-TECH.

![Hình 5.4.12.2. Ảnh giao diện trang gửi yêu cầu khiếu nại](images/storefront/hinh-5-4-12-2-khieu-nai.png)

*Hình 5.4.12.2. Ảnh giao diện trang gửi yêu cầu khiếu nại*

Biểu mẫu tiếp nhận khiếu nại (Hình 5.4.12.2) cho phép khách hàng điền Họ tên, Số điện thoại, Mã đơn hàng liên quan, phân loại khiếu nại (Hàng giao sai mã, Hàng bị móp méo khi vận chuyển, Linh kiện lỗi không lên hình) và mô tả chi tiết sự cố.

Khi gửi thành công, dữ liệu được chuyển tiếp ngay lập tức vào hòm thư quản trị (`/admin/reviews`) để nhân sự chăm sóc khách hàng chủ động xử lý ngoại tuyến, hoàn toàn không tạo ra quy trình hoàn tiền tự động phức tạp trên trang web.

## 5.5. Hiện thực giao diện quản trị

Phân hệ cổng quản trị là trung tâm điều hành toàn diện của cửa hàng, cung cấp các công cụ kiểm soát hàng hóa, đơn hàng và kho vận với độ chính xác cao. Dưới đây là 11 màn hình quản trị thực tế thu thập từ hệ thống.

### 5.5.1. Bảng tổng quan quản trị

Bảng tổng quan là màn hình đầu tiên khi quản trị viên đăng nhập, cung cấp cái nhìn toàn cảnh về tình hình kinh doanh và sức khỏe vận hành của cửa hàng.

![Hình 5.5.1. Ảnh giao diện quản trị bảng tổng quan quản trị](images/admin/hinh-5-5-1-admin-dashboard.png)

*Hình 5.5.1. Ảnh giao diện quản trị bảng tổng quan quản trị*

Khu vực trên cùng hiển thị các thẻ số liệu thống kê chủ chốt (KPI Cards): Tổng doanh thu trong ngày/tháng, Số đơn hàng mới cần xác nhận, Số đơn hàng đang lắp ráp trong xưởng, và Số lượng mã linh kiện đang rơi vào mức cảnh báo tồn kho tối thiểu.

Biểu đồ trực quan bên dưới thể hiện xu hướng doanh thu theo thời gian và cơ cấu doanh số đóng góp giữa các ngành hàng linh kiện cốt lõi (VGA, CPU, Mainboard) và các cấu hình PC dựng sẵn, hỗ trợ người quản lý ra quyết định nhập hàng kịp thời.

### 5.5.2. Quản lý ngành hàng, thuộc tính và thương hiệu

Giao diện quản lý danh mục và thương hiệu cho phép kiểm soát phân cấp hàng hóa và các nhãn hiệu đối tác được bày bán trên hệ thống.

![Hình 5.5.2.1. Ảnh giao diện quản trị quản lý ngành hàng, thuộc tính](images/admin/hinh-5-5-2-1-admin-nganh-hang.png)

*Hình 5.5.2.1. Ảnh giao diện quản trị quản lý ngành hàng, thuộc tính*

Màn hình Quản lý ngành hàng (Hình 5.5.2.1) thể hiện danh sách 8 ngành hàng linh kiện phần cứng kèm theo cấu hình trường thuộc tính kỹ thuật đặc thù (Specification Schema) cho từng loại. Quản trị viên có thể thêm, sửa, kích hoạt hoặc ẩn một danh mục chỉ với vài thao tác.

![Hình 5.5.2.2. Ảnh giao diện quản trị quản lý thương hiệu](images/admin/hinh-5-5-2-2-admin-thuong-hieu.png)

*Hình 5.5.2.2. Ảnh giao diện quản trị quản lý thương hiệu*

Màn hình Quản lý thương hiệu (Hình 5.5.2.2) quản lý danh sách các nhà sản xuất linh kiện danh tiếng (Intel, AMD, NVIDIA, ASUS, Corsair, Kingston...). Mỗi thương hiệu bao gồm tên, biểu trưng logo, xuất xứ và trạng thái hợp tác phân phối chính thức.

### 5.5.3. Quản lý mẫu sản phẩm và biến thể

Màn hình Quản lý mẫu sản phẩm là nơi định nghĩa thông tin hàng hóa tổng quát và quản lý chi tiết các biến thể mã hàng tồn kho (SKU).

![Hình 5.5.3. Ảnh giao diện quản trị quản lý mẫu sản phẩm và biến thể](images/admin/hinh-5-5-3-admin-mau-sp-sku.png)

*Hình 5.5.3. Ảnh giao diện quản trị quản lý mẫu sản phẩm và biến thể*

Bảng dữ liệu Master hiển thị danh sách các mẫu sản phẩm (Product Template) kèm theo ảnh đại diện, danh mục cha, thương hiệu và số lượng biến thể đang hoạt động. Nhấp vào một mẫu sản phẩm sẽ mở ra khu vực cấu hình biến thể (Variants Detail).

Tại đây, quản trị viên có thể thiết lập mã SKU duy nhất cho từng phiên bản, thông số kỹ thuật riêng biệt (dung lượng RAM 16GB hay 32GB, màu sắc Case Đen hay Trắng), giá niêm yết bán lẻ và trạng thái mở bán, đảm bảo dữ liệu luôn đồng bộ với cơ sở dữ liệu backend.

### 5.5.4. Quản lý PC dựng sẵn

Phân hệ quản lý PC dựng sẵn là nơi thiết lập các gói máy tính ráp sẵn thông qua cơ chế giải mã danh sách linh kiện thành phần (định mức linh kiện ảo (Virtual BOM)).

![Hình 5.5.4. Ảnh giao diện quản trị quản lý pc dựng sẵn](images/admin/hinh-5-5-4-admin-pc-bundle.png)

*Hình 5.5.4. Ảnh giao diện quản trị quản lý pc dựng sẵn*

Giao diện cho phép tạo mới hoặc chỉnh sửa một bộ PC hoàn chỉnh bằng cách đặt tên gói cấu hình (ví dụ: `PC Dragon Gaming Ultra 01`), tải ảnh đại diện tổng thể, và gán các linh kiện phần cứng tương ứng từ danh sách SKU đang có hàng trong kho.

Điểm đặc biệt của phân hệ này là giá bán gói cấu hình và trạng thái sẵn sàng bán (ATP) được tự động tính toán dựa trên tổng giá và số lượng tồn kho khả dụng của từng linh kiện thành phần trong kho, tránh nguy cơ bán gói máy tính khi một trong các linh kiện cốt lõi đã hết hàng.

### 5.5.5. Quản lý đơn hàng và chi tiết đơn

Màn hình Quản lý đơn hàng cung cấp công cụ điều phối trạng thái giao dịch linh hoạt thông qua chế độ xem dạng lưới (chế độ xem danh sách) và bảng Kanban trực quan.

![Hình 5.5.5. Ảnh giao diện quản trị quản lý đơn hàng và chi tiết đơn](images/admin/hinh-5-5-5-admin-don-hang.png)

*Hình 5.5.5. Ảnh giao diện quản trị quản lý đơn hàng và chi tiết đơn*

Các cột trên giao diện tương ứng với các trạng thái giao dịch: Chờ xác nhận, Đã thanh toán, Đang nhặt hàng, Đang lắp ráp, Chờ giao hàng và Đã hoàn thành. Nhân viên điều phối có thể kéo thả thẻ đơn hàng hoặc nhấp vào để mở hộp thoại xem chi tiết.

Màn hình chi tiết đơn hàng hiển thị toàn bộ thông tin người mua, địa chỉ nhận hàng, phương thức thanh toán, danh sách linh kiện cần xuất kho kèm số Serial Number cụ thể đã được gán, và các nút chuyển đổi trạng thái giao dịch có kiểm tra điều kiện nghiệp vụ chặt chẽ.

### 5.5.6. Quản lý tồn kho và sổ kho

Phân hệ Tồn kho và Sổ kho quản lý chính xác lượng hàng hóa tại kho tổng duy nhất của EL-TECH theo nguyên lý kiểm soát hai chiều (sổ kho đối ứng kép hai chiều).

![Hình 5.5.6. Ảnh giao diện quản trị quản lý tồn kho và sổ kho](images/admin/hinh-5-5-6-admin-ton-kho-so-kho.png)

*Hình 5.5.6. Ảnh giao diện quản trị quản lý tồn kho và sổ kho*

Bảng số dư tồn kho (Inventory Balances) phân định rõ ràng ba chỉ số số lượng đối với từng mã SKU: Số lượng thực tế trong kho (On-hand), Số lượng đang bị tạm giữ cho các đơn hàng chưa xuất xưởng (Reserved), và Số lượng khả dụng thực tế để tiếp tục bán hàng (Available to Promise = On-hand - Reserved).

Tab Sổ kho (Stock Ledger) ghi nhận bất biến mọi giao dịch phát sinh biến động kho (Phiếu nhập kho PO, Phiếu xuất kho bán hàng, Phiếu điều chỉnh kiểm kê định kỳ) kèm dấu thời gian và mã tham chiếu chứng từ, bảo đảm tuyệt đối tính toàn vẹn và khả năng truy vết nguồn gốc hàng hóa.

### 5.5.7. Quản lý đơn mua hàng nhập kho (Purchase Order)

Màn hình Quản lý Đơn mua hàng (đơn mua hàng nhập kho (Purchase Order) - PO) hỗ trợ chu trình mua hàng nhập kho từ các nhà phân phối chính hãng.

![Hình 5.5.7. Ảnh giao diện quản trị quản lý đơn mua hàng nhập kho (Purchase Order)](images/admin/hinh-5-5-7-admin-purchase-order.png)

*Hình 5.5.7. Ảnh giao diện quản trị quản lý đơn mua hàng nhập kho (Purchase Order)*

Quy trình PO được vận hành qua 3 trạng thái chuẩn mực: Bản nháp (Draft) -> Đã xác nhận đặt hàng (Confirmed) -> Đã nhập kho thành công (Received). Khi tạo PO, nhân viên thu mua chọn nhà cung cấp, thêm các mã SKU linh kiện cần nhập kèm theo số lượng và đơn giá nhập mua thỏa thuận.

Khi bấm nút xác nhận "Nhập kho" tại giao diện chi tiết PO, hệ thống tự động kích hoạt Transaction cơ sở dữ liệu: tăng số lượng tồn On-hand trong bảng Stock Quant, ghi bút toán nhập vào Sổ kho, tính toán lại giá vốn bình quân gia quyền (WAC)_TAG cho SKU, và chuyển trạng thái chứng từ sang Đã nhận hàng.

### 5.5.8. Quản lý khiếu nại

Màn hình Quản lý khiếu nại là nơi tiếp nhận tập trung các phản hồi, đánh giá công khai và các yêu cầu khiếu nại chất lượng hàng hóa được gửi từ khách hàng.

![Hình 5.5.8. Ảnh giao diện quản trị quản lý khiếu nại](images/admin/hinh-5-5-8-admin-khieu-nai.png)

*Hình 5.5.8. Ảnh giao diện quản trị quản lý khiếu nại*

Bảng dữ liệu hiển thị thông tin ngày gửi, họ tên khách hàng, số điện thoại, mã đơn hàng liên quan, loại vấn đề khiếu nại (Giao thiếu linh kiện, Hàng lỗi không hoạt động, Móp méo bao bì) và nội dung phản ánh cụ thể.

Quản trị viên có thể cập nhật trạng thái xử lý nội bộ (Mới tiếp nhận, Đang xử lý, Đã giải quyết) và ghi chú hướng xử lý thỏa thuận với khách hàng (Ví dụ: "Đã liên hệ khách đổi sản phẩm mới trực tiếp tại cửa hàng vào ngày 03/11"), giúp đảm bảo chất lượng dịch vụ chăm sóc khách hàng mà không cần quy trình hoàn tiền trực tuyến trên website.

### 5.5.9. Quản lý chương trình khuyến mãi và coupon

Màn hình Quản lý khuyến mãi cung cấp các công cụ kích cầu tiêu dùng thông qua việc thiết lập giảm giá trực tiếp trên linh kiện và tạo các mã phiếu mua hàng (Coupon).

![Hình 5.5.9. Ảnh giao diện quản trị quản lý chương trình khuyến mãi và coupon](images/admin/hinh-5-5-9-admin-khuyen-mai.png)

*Hình 5.5.9. Ảnh giao diện quản trị quản lý chương trình khuyến mãi và coupon*

Giao diện hỗ trợ thiết lập chiến dịch giảm giá theo tỷ lệ phần trăm hoặc số tiền cố định áp dụng cho từng SKU cụ thể hoặc toàn bộ một ngành hàng trong một khoảng thời gian có ngày bắt đầu và kết thúc xác định.

Hệ thống quản lý coupon cho phép sinh mã ưu đãi, giới hạn số lần sử dụng tối đa, giá trị đơn hàng tối thiểu để được áp dụng mã và mức giảm giá tối đa, hỗ trợ kiểm tra tính hợp lệ tự động ngay khi khách hàng nhập mã tại giỏ hàng.

### 5.5.10. Quản lý phí giao hàng

Màn hình Quản lý phí giao hàng cho phép cấu hình biểu phí vận chuyển áp dụng linh hoạt cho các đơn hàng giao tận nơi.

![Hình 5.5.10. Ảnh giao diện quản trị quản lý phí giao hàng](images/admin/hinh-5-5-10-admin-phi-giao-hang.png)

*Hình 5.5.10. Ảnh giao diện quản trị quản lý phí giao hàng*

Quản trị viên có thể thiết lập các mức cước vận chuyển chuẩn dựa trên khu vực địa lý (Nội thành, Ngoại thành, Các tỉnh lân cận) và đặt ngưỡng giá trị đơn hàng được hưởng chính sách Miễn phí vận chuyển (Freeship - ví dụ: miễn phí giao hàng cho các đơn linh kiện hoặc bộ PC có tổng giá trị từ 5.000.000 VNĐ trở lên).

Biểu phí cấu hình tại màn hình này được tự động nạp vào bộ tính toán giá của backend và cộng vào tổng số tiền thanh toán cuối cùng khi khách hàng chọn phương thức nhận hàng tận nơi tại trang đặt hàng và thanh toán.

---

Tóm lại, Chương 5 đã mô tả toàn diện hệ thống nhận diện thương hiệu, kiến trúc điều hướng tinh gọn cho mô hình một cửa hàng vật lý kiêm kho tổng, cùng toàn bộ 25 màn hình giao diện thực tế của phân hệ giao diện khách hàng và cổng quản trị. Việc đối chiếu trực quan giữa ảnh chụp thực tế và quy chuẩn thiết kế khẳng định nền tảng EL-TECH đã hiện thực hóa thành công các yêu cầu nghiệp vụ cốt lõi, loại bỏ hoàn toàn các chức năng ngoài phạm vi cam kết và sẵn sàng cho công tác đánh giá, thử nghiệm tổng kết tại Chương 6.

