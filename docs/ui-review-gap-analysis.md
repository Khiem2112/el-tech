# Báo Cáo Đánh Giá Giao Diện Frontend So Với Bản Mẫu Thiết Kế

- Dự án: EL-TECH Hardware - Nền tảng phân phối linh kiện máy tính và tư vấn cấu hình PC
- Mã tài liệu: UI-GAP-ANALYSIS-V1
- Phương pháp kiểm định: Tiêu chuẩn Impeccable Design Audit và Nielsen Norman Usability Heuristics
- Thư mục mẫu thiết kế: [ui-templates/store-front](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front)
- Thư mục mã nguồn Frontend: [fe/src/app](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app)
- Bộ quy chuẩn thiết kế: [design-system/el-tech/MASTER.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/design-system/el-tech/MASTER.md)

---

## 1. Phán Quyết Đánh Giá Tổng Quan

- Kết luận kiểm định: CHƯA ĐẠT CHUẨN (FAIL AUDIT)
- Tỷ lệ đáp ứng giao diện và thành phần tương tác: Ước tính đạt 72%
- Tóm tắt tình trạng:
  - Khung sườn kiến trúc, định tuyến trang, luồng dữ liệu Angular Signals và tích hợp dịch vụ API cơ bản đã được thiết lập tốt.
  - Tuy nhiên, nhiều khối thành phần tương tác cốt lõi, ma trận thông số kỹ thuật đặc thù cho giới phần cứng PC, dải hiển thị dữ liệu kho thực tế (Telemetry Strip), các điểm neo tương tác giữa danh mục sản phẩm và bộ cấu hình PC (BOM Builder Modal) bị lược bỏ hoặc đơn giản hóa quá mức.
  - Một số luồng giao diện quan trọng như Thanh toán (Checkout) và Tự dựng PC (PC Build) có sự chênh lệch lớn về trải nghiệm người dùng và tải nhận thức so với bản mẫu thiết kế chuẩn.

---

## 2. Đánh Giá 10 Nguyên Lý Khả Dụng Nielsen

### H1. Hiển thị Trạng thái Hệ thống (Visibility of system status)
- Đánh giá: Vi phạm mức độ Major.
- Chi tiết: 
  - Bản thiết kế [index.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/index.html) và [header.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/components/header.html) sở hữu dải Live Stock Telemetry hiển thị rõ ràng số lượng SKU tồn kho thực tế của 3 chi nhánh (Hà Nội: 1.240 SKU, TP.HCM: 1.890 SKU, Đà Nẵng: 680 SKU). Bản mã nguồn [fe/src/app/features/storefront/storefront-home.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/storefront/storefront-home.component.ts) hoàn toàn thiếu khối này.
  - Trang giỏ hàng mẫu có thanh tiến trình đạt ngưỡng miễn phí vận chuyển. Trang [fe/src/app/features/cart/cart-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/cart/cart-page.component.ts) chưa hiển thị thanh phản hồi trực quan này.

### H2. Tương đồng giữa Hệ thống và Thế giới Thực (Match between system and real world)
- Đánh giá: Đạt yêu cầu cơ bản.
- Chi tiết:
  - Quy ước thuật ngữ phần cứng (Socket, TDP, PCIe 4.0, DDR5, Form Factor) và đơn vị tiền tệ VND được áp dụng nhất quán.
  - Tuy nhiên, quy trình đóng gói và unbox linh kiện bóc seal tại trang chính sách [fe/src/app/features/refund/refund-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/refund/refund-page.component.ts) đã mô tả sát thực tế.

### H3. Quyền Kiểm soát và Tự do của Người dùng (User control and freedom)
- Đánh giá: Vi phạm mức độ Critical.
- Chi tiết:
  - Trong giỏ hàng mẫu [cart.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/cart.html), khi khách hàng xem cấu hình PC, mỗi linh kiện con trong dropdown đều có nút Đổi món để mở lại modal thay đổi linh kiện cụ thể đó. Trong [cart-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/cart/cart-page.component.ts), danh sách linh kiện bị khóa cứng dạng chỉ đọc, người dùng không thể đổi linh kiện trực tiếp từ giỏ hàng.
  - Thẻ sản phẩm ở trang danh mục [catalog-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/catalog/catalog-page.component.ts) thiếu nút nạp trực tiếp linh kiện vào PC Builder (+ Build PC).

### H4. Tính Nhất quán và Tiêu chuẩn (Consistency and standards)
- Đánh giá: Cần cải thiện mức độ Minor.
- Chi tiết:
  - Mẫu thiết kế sử dụng Google Material Symbols, trong khi FE đã chuyển dịch sang `lucide-angular` theo quy định kiến trúc. Sự chuyển dịch này là phù hợp với bộ nguyên tắc nội bộ, nhưng một số biểu tượng hành động (ví dụ icon giỏ hàng, tra cứu OTP, in biên nhận) có kích thước hiển thị chưa đồng đều (pha trộn giữa `size-3.5`, `size-4` và `text-[20px]`).

### H5. Ngăn ngừa Lỗi (Error prevention)
- Đánh giá: Đạt yêu cầu tương đối tốt.
- Chi tiết:
  - Hệ thống kiểm tra công suất nguồn và cảnh báo tương thích linh kiện đã được tích hợp trong dịch vụ PC Build.
  - Tuy nhiên, trang chi tiết sản phẩm [product-detail-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/catalog/product-detail-page.component.ts) còn thiếu hộp cảnh báo khoảng trống lắp đặt thùng máy (Case Clearance Alert: cảnh báo card màn hình quá dài hoặc tản nhiệt quá cao so với vỏ case).

### H6. Nhận biết Thay vì Nhớ lại (Recognition rather than recall)
- Đánh giá: Vi phạm mức độ Major.
- Chi tiết:
  - Cửa sổ đổi linh kiện [component-swap-modal.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/pc-build/component-swap-modal.component.ts) không có hình ảnh đại diện (thumbnail) của các linh kiện thay thế, chỉ hiển thị tên văn bản và giá tiền. Người dùng bị buộc phải ghi nhớ hình ảnh hoặc kiểu dáng của sản phẩm thay vì nhận diện trực quan như trong bản mẫu [change-component.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/change-component.html).
  - Thẻ sản phẩm ở trang danh mục thiếu các nhãn thông số kỹ thuật cốt lõi (VRAM, Bus, TDP) hiển thị dạng pill trực tiếp trên thẻ.

### H7. Linh hoạt và Hiệu quả Sử dụng (Flexibility and efficiency of use)
- Đánh giá: Vi phạm mức độ Blocker tại luồng Checkout.
- Chi tiết:
  - Bản mẫu [checkout.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/checkout.html) cho phép khách hàng nhập thông tin, chọn phương thức giao hàng và lập tức nhận được bảng tính giá cùng mã VietQR động có đồng hồ đếm ngược giữ hàng 20 phút.
  - Mã nguồn [checkout-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/checkout/checkout-page.component.ts) lại buộc người mua phải đi qua bước nhập và xác thực OTP qua Email hoặc Số điện thoại, rồi nhấn Tạo báo giá chính thức mới cho phép chọn chi nhánh và bấm Xác nhận tạo đơn. Điều này gây cản trở và làm chậm quy trình đặt hàng của khách.

### H8. Thẩm mỹ và Thiết kế Tối giản (Aesthetic and minimalist design)
- Đánh giá: Vi phạm mức độ Minor (Anti-pattern).
- Chi tiết:
  - Script kiểm tra tự động phát hiện mã nguồn [storefront-home.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/storefront/storefront-home.component.ts) sử dụng lớp trang trí `bg-clip-text text-transparent`. Đây là anti-pattern trang trí chữ quá mức, đi ngược lại ngôn ngữ thiết kế tối giản, kỹ thuật cao của NVIDIA Master Design System.

### H9. Giúp Người dùng Nhận biết, Chẩn đoán và Phục hồi sau Lỗi (Help users recognize, diagnose, and recover from errors)
- Đánh giá: Đạt yêu cầu.
- Chi tiết:
  - Thông báo lỗi xác thực OTP và lỗi kết nối API được biểu diễn rõ ràng qua hệ thống thông báo hoặc text lỗi màu đỏ tiêu chuẩn.

### H10. Trợ giúp và Tài liệu Hướng dẫn (Help and documentation)
- Đánh giá: Đạt yêu cầu.
- Chi tiết:
  - Trang chính sách [refund-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/refund/refund-page.component.ts) trình bày chi tiết chính sách đổi mới 30 ngày, hủy đơn, quy định cọc ráp máy và biểu mẫu gửi ticket RMA tiếp nhận trong 2 giờ.

---

## 3. Đánh Giá Hệ Thống Thiết Kế (Design System & Tokens)

Theo quy định tại [design-system/el-tech/MASTER.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/design-system/el-tech/MASTER.md):
- Bảng màu: Hệ màu chủ đạo NVIDIA Green (`#76b900`), bề mặt tối kỹ thuật (`surface-dark`: `#090d16`, `surface-elevated`: `#161b26`), nền sáng (`canvas`: `#f8fafc`). Frontend đã tuân thủ tốt việc tích hợp Tailwind token qua file `fe/src/styles.css`.
- Kiểu chữ: Sử dụng họ phông chữ Inter với các cấp độ hiển thị rõ ràng, phân cấp từ Display, Heading-XL, Heading-LG, Body-MD đến Caption.
- Khoảng cách và bo góc: Bán kính bo góc chuẩn hóa từ 0.5rem (lg) đến 0.75rem (xl), nút bo góc đều đặn.

---

## 4. Phân Tích Kịch Bản Người Dùng (Persona Red Flags)

### Alex - Kỹ sư Phần cứng / Game thủ Chuyên nghiệp (Power User)
- Kỳ vọng: Thao tác cực nhanh, muốn xem ngay thông số kỹ thuật chi tiết của linh kiện (TDP, Bus, VRAM, Socket) trực tiếp trên lưới sản phẩm; muốn bấm nút nạp ngay vào bộ PC đang ráp mà không cần chuyển trang.
- Điểm nghẽn trên FE:
  - Thẻ sản phẩm không có nút + Build PC.
  - Thẻ sản phẩm thiếu các pill thông số kỹ thuật tóm tắt.
  - Cửa sổ đổi linh kiện không có hình ảnh linh kiện, không thể so sánh nhanh kích thước hoặc kiểu dáng chân cắm tản nhiệt.

### Jordan - Khách hàng Phổ thông Mua Lần đầu (First-Timer)
- Kỳ vọng: Cần các gợi ý cấu hình PC hoàn chỉnh có sẵn để tham khảo và tùy biến; muốn quy trình mua hàng đơn giản, không bị rào cản kỹ thuật.
- Điểm nghẽn trên FE:
  - Trang chủ thiếu toàn bộ bộ sưu tập Virtual Prebuilt BOM Collection (các bộ PC lắp sẵn như EL-CREATOR Studio 4K, EL-GAMING Apex Predator) với nút Tùy biến cấu hình này.
  - Quy trình thanh toán bắt buộc xác minh mã OTP 2 lần (Email và Điện thoại) trước khi hiện tổng tiền và nút thanh toán, gây bối rối và có thể khiến khách từ bỏ giỏ hàng.

### Sam - Người Dùng Cần Hỗ Trợ Tiếp Cận & Rõ Ràng (Accessibility)
- Kỳ vọng: Cấu trúc vùng rõ ràng, độ tương phản văn bản cao, phím tắt và thao tác bàn phím đầy đủ.
- Điểm nghẽn trên FE:
  - Phân trang (Pagination) ở chân danh mục sản phẩm bị thiếu.
  - Thanh tìm kiếm cần hỗ trợ tìm kiếm toàn cục (Universal Search) mượt mà, bao quát mọi thể loại linh kiện với gợi ý kết quả trực quan (Instant Search Combobox).

---

## 5. Bảng Liệt Kê Chi Tiết Sai Lệch Theo Màn Hình

Mức độ nghiêm trọng được phân loại theo:
- P0 (Blocker): Chức năng quan trọng hoặc luồng nghiệp vụ cốt lõi bị cản trở, lệch nghiêm trọng so với thiết kế.
- P1 (Critical): Thiếu các khối giao diện hoặc thành phần chính của trang mẫu thiết kế.
- P2 (Major): Thiếu các chi tiết hiển thị, bộ lọc hoặc tương tác phụ nhưng ảnh hưởng rõ rệt tới trải nghiệm.
- P3 (Minor): Sai lệch nhỏ về khoảng cách, kiểu chữ, hoặc hiệu ứng trang trí.

---

### Màn Hình 1: Header Điều Hướng & Shell Chung
- Tệp mẫu: [ui-templates/store-front/components/header.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/components/header.html) và [footer.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/components/footer.html)
- Tệp mã nguồn: [fe/src/app/features/storefront/storefront-shell.component.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/storefront/storefront-shell.component.html)

| Mã lỗi | Mức độ | Mô tả chi tiết sai lệch | Hướng khắc phục đề xuất |
| :--- | :--- | :--- | :--- |
| SH-01 | Thay đổi thực tế | Thanh tìm kiếm toàn cục (Universal Search): Thực tế cho phép tìm kiếm bất kỳ sản phẩm nào thuộc bất kỳ thể loại nào (không ép buộc dropdown danh mục cố định như mẫu HTML), giúp giảm số bước thao tác và mở rộng phạm vi tra cứu. | Duy trì ô tìm kiếm toàn diện xuyên suốt mọi danh mục linh kiện, tối ưu gợi ý tìm kiếm tức thì theo từ khóa. |
| SH-02 | P3 | Dải tiện ích trên cùng (Top Utility Strip) thiếu thông tin giờ mở cửa showroom (08:30 - 21:30 mở cửa cả tuần). | Cập nhật thêm thẻ thông tin giờ hoạt động showroom vào thanh utility strip trên desktop. |

---

### Màn Hình 2: Trang Chủ (Storefront Home)
- Tệp mẫu: [ui-templates/store-front/index.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/index.html)
- Tệp mã nguồn: [fe/src/app/features/storefront/storefront-home.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/storefront/storefront-home.component.ts)

| Mã lỗi | Mức độ | Mô tả chi tiết sai lệch | Hướng khắc phục đề xuất |
| :--- | :--- | :--- | :--- |
| HM-01 | P1 | Thiếu hoàn toàn dải Live Stock Telemetry ở đầu trang chủ hiển thị dữ liệu SKU tồn kho thực tế đồng bộ tức thì của 3 chi nhánh (Hà Nội, TP.HCM, Đà Nẵng). | Thêm dải component Stock Telemetry phía dưới hero banner, hiển thị số lượng linh kiện có sẵn tại 3 kho. |
| HM-02 | P1 | Thiếu khối Tri-Job Launchpad (3 thẻ chọn hướng đi nhanh: Trình cấu hình PC Chuyên nghiệp, Bộ sưu tập PC ráp sẵn, Linh kiện lẻ chính hãng). | Bổ sung 3 thẻ Launchpad điều hướng nhanh vào phần đầu trang chủ. |
| HM-03 | P1 | Thiếu khối Visual Rig Showcase Bento trưng bày bộ máy cao cấp (EL-TITAN Workstation V2) kèm ma trận thông số kỹ thuật (CPU, GPU, RAM, PSU) và nút Tùy biến cấu hình này. | Triển khai khối Bento Showcase nổi bật bộ máy mẫu hàng đầu với thông số chi tiết. |
| HM-04 | P1 | Thiếu khối Virtual Prebuilt BOM Collection Showcase trưng bày 3 bộ PC ráp sẵn tiêu biểu (EL-CREATOR Studio 4K, EL-GAMING Apex Predator, EL-OFFICE Pro Slim) kèm nút Tùy biến linh kiện. | Bổ sung danh sách 3 cấu hình PC hoàn chỉnh có sẵn với nút chuyển trạng thái sang màn hình Build PC. |
| HM-05 | P2 | Thiếu banner tra cứu đơn hàng nhanh cho khách vãng lai bảo mật OTP ở cuối trang chủ. | Bổ sung thẻ tra cứu đơn hàng không cần đăng nhập vào chân trang chủ. |
| HM-06 | P3 | Hero banner sử dụng lớp chữ hiệu ứng `bg-clip-text text-transparent` bị cảnh báo là anti-pattern trang trí không cần thiết. | Loại bỏ gradient chữ, sử dụng màu chữ tiêu chuẩn theo hệ thống thiết kế. |

---

### Màn Hình 3: Danh Mục Sản Phẩm (Component Catalog)
- Tệp mẫu: [ui-templates/store-front/product-list.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/product-list.html)
- Tệp mã nguồn: [fe/src/app/features/catalog/catalog-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/catalog/catalog-page.component.ts)

| Mã lỗi | Mức độ | Mô tả chi tiết sai lệch | Hướng khắc phục đề xuất |
| :--- | :--- | :--- | :--- |
| CT-01 | P1 | Thẻ sản phẩm thiếu nút hành động trực tiếp + Build PC để thêm linh kiện vào cấu hình PC đang soạn thảo. | Thêm nút + Build PC trên từng thẻ sản phẩm, kết nối với Custom Build Service để gán linh kiện vào slot tương ứng. |
| CT-02 | P2 | Thẻ sản phẩm thiếu các thẻ thông số chuyên sâu (VRAM, Bus, TDP) hiển thị dạng mono pill nổi bật trên card. | Trích xuất các thuộc tính kỹ thuật chính từ specifications JSON để hiển thị thành các pill nhỏ trên card. |
| CT-03 | P2 | Thẻ sản phẩm thiếu nhãn phần trăm giảm giá và hiển thị giá gốc gạch ngang rõ ràng khi có khuyến mãi. | Bổ sung badge giảm giá và dòng giá niêm yết cũ gạch ngang trên thẻ sản phẩm. |
| CT-04 | P2 | Cột bộ lọc bên trái thiếu mục lọc theo Tình trạng hàng (Sẵn hàng tại Showroom / Đặt trước). | Thêm nhóm lọc Tình trạng hàng vào thanh lọc bên trái. |
| CT-05 | P2 | Chân danh sách sản phẩm chưa hiển thị khối phân trang (Pagination) chuẩn như mẫu thiết kế. | Tích hợp thành phần phân trang chuyển trang ở chân danh sách linh kiện. |

---

### Màn Hình 4: Chi Tiết Sản Phẩm (Product Detail)
- Tệp mẫu: [ui-templates/store-front/product-detail.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/product-detail.html)
- Tệp mã nguồn: [fe/src/app/features/catalog/product-detail-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/catalog/product-detail-page.component.ts)

| Mã lỗi | Mức độ | Mô tả chi tiết sai lệch | Hướng khắc phục đề xuất |
| :--- | :--- | :--- | :--- |
| PD-01 | P1 | Thiếu nút Thêm vào Cấu hình PC và cửa sổ Modal BOM cho phép chọn đưa linh kiện vào bộ PC đang soạn thảo để kiểm tra tương thích nguồn và kích thước. | Bổ sung nút hành động Thêm vào Cấu hình PC bên cạnh nút Mua ngay, mở modal xác nhận cấu hình. |
| PD-02 | P2 | Bộ sưu tập hình ảnh chỉ hiển thị một ảnh đơn, thiếu dải thumbnail đa góc nhìn và chế độ xem xoay 360 độ. | Bổ sung danh sách ảnh phụ thumbnails và chức năng chuyển đổi ảnh xem lớn. |
| PD-03 | P2 | Khối thông số tóm tắt đầu trang thiếu 3 ô pill kiến trúc phần cứng, chuẩn khe cắm và công suất nguồn tối thiểu đề xuất. | Bổ sung 3 khối pill thông số nhanh phía trên nút mua hàng. |
| PD-04 | P2 | Thiếu hộp cảnh báo kích thước lắp đặt thùng máy (Case clearance alert notice) đối với linh kiện kích thước lớn như card VGA hoặc tản nước. | Bổ sung thẻ cảnh báo kích thước yêu cầu của vỏ case trong phần thông tin chi tiết. |
| PD-05 | P3 | Tab đánh giá khách hàng thiếu biểu đồ phân bổ số sao (Histogram 5 sao đến 1 sao). | Bổ sung đồ họa biểu đồ cột phân bổ tỷ lệ đánh giá sao của sản phẩm. |

---

### Màn Hình 5: Trình Dựng PC (Custom PC Build)
- Tệp mẫu: [ui-templates/store-front/pc-build.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/pc-build.html)
- Tệp mã nguồn: [fe/src/app/features/pc-build/custom-build-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/pc-build/custom-build-page.component.ts)

| Mã lỗi | Mức độ | Mô tả chi tiết sai lệch | Hướng khắc phục đề xuất |
| :--- | :--- | :--- | :--- |
| PB-01 | P1 | Cột tóm tắt dự toán bên phải thiếu trường chọn chi nhánh lắp ráp và bàn giao (Branch Selector) kèm kiểm tra trạng thái tồn kho thực tế của toàn bộ linh kiện đã chọn. | Tích hợp bộ chọn chi nhánh và kiểm tra tính sẵn sàng của linh kiện ngay trên trang Builder. |
| PB-02 | P2 | Các ô linh kiện chưa chọn (như Vỏ Case) chưa có giao diện nổi bật dạng nét đứt có nút kêu gọi hành động + Chọn Vỏ Case Tương Thích. | Chuẩn hóa giao diện ô linh kiện trống với viền nét đứt và nút hành động rõ ràng. |
| PB-03 | P2 | Gói dịch vụ kỹ thuật đính kèm (Lắp ráp đi dây chuyên nghiệp, Cài Windows và Stress test 24h) ở mẫu là checkbox cho người dùng tự chọn, trong khi FE là các ô thông tin tĩnh. | Chuyển đổi các gói dịch vụ sang dạng checkbox có thể bật/tắt và cập nhật vào giá tạm tính. |

---

### Màn Hình 6: Cửa Sổ Đổi Linh Kiện (Component Swap Modal)
- Tệp mẫu: [ui-templates/store-front/change-component.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/change-component.html)
- Tệp mã nguồn: [fe/src/app/features/pc-build/component-swap-modal.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/pc-build/component-swap-modal.component.ts)

| Mã lỗi | Mức độ | Mô tả chi tiết sai lệch | Hướng khắc phục đề xuất |
| :--- | :--- | :--- | :--- |
| SW-01 | P1 | Danh sách linh kiện ứng viên trong modal thiếu hiển thị hình ảnh đại diện thumbnail của sản phẩm, chỉ có tên và giá tiền. | Bổ sung thẻ hình ảnh thumbnail cho từng linh kiện trong danh sách hoán đổi để người dùng nhận diện trực quan. |
| SW-02 | P1 | Cửa sổ đổi linh kiện cần bổ sung bộ lọc chuyên sâu theo các thông số kỹ thuật cụ thể của từng dòng linh kiện (ví dụ: CPU theo Socket và Số nhân/luồng; RAM theo Chuẩn DDR4/DDR5 và Bus MHz; VGA theo Dung lượng VRAM và Chiều dài Card; Nguồn theo Công suất Watt và Chuẩn 80 Plus; Case theo Kích cỡ Mainboard hỗ trợ). | Xây dựng bộ lọc thông số kỹ thuật động (Dynamic Technical Specification Filters) tương thích riêng theo từng category linh kiện đang chọn đổi. |

---

### Màn Hình 7: Giỏ Hàng (Shopping Cart)
- Tệp mẫu: [ui-templates/store-front/cart.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/cart.html)
- Tệp mã nguồn: [fe/src/app/features/cart/cart-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/cart/cart-page.component.ts)

| Mã lỗi | Mức độ | Mô tả chi tiết sai lệch | Hướng khắc phục đề xuất |
| :--- | :--- | :--- | :--- |
| CA-01 | P1 | Khối cấu hình PC tùy chọn trong giỏ hàng thiếu nút Đổi món trực tiếp trên từng linh kiện thành phần khi mở danh sách chi tiết. | Thêm liên kết Đổi món cạnh mỗi linh kiện trong dropdown bộ PC để mở modal hoán đổi linh kiện. |
| CA-02 | P2 | Thiếu dải trạng thái miễn phí vận chuyển kèm thanh tiến trình phần trăm đạt ngưỡng đơn hàng (Ví dụ: Mua thêm X đồng để miễn phí ship). | Thêm thanh tiến trình phần trăm miễn phí giao hàng ở đầu danh sách giỏ hàng. |

---

### Màn Hình 8: Thanh Toán & Đặt Hàng (Checkout)
- Tệp mẫu: [ui-templates/store-front/checkout.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/checkout.html)
- Tệp mã nguồn: [fe/src/app/features/checkout/checkout-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/checkout/checkout-page.component.ts)

| Mã lỗi | Mức độ | Mô tả chi tiết sai lệch | Hướng khắc phục đề xuất |
| :--- | :--- | :--- | :--- |
| CO-01 | P0 | Luồng thanh toán trên FE bắt buộc phải gửi OTP xác thực cả Email và Số điện thoại rồi bấm Tạo báo giá chính thức mới hiện nút đặt hàng, gây ma sát nhận thức lớn và làm gián đoạn luồng mua sắm so với mẫu thiết kế mở của template. | Tái cấu trúc luồng checkout theo mẫu: cho phép nhập thông tin người nhận, chọn chi nhánh/địa chỉ và xem báo giá kèm VietQR trực tiếp; OTP chỉ yêu cầu khi tra cứu hoặc xác thực đặc thù. |
| CO-02 | P2 | Cột danh sách linh kiện đặt mua ở cột phải thiếu nút bấm dropdown thu gọn/mở rộng xem chi tiết 8 linh kiện thành phần của bộ PC. | Bổ sung nút bấm accordion xem chi tiết danh sách linh kiện của cấu hình PC trong phần tóm tắt đơn. |
| CO-03 | P2 | Khối hiển thị mã VietQR động thiếu đồng hồ đếm ngược giữ hàng (Countdown Timer 20 phút) như thiết kế mẫu. | Bổ sung đồng hồ đếm ngược thời gian giữ đơn và mã QR thanh toán. |

---

### Màn Hình 9: Tra Cứu Đơn Hàng (Order Lookup & Tracking)
- Tệp mẫu: [ui-templates/store-front/order-tracking.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/order-tracking.html)
- Tệp mã nguồn: [fe/src/app/features/orders/order-lookup-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/orders/order-lookup-page.component.ts)

| Mã lỗi | Mức độ | Mô tả chi tiết sai lệch | Hướng khắc phục đề xuất |
| :--- | :--- | :--- | :--- |
| TR-01 | P2 | Thiếu khối cam kết SLA xử lý đơn hàng (SLA 120 phút, hỗ trợ kỹ thuật 7 ngày/tuần) trong phần tóm tắt đơn hàng. | Bổ sung các badge cam kết dịch vụ vào giao diện tra cứu đơn. |
| TR-02 | P3 | Tiến trình xử lý 5 giai đoạn đã triển khai tốt, nhưng chưa có thông tin chi tiết về kỹ thuật viên phụ trách lắp ráp và chứng nhận kết quả bài kiểm tra nhiệt độ FurMark. | Bổ sung thông tin kỹ thuật viên và kết quả stress test vào giai đoạn lắp ráp. |

---

### Màn Hình 10: Quản Lý Đơn Hàng Kanban (Order Kanban View)
- Tệp mẫu: [ui-templates/store-front/order-kanban-view.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/order-kanban-view.html)
- Tệp mã nguồn: [fe/src/app/features/orders/order-kanban-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/orders/order-kanban-page.component.ts)

| Mã lỗi | Mức độ | Mô tả chi tiết sai lệch | Hướng khắc phục đề xuất |
| :--- | :--- | :--- | :--- |
| KB-01 | P2 | Thẻ đơn hàng trên cột Lắp ráp của Kanban chưa hiển thị khối Telemetry chi tiết (nhiệt độ tối đa khi stress test, ví dụ: FurMark Max 64°C). | Bổ sung thuộc tính metrics vào thẻ đơn hàng khi ở giai đoạn lắp ráp. |

---

### Màn Hình 11: Tài Khoản Cá Nhân (Profile Page)
- Tệp mẫu: [ui-templates/store-front/profile-page.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/profile-page.html)
- Tệp mã nguồn: [fe/src/app/features/profile/profile-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/profile/profile-page.component.ts)

| Mã lỗi | Mức độ | Mô tả chi tiết sai lệch | Hướng khắc phục đề xuất |
| :--- | :--- | :--- | :--- |
| PR-01 | P2 | Mẫu thiết kế có thẻ Đơn hàng mới nhất ghim trên đầu với mã OTP nhận máy dạng số lớn (Ví dụ: 489-102) và mini-timeline 4 bước hiển thị sẵn, trong khi FE chia tách vào tab Đơn hàng riêng biệt. | Bổ sung thẻ tóm tắt đơn hàng đang xử lý nổi bật ở đầu trang thông tin cá nhân. |

---

### Màn Hình 12: Đăng Nhập / Đăng Ký (Auth Modal)
- Tệp mẫu: [ui-templates/store-front/auth.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/auth.html)
- Tệp mã nguồn: [fe/src/app/features/auth/auth-modal.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/auth/auth-modal.component.ts)

| Mã lỗi | Mức độ | Mô tả chi tiết sai lệch | Hướng khắc phục đề xuất |
| :--- | :--- | :--- | :--- |
| AU-01 | P3 | Thiếu tùy chọn Ghi nhớ đăng nhập (checkbox) và liên kết Quên mật khẩu? trong form đăng nhập. | Bổ sung checkbox ghi nhớ tài khoản và liên kết quên mật khẩu vào form. |

---

## 6. Lộ Trình Đề Xuất Khắc Phục (Remediation Roadmap)

Để đưa giao diện Frontend [fe](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe) đạt 100% chuẩn theo bộ thiết kế [ui-templates/store-front](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front), các bước hoàn thiện nên được chia thành 3 giai đoạn:

### Giai Đoạn 1: Tháo Gỡ Điểm Nghẽn Luồng Mua Sắm & Tự Dựng PC (Ưu tiên P0 và P1)
- Cải tổ luồng Checkout: Đơn giản hóa form thanh toán, cho phép tạo đơn và hiển thị VietQR kèm bộ đếm ngược mà không bắt buộc 2 bước OTP chặn trước.
- Hoàn thiện trang Catalog: Thêm nút + Build PC trên từng card linh kiện và bổ sung các pill thông số kỹ thuật (VRAM, Bus, TDP).
- Nâng cấp Component Swap Modal: Bổ sung thumbnail hình ảnh và tích hợp bộ lọc theo các thông số kỹ thuật cụ thể (Socket, Bus, VRAM, TDP, Form Factor...).
- Cho phép đổi linh kiện trực tiếp từ giỏ hàng.

### Giai Đoạn 2: Đồng Bộ Khối Trưng Bày và Dữ Liệu Kho Trang Chủ (Ưu tiên P1 và P2)
- Thêm dải Live Stock Telemetry 3 kho vào trang chủ.
- Xây dựng khối Tri-Job Launchpad và Visual Rig Showcase Bento với bảng linh kiện chi tiết.
- Bổ sung khối trưng bày Virtual Prebuilt BOM Collection cho 3 bộ máy ráp sẵn.
- Tích hợp bộ chọn chi nhánh và kiểm tra tồn kho trực tiếp trên trang Builder.

### Giai Đoạn 3: Hoàn Thiện Tương Tác Phụ, Bộ Lọc và Tinh Chỉnh Thị Giác (Ưu tiên P2 và P3)
- Bổ sung thanh phân trang (Pagination) ở chân trang danh mục.
- Tích hợp gallery ảnh đa góc và cảnh báo case clearance trên trang chi tiết sản phẩm.
- Bổ sung thanh tiến trình miễn phí vận chuyển trong giỏ hàng.
- Loại bỏ các lớp trang trí anti-pattern (`bg-clip-text text-transparent`) trên hero trang chủ.
