# CHƯƠNG 3. KHẢO SÁT, PHÂN TÍCH NGHIỆP VỤ VÀ ĐẶC TẢ YÊU CẦU

Chương này trình bày chi tiết kết quả khảo sát thực nghiệm trên ba nền tảng thương mại điện tử chuyên doanh linh kiện máy tính hàng đầu tại Việt Nam gồm GEARVN, HACOM và Phong Vũ. Trên cơ sở đối chiếu và phân tích khoảng trống nghiệp vụ, chương xác lập mô hình giá trị, phạm vi vận hành một cửa hàng một kho của EL-TECH, phân định các tác nhân hệ thống và xây dựng hệ thống đặc tả toàn diện bao gồm 7 nhóm yêu cầu chức năng (FR), 3 nhóm yêu cầu phi chức năng (NFR), 5 nhóm quy tắc nghiệp vụ bắt buộc (BR), bộ tiêu chí chấp nhận (AC) và ma trận truy vết toàn hệ thống.

---

## 3.1. Giới thiệu mô hình kinh doanh EL-TECH

### 3.1.1. Thương hiệu, định vị và giá trị cung cấp

Mục tiêu của tiểu mục này là giới thiệu định vị thương hiệu giả định EL-TECH Dragon Store và mô hình dòng giá trị mang lại cho khách hàng và doanh nghiệp.

EL-TECH Dragon Store được định vị là đơn vị chuyên doanh phần cứng máy tính để bàn (PC), tập trung phục vụ đối tượng khách hàng có nhu cầu nâng cấp linh kiện, game thủ, nhà sáng tạo nội dung số và các cá nhân mong muốn sở hữu dàn máy tính tự lắp ráp tối ưu theo ngân sách. Khác với các chuỗi siêu thị điện máy tổng hợp, giá trị cốt lõi của EL-TECH không nằm ở sự đa dạng về các mặt hàng tiêu dùng, mà nằm ở tính chuyên sâu về giải pháp kỹ thuật phần cứng và công cụ tư vấn tính tương thích linh kiện trực quan, tin cậy.

![Hình 3.1.1. Mô hình giá trị EL-TECH](drawio/hinh-3-1-1-mo-hinh-gia-tri.png)  
*Hình 3.1.1. Mô hình giá trị EL-TECH*  
*Tệp nguồn sơ đồ:* [hinh-3-1-1-mo-hinh-gia-tri.drawio](drawio/hinh-3-1-1-mo-hinh-gia-tri.drawio)

Sơ đồ dòng giá trị trên thể hiện sự tương tác đa chiều giữa ba chủ thể: Khách hàng (Buyer), Nền tảng trực tuyến EL-TECH và Cửa hàng - Kho vật lý tập trung. Khách hàng tiếp cận hệ thống với nhu cầu cấu hình một dàn máy tính hoàn chỉnh trong khoảng ngân sách định sẵn. Thay vì phải tự tra cứu tài liệu kỹ thuật phức tạp, công cụ tự lắp ráp máy tính (PC Builder) của EL-TECH đóng vai trò là một chuyên gia tư vấn ảo: hỗ trợ chọn linh kiện theo từng bước, tự động lọc danh sách tương thích theo chân cắm bo mạch chủ, kiểm tra công suất bộ nguồn (PSU) và tính toán tổng chi phí tức thời.

Tại tầng giao dịch, hệ thống trực tuyến cung cấp trải nghiệm đặt hàng minh bạch với hai phương thức thanh toán an toàn gồm chuyển khoản qua mã VietQR và thanh toán tiền mặt khi nhận hàng (COD). Khi đơn hàng được xác nhận, lệnh xuất kho và phiếu kỹ thuật được chuyển trực tiếp tới xưởng lắp ráp tại cửa hàng. Kỹ thuật viên tiến hành lắp ráp, kiểm tra độ ổn định nhiệt độ, gán mã định danh Serial Number cho từng linh kiện và đóng gói bàn giao cho khách hàng hoặc đơn vị vận chuyển.

Cần nhấn mạnh quyết định phạm vi chiến lược: hệ thống kiên quyết loại bỏ hoàn toàn ngành hàng máy tính xách tay (Laptop), điện thoại di động và máy tính bảng ra khỏi mô hình kinh doanh. Sự tập trung tuyệt đối vào linh kiện PC và PC lắp ráp giúp EL-TECH tối ưu hóa năng lực phục vụ, quản trị danh mục tinh gọn và nâng cao độ chính xác của các thuật toán tương thích phần cứng.

### 3.1.2. Danh mục sản phẩm và dịch vụ

Mục tiêu của tiểu mục này là xác lập chi tiết danh mục các nhóm mặt hàng mục tiêu được phép kinh doanh trên hệ thống và các chính sách giới hạn phạm vi dữ liệu.

Nhằm bảo đảm tính tập trung của đề tài, hệ thống quy định rõ các nhóm linh kiện phần cứng được phép lưu hành và loại bỏ toàn bộ các nhóm sản phẩm ngoài phạm vi khỏi cơ sở dữ liệu và menu điều hướng:

**Bảng 3.1.2. Danh mục mặt hàng mục tiêu và chính sách phạm vi**

| Danh mục mặt hàng | Phân loại linh kiện / dịch vụ | Hình thức bán hàng | Phạm vi áp dụng | Lưu ý kiểm soát dữ liệu trong hệ thống |
| :--- | :--- | :--- | :--- | :--- |
| Bộ vi xử lý (CPU) | Linh kiện phần cứng cốt lõi | Bán rời và tham gia bộ máy dựng sẵn (PC Bundle) | Trong phạm vi MVP | Quản lý thông số socket, số nhân/luồng, TDP |
| Bo mạch chủ (Mainboard) | Linh kiện phần cứng cốt lõi | Bán rời và tham gia bộ máy dựng sẵn (PC Bundle) | Trong phạm vi MVP | Quản lý chipset, socket hỗ trợ, chuẩn khe cắm RAM |
| Bộ nhớ trong (RAM) | Linh kiện phần cứng cốt lõi | Bán rời và tham gia bộ máy dựng sẵn (PC Bundle) | Trong phạm vi MVP | Quản lý chuẩn DDR4/DDR5, bus RAM, dung lượng |
| Card đồ họa (VGA) | Linh kiện phần cứng cốt lõi | Bán rời và tham gia bộ máy dựng sẵn (PC Bundle) | Trong phạm vi MVP | Quản lý công suất đề nghị, chiều dài card (mm) |
| Ổ cứng lưu trữ (SSD/HDD) | Linh kiện phần cứng cốt lõi | Bán rời và tham gia bộ máy dựng sẵn (PC Bundle) | Trong phạm vi MVP | Quản lý chuẩn giao tiếp M.2 NVMe, SATA 3, dung lượng |
| Nguồn máy tính (PSU) | Linh kiện phần cứng cốt lõi | Bán rời và tham gia bộ máy dựng sẵn (PC Bundle) | Trong phạm vi MVP | Quản lý công suất thực danh định (Watt), chuẩn 80 Plus |
| Vỏ máy tính (Case) | Khung vỏ và thẩm mỹ | Bán rời và tham gia bộ máy dựng sẵn (PC Bundle) | Trong phạm vi MVP | Quản lý kích thước chuẩn hỗ trợ (ATX, M-ATX, ITX) |
| Tản nhiệt (Cooling) | Tản nhiệt khí / Nước All-in-One | Bán rời và tham gia bộ máy dựng sẵn (PC Bundle) | Trong phạm vi MVP | Quản lý socket hỗ trợ, kích thước két nước radiator |
| Dàn máy PC dựng sẵn | Bộ PC hoàn chỉnh theo định mức linh kiện ảo (Virtual BOM) | Bán nguyên bộ bộ máy dựng sẵn (PC Bundle) | Trong phạm vi MVP | Cấu thành từ cây linh kiện con qua `PcBundleItem` |
| Máy tính xách tay (Laptop) | Thiết bị di động nguyên khối | Không kinh doanh | Ngoài phạm vi (OUT) | Loại bỏ hoàn toàn khỏi menu, seed dữ liệu và API |
| Điện thoại & Tablet | Thiết bị viễn thông di động | Không kinh doanh | Ngoài phạm vi (OUT) | Loại bỏ hoàn toàn khỏi menu, seed dữ liệu và API |

Bảng trên là căn cứ dữ liệu để nhóm thực hiện rà soát và làm sạch dữ liệu mẫu (Seed Data) trong tệp [be/prisma/schema.prisma](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/prisma/schema.prisma). Việc xác định phạm vi dứt khoát giúp giao diện trang chủ và bộ lọc không bị phân tán, đảm bảo hệ thống chuyên nghiệp và nhất quán với mục tiêu đề tài.

### 3.1.3. Mô hình vận hành một cửa hàng và một kho

Mục tiêu của tiểu mục này là làm rõ ranh giới vận hành vật lý của EL-TECH, khẳng định tính khả thi của mô hình một kho hàng tập trung.

EL-TECH hoạt động theo mô hình một địa điểm kinh doanh duy nhất (Single Store, Single Warehouse). Toàn bộ chuỗi cung ứng bắt đầu từ việc tiếp nhận đơn đặt hàng mua (đơn mua hàng nhập kho (Purchase Order) - PO) từ nhà cung cấp chính hãng, nhập hàng vào kho trung tâm, kiểm tra số serial và lưu kho.

![Hình 3.1.3. Mô hình vận hành một cửa hàng EL-TECH](drawio/hinh-3-1-3-mo-hinh-van-hanh.png)  
*Hình 3.1.3. Mô hình vận hành một cửa hàng EL-TECH*  
*Tệp nguồn sơ đồ:* [hinh-3-1-3-mo-hinh-van-hanh.drawio](drawio/hinh-3-1-3-mo-hinh-van-hanh.drawio)

Sơ đồ trên mô tả quy trình vận hành luân chuyển hàng hóa khép kín. Hàng hóa sau khi nhập kho được phục vụ đồng thời cho hai kênh phân phối: bán lẻ linh kiện đơn chiếc trực tiếp cho khách hàng hoặc cung cấp linh kiện cho xưởng kỹ thuật để tiến hành lắp ráp thành các dàn máy PC hoàn chỉnh. 

Về mặt công nghệ, mô hình này loại bỏ hoàn toàn các khái niệm phân bổ hàng hóa đa chi nhánh, chuyển kho nội bộ (Inter-branch Transfers) hay giá vốn theo từng cửa hàng. Điều này giúp tối giản hóa cơ sở dữ liệu: mỗi mã SKU chỉ có duy nhất một bản ghi số dư tồn kho `StockQuant` và áp dụng một mức giá vốn bình quân gia quyền `wacUnitCost` thống nhất trên toàn hệ thống.

---

## 3.2. Khảo sát các website tương tự và rút ra yêu cầu

### 3.2.1. Mục tiêu, đối tượng và phương pháp khảo sát

Mục tiêu của công tác khảo sát là thu thập các bằng chứng thực tế về trải nghiệm người dùng, cấu trúc chức năng và các quy trình giao dịch trên các nền tảng bán lẻ máy tính hàng đầu tại Việt Nam, từ đó xác lập bộ yêu cầu kỹ thuật và quyết định thiết kế cho EL-TECH.

Nhóm lựa chọn ba đối tượng khảo sát đại diện:
- Website GEARVN (`https://gearvn.com/?srsltid=AYCX9vIihusJ-XKqxPTA_5Aeq5jTKRom_h6UPfvTw121Piqf2TvgITKk`): Đơn vị bán lẻ hàng đầu về PC Gaming và linh kiện cao cấp tại TP.HCM.
- Website HACOM (`https://hacom.vn/`): Hệ thống bán lẻ máy tính lâu năm với thế mạnh về danh mục linh kiện chuyên sâu và khách hàng am hiểu kỹ thuật.
- Website Phong Vũ (`https://phongvu.vn/`): Chuỗi bán lẻ điện máy và thiết bị công nghệ quy mô toàn quốc.

Phương pháp thực hiện: Nhóm tiến hành truy cập trực tiếp các trang web chính thức tại thời điểm Quý 4 năm 2026, ghi nhận trải nghiệm người dùng thực tế, lưu trữ ảnh chụp màn hình minh chứng và ghi nhận vào phiếu quan sát có cấu trúc. Nhóm cam kết không sử dụng các nhận định cảm tính hoặc suy diễn các số liệu nội bộ không có bằng chứng công khai.

### 3.2.2. Xây dựng bộ tiêu chí so sánh

Nhóm thiết lập bộ tiêu chí so sánh chuẩn hóa gồm 11 khía cạnh nghiệp vụ và trải nghiệm người dùng cốt lõi:

**Bảng 3.2.2. Bộ tiêu chí khảo sát và thang đánh giá**

| Mã tiêu chí | Tên tiêu chí đánh giá | Mô tả nội dung tiêu chí | Bằng chứng cần thu thập | Quy tắc đánh giá |
| :--- | :--- | :--- | :--- | :--- |
| TC-01 | Phân cấp menu linh kiện | Độ rõ ràng và chuyên sâu của cây danh mục phần cứng PC | Ảnh chụp menu trang chủ | Có / Không / Một phần |
| TC-02 | Bộ lọc thông số kỹ thuật | Khả năng lọc chi tiết theo Socket, Bus RAM, Chuẩn PCIe | Ảnh chụp trang danh mục | Có / Không / Một phần |
| TC-03 | Công cụ PC Builder | Tính năng chọn cấu hình máy tính theo từng linh kiện | Ảnh chụp trang tự lắp ráp máy tính (PC Builder) | Có / Không / Một phần |
| TC-04 | Kiểm tra tương thích tự động | Cảnh báo xung đột phần cứng khi cấu hình PC | Kết quả thử nghiệm chọn sai socket | Có cảnh báo / Không cảnh báo |
| TC-05 | Đóng gói bộ máy dựng sẵn (PC Bundle) sẵn | Bán dàn máy hoàn chỉnh với cấu hình định mức linh kiện ảo (Virtual BOM) | Danh sách PC dựng sẵn | Có / Không |
| TC-06 | Luồng giỏ hàng và thanh toán | Trải nghiệm checkout, phương thức QR Code và COD | Ảnh chụp giao diện thanh toán | Đầy đủ / Rườm rà |
| TC-07 | Chính sách đặt cọc | Có bắt buộc đặt cọc tiền đối với đơn hàng lắp ráp hay không | Điều khoản thanh toán công bố | Bắt buộc / Không bắt buộc |
| TC-08 | Tra cứu đơn hàng vãng lai | Khả năng tra cứu đơn không cần đăng nhập tài khoản | Form tra cứu đơn hàng | Hỗ trợ / Chỉ hỗ trợ thành viên |
| TC-09 | Đánh giá nhận xét sản phẩm | Ràng buộc điều kiện mua hàng khi gửi đánh giá sao | Form gửi review chi tiết | Tự do / Bắt buộc đã mua |
| TC-10 | Tiếp nhận khiếu nại đổi trả | Kênh tiếp nhận phản ánh chất lượng trên website | Trang liên hệ / khiếu nại | Form trực tuyến / Chỉ qua hotline |
| TC-11 | Mật độ thông tin & UI/UX | Tính thẩm mỹ, phong cách hiện đại, responsive | Ảnh chụp desktop và mobile | Cao / Trung bình / Thấp |

### 3.2.3. Phân tích website GEARVN

Nhóm tiến hành khảo sát thực nghiệm trên hệ thống GEARVN và ghi nhận các bằng chứng sau:

![Hình 3.2.3. Ảnh minh chứng khảo sát giao diện GEARVN](images/surveys/hinh-3-2-3-gearvn.png)  
*Hình 3.2.3. Ảnh minh chứng khảo sát giao diện GEARVN (Nguồn: gearvn.com, truy cập ngày 02/11/2026 tại https://gearvn.com/?srsltid=AYCX9vIihusJ-XKqxPTA_5Aeq5jTKRom_h6UPfvTw121Piqf2TvgITKk)*

**Bảng 3.2.3. Phiếu quan sát website GEARVN**

| Tiêu chí | Quan sát thực tế | Bằng chứng URL / Ảnh chụp | Tác động thiết kế lên EL-TECH |
| :--- | :--- | :--- | :--- |
| TC-01, TC-02 | Menu phân cấp linh kiện rất trực quan; bộ lọc giá và thương hiệu mượt mà nhưng bộ lọc thông số kỹ thuật sâu còn hạn chế | `gearvn.com/collections/linh-kien-pc` | Kế thừa phân cấp menu nhưng bổ sung bộ lọc thông số socket chuyên sâu |
| TC-03, TC-04 | Cung cấp công cụ xây dựng cấu hình PC; có tính năng tự động cộng tổng giá tiền và gợi ý nguồn; chưa cảnh báo xung đột kích thước case | `gearvn.com/pages/build-pc` | EL-TECH phát triển PC Builder có kiểm tra chuẩn chân cắm và công suất nguồn |
| TC-06, TC-07 | Tích hợp cổng thanh toán VNPay-QR và COD; các đơn tự ráp giá trị cao có nhân viên gọi xác nhận đặt cọc | Quy trình thanh toán trên site | EL-TECH áp dụng QR/COD toàn phần, kiên quyết không yêu cầu cọc để tinh giản |
| TC-08, TC-10 | Tra cứu đơn chủ yếu qua số hotline hoặc tài khoản; form khiếu nại bảo hành nằm riêng tại trang chính sách | `gearvn.com/pages/chinh-sach-bao-hanh` | EL-TECH bổ sung cổng tra cứu đơn vãng lai bằng OTP và form tiếp nhận khiếu nại |

### 3.2.4. Phân tích website HACOM

Khảo sát trên hệ thống HACOM ghi nhận các điểm nổi bật về chiều sâu kỹ thuật:

![Hình 3.2.4. Ảnh minh chứng khảo sát giao diện HACOM](images/surveys/hinh-3-2-4-hacom.png)  
*Hình 3.2.4. Ảnh minh chứng khảo sát giao diện HACOM (Nguồn: hacom.vn, truy cập ngày 02/11/2026 tại https://hacom.vn/)*

**Bảng 3.2.4. Phiếu quan sát website HACOM**

| Tiêu chí | Quan sát thực tế | Bằng chứng URL / Ảnh chụp | Tác động thiết kế lên EL-TECH |
| :--- | :--- | :--- | :--- |
| TC-01, TC-02 | Bộ lọc thông số kỹ thuật chi tiết nhất (Socket, Bus RAM, Chuẩn PCIe, Chiều dài VGA); phục vụ tốt người dùng chuyên sâu | `hacom.vn/linh-kien-may-tinh` | Học hỏi bảng thuộc tính kỹ thuật để đưa vào schema `ProductTemplate` |
| TC-03, TC-04 | PC Builder chuyên nghiệp, hỗ trợ in báo giá ra PDF/Excel; có thuật toán kiểm tra tính tương thích socket | `hacom.vn/xay-dung-cau-hinh-may-tinh` | Kế thừa thuật toán kiểm tra socket giữa CPU và Mainboard |
| TC-08, TC-09 | Cho phép tra cứu bảo hành qua Serial; phần đánh giá sản phẩm yêu cầu đăng nhập thành viên | `hacom.vn/tra-cuu-bao-hanh` | EL-TECH áp dụng đánh giá mở tự do cho mọi khách hàng không cần đăng nhập |
| TC-11 | Mật độ thông tin quá dày đặc, nhiều banner khuyến mãi nhấp nháy tạo cảm giác rối mắt cho người dùng mới | Giao diện tổng quan trang chủ | EL-TECH ứng dụng Spartan UI tối giản, tăng khoảng thở và độ tương phản cao |

### 3.2.5. Phân tích website Phong Vũ

Khảo sát trên hệ thống Phong Vũ mang lại bài học về quản lý tài khoản và giao tiếp:

![Hình 3.2.5. Ảnh minh chứng khảo sát giao diện Phong Vũ](images/surveys/hinh-3-2-5-phongvu.png)  
*Hình 3.2.5. Ảnh minh chứng khảo sát giao diện Phong Vũ (Nguồn: phongvu.vn, truy cập ngày 02/11/2026 tại https://phongvu.vn/)*

**Bảng 3.2.5. Phiếu quan sát website Phong Vũ**

| Tiêu chí | Quan sát thực tế | Bằng chứng URL / Ảnh chụp | Tác động thiết kế lên EL-TECH |
| :--- | :--- | :--- | :--- |
| TC-01, TC-05 | Danh mục kinh doanh hỗn hợp (Laptop, Điện thoại, Thiết bị gia dụng); linh kiện PC không phải ưu tiên duy nhất | `phongvu.vn` | EL-TECH kiên quyết loại bỏ laptop và mobile để tập trung 100% cho PC |
| TC-06, TC-08 | Cổng tra cứu đơn hàng bằng số điện thoại gửi mã OTP SMS rất bảo mật và tiện lợi cho khách vãng lai | `phongvu.vn/tra-cuu-don-hang` | Kế thừa trực tiếp giải pháp tra cứu bằng SĐT/Email kết hợp mã OTP cho khách |
| TC-09, TC-10 | Đánh giá sản phẩm chỉ cho phép khi đã mua hàng thành công; khiếu nại hỗ trợ đa kênh qua tổng đài | Chính sách đánh giá Phong Vũ | EL-TECH áp dụng form khiếu nại tự do trên website, xử lý ngoại lệ ngoài màn hình |
| TC-11 | Giao diện chuẩn phong cách thương mại điện tử hiện đại, responsive tốt trên các thiết bị di động | Giao diện mobile web Phong Vũ | Kế thừa phong cách Mobile-First với bottom navigation bar |

### 3.2.6. So sánh tổng hợp, khoảng trống và yêu cầu rút ra

Dưới đây là ma trận so sánh tổng hợp giữa ba website khảo sát và các quyết định thiết kế cho hệ thống EL-TECH:

**Bảng 3.2.6. Ma trận so sánh GEARVN - HACOM - Phong Vũ - EL-TECH**

| Tiêu chí khảo sát | GEARVN | HACOM | Phong Vũ | Quyết định thiết kế của EL-TECH | Yêu cầu FR liên quan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Chuyên biệt hóa ngành hàng | Gaming & PC | PC & Doanh nghiệp | Đa ngành hàng | 100% Linh kiện PC và bộ máy dựng sẵn (PC Bundle), không laptop/mobile | FR-01, FR-02 |
| Bộ lọc thông số kỹ thuật | Trung bình | Rất chi tiết | Cơ bản | Chi tiết các thuộc tính phần cứng cốt lõi (Socket, TDP, Bus) | FR-03, FR-04 |
| Công cụ PC Builder | Có | Có | Có | PC Builder trực quan 8 thành phần, kiểm tra tương thích | FR-05, FR-06 |
| Chính sách đặt cọc | Bắt buộc cọc PC | Bắt buộc cọc PC | Tùy giá trị đơn | Tuyệt đối không bắt cọc; thanh toán QR hoặc COD toàn phần | FR-10, BR-03 |
| Tra cứu đơn vãng lai | Hạn chế | Qua Hotline | Hỗ trợ qua OTP | Hỗ trợ 3 cách: Mã đơn, SĐT/Email kèm xác thực OTP | FR-12, FR-13 |
| Chính sách đánh giá SP | Có kiểm duyệt | Thành viên | Bắt buộc đã mua | Đánh giá tự do, không bắt buộc mua hàng, không duyệt tay | FR-14, BR-02 |
| Tiếp nhận khiếu nại | Trang bảo hành | Trung tâm BH | Tổng đài CSKH | Form gửi nội dung tự do trên web, tiếp nhận vào DB | FR-15, BR-05 |
| Mô hình quản trị kho | Đa chi nhánh | Đa chi nhánh | Đa chi nhánh | Một cửa hàng, một kho trung tâm duy nhất, quản lý giá vốn bình quân gia quyền (WAC) | FR-18, FR-19 |

Phân tích ma trận so sánh cho thấy khoảng trống lớn của các website hiện nay là sự phức tạp trong quy trình đặt cọc và chính sách tra cứu đơn cho khách vãng lai. EL-TECH định vị sự khác biệt bằng cách tinh giản triệt để: không cọc tiền, tra cứu minh bạch bằng OTP và hỗ trợ tối đa người tự ráp máy tính.

---

## 3.3. Các bên liên quan và tác nhân hệ thống

### 3.3.1. Nhận diện stakeholders và nhu cầu

Mục tiêu của tiểu mục này là nhận diện toàn bộ các bên liên quan (Stakeholders) tham gia trực tiếp hoặc gián tiếp vào hệ thống và phân tích nhu cầu của họ.

**Bảng 3.3.1. Ma trận bên liên quan và mức độ tham gia**

| Nhóm Stakeholder | Nhu cầu và mong đợi chính | Trách nhiệm chính trong hệ thống | Quyền hạn trên phần mềm | Mức ảnh hưởng |
| :--- | :--- | :--- | :--- | :--- |
| Khách vãng lai (Guest) | Tra cứu linh kiện nhanh, ráp PC đúng, đặt hàng không cần tạo tài khoản rườm rà | Cung cấp thông tin nhận hàng và thanh toán đúng hạn | Quyền truy cập công khai và tra cứu đơn của chính mình | Rất cao |
| Khách hàng thành viên | Lưu trữ thông tin cá nhân, xem lịch sử đơn hàng, quản lý hồ sơ và nhận diện ưu đãi | Tuân thủ điều khoản dịch vụ và bảo mật mật khẩu | Quyền tài khoản cá nhân, xem đơn của chính mình | Rất cao |
| Quản trị viên cửa hàng | Vận hành toàn bộ quy trình: catalog, giá, đơn hàng, tồn kho, báo cáo doanh thu | Quản lý kinh doanh, nhập kho, duyệt đơn và điều phối giao hàng | Toàn quyền quản trị trên phân hệ quản trị | Toàn diện |
| Kỹ thuật viên lắp ráp | Nhận phiếu linh kiện định mức linh kiện ảo (Virtual BOM) rõ ràng, chính xác để ráp máy chuẩn kỹ thuật | Lắp ráp máy tính, kiểm tra tương thích vật lý, dán tem bảo hành | Không có tài khoản riêng; thao tác thông qua Admin | Cao |
| Thủ kho (Warehouse) | Kiểm kê số lượng tồn kho tức thời chính xác, quét serial nhập/xuất kho nhanh | Quản lý nhập hàng PO, kiểm định serial và bảo toàn hàng hóa | Thao tác trên phân hệ kho của cổng quản trị | Cao |
| Nhà cung cấp (Supplier) | Nhận đơn đặt hàng PO minh bạch, thanh toán tiền hàng đúng hợp đồng | Cung cấp linh kiện chính hãng, bảo hành theo tiêu chuẩn | Không có tài khoản; tương tác qua phiếu PO in ấn | Trung bình |
| Đơn vị vận chuyển (Carrier) | Nhận thông tin kiện hàng, địa chỉ và số tiền COD cần thu chuẩn xác | Giao hàng đúng hạn, thu hộ COD và phản hồi trạng thái giao | Tương tác giao nhận ngoài hệ thống phần mềm | Trung bình |

Bảng ma trận trên khẳng định rõ: trong phần mềm EL-TECH, chỉ có 3 nhóm người dùng có tài khoản hoặc tương tác trực tiếp qua màn hình là Khách vãng lai, Khách thành viên và Quản trị viên. Các vai trò như Kỹ thuật viên, Thủ kho được gộp chung vào phân hệ quản trị; Nhà cung cấp và Đơn vị giao vận thuộc ranh giới hoạt động ngoài màn hình (ngoài hệ thống trực tuyến).

### 3.3.2. Phân định actor hệ thống và vai trò nghiệp vụ

Mục tiêu của tiểu mục này là phân định ranh giới giữa tác nhân hệ thống phần mềm và các vai trò nghiệp vụ thực tế.

![Hình 3.3.2. Sơ đồ bối cảnh tác nhân EL-TECH](drawio/hinh-3-3-2-so-do-boi-canh-tac-nhan.png)  
*Hình 3.3.2. Sơ đồ bối cảnh tác nhân EL-TECH*  
*Tệp nguồn sơ đồ:* [hinh-3-3-2-so-do-boi-canh-tac-nhan.drawio](drawio/hinh-3-3-2-so-do-boi-canh-tac-nhan.drawio)

Sơ đồ trên xác lập đường biên hệ thống (System Boundary) của phần mềm EL-TECH. Tác nhân tương tác trực tiếp bao gồm Khách vãng lai (Guest User), Khách thành viên (Registered User) và Quản trị viên (Store Admin). Hệ thống tích hợp với dịch vụ bên ngoài là Cổng gửi mã xác thực OTP (thực hiện chức năng bảo vệ tra cứu thông tin đơn hàng). 

Ranh giới bên phải của sơ đồ làm rõ các nghiệp vụ ngoài màn hình: việc lắp ráp vật lý các linh kiện vào thùng máy, việc vận chuyển giao hàng của đơn vị bưu cục, và việc thỏa thuận đổi trả bồi hoàn khiếu nại đều diễn ra ngoài hệ thống phần mềm. Phần mềm chỉ đóng vai trò ghi nhận thông tin và chuyển đổi trạng thái số liệu tương ứng.

---

## 3.4. Đặc tả yêu cầu chức năng (FR)

### 3.4.1. Yêu cầu chức năng khám phá và lựa chọn sản phẩm

Mục tiêu: Cung cấp đầy đủ các công cụ tìm kiếm, lọc linh kiện phần cứng và hỗ trợ xây dựng cấu hình máy tính cá nhân.

**Bảng 3.4.1. Đặc tả FR nhóm danh mục, SKU và PC Builder**

| Mã FR | Tên yêu cầu chức năng | Tác nhân | Tiền điều kiện / Đầu vào | Xử lý nghiệp vụ của hệ thống | Kết quả đầu ra | Tiêu chí chấp nhận |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| FR-01 | Xem danh mục linh kiện PC | Khách vãng lai, Thành viên | Truy cập trang `/catalog` | Truy vấn các SKU có trạng thái `ACTIVE` thuộc các danh mục linh kiện hợp lệ; không hiển thị laptop/mobile | Danh sách sản phẩm có phân trang, giá bán niêm yết | Chỉ hiển thị linh kiện phần cứng, không có laptop |
| FR-02 | Tìm kiếm & lọc đa tiêu chí | Khách vãng lai, Thành viên | Từ khóa tìm kiếm, bộ lọc khoảng giá, thương hiệu, socket, RAM bus | Áp dụng bộ lọc SQL linh hoạt; kết hợp điều kiện AND giữa các nhóm thuộc tính | Danh sách sản phẩm thỏa mãn tiêu chí lọc | Trả kết quả dưới 500ms; không lỗi khi không tìm thấy |
| FR-03 | Xem chi tiết sản phẩm | Khách vãng lai, Thành viên | Chọn 1 sản phẩm cụ thể | Hiển thị thông số kỹ thuật chi tiết, hình ảnh, tình trạng tồn kho (`available > 0`) và các đánh giá sao | Trang chi tiết SKU | Hiển thị rõ thông số kỹ thuật và số lượng tồn khả dụng |
| FR-04 | Khởi tạo cấu hình PC Builder | Khách vãng lai, Thành viên | Truy cập trang `/pc-builder` | Khởi tạo ma trận 8 linh kiện tiêu chuẩn (CPU, Main, RAM, VGA, SSD, PSU, Case, Tản nhiệt) | Giao diện 8 ô chọn linh kiện | Giao diện hiển thị đúng 8 slot linh kiện chuẩn |
| FR-05 | Chọn linh kiện & Lọc tương thích | Khách vãng lai, Thành viên | Nhấn chọn linh kiện cho 1 slot | Tự động áp dụng bộ lọc tương thích: ví dụ nếu đã chọn CPU socket LGA1700 thì slot Mainboard chỉ hiển thị main hỗ trợ LGA1700 | Danh sách linh kiện tương thích | Không cho phép chọn bo mạch chủ sai chuẩn chân cắm CPU |
| FR-06 | Tính tổng giá & Công suất nguồn | Khách vãng lai, Thành viên | Thay đổi danh sách linh kiện trong PC Builder | Tính tổng tiền tạm tính; cộng tổng công suất tiêu thụ (TDP) của CPU + VGA và đưa ra khuyến nghị công suất PSU | Tổng chi phí và thanh khuyến nghị Watt | Tự động tính toán lại tức thì qua Angular Signals |
| FR-07 | Chuyển cấu hình vào giỏ hàng | Khách vãng lai, Thành viên | Bấm nút "Thêm vào giỏ" từ PC Builder | Kiểm tra tính đầy đủ của các linh kiện bắt buộc; đóng gói thành một bộ bộ máy dựng sẵn (PC Bundle) trong giỏ hàng | Chuyển hướng sang giỏ hàng | Toàn bộ linh kiện con được thêm vào giỏ cùng lúc |

### 3.4.2. Yêu cầu chức năng giỏ hàng, khuyến mãi và đặt hàng

Mục tiêu: Quản lý giỏ hàng máy khách, tính toán giá trị thanh toán độc lập tại máy chủ và khởi tạo đơn hàng an toàn.

**Bảng 3.4.2. Đặc tả FR nhóm giỏ hàng, thanh toán và tạo đơn**

| Mã FR | Tên yêu cầu chức năng | Tác nhân | Tiền điều kiện / Đầu vào | Xử lý nghiệp vụ của hệ thống | Kết quả đầu ra | Tiêu chí chấp nhận |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| FR-08 | Quản lý giỏ hàng | Khách vãng lai, Thành viên | Thêm/bớt/xóa SKU hoặc bộ máy dựng sẵn (PC Bundle) trong giỏ | Cập nhật số lượng trong state Signals; lưu tạm vào LocalStorage; kiểm tra số lượng đặt không vượt quá tồn kho khả dụng | Giao diện giỏ hàng cập nhật | Không cho phép đặt số lượng vượt quá tồn khả dụng |
| FR-09 | Áp dụng mã giảm giá (Coupon) | Khách vãng lai, Thành viên | Nhập chuỗi mã coupon tại màn hình checkout | Gửi mã về backend kiểm tra: hạn dùng, số lượt còn lại, giá trị đơn tối thiểu (`minOrderValue`); tính số tiền giảm trừ | Hiển thị số tiền giảm trừ và tổng tiền mới | Báo lỗi rõ ràng nếu mã hết hạn hoặc không đủ điều kiện |
| FR-10 | Lựa chọn phương thức thanh toán | Khách vãng lai, Thành viên | Màn hình thanh toán; chọn `QR` hoặc `COD` | Ghi nhận phương thức thanh toán; tuyệt đối không hiển thị tùy chọn đặt cọc một phần | Cập nhật phương thức trong payload checkout | Chỉ có 2 lựa chọn: QR toàn phần hoặc COD toàn phần |
| FR-11 | Khởi tạo đơn hàng (Create Order) | Khách vãng lai, Thành viên | Nhấn nút "Đặt hàng" | Kích hoạt `prisma.$transaction`: kiểm tra lại giá, khóa và tăng `reserved` trong `StockQuant`, tạo bản ghi Order, trả về mã đơn | Đơn hàng tạo thành công (201 Created) | Bảo đảm nguyên tử (ACID); sinh mã đơn UUID an toàn |

### 3.4.3. Yêu cầu chức năng tra cứu, tài khoản, đánh giá, khiếu nại

Mục tiêu: Cung cấp giải pháp tra cứu tiến độ đơn hàng minh bạch, hồ sơ cá nhân, đánh giá sản phẩm tự do và tiếp nhận khiếu nại.

**Bảng 3.4.3. Đặc tả FR nhóm sau mua và tài khoản**

| Mã FR | Tên yêu cầu chức năng | Tác nhân | Tiền điều kiện / Đầu vào | Xử lý nghiệp vụ của hệ thống | Kết quả đầu ra | Tiêu chí chấp nhận |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| FR-12 | Tra cứu đơn bằng Mã đơn hàng | Khách vãng lai | Nhập chuỗi mã đơn hàng (UUID v4) | Backend truy vấn đơn hàng; chỉ hiển thị thông tin nếu là đơn của khách vãng lai (không gắn `userId`) | Màn hình tiến độ đơn hàng (9 trạng thái) | Không hiển thị đơn của tài khoản thành viên |
| FR-13 | Tra cứu đơn bằng SĐT / Email | Khách vãng lai | Nhập SĐT hoặc Email; yêu cầu gửi mã OTP | Hệ thống sinh mã OTP 6 số (hạn 5 phút); sau khi khách nhập đúng OTP, backend trả về danh sách đơn vãng lai tương ứng | Danh sách các đơn hàng vãng lai | Bắt buộc phải xác thực OTP thành công mới hiển thị đơn |
| FR-14 | Đánh giá sản phẩm mở tự do | Khách vãng lai, Thành viên | Nhập số sao (1-5), họ tên và nội dung nhận xét | Lưu trực tiếp vào bảng `Review`; hiển thị công khai ngay lập tức; không bắt buộc đã mua hàng | Đánh giá mới xuất hiện trên trang chi tiết SKU | Không yêu cầu đăng nhập; không chặn đánh giá nhiều lần |
| FR-15 | Gửi yêu cầu khiếu nại | Khách vãng lai, Thành viên | Điền form khiếu nại: họ tên, liên hệ, mã đơn (tùy chọn), nội dung | Kiểm tra độ dài văn bản (10-2000 ký tự); lưu vào bảng `Complaint`; trả về mã tiếp nhận | Thông báo gửi khiếu nại thành công | Hệ thống chỉ tiếp nhận; giải quyết khiếu nại ngoài màn hình |
| FR-16 | Quản lý lịch sử đơn thành viên | Khách hàng thành viên | Đã đăng nhập tài khoản | Truy vấn toàn bộ đơn hàng có `userId` khớp với phiên đăng nhập hiện tại; hiển thị danh sách và chi tiết | Trang lịch sử đơn hàng cá nhân | Không hiển thị đơn vãng lai; bảo mật tuyệt đối giữa các user |

### 3.4.4. Yêu cầu chức năng quản trị catalog, chính sách giá, khách hàng

Mục tiêu: Cung cấp các công cụ vận hành danh mục sản phẩm, biến thể SKU, cấu hình định mức linh kiện ảo (Virtual BOM), khuyến mãi và phí giao hàng.

**Bảng 3.4.4. Đặc tả FR nhóm quản trị bán hàng**

| Mã FR | Tên yêu cầu chức năng | Tác nhân | Tiền điều kiện / Đầu vào | Xử lý nghiệp vụ của hệ thống | Kết quả đầu ra | Tiêu chí chấp nhận |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| FR-17 | Quản lý Mẫu SP & Biến thể SKU | Quản trị viên | Đăng nhập Admin; truy cập quản lý catalog | Tạo/sửa/xóa ProductTemplate và các biến thể ProductVariant; thiết lập giá niêm yết, mã vạch và thuộc tính kỹ thuật | Danh mục sản phẩm cập nhật | Giá bán bắt buộc dùng kiểu Decimal; quản lý trạng thái ACTIVE |
| FR-18 | Cấu hình bộ máy dựng sẵn (PC Bundle) & định mức linh kiện ảo (Virtual BOM) | Quản trị viên | Truy cập quản lý PC dựng sẵn | Tạo gói cấu hình PC; thêm/bớt các dòng `PcBundleItem` tham chiếu đến các SKU linh kiện con; đặt giá bán trọn bộ | Bộ bộ máy dựng sẵn (PC Bundle) sẵn sàng chào bán | Lưu chính xác cấu trúc linh kiện con của dàn máy |
| FR-19 | Quản lý chương trình khuyến mãi | Quản trị viên | Tạo mới chiến dịch ưu đãi | Thiết lập loại giảm giá (% hoặc số tiền), phạm vi áp dụng (theo Category hoặc SKU), thời gian bắt đầu và kết thúc | Chương trình khuyến mãi kích hoạt | Tự động áp dụng khi tính toán giỏ hàng trong thời hạn |
| FR-20 | Quản lý biểu phí giao hàng | Quản trị viên | Truy cập cấu hình vận chuyển | Thiết lập mức phí giao hàng theo từng khu vực tỉnh thành; phí nhận tại cửa hàng mặc định bằng 0đ | Bảng biểu phí cập nhật | Áp dụng chính xác vào công thức tính `finalTotal` |
| FR-21 | Xem hòm thư khiếu nại | Quản trị viên | Truy cập quản lý khiếu nại | Hiển thị danh sách các phản ánh do khách gửi lên kèm thông tin liên hệ và thời điểm gửi | Bảng danh sách khiếu nại | Cho phép xem chi tiết để nhân viên gọi điện xử lý offline |

### 3.4.5. Yêu cầu chức năng mua hàng, kho và serial

Mục tiêu: Quản lý nhà cung cấp, đơn mua PO, nhập kho kiểm tra serial và cập nhật số dư tồn kho tập trung.

**Bảng 3.4.5. Đặc tả FR nhóm PO, kho và serial**

| Mã FR | Tên yêu cầu chức năng | Tác nhân | Tiền điều kiện / Đầu vào | Xử lý nghiệp vụ của hệ thống | Kết quả đầu ra | Tiêu chí chấp nhận |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| FR-22 | Tạo đơn mua hàng (đơn mua hàng nhập kho (Purchase Order)) | Quản trị viên | Chọn nhà cung cấp, danh sách SKU và số lượng nhập | Khởi tạo bản ghi `PurchaseOrder` ở trạng thái `DRAFT`; cho phép chỉnh sửa trước khi xác nhận | Đơn PO ở trạng thái DRAFT | Đầy đủ thông tin nhà cung cấp và đơn giá nhập |
| FR-23 | Tiếp nhận PO & Nhập kho đủ | Quản trị viên | Đơn PO đã xác nhận; hàng về kho | Nhập danh sách Serial Number tương ứng với từng linh kiện; hệ thống tăng `onHand` trong `StockQuant`, cập nhật giá vốn bình quân gia quyền (WAC) | Đơn PO chuyển sang `COMPLETED`, tăng tồn | Ghi nhận bút toán vào `StockLedgerEntry`, tạo `SerialUnit` |
| FR-24 | Xử lý PO khi giao thiếu hàng | Quản trị viên | Nhà cung cấp giao không đủ số lượng đặt | Nhập số lượng thực nhận; hệ thống điều chỉnh giảm số lượng dòng PO tương ứng với số thực nhận, không tạo chuyển kho | Đơn PO cập nhật theo thực nhận, nhập kho phần đã giao | Tính giá vốn giá vốn bình quân gia quyền (WAC) dựa trên số lượng và giá thực nhận |
| FR-25 | Quản lý sổ kho & Số dư tồn | Quản trị viên | Xem báo cáo kho | Hiển thị chi tiết `onHand`, `reserved`, `quarantine` và `available` cho từng SKU; xem lịch sử biến động sổ cái | Bảng kiểm kê tồn kho tức thời | Giá trị `available = onHand - reserved - quarantine` |

### 3.4.6. Yêu cầu chức năng xử lý đơn hàng và giao nhận

Mục tiêu: Điều phối vòng đời 9 trạng thái đơn hàng, chuẩn bị linh kiện, lắp ráp PC và giao hàng.

**Bảng 3.4.6. Đặc tả FR nhóm vận hành đơn hàng và giao nhận**

| Mã FR | Tên yêu cầu chức năng | Tác nhân | Tiền điều kiện / Đầu vào | Xử lý nghiệp vụ của hệ thống | Kết quả đầu ra | Tiêu chí chấp nhận |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| FR-26 | Xác nhận đơn hàng (Confirm) | Quản trị viên | Đơn hàng mới tạo (`PENDING`) | Kiểm tra thông tin thanh toán (QR đã nhận tiền hoặc COD hợp lệ); chuyển đơn sang `CONFIRMED` | Đơn chuyển trạng thái `CONFIRMED` | Ghi nhận lịch sử trạng thái trong `OrderStatusHistory` |
| FR-27 | Chuẩn bị & Lắp ráp đơn hàng | Quản trị viên | Đơn ở trạng thái `CONFIRMED` | Phân nhánh: nếu là linh kiện rời chuyển sang `PREPARING`; nếu là bộ máy dựng sẵn (PC Bundle) chuyển sang `ASSEMBLING` | Đơn chuyển trạng thái `PREPARING` hoặc `ASSEMBLING` | Đúng quy trình kỹ thuật theo loại mặt hàng trong đơn |
| FR-28 | Xuất kho & Bàn giao giao hàng | Quản trị viên | Đơn đã chuẩn bị/lắp ráp xong | Nhân viên chọn Serial Number xuất kho; trừ `onHand` và `reserved`; chuyển đơn sang `SHIPPING` | Đơn chuyển sang `SHIPPING` | Trừ đồng thời số lượng tồn thực tế và số lượng giữ hàng |
| FR-29 | Xử lý giao hàng thất bại | Quản trị viên | Đơn vị vận chuyển báo không giao được | Chuyển trạng thái đơn sang `DELIVERY_FAILED`; cho phép nhân viên liên hệ lại khách và chuyển lại `SHIPPING` không giới hạn | Đơn sang `DELIVERY_FAILED` rồi quay lại `SHIPPING` | Không tự động hoàn kho khi chưa có quyết định hủy đơn |
| FR-30 | Hoàn tất đơn hàng (Complete) | Quản trị viên | Giao hàng thành công hoặc khách nhận tại quầy | Thu đủ tiền (nếu COD); chuyển trạng thái đơn sang `COMPLETED`; kết thúc chu trình đơn hàng | Đơn hàng ở trạng thái `COMPLETED` | Trạng thái kết thúc thành công, lưu vết doanh thu |

### 3.4.7. Tổng hợp và đối chiếu yêu cầu chức năng

Dưới đây là ma trận đối chiếu 30 yêu cầu chức năng với mã nguồn thực tế và quy tắc nghiệp vụ:

**Bảng 3.4.7. Ma trận FR mục tiêu nghiệp vụ mã nguồn**

| Mã FR | Tên yêu cầu chức năng | Quy tắc BR liên quan | Thành phần mã nguồn thực tế | Trạng thái triển khai | Kiểm thử (TC) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| FR-01 -> FR-03 | Xem danh mục, tìm kiếm & chi tiết SKU | BR-01 | [be/src/routes/catalog.routes.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/routes/catalog.routes.ts) | Đã hoàn thành | TC-CAT-01 |
| FR-04 -> FR-07 | Cấu hình PC Builder & Kiểm tra tương thích | BR-01 | [be/src/routes/pc-build.routes.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/routes/pc-build.routes.ts) | Đã hoàn thành | TC-PCB-01 |
| FR-08 -> FR-11 | Giỏ hàng, Mã giảm giá, Checkout & Tạo đơn | BR-01, BR-03 | [be/src/services/order.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/order.service.ts) | Đã hoàn thành | TC-ORD-01 |
| FR-12 -> FR-13 | Tra cứu đơn hàng vãng lai (Mã / SĐT / OTP) | BR-02 | [be/src/routes/order-lookup.routes.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/routes/order-lookup.routes.ts) | Đã hoàn thành | TC-LKP-01 |
| FR-14 | Đánh giá sản phẩm mở tự do | BR-02 | [be/src/routes/review.routes.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/routes/review.routes.ts) | Đã hoàn thành | TC-REV-01 |
| FR-15 | Tiếp nhận yêu cầu khiếu nại tự do | BR-05 | `be/src/routes/complaint.routes.ts` | Target Schema | TC-CMP-01 |
| FR-16 | Quản lý lịch sử đơn thành viên | BR-02 | [be/src/routes/order.routes.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/routes/order.routes.ts) | Đã hoàn thành | TC-ACC-01 |
| FR-17 -> FR-21 | Quản trị Catalog, BOM, Giá, Phí ship | BR-01 | [fe/src/app/core/api/admin-api.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/core/api/admin-api.service.ts) | Đã hoàn thành | TC-ADM-01 |
| FR-22 -> FR-25 | Quản trị Đơn mua PO, Kho và Serial giá vốn bình quân gia quyền (WAC) | BR-04 | [fe/src/app/features/admin/procurement/](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/procurement/) | Đã hoàn thành | TC-STK-01 |
| FR-26 -> FR-30 | Vận hành đơn qua 9 trạng thái & Giao nhận | BR-03, BR-04 | [be/src/services/order.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/order.service.ts) | Đã hoàn thành | TC-FUL-01 |

---

## 3.5. Đặc tả yêu cầu phi chức năng (NFR)

### 3.5.1. Bảo mật và quyền riêng tư

Mục tiêu: Đảm bảo dữ liệu người dùng được bảo vệ, phân quyền nghiêm ngặt và ngăn chặn rò rỉ mã OTP hoặc thông tin đơn hàng vãng lai.

**Bảng 3.5.1. Đặc tả NFR bảo mật, riêng tư và phân quyền**

| Mã NFR | Nguyên tắc bảo mật | Thước đo và điều kiện kiểm soát | API / Thành phần liên quan | Phương pháp kiểm thử |
| :--- | :--- | :--- | :--- | :--- |
| NFR-01 | Bảo vệ tra cứu đơn hàng vãng lai | Tra cứu bằng SĐT hoặc Email bắt buộc phải qua bước gửi và xác thực mã OTP 6 số; không bao giờ trả về mã OTP trong response | `POST /api/order-lookup/otp`, `POST /api/order-lookup/verify` | Kiểm tra tự động bằng Postman / Integration test |
| NFR-02 | Chống tấn công brute-force OTP | Giới hạn tối đa 5 lần gửi yêu cầu OTP trong 15 phút trên mỗi số điện thoại/IP; mã OTP tự hủy sau 5 phút | Middleware `rate-limit` tại Express | Thử nghiệm gửi 6 request liên tục trong 1 phút |
| NFR-03 | Phân quyền truy cập Admin | Toàn bộ endpoint `/api/admin/*` bắt buộc có JWT token hợp lệ với vai trò `ADMIN`; chặn ngay lập tức mã lỗi 403 nếu sai quyền | [be/src/middleware/admin-auth.middleware.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/middleware/admin-auth.middleware.ts) | Thử gọi API admin bằng token khách hàng |
| NFR-04 | Mã đơn hàng khó suy đoán | Mã đơn hàng sử dụng định dạng UUID v4 (chuỗi ngẫu nhiên 128-bit); tuyệt đối không dùng số nguyên tự tăng tuần tự (1, 2, 3...) | Tệp tiện ích [be/src/lib/uuid.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/lib/uuid.ts) | Kiểm tra định dạng trường `id` trong bảng `Order` |

### 3.5.2. Hiệu năng, UX, tính sẵn sàng và tương thích

Mục tiêu: Đảm bảo ứng dụng phản hồi mượt mà, giao diện tương thích hoàn hảo trên các thiết bị di động.

**Bảng 3.5.2. Đặc tả NFR hiệu năng và khả dụng**

| Mã NFR | Kỳ vọng chất lượng | Chỉ số đo lường (KPI) | Cách thức kiểm chứng thực tế |
| :--- | :--- | :--- | :--- |
| NFR-05 | Thời gian phản hồi API tra cứu | Dưới 500ms cho 95% số yêu cầu (P95) | Đo thời gian phản hồi qua Network Tab trình duyệt |
| NFR-06 | Tốc độ tính toán PC Builder | Cập nhật tổng tiền và tương thích dưới 50ms | Đo thời gian thực thi của Angular `computed()` Signal |
| NFR-07 | Tính tương thích Responsive | Hiển thị hoàn chỉnh trên 3 kích thước màn hình: Mobile (375px), Tablet (768px), Desktop (1440px) | Kiểm tra trực quan qua Chrome DevTools Responsive Mode |
| NFR-08 | Lưu giữ trạng thái người dùng | Dữ liệu giỏ hàng và danh sách PC Builder không bị mất khi người dùng bấm F5 tải lại trang | Lưu trữ đồng bộ vào `localStorage` của trình duyệt | Kiểm tra tải lại trang khi đang chọn dở cấu hình PC |

### 3.5.3. Toàn vẹn dữ liệu, audit và khả năng bảo trì

Mục tiêu: Đảm bảo số liệu tài chính và tồn kho chính xác tuyệt đối, có khả năng truy vết lịch sử kiểm toán.

**Bảng 3.5.3. Đặc tả NFR nhất quán dữ liệu và bảo trì**

| Mã NFR | Tính chất toàn vẹn | Bất biến dữ liệu bắt buộc | Cơ chế kỹ thuật đảm bảo |
| :--- | :--- | :--- | :--- |
| NFR-09 | An toàn giao dịch kho và đơn | Không bao giờ xảy ra tình trạng bán vượt tồn khả dụng (`available >= 0`) | Bao bọc thao tác trong `prisma.$transaction` với lock dòng |
| NFR-10 | Tính bất biến của giá trị tiền tệ | Số tiền trong các bảng tính toán và thanh toán bắt buộc dùng kiểu `Decimal(12, 2)`, không dùng `Float` | Định nghĩa `Decimal` trong schema Prisma và hợp đồng API |
| NFR-11 | Lịch sử vết kiểm toán (Audit Trail) | Mọi thay đổi trạng thái đơn hàng đều phải sinh ra bản ghi `OrderStatusHistory` lưu thời điểm và tác nhân | Hook tự động trong `OrderService` ghi nhật ký |
| NFR-12 | Sổ cái kho không thể chỉnh sửa | Bản ghi trong `StockLedgerEntry` chỉ được phép INSERT, không bao giờ được UPDATE hoặc DELETE | Quyền hạn truy cập cơ sở dữ liệu và ràng buộc tầng dịch vụ |

---

## 3.6. Quy tắc nghiệp vụ (BR)

### 3.6.1. Quy tắc catalog, khuyến mãi và giá

**Bảng 3.6.1. BR danh mục, BOM, giá và ưu đãi**

| Mã BR | Tên quy tắc | Điều kiện kích hoạt | Xử lý nghiệp vụ bắt buộc | Ví dụ minh họa |
| :--- | :--- | :--- | :--- | :--- |
| BR-01.1 | Chỉ chào bán linh kiện và PC | Khi duyệt catalog hoặc API | Hệ thống chỉ hiển thị các mặt hàng thuộc nhóm linh kiện máy tính hoặc bộ máy dựng sẵn (PC Bundle); loại bỏ hoàn toàn laptop/mobile | Không thể tìm thấy sản phẩm có danh mục Laptop |
| BR-01.2 | Kiểm soát SKU khả dụng | Khi đưa sản phẩm vào giỏ | Sản phẩm chỉ được phép mua nếu SKU có trạng thái `ACTIVE` và số lượng khả dụng `available > 0` | Không thể thêm vào giỏ sản phẩm đã ngừng kinh doanh |
| BR-01.3 | Giá do backend quyết định | Khi tạo đơn hàng | Máy chủ tái truy vấn giá niêm yết hiện hành trong DB để tính tổng tiền; bỏ qua giá do máy khách gửi lên | Nếu client gửi giá 1.000đ cho CPU 5 triệu, backend vẫn tính 5 triệu |
| BR-01.4 | Ràng buộc mã giảm giá Coupon | Khi áp dụng mã giảm | Phải thỏa mãn đồng thời: thời gian hiệu lực, số lượt sử dụng còn lại và giá trị đơn hàng tối thiểu | Mã giảm 200k cho đơn từ 3 triệu sẽ không áp dụng được cho đơn 2.5 triệu |

### 3.6.2. Quy tắc xác thực, tra cứu và đánh giá

**Bảng 3.6.2. BR tra cứu, tài khoản và đánh giá tự do**

| Mã BR | Tên quy tắc | Tiền điều kiện | Kết quả và ranh giới quyền | Ghi chú bảo mật |
| :--- | :--- | :--- | :--- | :--- |
| BR-02.1 | Phân lập tra cứu đơn vãng lai | Tra cứu bằng mã đơn hàng | Chỉ hiển thị nếu đơn đó là đơn vãng lai (`userId IS NULL`); nếu là đơn của thành viên thì yêu cầu đăng nhập | Ngăn chặn người lạ xem trộm đơn của thành viên |
| BR-02.2 | Xác thực OTP khi tra cứu liên hệ | Tra cứu bằng SĐT hoặc Email | Bắt buộc nhập đúng mã OTP được gửi về SĐT/Email; chỉ hiển thị danh sách các đơn hàng vãng lai | Bảo vệ quyền riêng tư lịch sử mua sắm của khách |
| BR-02.3 | Đánh giá sản phẩm mở tự do | Khách hàng gửi review | Cho phép mọi khách hàng đánh giá không cần đăng nhập, không bắt buộc đã mua hàng, không giới hạn số lượt | Khuyến khích phản hồi đóng góp tự do từ cộng đồng |
| BR-02.4 | Tách biệt lịch sử đơn thành viên | Thành viên đăng nhập | Chỉ hiển thị các đơn hàng có `userId` khớp với ID tài khoản đăng nhập; không hiển thị đơn vãng lai | Bảo đảm an toàn dữ liệu cá nhân theo chuẩn RBAC |

### 3.6.3. Quy tắc thanh toán và trạng thái đơn

**Bảng 3.6.3. BR checkout, QR/COD và vòng đời đơn tinh giản**

| Mã BR | Tên quy tắc | Phương thức / Ngữ cảnh | Quy tắc xử lý nghiệp vụ | Trạng thái chuyển đổi |
| :--- | :--- | :--- | :--- | :--- |
| BR-03.1 | Thanh toán toàn phần, không cọc | Thanh toán QR Code | Khách hàng thanh toán 100% giá trị đơn hàng qua quét mã VietQR; không chấp nhận thanh toán một phần | Đơn tạo ở `PENDING`, nhận tiền chuyển sang `CONFIRMED` |
| BR-03.2 | Thanh toán khi nhận hàng COD | Thanh toán tiền mặt | Khách hàng thanh toán 100% giá trị đơn hàng cho nhân viên giao hàng khi nhận kiện hàng; không yêu cầu đặt cọc | Đơn tạo ở `PENDING`, xác nhận chuyển sang `CONFIRMED` |
| BR-03.3 | Đúng 9 trạng thái đơn hàng | Vòng đời đơn hàng | Vòng đời đơn chỉ luân chuyển qua 9 trạng thái chuẩn: PENDING -> CONFIRMED -> PREPARING / ASSEMBLING -> READY_FOR_PICKUP / SHIPPING -> DELIVERY_FAILED -> COMPLETED / CANCELLED | Không phát sinh các trạng thái trung gian ngoài danh mục 9 |
| BR-03.4 | Không hoàn tiền trực tuyến | Đơn hàng bị hủy | Nếu đơn đã thanh toán QR bị hủy, hệ thống không tích hợp hoàn tiền tự động; việc hoàn tiền được thỏa thuận trực tiếp ngoài hệ thống | Đơn chuyển sang `CANCELLED`, ghi chú xử lý offline |

### 3.6.4. Quy tắc kho, PO, serial và giao nhận

**Bảng 3.6.4. BR bất biến tồn kho, mua hàng và giao nhận**

| Mã BR | Tên quy tắc | Đối tượng tác động | Quy tắc bất biến bắt buộc | Xử lý ngoại lệ trong phạm vi |
| :--- | :--- | :--- | :--- | :--- |
| BR-04.1 | Bất biến số dư tồn khả dụng | Bảng `StockQuant` | Giá trị `available = onHand - reserved - quarantine` luôn luôn phải lớn hơn hoặc bằng 0 | Nếu đơn hàng yêu cầu số lượng vượt `available`, giao dịch bị từ chối ngay |
| BR-04.2 | Quản lý kho tập trung duy nhất | Mô hình kho | Toàn bộ hệ thống chỉ ghi nhận một kho hàng duy nhất; không có nghiệp vụ chuyển kho giữa các chi nhánh | Loại bỏ các bảng và API điều chuyển chi nhánh |
| BR-04.3 | Giá vốn bình quân giá vốn bình quân gia quyền (WAC) | Bảng `StockLedgerEntry` | Mỗi lần hoàn tất nhập kho PO, giá vốn bình quân gia quyền của SKU được tính toán lại theo công thức chuẩn | Lưu vết giá vốn vào sổ cái để phục vụ báo cáo tài chính |
| BR-04.4 | Xử lý giao hàng thất bại | Đơn hàng `SHIPPING` | Nếu giao hàng không thành công, đơn chuyển sang `DELIVERY_FAILED`; cho phép nhân viên liên hệ lại và chuyển lại `SHIPPING` không giới hạn | Không tự động hủy đơn hoặc hoàn kho khi chưa có quyết định dứt khoát |

### 3.6.5. Quy tắc nhận khiếu nại và ranh giới off-screen

**Bảng 3.6.5. BR tiếp nhận khiếu nại và bảo vệ dữ liệu**

| Mã BR | Tên quy tắc | Trường dữ liệu bắt buộc | Thời điểm kích hoạt | Quyền xem và ranh giới xử lý |
| :--- | :--- | :--- | :--- | :--- |
| BR-05.1 | Tiếp nhận khiếu nại tự do | Họ tên, Số điện thoại/Email liên hệ, Nội dung mô tả (tối thiểu 10 ký tự); Mã đơn hàng (tùy chọn) | Khách gửi form tại `/complaints` | Hệ thống lưu trữ vào cơ sở dữ liệu và gửi thông báo xác nhận đã tiếp nhận |
| BR-05.2 | Ranh giới xử lý ngoài màn hình | Trạng thái xử lý nội bộ | Sau khi tiếp nhận khiếu nại | Toàn bộ việc liên hệ, kiểm định sản phẩm lỗi, đổi hàng mới hoặc hoàn tiền được thực hiện ngoài màn hình (ngoài hệ thống trực tuyến) |
| BR-05.3 | Bảo vệ dữ liệu khiếu nại | Quyền truy cập hòm thư khiếu nại | Phân hệ Admin | Chỉ có tài khoản Quản trị viên mới được xem danh sách phản ánh; thông tin liên hệ của khách được bảo mật tuyệt đối |

---

## 3.7. Tiêu chí chấp nhận và ma trận truy vết

### 3.7.1. Tiêu chí chấp nhận theo nghiệp vụ mới

**Bảng 3.7.1. Tiêu chí chấp nhận cho các luồng trọng yếu**

| Mã AC | Yêu cầu FR liên quan | Dữ liệu đầu vào kiểm thử | Kết quả kỳ vọng | Bằng chứng kiểm tra thực tế |
| :--- | :--- | :--- | :--- | :--- |
| AC-01 | FR-01, FR-02 | Truy cập danh mục và tìm kiếm từ khóa "laptop", "macbook" | Không trả về bất kỳ kết quả nào; danh mục chỉ hiển thị linh kiện PC và PC dựng sẵn | Ảnh chụp kết quả tìm kiếm rỗng trên giao diện |
| AC-02 | FR-05, FR-06 | Trong PC Builder, chọn CPU Intel Core i5 13400F (LGA1700), mở danh sách chọn Mainboard | Danh sách Mainboard chỉ hiển thị các bo mạch chủ có chuẩn socket LGA1700 (B760, Z790...); ẩn các main AMD AM4/AM5 | Kiểm tra trực quan modal chọn bo mạch chủ |
| AC-03 | FR-10, FR-11 | Đặt hàng dàn PC trị giá 25.000.000đ; chọn phương thức thanh toán | Màn hình hiển thị đúng 2 phương thức: QR 100% (25 triệu) hoặc COD 100% (25 triệu); không có ô bắt cọc | Ảnh chụp màn hình checkout không có cọc |
| AC-04 | FR-12, FR-13 | Tra cứu đơn hàng của khách vãng lai bằng số điện thoại | Hệ thống yêu cầu gửi OTP; chỉ sau khi nhập đúng mã OTP 6 số mới hiển thị thông tin tiến độ đơn | Log kiểm thử gửi và xác thực OTP thành công |
| AC-05 | FR-14 | Đánh giá 5 sao cho sản phẩm VGA RTX 4060 mà chưa từng đăng nhập hay đặt mua đơn hàng nào | Đánh giá được ghi nhận thành công và xuất hiện ngay lập tức trên trang chi tiết sản phẩm | Đánh giá hiển thị công khai trên giao diện web |
| AC-06 | FR-29 | Đơn hàng đang ở trạng thái `SHIPPING`, chuyển sang `DELIVERY_FAILED` | Nhân viên có thể bấm nút "Giao lại" để chuyển trạng thái về lại `SHIPPING`; số lần giao lại không bị giới hạn | Lịch sử trạng thái đơn có bước quay lại SHIPPING |

### 3.7.2. Ma trận truy vết yêu cầu toàn hệ thống

Bảng ma trận truy vết dưới đây kết nối toàn bộ chuỗi từ Yêu cầu chức năng (FR), Quy tắc nghiệp vụ (BR), Ca sử dụng (UC), Sơ đồ thiết kế kỹ thuật, Màn hình giao diện, API Endpoint, Mã kiểm thử (TC) và Mức độ hoàn thành thực tế:

**Bảng 3.7.2. Ma trận truy vết yêu cầu toàn hệ thống**

| Mã FR | Quy tắc BR | Mã UC | Sơ đồ kỹ thuật tương ứng | Màn hình giao diện / API Endpoint | Mã kiểm thử | Mức độ hoàn thành |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| FR-01, FR-02 | BR-01 | UC-01 | Hình 4.3.1, Hình 4.5.1.2 | `/catalog`, `GET /api/catalog/products` | TC-CAT-01 | Hoàn thành 100% |
| FR-03 | BR-01 | UC-01 | Hình 4.6.2 | `/products/:slug`, `GET /api/catalog/products/:id` | TC-CAT-02 | Hoàn thành 100% |
| FR-04 -> FR-07 | BR-01 | UC-01 | Hình 4.2.1, Hình 4.6.2 | `/pc-builder`, `POST /api/pc-build/validate` | TC-PCB-01 | Hoàn thành 100% |
| FR-08, FR-09 | BR-01 | UC-02 | Hình 4.2.1, Hình 4.5.2.1 | `/cart`, `/checkout`, `POST /api/cart/items` | TC-ORD-01 | Hoàn thành 100% |
| FR-10, FR-11 | BR-03 | UC-02 | Hình 4.2.1, Hình 4.6.4 | `/checkout`, `POST /api/orders` | TC-ORD-02 | Hoàn thành 100% |
| FR-12, FR-13 | BR-02 | UC-03 | Hình 4.2.2, Hình 4.5.2.2 | `/order-lookup`, `POST /api/order-lookup/verify` | TC-LKP-01 | Hoàn thành 100% |
| FR-14 | BR-02 | UC-01 | Hình 4.2.3, Hình 4.6.6 | `/products/:slug`, `POST /api/reviews` | TC-REV-01 | Hoàn thành 100% |
| FR-15 | BR-05 | UC-05 | Hình 4.2.7, Hình 4.6.6 | `/complaints`, `POST /api/complaints` | TC-CMP-01 | Target Schema |
| FR-16 | BR-02 | UC-04 | Hình 4.3.1, Hình 4.6.3 | `/account/orders`, `GET /api/orders/my-orders` | TC-ACC-01 | Hoàn thành 100% |
| FR-17, FR-18 | BR-01 | UC-06 | Hình 4.3.2, Hình 4.6.2 | `/admin/catalog`, `POST /api/admin/products` | TC-ADM-01 | Hoàn thành 100% |
| FR-19, FR-20 | BR-01 | UC-06 | Hình 4.2.8, Hình 4.6.2 | `/admin/promotions`, `POST /api/admin/promotions` | TC-ADM-02 | Hoàn thành 100% |
| FR-21 | BR-05 | UC-06 | Hình 4.3.2, Hình 4.6.6 | `/admin/complaints`, `GET /api/admin/complaints` | TC-ADM-03 | Target Schema |
| FR-22 -> FR-25 | BR-04 | UC-07 | Hình 4.2.4, Hình 4.6.5 | `/admin/procurement`, `POST /api/admin/po` | TC-STK-01 | Hoàn thành 100% |
| FR-26 -> FR-30 | BR-03, BR-04 | UC-08 | Hình 4.2.5, Hình 4.2.6, Hình 4.6.4 | `/admin/orders`, `PATCH /api/admin/orders/:id` | TC-FUL-01 | Hoàn thành 100% |

Toàn bộ hệ thống đặc tả yêu cầu, quy tắc nghiệp vụ và ma trận truy vết trên đây là nền tảng vững chắc để chuyển sang Chương 4 thực hiện mô hình hóa chi tiết bằng các sơ đồ BPMN, Use Case, DFD và ERD.

