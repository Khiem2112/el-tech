# TRƯỜNG ĐẠI HỌC KINH TẾ - LUẬT - ĐHQG TP.HCM
## KHOA HỆ THỐNG THÔNG TIN
### BỘ MÔN HỆ THỐNG THÔNG TIN KINH DOANH

<br><br><br>

# BÁO CÁO ĐỒ ÁN MÔN HỌC
## PHÁT TRIỂN ỨNG DỤNG WEB KINH DOANH NÂNG CAO

<br>

### ĐỀ TÀI:
# EL-TECH DRAGON STORE
## HỆ THỐNG KINH DOANH LINH KIỆN MÁY TÍNH VÀ DỊCH VỤ HỖ TRỢ LẮP RÁP PC

<br><br><br>

**Giảng viên hướng dẫn:** ThS. Giảng viên phụ trách học phần  
**Nhóm sinh viên thực hiện:**
- Nguyễn Phạm Quốc Khiêm - MSSV: K234060701 - Lớp: K23406
- Bùi Ngọc Linh - MSSV: K2340607XX - Lớp: K23406
- Huỳnh Tấn Phúc - MSSV: K234060717 - Lớp: K23406

<br><br>

**Thành phố Hồ Chí Minh, Năm 2026**

<br>

---

## LỜI CAM ĐOAN

Nhóm thực hiện đề tài xin cam đoan rằng toàn bộ nội dung được trình bày trong bản báo cáo này là kết quả nghiên cứu, phân tích, thiết kế và phát triển độc lập của nhóm dưới sự hướng dẫn chuyên môn của Giảng viên phụ trách học phần Phát triển ứng dụng Web kinh doanh nâng cao.

Mọi số liệu khảo sát, trích dẫn học thuật, sơ đồ kiến trúc, mô hình quy trình và kết quả kiểm thử được thu thập và trình bày một cách trung thực, có dẫn chứng nguồn gốc rõ ràng theo chuẩn trích dẫn APA 7. Toàn bộ mã nguồn của hệ thống bao gồm phân hệ giao diện người dùng (Frontend bằng Angular), dịch vụ ứng dụng (Backend bằng Express) và lược đồ cơ sở dữ liệu (PostgreSQL qua Prisma ORM) đều do nhóm xây dựng và thử nghiệm thực tế. 

Các công cụ trí tuệ nhân tạo (AI coding assistant) được sử dụng đúng mục đích hỗ trợ tra cứu kỹ thuật, tái cấu trúc mã nguồn và kiểm tra tuân thủ quy chuẩn theo quy định liêm chính học thuật. Những tính năng được gắn nhãn hoàn thành đều đã được kiểm tra trên môi trường thực thi cục bộ; những giới hạn hoặc chức năng nằm ngoài phạm vi tinh giản đều được nhóm công bố minh bạch và khách quan trong báo cáo, không có bất kỳ sự ngụy tạo số liệu hay kết quả thực nghiệm nào.

Nhóm xin chịu hoàn toàn trách nhiệm trước Khoa Hệ thống Thông tin và Nhà trường (Trường Đại học Kinh tế - Luật - ĐHQG TP.HCM) về tính trung thực của lời cam đoan này.

*Thành phố Hồ Chí Minh, ngày 02 tháng 11 năm 2026*  
**Đại diện nhóm sinh viên**  
(Ký và ghi rõ họ tên)

---

## LỜI CẢM ƠN

Để hoàn thành đề tài đồ án môn học Phát triển ứng dụng Web kinh doanh nâng cao với chủ đề "EL-TECH Dragon Store – Hệ thống kinh doanh linh kiện PC và dịch vụ lắp ráp PC", nhóm chúng em đã nhận được sự quan tâm, hướng dẫn và hỗ trợ quý báu từ nhiều thầy cô, bạn bè và người thân.

Trước hết, nhóm xin gửi lời tri ân sâu sắc nhất đến Quý Thầy/Cô phụ trách học phần Phát triển ứng dụng Web kinh doanh nâng cao thuộc Khoa Hệ thống Thông tin, Trường Đại học Kinh tế - Luật - ĐHQG TP.HCM. Những bài giảng lý thuyết chuyên sâu, các yêu cầu thực tiễn về kiến trúc phần mềm, nguyên lý toàn vẹn dữ liệu giao dịch và quy chuẩn nghiệp vụ kinh doanh thương mại điện tử khắt khe của Thầy/Cô đã trở thành kim chỉ nam giúp nhóm xây dựng hệ thống đúng chuẩn công nghiệp và hoàn thiện báo cáo khoa học này.

Nhóm cũng xin chân thành cảm ơn các bạn sinh viên trong lớp học phần đã chia sẻ những góc nhìn phản biện giá trị, đóng góp ý kiến về mặt trải nghiệm người dùng trong các buổi báo cáo tiến độ và kiểm thử luồng nghiệp vụ. 

Mặc dù nhóm đã nỗ lực vận dụng tối đa kiến thức kỹ thuật và thời gian để xây dựng hệ thống một cách chỉn chu nhất, song do giới hạn về mặt thời gian và kinh nghiệm thực tiễn, đồ án chắc chắn không tránh khỏi những thiếu sót nhất định. Nhóm rất mong nhận được những nhận xét, góp ý và chỉ dẫn quý báu từ Quý Thầy/Cô để hệ thống ngày càng hoàn thiện hơn và có thể áp dụng hiệu quả vào thực tế.

Kính chúc Quý Thầy/Cô luôn dồi dào sức khỏe, niềm vui và tiếp tục gặt hái nhiều thành công trong sự nghiệp trồng người cao quý!

---

## TÓM TẮT BÁO CÁO

Báo cáo trình bày toàn diện quá trình phân tích, thiết kế và hiện thực hóa đề tài "EL-TECH Dragon Store – Hệ thống kinh doanh linh kiện máy tính và dịch vụ hỗ trợ lắp ráp PC", một ứng dụng web thương mại điện tử chuyên biệt đáp ứng nhu cầu kinh doanh linh kiện phần cứng và giải quyết rào cản kỹ thuật cho người dùng khi tự lắp ráp cấu hình máy tính cá nhân.

Về phương pháp thực hiện, đề tài xuất phát từ việc khảo sát thực tế và phân tích ma trận so sánh đối chiếu trên ba hệ thống bán lẻ hàng đầu tại Việt Nam gồm GEARVN, HACOM và Phong Vũ theo 11 tiêu chí nghiệp vụ và trải nghiệm người dùng. Trên cơ sở đó, nhóm xác định phạm vi hệ thống mục tiêu tinh giản (MVP) tập trung vào mô hình vận hành một cửa hàng và một kho vật lý duy nhất, loại bỏ sự phức tạp không cần thiết của việc điều chuyển đa chi nhánh. Hệ thống chỉ tập trung kinh doanh linh kiện rời, phụ kiện và PC nguyên bộ hoặc cấu hình tự chọn (định mức linh kiện ảo (Virtual BOM)), kiên quyết loại bỏ danh mục laptop và điện thoại di động khỏi phạm vi. Phương thức thanh toán được chuẩn hóa thành hai nhánh QR toàn phần hoặc COD toàn phần, không áp dụng cơ chế đặt cọc một phần; vòng đời đơn hàng được cố định chính xác 9 trạng thái không hoàn tiền trực tuyến; quy trình tiếp nhận khiếu nại cho phép khách hàng gửi mô tả tự do nhưng ranh giới xử lý sau tiếp nhận được thực hiện ngoài màn hình nhằm đảm bảo tính khả thi thực nghiệm.

Về mặt công nghệ và kiến trúc, hệ thống được xây dựng trên nền tảng Frontend Angular 22 Standalone Components kết hợp Angular Native Signals, Tailwind CSS và bộ giao diện Spartan UI tối ưu hiệu năng và mật độ thông tin. Phía Backend vận hành trên nền tảng Node.js với Express REST API, xác thực dữ liệu đầu vào nghiêm ngặt bằng Zod schemas và quản trị tầng dữ liệu bền vững thông qua Prisma ORM kết nối hệ quản trị cơ sở dữ liệu PostgreSQL. Các nghiệp vụ trọng yếu như tính toán giỏ hàng, áp dụng mã giảm giá, kiểm tra tính tương thích phần cứng, giữ tồn kho theo thời gian thực và quản lý đơn vị định danh sản phẩm (Serial Number) được kiểm soát hoàn toàn tại máy chủ với các giao dịch an toàn (ACID transaction).

Báo cáo phân tích chi tiết toàn bộ chuỗi mô hình hóa bao gồm 8 quy trình nghiệp vụ BPMN 2.0, 8 bảng đặc tả Use Case theo định dạng 13 trường chuẩn, sơ đồ luồng dữ liệu DFD 3 cấp độ và 6 phân cụm mô hình quan hệ thực thể ERD mục tiêu. Cuối cùng, báo cáo đánh giá trung thực kết quả triển khai thông qua các minh chứng giao diện thực tế, phân tích các lỗ hổng kỹ thuật còn tồn đọng và đề xuất lộ trình phát triển hoàn thiện trong tương lai.

---

## MỤC LỤC

- CHƯƠNG 1. TỔNG QUAN VỀ ĐỀ TÀI
  - 1.1. Bối cảnh và lý do chọn đề tài
  - 1.2. Mục tiêu đề tài
  - 1.3. Đối tượng, phạm vi và giới hạn đề tài
  - 1.4. Phương pháp thực hiện
  - 1.5. Ý nghĩa đề tài
  - 1.6. Kết cấu báo cáo
- CHƯƠNG 2. CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ VẬN DỤNG
  - 2.1. Các nguyên lý nghiệp vụ được áp dụng
    - 2.1.1. Luồng mua hàng và nguồn xác thực dữ liệu
    - 2.1.2. Mô hình Category – Product Template – SKU và định mức linh kiện ảo (Virtual BOM)
    - 2.1.3. Định giá, khuyến mãi và tính toán giỏ hàng
    - 2.1.4. Tồn kho một cửa hàng, serial và giá vốn bình quân
  - 2.2. Công nghệ front-end và trải nghiệm người dùng
    - 2.2.1. Angular, TypeScript và component
    - 2.2.2. Signals, state và giao tiếp API
    - 2.2.3. Tailwind CSS và nguyên tắc thiết kế responsive
  - 2.3. Công nghệ back-end và cơ sở dữ liệu
    - 2.3.1. Node.js, Express và API REST
    - 2.3.2. Zod, bảo vệ dữ liệu đầu vào và kiểm tra quyền
    - 2.3.3. PostgreSQL, Prisma schema và migration
    - 2.3.4. Transaction, idempotency và concurrency
  - 2.4. Các phương pháp phân tích và kiểm chứng được vận dụng
    - 2.4.1. FDD, BPMN, Use Case, State, Sequence, DFD và ERD
    - 2.4.2. Truy vết yêu cầu và phương pháp đánh giá
  - 2.5. Tổng hợp công nghệ và mức độ áp dụng
- CHƯƠNG 3. KHẢO SÁT, PHÂN TÍCH NGHIỆP VỤ VÀ ĐẶC TẢ YÊU CẦU
  - 3.1. Giới thiệu mô hình kinh doanh EL-TECH
    - 3.1.1. Thương hiệu, định vị và giá trị cung cấp
    - 3.1.2. Danh mục sản phẩm và dịch vụ
    - 3.1.3. Mô hình vận hành một cửa hàng và một kho
  - 3.2. Khảo sát các website tương tự và rút ra yêu cầu
    - 3.2.1. Mục tiêu, đối tượng và phương pháp khảo sát
    - 3.2.2. Xây dựng bộ tiêu chí so sánh
    - 3.2.3. Phân tích website GEARVN
    - 3.2.4. Phân tích website HACOM
    - 3.2.5. Phân tích website Phong Vũ
    - 3.2.6. So sánh tổng hợp, khoảng trống và yêu cầu rút ra
  - 3.3. Các bên liên quan và tác nhân hệ thống
    - 3.3.1. Nhận diện stakeholders và nhu cầu
    - 3.3.2. Phân định actor hệ thống và vai trò nghiệp vụ
  - 3.4. Đặc tả yêu cầu chức năng (FR)
    - 3.4.1. Yêu cầu chức năng khám phá và lựa chọn sản phẩm
    - 3.4.2. Yêu cầu chức năng giỏ hàng, khuyến mãi và đặt hàng
    - 3.4.3. Yêu cầu chức năng tra cứu, tài khoản, đánh giá, khiếu nại
    - 3.4.4. Yêu cầu chức năng quản trị catalog, chính sách giá, khách hàng
    - 3.4.5. Yêu cầu chức năng mua hàng, kho và serial
    - 3.4.6. Yêu cầu chức năng xử lý đơn hàng và giao nhận
    - 3.4.7. Tổng hợp và đối chiếu yêu cầu chức năng
  - 3.5. Đặc tả yêu cầu phi chức năng (NFR)
    - 3.5.1. Bảo mật và quyền riêng tư
    - 3.5.2. Hiệu năng, UX, tính sẵn sàng và tương thích
    - 3.5.3. Toàn vẹn dữ liệu, audit và khả năng bảo trì
  - 3.6. Quy tắc nghiệp vụ (BR)
    - 3.6.1. Quy tắc catalog, khuyến mãi và giá
    - 3.6.2. Quy tắc xác thực, tra cứu và đánh giá
    - 3.6.3. Quy tắc thanh toán và trạng thái đơn
    - 3.6.4. Quy tắc kho, PO, serial và giao nhận
    - 3.6.5. Quy tắc nhận khiếu nại và ranh giới off-screen
  - 3.7. Tiêu chí chấp nhận và ma trận truy vết
    - 3.7.1. Tiêu chí chấp nhận theo nghiệp vụ mới
    - 3.7.2. Ma trận truy vết yêu cầu toàn hệ thống
- CHƯƠNG 4. MÔ HÌNH HÓA VÀ THIẾT KẾ HỆ THỐNG
  - 4.1. Phân rã chức năng và nguyên tắc mô hình hóa
  - 4.2. Sơ đồ BPMN 2.0 các quy trình nghiệp vụ
    - 4.2.1. Quy trình lựa chọn sản phẩm và đặt hàng
    - 4.2.2. Quy trình tra cứu đơn hàng
    - 4.2.3. Quy trình đánh giá sản phẩm
    - 4.2.4. Quy trình mua hàng và nhập kho
    - 4.2.5. Quy trình xử lý đơn và lắp ráp
    - 4.2.6. Quy trình giao hàng
    - 4.2.7. Quy trình tiếp nhận khiếu nại
    - 4.2.8. Quy trình cấu hình khuyến mãi và mã giảm giá
  - 4.3. Sơ đồ Use Case và đặc tả Use Case
  - 4.4. Thiết kế kiến trúc hệ thống
  - 4.5. Thiết kế luồng dữ liệu
    - 4.5.1. DFD ngữ cảnh và cấp 0
    - 4.5.2. DFD chi tiết mua hàng và sau mua
  - 4.6. Thiết kế cơ sở dữ liệu mục tiêu
    - 4.6.1. ERD tổng thể hệ thống
    - 4.6.2. ERD catalog, SKU và bộ máy dựng sẵn (PC Bundle)
    - 4.6.3. ERD giỏ hàng, khách và đơn hàng
    - 4.6.4. ERD thanh toán giản lược
    - 4.6.5. ERD mua hàng, tồn kho và serial một cửa hàng
    - 4.6.6. ERD đánh giá và yêu cầu khiếu nại
- CHƯƠNG 5. THIẾT KẾ GIAO DIỆN UI/UX VÀ HIỆN THỰC WEBSITE
  - 5.1. Bộ nhận diện và thiết kế thương hiệu EL-TECH
  - 5.2. Sitemap và cấu trúc điều hướng
    - 5.2.1. Sitemap phía khách hàng
    - 5.2.2. Sitemap quản trị
  - 5.3. Quy trình và tiêu chí thiết kế UI/UX
    - 5.3.1. Thiết kế luồng và hệ thống thành phần giao diện
    - 5.3.2. Khả năng sử dụng, responsive và trạng thái trống
  - 5.4. Hiện thực giao diện phía khách hàng
  - 5.5. Hiện thực giao diện quản trị
- CHƯƠNG 6. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN
  - 6.1. Kết quả đạt được
  - 6.2. Hạn chế của đề tài
  - 6.3. Hướng phát triển
  - 6.4. Kết luận chung
- TÀI LIỆU THAM KHẢO VÀ PHỤ LỤC

---

## DANH MỤC TỪ VIẾT TẮT

| Từ viết tắt | Thuật ngữ tiếng Anh đầy đủ | Giải thích nghĩa tiếng Việt |
| :--- | :--- | :--- |
| ACID | Atomicity, Consistency, Isolation, Durability | Bốn đặc tính cơ bản của một giao dịch cơ sở dữ liệu an toàn |
| API | Application Programming Interface | Giao diện lập trình ứng dụng |
| BOM | Bill of Materials | Danh mục cấu thành linh kiện của một sản phẩm phần cứng |
| BPMN | Business Process Model and Notation 2.0 | Chuẩn ký pháp mô hình hóa quy trình nghiệp vụ |
| BR | Business Rule | Quy tắc nghiệp vụ bắt buộc của hệ thống |
| COD | Cash on Delivery | Phương thức thanh toán tiền mặt khi nhận hàng |
| CTA | Call to Action | Lời kêu gọi hành động trên giao diện người dùng |
| DFD | Data Flow Diagram | Sơ đồ luồng dữ liệu các cấp độ |
| ERD | Entity Relationship Diagram | Sơ đồ quan hệ thực thể cơ sở dữ liệu |
| FDD | Functional Decomposition Diagram | Sơ đồ phân rã chức năng |
| FK | Foreign Key | Khóa ngoại trong bảng cơ sở dữ liệu quan hệ |
| FR | Functional Requirement | Yêu cầu chức năng của hệ thống phần mềm |
| NFR | Non-Functional Requirement | Yêu cầu phi chức năng (bảo mật, hiệu năng, khả năng bảo trì) |
| ORM | Object-Relational Mapping | Kỹ thuật ánh xạ giữa đối tượng lập trình và bảng quan hệ |
| OTP | One-Time Password | Mật khẩu dùng một lần xác thực danh tính qua SMS hoặc Email |
| PC | Personal Computer | Máy tính để bàn cá nhân |
| PK | Primary Key | Khóa chính của bảng dữ liệu |
| PO | đơn mua hàng nhập kho (Purchase Order) | Đơn đặt hàng nhập kho từ nhà cung cấp |
| QR | Quick Response Code | Mã phản hồi nhanh dùng trong thanh toán chuyển khoản |
| REST | Representational State Transfer | Phong cách kiến trúc thiết kế dịch vụ web |
| SKU | Stock Keeping Unit | Đơn vị lưu kho và định danh biến thể thương mại duy nhất |
| TC | Test Case | Trường hợp kiểm thử chức năng |
| TDP | Thermal Design Power | Công suất tỏa nhiệt tối đa của linh kiện phần cứng (W) |
| UC | Use Case | Ca sử dụng mô tả tương tác giữa tác nhân và hệ thống |
| UI | User Interface | Giao diện người dùng |
| UX | User Experience | Trải nghiệm người dùng |
| giá vốn bình quân gia quyền (WAC) | Weighted Average Cost | Phương pháp tính giá vốn bình quân gia quyền cho hàng tồn kho |

---

## DANH MỤC BẢNG BIỂU

| Ký hiệu bảng | Tên bảng biểu chi tiết | Vị trí đề mục |
| :--- | :--- | :--- |
| Bảng 2.1.3 | Thành phần cấu thành tổng thanh toán | Mục 2.1.3 |
| Bảng 2.2.1 | Áp dụng Angular và TypeScript trong hệ thống | Mục 2.2.1 |
| Bảng 2.3.2 | Nhóm kiểm tra đầu vào và quyền truy cập | Mục 2.3.2 |
| Bảng 2.3.3 | Kế hoạch chuyển đổi dữ liệu từ schema hiện hữu | Mục 2.3.3 |
| Bảng 2.5 | Ma trận công nghệ tính năng bằng chứng triển khai | Mục 2.5 |
| Bảng 3.1.2 | Danh mục mặt hàng mục tiêu và chính sách phạm vi | Mục 3.1.2 |
| Bảng 3.2.2 | Bộ tiêu chí khảo sát và thang đánh giá | Mục 3.2.2 |
| Bảng 3.2.3 | Phiếu quan sát website GEARVN | Mục 3.2.3 |
| Bảng 3.2.4 | Phiếu quan sát website HACOM | Mục 3.2.4 |
| Bảng 3.2.5 | Phiếu quan sát website Phong Vũ | Mục 3.2.5 |
| Bảng 3.2.6 | Ma trận so sánh GEARVN - HACOM - Phong Vũ - EL-TECH | Mục 3.2.6 |
| Bảng 3.3.1 | Ma trận bên liên quan và mức độ tham gia | Mục 3.3.1 |
| Bảng 3.4.1 | Đặc tả FR nhóm danh mục, SKU và PC Builder | Mục 3.4.1 |
| Bảng 3.4.2 | Đặc tả FR nhóm giỏ hàng, thanh toán và tạo đơn | Mục 3.4.2 |
| Bảng 3.4.3 | Đặc tả FR nhóm sau mua và tài khoản | Mục 3.4.3 |
| Bảng 3.4.4 | Đặc tả FR nhóm quản trị bán hàng | Mục 3.4.4 |
| Bảng 3.4.5 | Đặc tả FR nhóm PO, kho và serial | Mục 3.4.5 |
| Bảng 3.4.6 | Đặc tả FR nhóm vận hành đơn hàng và giao nhận | Mục 3.4.6 |
| Bảng 3.4.7 | Ma trận FR mục tiêu nghiệp vụ mã nguồn | Mục 3.4.7 |
| Bảng 3.5.1 | Đặc tả NFR bảo mật, riêng tư và phân quyền | Mục 3.5.1 |
| Bảng 3.5.2 | Đặc tả NFR hiệu năng và khả dụng | Mục 3.5.2 |
| Bảng 3.5.3 | Đặc tả NFR nhất quán dữ liệu và bảo trì | Mục 3.5.3 |
| Bảng 3.6.1 | BR danh mục, BOM, giá và ưu đãi | Mục 3.6.1 |
| Bảng 3.6.2 | BR tra cứu, tài khoản và đánh giá tự do | Mục 3.6.2 |
| Bảng 3.6.3 | BR checkout, QR/COD và vòng đời đơn tinh giản | Mục 3.6.3 |
| Bảng 3.6.4 | BR bất biến tồn kho, mua hàng và giao nhận | Mục 3.6.4 |
| Bảng 3.6.5 | BR tiếp nhận khiếu nại và bảo vệ dữ liệu | Mục 3.6.5 |
| Bảng 3.7.1 | Tiêu chí chấp nhận cho các luồng trọng yếu | Mục 3.7.1 |
| Bảng 3.7.2 | Ma trận truy vết yêu cầu toàn hệ thống | Mục 3.7.2 |
| Bảng 5.2.1 | Danh mục route và quyền truy cập phía khách | Mục 5.2.1 |
| Bảng 5.2.2 | Danh mục route quản trị giữ, loại và bổ sung | Mục 5.2.2 |
| Bảng 5.3.2 | Checklist UX và responsive | Mục 5.3.2 |

---

## DANH MỤC HÌNH ẢNH VÀ SƠ ĐỒ

| Ký hiệu hình | Tên hình ảnh / sơ đồ kỹ thuật | Loại minh chứng | Vị trí đề mục |
| :--- | :--- | :--- | :--- |
| Hình 2.1.1 | Luồng giao dịch trực tuyến EL-TECH sau tinh giản | Sơ đồ Draw.io | Mục 2.1.1 |
| Hình 2.1.2 | Quan hệ khái niệm Product Template - SKU - bộ máy dựng sẵn (PC Bundle) | Sơ đồ Draw.io | Mục 2.1.2 |
| Hình 2.1.4 | Quan hệ số dư tồn kho và lịch sử chuyển động | Sơ đồ Draw.io | Mục 2.1.4 |
| Hình 2.2.2 | Luồng giao tiếp component - frontend service API | Sơ đồ Draw.io | Mục 2.2.2 |
| Hình 2.3.1 | Kiến trúc ứng dụng Angular Express - Prisma PostgreSQL | Sơ đồ Draw.io | Mục 2.3.1 |
| Hình 2.3.4 | Ví dụ transaction tạo đơn và giữ tồn | Sơ đồ Draw.io | Mục 2.3.4 |
| Hình 2.4.2 | Chuỗi truy vết từ yêu cầu tới minh chứng | Sơ đồ Draw.io | Mục 2.4.2 |
| Hình 3.1.1 | Mô hình giá trị EL-TECH | Sơ đồ Draw.io | Mục 3.1.1 |
| Hình 3.1.3 | Mô hình vận hành một cửa hàng EL-TECH | Sơ đồ Draw.io | Mục 3.1.3 |
| Hình 3.2.3 | Ảnh minh chứng khảo sát giao diện GEARVN | Ảnh chụp khảo sát | Mục 3.2.3 |
| Hình 3.2.4 | Ảnh minh chứng khảo sát giao diện HACOM | Ảnh chụp khảo sát | Mục 3.2.4 |
| Hình 3.2.5 | Ảnh minh chứng khảo sát giao diện Phong Vũ | Ảnh chụp khảo sát | Mục 3.2.5 |
| Hình 3.3.2 | Sơ đồ bối cảnh tác nhân EL-TECH | Sơ đồ Draw.io | Mục 3.3.2 |
| Hình 4.2.1 | BPMN lựa chọn linh kiện PC và đặt hàng | Sơ đồ Draw.io | Mục 4.2.1 |
| Hình 4.2.2 | BPMN tra cứu đơn | Sơ đồ Draw.io | Mục 4.2.2 |
| Hình 4.2.3 | BPMN đánh giá sản phẩm | Sơ đồ Draw.io | Mục 4.2.3 |
| Hình 4.2.4 | BPMN PO và nhập kho | Sơ đồ Draw.io | Mục 4.2.4 |
| Hình 4.2.5 | BPMN chuẩn bị lắp ráp đơn | Sơ đồ Draw.io | Mục 4.2.5 |
| Hình 4.2.6 | BPMN giao nhận | Sơ đồ Draw.io | Mục 4.2.6 |
| Hình 4.2.7 | BPMN tiếp nhận khiếu nại | Sơ đồ Draw.io | Mục 4.2.7 |
| Hình 4.2.8 | BPMN cấu hình khuyến mãi và mã giảm giá | Sơ đồ Draw.io | Mục 4.2.8 |
| Hình 4.3.1 | Use Case khách hàng | Sơ đồ Draw.io | Mục 4.3.1 |
| Hình 4.3.2 | Use Case quản trị viên | Sơ đồ Draw.io | Mục 4.3.2 |
| Hình 4.4 | Sơ đồ kiến trúc tổng thể Angular -> Express -> Prisma -> PostgreSQL | Sơ đồ Draw.io | Mục 4.4 |
| Hình 4.5.1.1 | DFD ngữ cảnh EL-TECH | Sơ đồ Draw.io | Mục 4.5.1 |
| Hình 4.5.1.2 | DFD cấp 0 các quá trình chính | Sơ đồ Draw.io | Mục 4.5.1 |
| Hình 4.5.2.1 | DFD cấp 1 xử lý đơn và thanh toán | Sơ đồ Draw.io | Mục 4.5.2 |
| Hình 4.5.2.2 | DFD cấp 1 tra cứu và khiếu nại | Sơ đồ Draw.io | Mục 4.5.2 |
| Hình 4.6.1 | ERD tổng thể EL-TECH mục tiêu | Sơ đồ Draw.io | Mục 4.6.1 |
| Hình 4.6.2 | ERD danh mục, SKU, bộ máy dựng sẵn (PC Bundle) và định giá | Sơ đồ Draw.io | Mục 4.6.2 |
| Hình 4.6.3 | ERD giỏ hàng, tài khoản, tra cứu và đơn hàng | Sơ đồ Draw.io | Mục 4.6.3 |
| Hình 4.6.4 | ERD thanh toán QR và COD không cọc | Sơ đồ Draw.io | Mục 4.6.4 |
| Hình 4.6.5 | ERD nhà cung cấp, PO, tồn kho và serial | Sơ đồ Draw.io | Mục 4.6.5 |
| Hình 4.6.6 | ERD Review tự do và Complaint intake | Sơ đồ Draw.io | Mục 4.6.6 |
| Hình 5.1.1 | Bộ nhận diện EL-TECH và quy chuẩn màu | Sơ đồ Draw.io | Mục 5.1 |
| Hình 5.2.1 | Sitemap khách hàng EL-TECH mục tiêu | Sơ đồ Draw.io | Mục 5.2.1 |
| Hình 5.2.2 | Sitemap quản trị một cửa hàng | Sơ đồ Draw.io | Mục 5.2.2 |
| Hình 5.3.1 | Luồng UX mua linh kiện và sau mua | Sơ đồ Draw.io | Mục 5.3.1 |
| Hình 5.4.1 | Ảnh giao diện trang chủ và menu linh kiện | Ảnh chụp thực tế | Mục 5.4.1 |
| Hình 5.4.2 | Ảnh giao diện trang danh mục và tìm kiếm/lọc | Ảnh chụp thực tế | Mục 5.4.2 |
| Hình 5.4.3.1 | Ảnh giao diện trang chi tiết sản phẩm | Ảnh chụp thực tế | Mục 5.4.3 |
| Hình 5.4.3.2 | Ảnh giao diện giao diện gửi đánh giá sản phẩm tự do | Ảnh chụp thực tế | Mục 5.4.3 |
| Hình 5.4.4 | Ảnh giao diện trang tự lắp ráp máy tính (PC Builder) | Ảnh chụp thực tế | Mục 5.4.4 |
| Hình 5.4.5 | Ảnh giao diện trang giỏ hàng | Ảnh chụp thực tế | Mục 5.4.5 |
| Hình 5.4.6 | Ảnh giao diện trang checkout QR/COD | Ảnh chụp thực tế | Mục 5.4.6 |
| Hình 5.4.7 | Ảnh giao diện trang xác nhận đặt hàng và thanh toán | Ảnh chụp thực tế | Mục 5.4.7 |
| Hình 5.4.8 | Ảnh giao diện trang tra cứu đơn vãng lai | Ảnh chụp thực tế | Mục 5.4.8 |
| Hình 5.4.9 | Ảnh giao diện trang theo dõi tiến độ đơn | Ảnh chụp thực tế | Mục 5.4.9 |
| Hình 5.4.10 | Ảnh giao diện trang đăng ký/đăng nhập tài khoản | Ảnh chụp thực tế | Mục 5.4.10 |
| Hình 5.4.11 | Ảnh giao diện trang hồ sơ và lịch sử đơn thành viên | Ảnh chụp thực tế | Mục 5.4.11 |
| Hình 5.4.12.1 | Ảnh giao diện các trang thông tin liên hệ và chính sách còn dùng | Ảnh chụp thực tế | Mục 5.4.12 |
| Hình 5.4.12.2 | Ảnh giao diện trang gửi yêu cầu khiếu nại | Ảnh chụp thực tế | Mục 5.4.12 |
| Hình 5.5.1 | Ảnh giao diện quản trị bảng tổng quan quản trị | Ảnh chụp thực tế | Mục 5.5.1 |
| Hình 5.5.2.1 | Ảnh giao diện quản trị quản lý ngành hàng, thuộc tính | Ảnh chụp thực tế | Mục 5.5.2 |
| Hình 5.5.2.2 | Ảnh giao diện quản trị quản lý thương hiệu | Ảnh chụp thực tế | Mục 5.5.2 |
| Hình 5.5.3 | Ảnh giao diện quản trị quản lý mẫu sản phẩm và biến thể | Ảnh chụp thực tế | Mục 5.5.3 |
| Hình 5.5.4 | Ảnh giao diện quản trị quản lý pc dựng sẵn | Ảnh chụp thực tế | Mục 5.5.4 |
| Hình 5.5.5 | Ảnh giao diện quản trị quản lý đơn hàng và chi tiết đơn | Ảnh chụp thực tế | Mục 5.5.5 |
| Hình 5.5.6 | Ảnh giao diện quản trị quản lý tồn kho và sổ kho | Ảnh chụp thực tế | Mục 5.5.6 |
| Hình 5.5.7 | Ảnh giao diện quản trị quản lý đơn mua hàng nhập kho (Purchase Order) | Ảnh chụp thực tế | Mục 5.5.7 |
| Hình 5.5.8 | Ảnh giao diện quản trị quản lý khiếu nại | Ảnh chụp thực tế | Mục 5.5.8 |
| Hình 5.5.9 | Ảnh giao diện quản trị quản lý chương trình khuyến mãi và coupon | Ảnh chụp thực tế | Mục 5.5.9 |
| Hình 5.5.10 | Ảnh giao diện quản trị quản lý phí giao hàng | Ảnh chụp thực tế | Mục 5.5.10 |



---

# CHƯƠNG 1. TỔNG QUAN VỀ ĐỀ TÀI

## 1.1. Bối cảnh và lý do chọn đề tài

Thị trường máy tính cá nhân (PC) và linh kiện phần cứng tại Việt Nam trong những năm gần đây ghi nhận sự phát triển mạnh mẽ, được thúc đẩy bởi sự bùng nổ của các ngành công nghiệp nội dung số, thể thao điện tử (Esports), trí tuệ nhân tạo (AI) và nhu cầu làm việc từ xa. Khác với phân khúc máy tính xách tay (laptop) đóng gói nguyên khối với cấu hình cố định, phân khúc máy tính để bàn lắp ráp sở hữu tính linh hoạt rất cao về mặt công năng và hiệu suất. Người tiêu dùng có thể tự do lựa chọn và tùy biến từng linh kiện riêng rẽ từ bộ vi xử lý (CPU), bo mạch chủ (Mainboard), bộ nhớ truy xuất ngẫu nhiên (RAM), card đồ họa (VGA) đến bộ nguồn và giải pháp tản nhiệt nhằm tối ưu hóa chi phí trên từng mức hiệu năng mong muốn.

Tuy nhiên, đặc thù công nghệ của ngành hàng linh kiện PC đặt ra những rào cản kỹ thuật rất lớn đối với người tiêu dùng phổ thông. Mỗi linh kiện phần cứng khi kết hợp với nhau đều đòi hỏi những ràng buộc tương thích cơ học và điện tử nghiêm ngặt, bao gồm chuẩn chân cắm (socket), phiên bản chipset, chuẩn khe cắm bộ nhớ (DDR4 hoặc DDR5), công suất nguồn cung cấp danh định và kích thước vật lý của khung vỏ máy (Case). Phần lớn khách hàng khi tự chọn cấu hình thường gặp tình trạng mất phương hướng trước hàng nghìn mã sản phẩm (SKU) với thông số kỹ thuật phức tạp, dẫn đến nguy cơ xung đột phần cứng, mua thừa hoặc thiếu công suất nguồn, hoặc không thể lắp ráp hoàn chỉnh.

Về phía các đơn vị kinh doanh bán lẻ, công tác quản trị vận hành ngành hàng linh kiện và dịch vụ lắp ráp PC cũng đối mặt với nhiều bài toán hóc búa. Đầu tiên là bài toán quản lý tồn kho và giá vốn linh kiện: các sản phẩm phần cứng có tốc độ trượt giá nhanh và chu kỳ vòng đời ngắn, đòi hỏi phương pháp hạch toán giá vốn chính xác theo thời gian thực (như giá vốn bình quân gia quyền - giá vốn bình quân gia quyền (WAC)) và kiểm soát chặt chẽ từng đơn vị sản phẩm thông qua số định danh Serial Number. Thứ hai là bài toán quản lý danh mục và cấu hình linh kiện cấu thành (Virtual Bill of Materials - định mức linh kiện ảo (Virtual BOM)): hệ thống vừa phải quản lý từng linh kiện bán lẻ độc lập, vừa phải đóng gói thành các bộ máy tính hoàn chỉnh (PC Builder/bộ máy dựng sẵn (PC Bundle)) với cơ chế tự động giữ tồn kho linh kiện con tương ứng khi phát sinh giao dịch.

Hiện nay, nhiều hệ thống bán lẻ trong nước đã triển khai công cụ xây dựng cấu hình máy tính trực tuyến, song phần lớn vẫn dừng lại ở dạng biểu mẫu chọn lựa đơn giản, thiếu các thuật toán gợi ý tương thích tự động ở mức độ tin cậy cao, hoặc quy trình xử lý đơn hàng còn phụ thuộc nặng nề vào các thao tác thủ công ngoài hệ thống. Điều này tạo ra độ trễ lớn trong việc phản hồi khách hàng và dễ dẫn đến sai sót khi kiểm kê kho bãi.

Xuất phát từ thực tiễn trên, nhóm nghiên cứu đã quyết định lựa chọn đề tài "EL-TECH Dragon Store – Hệ thống kinh doanh linh kiện PC và dịch vụ lắp ráp PC". Đề tài hướng đến việc nghiên cứu, thiết kế và phát triển một nền tảng thương mại điện tử chuyên sâu, tích hợp công cụ hỗ trợ xây dựng cấu hình PC thông minh, kiểm soát tính tương thích phần cứng, tối ưu hóa quy trình giữ tồn kho linh kiện và tinh gọn hóa chuỗi vận hành bán lẻ từ tiếp nhận đơn hàng đến khâu giao nhận hoàn tất.

## 1.2. Mục tiêu đề tài

Mục tiêu tổng quát của đề tài là xây dựng một hệ thống web thương mại điện tử hoàn chỉnh, tin cậy và đạt hiệu năng cao phục vụ hoạt động kinh doanh linh kiện máy tính và dịch vụ cấu hình lắp ráp PC cho thương hiệu giả định EL-TECH, kết hợp chặt chẽ giữa trải nghiệm mua sắm mượt mà phía người dùng cuối và quy trình quản trị kho vận, đơn hàng nghiêm ngặt phía quản trị viên.

Để hiện thực hóa mục tiêu tổng quát, nhóm xác định các mục tiêu cụ thể sau:
- Xây dựng cổng danh mục linh kiện chuyên biệt với công cụ tìm kiếm và bộ lọc đa chiều theo thông số kỹ thuật chuẩn, cho phép khách hàng tra cứu chi tiết giá cả, tình trạng sẵn hàng và đặc tính kỹ thuật của từng SKU linh kiện rời cũng như các bộ PC dựng sẵn.
- Phát triển chức năng tự lắp ráp máy tính (PC Builder) tương tác trực quan với thuật toán gợi ý và kiểm soát tương thích cơ bản theo chuẩn chân cắm, công suất nguồn và chuẩn bộ nhớ, giúp người dùng dễ dàng cấu hình dàn máy theo nhu cầu và ngân sách cá nhân.
- Hiện thực hóa cơ chế giỏ hàng và thanh toán trực tuyến tin cậy với hai phương thức chuyển khoản qua mã QR hoặc thanh toán tiền mặt khi nhận hàng (COD), đảm bảo kiểm tra tồn kho và tính toán giá trị đơn hàng hoàn toàn ở tầng máy chủ (Backend-driven) nhằm chống gian lận dữ liệu.
- Thiết kế quy trình quản lý tồn kho vật lý tại một kho trung tâm duy nhất, quản lý số định danh Serial Number của linh kiện nhập - xuất, và áp dụng phương pháp giá vốn bình quân gia quyền (WAC)_TAG để bảo đảm tính toàn vẹn số liệu tài chính.
- Xây dựng cổng tra cứu hành trình đơn hàng minh bạch cho cả khách vãng lai (thông qua mã đơn hoặc số điện thoại/email kết hợp mã xác thực OTP) và khách hàng có tài khoản thành viên, đồng thời cung cấp phân hệ quản trị Kanban hỗ trợ nhân viên theo dõi sát sao vòng đời xử lý đơn hàng qua 9 trạng thái chuẩn hóa.

## 1.3. Đối tượng, phạm vi và giới hạn đề tài

Hệ thống phục vụ ba nhóm đối tượng người dùng chính với các vai trò và quyền hạn được phân định rõ ràng:
- Khách vãng lai (Guest): Khách hàng truy cập hệ thống mà không cần đăng nhập tài khoản. Đối tượng này có quyền duyệt danh mục sản phẩm, sử dụng công cụ tự lắp ráp máy tính (PC Builder), thêm hàng vào giỏ, thực hiện đặt hàng thanh toán và tra cứu tiến độ đơn hàng vãng lai thông qua mã đơn hoặc số điện thoại/email kèm xác thực mã OTP.
- Khách hàng thành viên (Registered Customer): Khách hàng đã đăng ký và xác thực tài khoản trên hệ thống. Ngoài toàn bộ quyền hạn như khách vãng lai, khách hàng thành viên được lưu trữ thông tin cá nhân, sổ địa chỉ giao hàng, theo dõi lịch sử các đơn hàng đã đặt và gửi đánh giá nhận xét cho các sản phẩm.
- Quản trị viên cửa hàng (Store Administrator): Người chịu trách nhiệm vận hành toàn bộ hoạt động kinh doanh của cửa hàng, bao gồm quản lý danh mục sản phẩm, cấu hình bảng giá và khuyến mãi, quản lý nhà cung cấp và đơn đặt hàng nhập kho (PO), theo dõi biến động tồn kho và số serial, tiếp nhận và điều phối trạng thái xử lý đơn hàng.

Về phạm vi triển khai của phiên bản sản phẩm khả dụng tối thiểu (MVP), hệ thống được giới hạn trong một mô hình vận hành tinh giản và thực tế:
- Mô hình vận hành: Hệ thống chỉ quản lý một cửa hàng vật lý duy nhất gắn liền với một kho hàng tập trung. Các quy trình phức tạp liên quan đến phân bổ hàng hóa đa chi nhánh, điều chuyển nội bộ giữa các kho (Branch-to-Branch Transfers) được loại bỏ khỏi phạm vi thiết kế để tập trung nâng cao chất lượng vận hành cốt lõi.
- Danh mục sản phẩm: Hệ thống chỉ tập trung duy nhất vào linh kiện máy tính để bàn (CPU, RAM, Mainboard, VGA, SSD/HDD, PSU, Case, Tản nhiệt), các thiết bị ngoại vi phụ trợ và các bộ PC lắp ráp hoàn chỉnh. Tuyệt đối không đưa các ngành hàng máy tính xách tay (Laptop), điện thoại di động hay thiết bị văn phòng vào danh mục, cơ sở dữ liệu mẫu và giao diện người dùng.
- Chính sách thanh toán và cọc: Hệ thống áp dụng thanh toán 100% giá trị đơn hàng thông qua chuyển khoản QR Code hoặc thanh toán khi nhận hàng COD. Nhóm quyết định không triển khai cơ chế đặt cọc một phần (đặt cọc một phần) kể cả đối với đơn hàng lắp ráp PC tùy biến nhằm loại bỏ sự phức tạp của việc theo dõi công nợ treo và hoàn cọc.
- Vòng đời đơn hàng và xử lý tài chính: Vòng đời đơn hàng được quản lý chặt chẽ qua đúng 9 trạng thái mục tiêu. Hệ thống không tích hợp các luồng đổi trả hàng (RMA), hoàn tiền trực tuyến (hoàn tiền trực tuyến) hay đối soát ngoại lệ giao dịch với cổng thanh toán bên thứ ba.
- Tiếp nhận khiếu nại: Khách hàng có thể gửi yêu cầu khiếu nại hoặc phản ánh chất lượng với nội dung văn bản tự do thông qua biểu mẫu tiếp nhận trên website. Hệ thống chịu trách nhiệm lưu trữ và xác nhận việc tiếp nhận thông tin; toàn bộ quá trình xử lý, giải quyết khiếu nại và thỏa thuận bồi hoàn sau đó được quy định thuộc ranh giới vận hành thực tế ngoài màn hình (nghiệp vụ vận hành thực tế ngoài hệ thống trực tuyến).

## 1.4. Phương pháp thực hiện

Để đảm bảo đề tài được triển khai khoa học, đáp ứng đầy đủ cả yêu cầu lý thuyết học thuật lẫn tính ứng dụng thực tiễn, nhóm đã áp dụng kết hợp các phương pháp kỹ thuật phần mềm sau:

Phương pháp khảo sát và phân tích hiện trạng: Nhóm tiến hành khảo sát thực nghiệm trên ba nền tảng thương mại điện tử chuyên kinh doanh linh kiện máy tính hàng đầu tại Việt Nam gồm GEARVN, HACOM và Phong Vũ. Bằng phương pháp quan sát trực tiếp trải nghiệm người dùng, chụp ảnh minh chứng và phân tích chức năng công khai, nhóm thiết lập bộ tiêu chí đánh giá chuẩn nhằm rút ra các bài học thiết kế giao diện, nhận diện những điểm nghẽn nghiệp vụ và xác định các yêu cầu chức năng cần có cho EL-TECH.

Phương pháp phân tích và mô hình hóa hệ thống: Dựa trên các yêu cầu thu thập được, nhóm sử dụng các chuẩn ký pháp kỹ thuật phần mềm tiêu chuẩn để mô hình hóa hệ thống:
- Sử dụng Business Process Model and Notation (BPMN 2.0) để trực quan hóa 8 quy trình nghiệp vụ cốt lõi theo từng làn bơi (lane) và cổng phân nhánh (gateway).
- Sử dụng mô hình Ca sử dụng (Use Case Diagram) kết hợp bảng đặc tả Use Case chi tiết theo cấu trúc 13 trường chuẩn công nghiệp để mô tả tương tác giữa các tác nhân và hệ thống.
- Sử dụng Sơ đồ luồng dữ liệu (Data Flow Diagram - DFD) ở ba cấp độ (ngữ cảnh, cấp 0 và cấp 1) để phân tích sự chuyển dịch và lưu trữ dữ liệu.
- Thiết kế Sơ đồ quan hệ thực thể (Entity Relationship Diagram - ERD) phân rã thành 6 phân cụm dữ liệu mục tiêu, đảm bảo chuẩn hóa dữ liệu quan hệ và bảo toàn các bất biến nghiệp vụ.

Phương pháp phát triển và thực nghiệm phần mềm: Nhóm áp dụng kiến trúc phát triển ứng dụng hiện đại theo mô hình phân tầng độc lập (nguyên lý phân tách mối bận tâm độc lập). Phía máy khách sử dụng framework Angular 22 với kiến trúc Standalone Components, cơ chế quản lý trạng thái phản ứng Angular Signals, bộ thư viện giao diện Spartan UI và Tailwind CSS. Phía máy chủ xây dựng bằng Node.js kết hợp Express REST API, áp dụng thư viện Zod để thẩm định dữ liệu đầu vào và Prisma ORM để thao tác an toàn với cơ sở dữ liệu PostgreSQL.

Phương pháp kiểm thử và truy vết chất lượng: Nhóm xây dựng ma trận truy vết yêu cầu (Traceability Matrix) liên kết chặt chẽ từ Mục tiêu sang Yêu cầu chức năng (FR), Quy tắc nghiệp vụ (BR), Ca sử dụng (UC) và Trường hợp kiểm thử (TC). Toàn bộ mã nguồn trước khi tích hợp đều phải vượt qua các cổng kiểm định tự động (Type check và Linter) nhằm đảm bảo hệ thống không phát sinh lỗi thực thi.

## 1.5. Ý nghĩa đề tài

Về mặt học thuật và đào tạo, đề tài mang lại giá trị thực hành sâu sắc đối với các thành viên trong nhóm thông qua việc làm chủ toàn diện quy trình phát triển một hệ thống phần mềm quy mô thương mại. Việc giải quyết các bài toán về quản lý cấu hình linh kiện đa cấp (định mức linh kiện ảo (Virtual BOM)), quản lý tồn kho và giá vốn (giá vốn bình quân gia quyền (WAC)), xử lý tranh chấp dữ liệu đồng thời (Concurrency Transactions) và kiểm soát tính tương thích phần cứng giúp sinh viên củng cố vững chắc các nguyên lý kỹ thuật phần mềm, cấu trúc dữ liệu, giải thuật và an toàn thông tin đã được đào tạo trong chương trình học.

Về mặt thực tiễn, sản phẩm EL-TECH Dragon Store cung cấp một mô hình giải pháp thương mại điện tử chuyên biệt, giúp người dùng giải quyết triệt để nỗi sợ mua sai hoặc không tương thích khi lựa chọn linh kiện lắp ráp máy tính. Đối với các đơn vị kinh doanh bán lẻ quy mô vừa và nhỏ, đề tài mang đến một kiến trúc hệ thống tinh gọn, tối ưu chi phí vận hành, chuẩn hóa quy trình xuất nhập kho và theo dõi tiến độ đơn hàng chính xác, từ đó nâng cao chất lượng dịch vụ và niềm tin của khách hàng.

## 1.6. Kết cấu báo cáo

Báo cáo kết quả nghiên cứu và phát triển đề tài được cấu trúc chặt chẽ thành 7 chương chính cùng phần tài liệu tham khảo và phụ lục minh chứng:
- Chương 1: Tổng quan về đề tài - Giới thiệu bối cảnh thị trường, lý do lựa chọn, mục tiêu, phạm vi tinh giản, phương pháp thực hiện và ý nghĩa của đề tài.
- Chương 2: Cơ sở lý thuyết và công nghệ vận dụng - Trình bày các nguyên lý nghiệp vụ bán lẻ, định mức linh kiện ảo (Virtual BOM), giá vốn tồn kho, kiến trúc công nghệ Frontend (Angular, Signals), Backend (Node.js, Express, Prisma) và các phương pháp mô hình hóa.
- Chương 3: Khảo sát, phân tích nghiệp vụ và đặc tả yêu cầu - Phân tích chi tiết kết quả khảo sát 3 website tham chiếu, xây dựng bảng tiêu chí so sánh, đặc tả toàn diện 7 nhóm yêu cầu chức năng, 3 nhóm yêu cầu phi chức năng, 5 nhóm quy tắc nghiệp vụ và ma trận truy vết hệ thống.
- Chương 4: Mô hình hóa và thiết kế hệ thống - Trực quan hóa hệ thống thông qua 8 sơ đồ quy trình BPMN 2.0, 2 sơ đồ Use Case nhóm kèm 8 bảng đặc tả Use Case 13 trường, sơ đồ kiến trúc tổng thể, DFD 3 cấp độ và ERD cơ sở dữ liệu mục tiêu với 6 phân cụm.
- Chương 5: Thiết kế giao diện UI/UX và hiện thực website - Trình bày quy chuẩn nhận diện thương hiệu, sitemap khách hàng và quản trị, luồng trải nghiệm người dùng, cùng ảnh chụp minh chứng thực tế và phân tích kỹ thuật 14 giao diện khách hàng và 10 giao diện quản trị.
- Chương 6: Kết luận và hướng phát triển - Tổng kết các kết quả đạt được, phân tích khách quan các hạn chế kỹ thuật hiện tại và đề xuất định hướng nghiên cứu mở rộng trong tương lai.
- Tài liệu tham khảo và Phụ lục: Danh mục tài liệu tham khảo theo định dạng APA 7 và các bảng mã nguồn, kịch bản kiểm thử chi tiết.



---

# CHƯƠNG 2. CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ VẬN DỤNG

Chương này trình bày toàn diện các nguyên lý nghiệp vụ bán lẻ linh kiện máy tính, mô hình dữ liệu cấu thành danh mục, cơ chế quản lý tồn kho và giá vốn bình quân gia quyền. Đồng thời, chương phân tích sâu các công nghệ nền tảng được lựa chọn để xây dựng hệ thống EL-TECH bao gồm Angular 22, Express REST API, Zod validation, Prisma ORM, cơ sở dữ liệu PostgreSQL và các chuẩn ký pháp mô hình hóa phần mềm.

## 2.1. Các nguyên lý nghiệp vụ được áp dụng

### 2.1.1. Luồng mua hàng và nguồn xác thực dữ liệu

Mục tiêu của tiểu mục này là làm rõ chuỗi vận hành giao dịch thương mại điện tử từ bước tiếp cận sản phẩm ban đầu cho đến khi hoàn tất đơn hàng, xác định rõ ranh giới trách nhiệm giữa giao diện người dùng và máy chủ dịch vụ.

Trong các hệ thống thương mại điện tử chuyên nghiệp, luồng giao dịch được tổ chức tuần tự qua các giai đoạn: khám phá danh mục (Catalog Discovery) -> thêm vào giỏ hàng (Cart) -> xác nhận thanh toán (Checkout) -> khởi tạo đơn hàng (Order Creation) -> hoàn tất giao nhận (Fulfillment). Nguyên lý cốt lõi được áp dụng trong hệ thống EL-TECH là "máy chủ là nguồn xác thực sự thật duy nhất" (Backend as nguồn xác thực dữ liệu duy nhất). Mọi thông tin hiển thị tại trình duyệt máy khách (Client) chỉ mang tính chất tham khảo trực quan; toàn bộ việc tính toán giá bán, áp dụng khuyến mãi, kiểm tra số dư tồn kho khả dụng và chuyển đổi trạng thái đơn hàng đều do máy chủ backend quyết định tuyệt đối.

![Hình 2.1.1. Luồng giao dịch trực tuyến EL-TECH sau tinh giản](drawio/hinh-2-1-1-luong-giao-dich.png)  
*Hình 2.1.1. Luồng giao dịch trực tuyến EL-TECH sau tinh giản*  
*Tệp nguồn sơ đồ:* [hinh-2-1-1-luong-giao-dich.drawio](drawio/hinh-2-1-1-luong-giao-dich.drawio)

Hình trên mô tả chi tiết chuỗi giao dịch trực tuyến được tinh giản theo đúng phạm vi MVP của đề tài. Tại bước khởi đầu, khách hàng duyệt qua danh mục linh kiện rời hoặc sử dụng công cụ cấu hình PC Builder. Khi thêm các mặt hàng vào giỏ hàng, hệ thống lưu trữ trạng thái giỏ tạm thời tại máy khách. Khi khách hàng tiến hành Checkout, một yêu cầu thẩm định dữ liệu được gửi về backend. Tại đây, backend thực hiện kiểm tra chéo giá bán niêm yết hiện hành của từng SKU trong cơ sở dữ liệu, tính toán lại giá trị giảm giá từ mã coupon hợp lệ và xác thực lượng hàng tồn kho vật lý có đủ đáp ứng hay không.

Tiếp theo, khách hàng lựa chọn hình thức nhận hàng (giao tận nơi hoặc nhận trực tiếp tại quầy) và chọn một trong hai phương thức thanh toán: chuyển khoản QR toàn phần hoặc thanh toán tiền mặt khi nhận hàng (COD). Điểm mấu chốt trong thiết kế tinh giản của EL-TECH là tuyệt đối không áp dụng cơ chế đặt cọc một phần (đặt cọc một phần), kể cả đối với các đơn hàng lắp ráp PC tùy biến. Quyết định này giúp loại bỏ hoàn toàn các rủi ro phát sinh công nợ treo, quy trình đối soát phức tạp và nhu cầu hoàn cọc khi giao dịch bất thành.

Tại khâu tạo đơn hàng, backend khởi tạo một giao dịch cơ sở dữ liệu cô lập (ACID Transaction) nhằm đồng thời tạo bản ghi đơn hàng, khóa số lượng linh kiện tương ứng vào trạng thái giữ hàng (Reserved Stock) và trả về thông tin xác nhận cho khách hàng. Sau đó, đơn hàng chuyển qua phân hệ kho để nhân viên chuẩn bị hàng, lắp ráp và bàn giao đơn vị vận chuyển. Toàn bộ chuỗi vận hành không mô hình hóa các ngoại lệ hoàn tiền trực tuyến trên website; mọi thỏa thuận bồi hoàn hoặc lỗi giao dịch được quy định giải quyết ngoài hệ thống.

Tóm lại, việc chuẩn hóa luồng giao dịch theo nguyên lý kiểm soát tập trung tại máy chủ và tinh giản chính sách thanh toán giúp bảo vệ tuyệt đối tính toàn vẹn dữ liệu, loại bỏ hoàn toàn nguy cơ can thiệp giá từ máy khách và đảm bảo sự vận hành ổn định cho cửa hàng.

### 2.1.2. Mô hình Category – Product Template – SKU và định mức linh kiện ảo (Virtual BOM)

Mục tiêu của tiểu mục này là phân tích kiến trúc phân tách giữa mẫu sản phẩm, biến thể thương mại và kỹ thuật đóng gói bộ máy tính thông qua danh mục linh kiện cấu thành ảo (Virtual Bill of Materials).

Trong kinh doanh linh kiện máy tính, một mặt hàng không thể quản lý bằng một mã định danh đơn lẻ. Hệ thống EL-TECH áp dụng mô hình phân tách ba cấp gồm Ngành hàng (Category) -> Mẫu sản phẩm chung (Product Template) -> Biến thể lưu kho (Stock Keeping Unit - SKU). Mẫu sản phẩm đóng vai trò chứa đựng các thông số kỹ thuật chung (như tên dòng sản phẩm, thương hiệu, mô tả chi tiết, hình ảnh đại diện), trong khi SKU đại diện cho đơn vị hàng hóa cụ thể có giá bán, mã vạch và số dư tồn kho riêng biệt (như màu sắc, dung lượng hoặc phiên bản xung nhịp).

![Hình 2.1.2. Quan hệ khái niệm Product Template - SKU - bộ máy dựng sẵn (PC Bundle)](drawio/hinh-2-1-2-quan-he-khai-niem.png)  
*Hình 2.1.2. Quan hệ khái niệm Product Template - SKU - bộ máy dựng sẵn (PC Bundle)*  
*Tệp nguồn sơ đồ:* [hinh-2-1-2-quan-he-khai-niem.drawio](drawio/hinh-2-1-2-quan-he-khai-niem.drawio)

Đối với các bộ máy tính để bàn lắp sẵn hoặc cấu hình tự chọn (bộ máy dựng sẵn (PC Bundle)), hệ thống áp dụng nguyên lý định mức linh kiện ảo (Virtual BOM) thông qua thực thể `PcBundleItem`. Một bộ PC không phải là một mặt hàng vật lý được nhập nguyên khối từ nhà cung cấp, mà là một cấu trúc ảo tập hợp từ nhiều SKU linh kiện rời lẻ (ví dụ: 1 SKU CPU Intel Core i5, 2 SKU RAM Kingston 16GB, 1 SKU VGA RTX 4060, 1 SKU Mainboard B760...). 

Sơ đồ trên làm rõ mối quan hệ một-nhiều giữa Product Template và các SKU con, cũng như quan hệ đa chiều giữa PcBundle và các SKU thành phần. Mỗi dòng trong định mức linh kiện ảo (Virtual BOM) lưu trữ khóa ngoại tham chiếu đến SKU linh kiện, số lượng yêu cầu (`quantity`) và cờ bắt buộc (`isMandatory`). Thiết kế này mang lại lợi thế vượt trội: cùng một mã SKU RAM hoặc VGA vừa có thể bán rời lẻ cho khách nâng cấp máy, vừa có thể đồng thời tham gia vào các gói cấu hình bộ máy dựng sẵn (PC Bundle) khác nhau mà không làm phân mảnh dữ liệu quản lý tồn kho.

Khi một bộ bộ máy dựng sẵn (PC Bundle) được khách hàng đặt mua, hệ thống không trừ tồn kho của một mặt hàng "PC" trừu tượng, mà tự động duyệt qua cây BOM để kiểm tra và trừ tồn kho trực tiếp trên từng SKU linh kiện con tương ứng. Cách tiếp cận này giúp cửa hàng kiểm soát chính xác giá vốn thực tế của toàn bộ dàn máy và ngăn chặn tình trạng nhận đơn lắp ráp khi một trong các linh kiện cốt lõi đã hết hàng.

Nhờ mô hình định mức linh kiện ảo (Virtual BOM) kết hợp chuẩn hóa SKU, EL-TECH giải quyết trọn vẹn bài toán kinh doanh song song giữa bán lẻ linh kiện và dịch vụ lắp ráp máy tính, tạo nền tảng vững chắc cho công cụ tự lắp ráp máy tính (PC Builder) vận hành tin cậy.

### 2.1.3. Định giá, khuyến mãi và tính toán giỏ hàng

Mục tiêu của tiểu mục này là xác lập công thức tính toán tài chính minh bạch cho giỏ hàng, quy tắc phối hợp giữa giá niêm yết, chương trình khuyến mãi theo danh mục, mã giảm giá và phí giao hàng.

Hệ thống loại bỏ hoàn toàn các quy tắc giảm trừ tiền cố định (hardcoded) trong mã nguồn. Toàn bộ giá trị đơn hàng được cấu thành từ các thành phần dữ liệu có nguồn gốc rõ ràng, được backend tính toán lại độc lập tại thời điểm thanh toán. Công thức tính tổng số tiền thanh toán cuối cùng (`finalTotal`) được chuẩn hóa như sau:

$$\text{subtotal} = \sum_{i=1}^{n} (\text{skuUnitPrice}_i \times \text{quantity}_i)$$

$$\text{promotionDiscount} = \sum (\text{mức giảm trực tiếp theo chương trình khuyến mãi hợp lệ})$$

$$\text{couponDiscount} = \text{giá trị giảm trừ từ mã Coupon sau khi thỏa mãn điều kiện đơn hàng tối thiểu}$$

$$\text{finalTotal} = \max(0, \text{subtotal} - \text{promotionDiscount} - \text{couponDiscount}) + \text{shippingFee}$$

Dưới đây là bảng quy chuẩn chi tiết các thành phần cấu thành tổng thanh toán áp dụng trong toàn hệ thống:

**Bảng 2.1.3. Thành phần cấu thành tổng thanh toán**

| Thành phần | Nguồn dữ liệu | Quy tắc tính toán | Ảnh hưởng tổng tiền |
| :--- | :--- | :--- | :--- |
| Tiền hàng tạm tính (`subtotal`) | Bảng `ProductVariant.price` trong PostgreSQL | Tổng tích số giữa giá niêm yết của từng SKU và số lượng đặt mua trong giỏ | Tăng tổng giá trị thanh toán |
| Khuyến mãi ngành hàng (`promotionDiscount`) | Bảng `ProductPromotion` còn hiệu lực | Giảm theo phần trăm hoặc số tiền trực tiếp áp dụng trên từng SKU/Category cụ thể | Giảm trừ tiền hàng trước coupon |
| Mã giảm giá (`couponDiscount`) | Bảng `Coupon` kích hoạt bởi khách | Kiểm tra điều kiện giá trị đơn tối thiểu (`minOrderValue`), hạn sử dụng và lượt dùng | Giảm trừ trực tiếp trên subtotal |
| Phí vận chuyển (`shippingFee`) | Bảng `ShippingFeeConfig` | Áp dụng theo khu vực giao hàng; bằng 0đ nếu khách chọn nhận hàng trực tiếp tại quầy | Tăng vào tổng tiền cuối cùng |
| Tổng thanh toán (`finalTotal`) | Tính toán độc lập tại `OrderService` | Áp dụng công thức chuẩn, đảm bảo không âm và phản ánh 100% nghĩa vụ trả tiền | Giá trị thanh toán thực tế của đơn |

Sau khi tính toán, backend đối chiếu kết quả với các ràng buộc nghiệp vụ. Ví dụ minh họa: Khách hàng đặt mua một bộ máy tính gồm CPU (5.000.000đ), Mainboard (3.500.000đ) và RAM (1.500.000đ), tổng `subtotal` là 10.000.000đ. Cửa hàng đang có chương trình khuyến mãi giảm 5% cho linh kiện Mainboard (tương đương 175.000đ), khách hàng nhập thêm mã coupon `ELTECH500` giảm 500.000đ cho đơn từ 8.000.000đ trở lên, và chọn giao hàng tiêu chuẩn với phí 50.000đ. Tổng thanh toán được backend xác định chính xác: 10.000.000đ - 175.000đ - 500.000đ + 50.000đ = 9.375.000đ. Số tiền này sẽ được mã hóa vào mã VietQR hoặc ghi nhận vào khoản thu COD khi giao hàng.

Quy trình tính toán chặt chẽ này đảm bảo loại bỏ mọi sai lệch làm tròn tiền tệ, ngăn chặn hành vi chỉnh sửa payload giá từ trình duyệt và cung cấp bằng chứng tài chính rõ ràng phục vụ hạch toán kế toán.

### 2.1.4. Tồn kho một cửa hàng, serial và giá vốn bình quân

Mục tiêu của tiểu mục này là làm rõ cấu trúc dữ liệu quản lý kho tập trung, cơ chế phân tách các trạng thái tồn kho, quy trình truy vết đơn vị sản phẩm qua số serial và phương pháp tính giá vốn bình quân gia quyền.

Khác với các hệ thống phân tán đa chi nhánh đòi hỏi nghiệp vụ chuyển kho phức tạp, EL-TECH thiết lập mô hình kho tập trung duy nhất tại địa điểm cửa hàng. Trọng tâm của mô hình là duy trì sự nhất quán giữa số lượng tồn kho sổ sách, số lượng vật lý thực tế và số lượng đã cam kết cho khách hàng.

![Hình 2.1.4. Quan hệ số dư tồn kho và lịch sử chuyển động](drawio/hinh-2-1-4-ton-kho-chuyen-dong.png)  
*Hình 2.1.4. Quan hệ số dư tồn kho và lịch sử chuyển động*  
*Tệp nguồn sơ đồ:* [hinh-2-1-4-ton-kho-chuyen-dong.drawio](drawio/hinh-2-1-4-ton-kho-chuyen-dong.drawio)

Sơ đồ trên thể hiện cấu trúc phân tầng trong quản trị kho của EL-TECH. Bản ghi `StockQuant` lưu trữ số dư tức thời của từng mã SKU tại kho duy nhất, bao gồm ba trường trạng thái cốt lõi: số lượng thực có trong kho (`onHand`), số lượng đang giữ cho các đơn hàng chưa xuất kho (`reserved`), và số lượng hàng cách ly do lỗi kỹ thuật hoặc chờ xử lý (`quarantine`). Số lượng thực sự sẵn sàng để chào bán cho khách hàng mới (`available`) được tính toán theo công thức bất biến:

$$\text{available} = \text{onHand} - \text{reserved} - \text{quarantine}$$

Bất biến nghiệp vụ bắt buộc của hệ thống là giá trị `available` luôn phải lớn hơn hoặc bằng 0. Khi khách hàng đặt đơn thành công, hệ thống tăng ngay lập tức giá trị `reserved` tương ứng mà không làm giảm `onHand`. Chỉ khi nhân viên kho thực hiện xuất hàng giao cho khách, giá trị `onHand` và `reserved` mới cùng được giảm tương ứng.

Mọi biến động kho đều bắt buộc phải thông qua phiếu biến động `StockMove` và ghi nhận một bản ghi bất biến vào sổ cái `StockLedgerEntry`. Sổ cái lưu vết thời điểm phát sinh, loại nghiệp vụ (nhập hàng PO, xuất bán lẻ, điều chỉnh cách ly), độ biến thiên số lượng (`quantityDelta`) và giá vốn bình quân gia quyền tại thời điểm đó (`wacUnitCost`). Đồng thời, đối với các linh kiện giá trị cao như CPU, Mainboard hay VGA, hệ thống bắt buộc quản lý từng đơn vị sản phẩm vật lý thông qua số định danh `SerialUnit`, đảm bảo mỗi số serial là duy nhất và có thể truy ngược về đúng đơn nhập hàng PO gốc.

Phương pháp giá vốn bình quân gia quyền (WAC)_TAG được tự động tính toán lại sau mỗi lần hoàn tất nhập kho theo công thức:

$$\text{giá vốn bình quân gia quyền (WAC)}_{\text{mới}} = \frac{(\text{onHand}_{\text{cũ}} \times \text{giá vốn bình quân gia quyền (WAC)}_{\text{cũ}}) + (\text{qtyNhập} \times \text{đơnGiáNhập})}{\text{onHand}_{\text{cũ}} + \text{qtyNhập}}$$

Mô hình quản trị kho tập trung này loại bỏ hoàn toàn các xung đột điều chuyển liên kho, bảo vệ cửa hàng trước nguy cơ bán vượt tồn (overselling) và duy trì sự chuẩn xác của giá vốn hàng tồn kho.

---

## 2.2. Công nghệ front-end và trải nghiệm người dùng

### 2.2.1. Angular, TypeScript và component

Mục tiêu của tiểu mục này là phân tích kiến trúc tầng giao diện người dùng xây dựng trên nền tảng Angular 22, TypeScript hiện đại và tổ chức component phân hệ.

Hệ thống lựa chọn Angular 22 làm framework chủ đạo cho toàn bộ giao diện máy khách, bao gồm cả cổng mua sắm dành cho khách hàng (giao diện khách hàng) và phân hệ quản trị vận hành (cổng quản trị). Khác với các thư viện render UI thuần túy, Angular cung cấp một giải pháp toàn diện bao gồm cơ chế định tuyến (Routing), quản lý biểu mẫu phản ứng (Reactive Forms), dịch vụ truyền thông HTTP chuẩn hóa và hệ thống phụ thuộc dịch vụ (Dependency Injection).

**Bảng 2.2.1. Áp dụng Angular và TypeScript trong hệ thống**

| Công nghệ / Cơ chế | Màn hình áp dụng | File minh chứng trong mã nguồn | Vai trò kỹ thuật chính |
| :--- | :--- | :--- | :--- |
| Angular Standalone Components | Toàn bộ ứng dụng | [fe/src/app/app.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/app.ts) | Loại bỏ NgModule, giảm dung lượng bundle và tối ưu hóa thời gian tải trang |
| Angular Routing & Lazy Loading | Cấu hình điều hướng | [fe/src/app/app.routes.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/app.routes.ts) | Phân tách module giao diện khách hàng và Admin, tải mã nguồn theo nhu cầu thực tế của trang |
| Strict TypeScript | Toàn bộ Frontend | [fe/src/app/core/api/api.types.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/core/api/api.types.ts) | Định kiểu tường minh cho hợp đồng API, triệt tiêu lỗi runtime do `any` hoặc sai kiểu |
| HTTP Interceptors | Toàn bộ giao tiếp mạng | [fe/src/app/core/api/auth.interceptor.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/core/api/auth.interceptor.ts) | Tự động tiêm Bearer token cho request admin và gắn Correlation ID để theo vết lỗi |
| Atomic Design & Spartan UI | Bộ thành phần nguyên tử | [fe/src/app/components/atoms/](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms/) | Chuẩn hóa các thành phần UI nền tảng (Button, Input, Badge, Select) theo thiết kế NVIDIA |

Bảng trên tổng hợp các cơ chế cốt lõi được triển khai trong mã nguồn frontend. Việc áp dụng kiến trúc Standalone Component giúp hệ thống loại bỏ hoàn toàn sự cồng kềnh của NgModule truyền thống. Mỗi màn hình hoặc thành phần giao diện chỉ khai báo đúng các dependency cần thiết, cho phép trình duyệt kích hoạt tính năng Tree-shaking tối đa để tinh gọn dung lượng phân phối.

Tuy nhiên, phân tích mã nguồn hiện tại cũng chỉ ra một hạn chế: phân hệ giao diện khách hàng và cổng quản trị hiện đang được đóng gói chung trong cùng một dự án Angular. Mặc dù cơ chế Lazy Loading đã giúp tách biệt các chunk mã nguồn khi tải trang, song về mặt lâu dài, việc phân tách hoàn toàn thành hai ứng dụng độc lập (Micro-frontends hoặc hai project riêng) sẽ giúp tăng cường tính cách ly bảo mật và giảm thiểu rủi ro rò rỉ mã quản trị sang môi trường khách hàng.

Nhìn chung, nền tảng Angular 22 cùng TypeScript nghiêm ngặt đã tạo nên một cấu trúc mã nguồn có tính kỷ luật cao, dễ bảo trì và đảm bảo hiệu năng mượt mà cho các luồng nghiệp vụ tương tác phức tạp.

### 2.2.2. Signals, state và giao tiếp API

Mục tiêu của tiểu mục này là làm rõ mô hình quản lý trạng thái phản ứng dựa trên Angular Signals và chu trình trao đổi dữ liệu với backend REST API.

Angular Signals là cơ chế phản ứng mịn (Fine-grained Reactivity) mới nhất của Angular, thay thế dần mô hình kiểm tra thay đổi Zone.js truyền thống. Thay vì kích hoạt kiểm tra lại toàn bộ cây component sau mỗi sự kiện, Signals cho phép hệ thống chỉ cập nhật chính xác các nút DOM thực sự bị ảnh hưởng bởi sự biến thiên của dữ liệu.

![Hình 2.2.2. Luồng giao tiếp component - frontend service API](drawio/hinh-2-2-2-luong-giao-tiep-fe-be.png)  
*Hình 2.2.2. Luồng giao tiếp component - frontend service API*  
*Tệp nguồn sơ đồ:* [hinh-2-2-2-luong-giao-tiep-fe-be.drawio](drawio/hinh-2-2-2-luong-giao-tiep-fe-be.drawio)

Hình trên minh họa chu trình giao tiếp khép kín giữa các lớp giao diện và máy chủ. Khi người dùng thực hiện thao tác trên màn hình (như bấm chọn một linh kiện CPU trong PC Builder), component gửi yêu cầu cập nhật trạng thái tới Service phụ trách (`PcBuilderService` hoặc `CartService`). Tại đây, trạng thái được lưu trữ dưới dạng một `WritableSignal`. Các giá trị phụ thuộc như tổng tiền tạm tính, tính hợp lệ của chuẩn chân cắm bo mạch chủ, hoặc công suất nguồn khuyến nghị được biểu diễn thông qua hàm `computed()`. Khi signal gốc thay đổi, hàm `computed()` tự động tính toán lại giá trị mới và đẩy trực tiếp ra template HTML mà không tốn chi phí quét toàn cục.

Đồng thời, Frontend Service sử dụng `HttpClient` để gửi các yêu cầu REST API tới máy chủ Express. Các HTTP Interceptor đảm nhận vai trò gắn thông tin định danh và bắt các lỗi mạng để hiển thị thông báo toast phù hợp. Cần nhấn mạnh sự khác biệt bản chất: trạng thái trong Angular Signals chỉ là dữ liệu tạm thời tồn tại trong bộ nhớ RAM của trình duyệt nhằm phục vụ trải nghiệm người dùng; toàn bộ dữ liệu có giá trị giao dịch bền vững (bảng giá, trạng thái đơn, số lượng giữ hàng) bắt buộc phải được lưu giữ và bảo vệ trong cơ sở dữ liệu PostgreSQL.

Nhờ sự kết hợp này, các tính năng có tính tương tác cao như bộ lọc linh kiện đa tiêu chí, tính toán giá trị cấu hình máy tính tức thời và giỏ hàng đạt được độ phản hồi gần như tức thì, mang lại trải nghiệm tối ưu cho người mua hàng.

### 2.2.3. Tailwind CSS và nguyên tắc thiết kế responsive

Mục tiêu của tiểu mục này là trình bày phương pháp tạo kiểu giao diện thông qua Tailwind CSS, các quy chuẩn về khoảng cách, kiểu chữ và nguyên tắc đáp ứng đa kích thước màn hình (Responsive Design).

Giao diện của EL-TECH áp dụng ngôn ngữ thiết kế lấy cảm hứng từ phong cách công nghệ cao của NVIDIA (EL-TECH Dark & High Contrast), sử dụng Tailwind CSS kết hợp hàm tiện ích `cn` và `hlm` (Class Variance Authority) để chuẩn hóa các biến thể giao diện. Hệ thống phân chia thang điểm màu rõ rệt: nền tối chuyên sâu (slate-900 / zinc-950), chữ độ tương phản cao (white / zinc-100), viền sắc nét (zinc-800) và điểm nhấn nhận diện thương hiệu công nghệ (emerald-500 / green-500).

Về mặt đáp ứng thiết bị, giao diện được tối ưu hóa theo phương pháp Mobile-First với các điểm ngắt tiêu chuẩn:
- Thiết bị di động (Mobile < 640px): Bộ lọc danh mục được thu gọn thành bảng trượt (Sheet/Drawer); danh sách linh kiện chuyển từ dạng bảng nhiều cột sang thẻ đơn giản xếp dọc; thanh tổng tiền PC Builder được neo cố định ở đáy màn hình (Sticky Bottom Bar) để khách hàng luôn theo dõi được ngân sách.
- Máy tính bảng (Tablet 640px - 1024px): Bố cục chuyển sang lưới 2 cột, menu điều hướng thu gọn thành hamburger menu, bảng quản trị cho phép cuộn ngang có ghim cột hành động.
- Máy tính để bàn (Desktop > 1024px): Bố cục lưới toàn phần với thanh danh mục và bộ lọc cố định bên trái (Sidebar Filter), vùng hiển thị sản phẩm chính giữa và bảng tóm tắt đơn hàng cố định bên phải.

Hệ thống cũng quy chuẩn hóa toàn bộ các trạng thái tương tác phản hồi người dùng: trạng thái đang tải hiển thị khung xương mờ (khung xương giao diện chờ tải) thay vì vòng xoay gây khó chịu; trạng thái không có dữ liệu (trạng thái dữ liệu trống) đi kèm thông điệp hướng dẫn rõ ràng và nút bấm kêu gọi hành động (CTA); trạng thái lỗi dữ liệu hiển thị khung cảnh báo màu đỏ với mã lỗi truy vết. Sự nhất quán này giúp người mới mua máy tính cảm thấy tự tin và dễ dàng làm quen với giao diện.

---

## 2.3. Công nghệ back-end và cơ sở dữ liệu

### 2.3.1. Node.js, Express và API REST

Mục tiêu của tiểu mục này là mô tả kiến trúc phân tầng xử lý của máy chủ backend xây dựng trên môi trường Node.js và framework Express.

Phân hệ máy chủ của EL-TECH được thiết kế theo mô hình kiến trúc phân tầng rõ rệt: Routing Layer -> Middleware Layer -> Business Service Layer -> Data Persistence Layer (Prisma). Cách tổ chức này giúp tách biệt hoàn toàn giữa việc định tuyến giao thức HTTP và logic xử lý nghiệp vụ, đảm bảo mã nguồn dễ kiểm thử tự động và mở rộng độc lập.

![Hình 2.3.1. Kiến trúc ứng dụng Angular Express - Prisma PostgreSQL](drawio/hinh-2-3-1-kien-truc-ung-dung.png)  
*Hình 2.3.1. Kiến trúc ứng dụng Angular Express - Prisma PostgreSQL*  
*Tệp nguồn sơ đồ:* [hinh-2-3-1-kien-truc-ung-dung.drawio](drawio/hinh-2-3-1-kien-truc-ung-dung.drawio)

Sơ đồ trên phân rã chi tiết 3 phân tầng công nghệ của hệ thống. Tầng Presentation (Frontend) giao tiếp với Tầng Dịch vụ (Backend) thông qua giao thức chuẩn HTTPS và dữ liệu định dạng JSON. Khi một yêu cầu HTTP gửi đến Express:
1. Router tiếp nhận và điều phối qua tầng Middleware kiểm tra bảo mật (CORS, giới hạn tần suất gửi yêu cầu Rate-limiting để chống tấn công từ chối dịch vụ hoặc dò mã OTP).
2. Tầng Middleware thẩm định Zod tiếp nhận và kiểm tra cấu trúc dữ liệu đầu vào. Nếu dữ liệu sai định dạng hoặc thiếu trường bắt buộc, yêu cầu bị chặn lại ngay lập tức và trả về mã lỗi 400 Bad Request kèm chi tiết lỗi mà không cần gọi xuống tầng dịch vụ.
3. Yêu cầu hợp lệ được chuyển cho Controller gọi đến Business Service (như [be/src/services/order.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/order.service.ts)). Tầng dịch vụ chịu trách nhiệm thực thi các quy tắc nghiệp vụ, tính toán tiền tệ và kiểm tra tính hợp lệ của trạng thái.
4. Tầng dịch vụ tương tác với cơ sở dữ liệu PostgreSQL thông qua Prisma Client, sử dụng các truy vấn được định kiểu tĩnh (Type-safe SQL) để truy xuất và ghi nhận dữ liệu bền vững.

Kiến trúc phân tầng này đảm bảo hệ thống không có sự chồng chéo trách nhiệm: Controller không trực tiếp viết mã SQL, Service không phụ thuộc vào đối tượng `req` hay `res` của Express, tạo điều kiện thuận lợi cho việc kiểm thử đơn vị (Unit Test).

### 2.3.2. Zod, bảo vệ dữ liệu đầu vào và kiểm tra quyền

Mục tiêu của tiểu mục này là phân tích cơ chế bảo vệ máy chủ thông qua lược đồ xác thực Zod và phân định rõ giữa xác thực kiểu dữ liệu với phân quyền truy cập.

Trong kiến trúc của EL-TECH, việc kiểm tra kiểu dữ liệu (Type Validation) và kiểm tra phân quyền (Authorization) được phân tách thành hai tầng bảo vệ độc lập. TypeScript chỉ bảo đảm an toàn kiểu ở thời điểm biên dịch (Compile-time), trong khi dữ liệu người dùng gửi lên qua mạng là không thể tin cậy ở thời điểm chạy (Runtime). Thư viện Zod được áp dụng để thiết lập các lược đồ (Schemas) thẩm định nghiêm ngặt toàn bộ tham số URL, chuỗi truy vấn (query string) và thân yêu cầu (request body).

**Bảng 2.3.2. Nhóm kiểm tra đầu vào và quyền truy cập**

| Nhóm API | Dữ liệu đầu vào cần kiểm tra | Cơ chế xác thực và ủy quyền | Mức độ triển khai thực tế |
| :--- | :--- | :--- | :--- |
| Tra cứu đơn hàng (`/api/order-lookup`) | Mã đơn (UUID v4), Số điện thoại (chuẩn 10 chữ số), Email (định dạng RFC), mã OTP (6 chữ số) | Không yêu cầu login; kiểm tra OTP hợp lệ khi tra cứu bằng SĐT/Email; chỉ hiển thị đơn vãng lai | Đã triển khai đầy đủ với Zod schema và rate-limit |
| Đặt hàng & Giỏ (`/api/orders`, `/api/checkout`) | Danh sách SKU, số lượng (> 0), phương thức thanh toán (`QR` hoặc `COD`), địa chỉ giao hàng | Cho phép Guest và Account; Backend tính lại toàn bộ giá trị, không tin cậy giá client | Đã triển khai đầy đủ, xác thực trong transaction |
| Quản trị viên (`/api/admin/*`) | Thông tin sản phẩm, cập nhật tồn kho, tiếp nhận PO, điều chuyển trạng thái đơn | Bắt buộc Bearer Token hoặc Cookie Session có vai trò `ADMIN`; Middleware chặn 403 nếu sai quyền | Đã triển khai với `admin-auth.middleware.ts` |
| Tiếp nhận khiếu nại (`/api/complaints`) | Họ tên, thông tin liên hệ (SĐT/Email), mã đơn hàng tùy chọn, mô tả khiếu nại tự do | Công khai cho mọi khách hàng; kiểm tra độ dài văn bản tối thiểu 10 ký tự, tối đa 2000 ký tự | Đã thiết kế schema mục tiêu, tiếp nhận ghi nhận vào DB |

Bảng trên phân loại rõ các cơ chế kiểm soát đầu vào theo từng nhóm tính năng. Việc thẩm định bằng Zod giúp loại bỏ triệt để các lỗ hổng tiêm mã độc (SQL Injection hoặc XSS payload) trước khi dữ liệu chạm tới tầng xử lý logic. 

Đồng thời, đối với tính năng tra cứu đơn hàng của khách vãng lai, việc bắt buộc xác thực mã OTP khi tìm kiếm bằng số điện thoại hoặc email là biện pháp then chốt để bảo vệ quyền riêng tư, ngăn chặn kẻ gian thu thập thông tin cá nhân và lịch sử mua sắm của khách hàng khác.

### 2.3.3. PostgreSQL, Prisma schema và migration

Mục tiêu của tiểu mục này là phân tích hiện trạng lược đồ cơ sở dữ liệu hiện tại và kế hoạch chuyển đổi sang lược đồ mục tiêu đơn cửa hàng phù hợp với phạm vi báo cáo.

Hiện tại, lược đồ cơ sở dữ liệu trong tệp [be/prisma/schema.prisma](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/prisma/schema.prisma) kế thừa cấu trúc lớn gồm 43 model và 29 enum từ phiên bản phát triển thử nghiệm ban đầu. Cấu trúc này bao gồm nhiều thực thể phức tạp như quản lý đa chi nhánh (`Branch`), điều chuyển kho nội bộ (`StockTransfer`), hoàn hàng nhà cung cấp (`SupplierReturn`), phê duyệt đánh giá và các trạng thái thanh toán đa tầng.

Để đáp ứng phạm vi MVP đã cam kết tại Đề tài (mô hình một cửa hàng, một kho duy nhất, thanh toán không cọc, không hoàn tiền trực tuyến), hệ thống đã xây dựng kế hoạch chuyển đổi và tinh giản lược đồ dữ liệu như trình bày trong bảng sau:

**Bảng 2.3.3. Kế hoạch chuyển đổi dữ liệu từ schema hiện hữu**

| Model / Trường dữ liệu | Hiện trạng trong mã nguồn | Quyết định xử lý trong Target Schema | Tác động dữ liệu và lý do kỹ thuật |
| :--- | :--- | :--- | :--- |
| Model `Branch` | Tồn tại quan hệ đa chi nhánh với Stock và User | Giữ lại bản ghi mặc định ID `main-store`, loại bỏ quan hệ đa điểm | Không làm gãy ràng buộc khóa ngoại hiện có, loại bỏ luồng chọn chi nhánh ở frontend |
| Model `StockTransfer` | Quản lý phiếu điều chuyển liên chi nhánh | Đánh dấu DEPRECATED / Loại bỏ khỏi báo cáo | Phạm vi đề tài là một kho duy nhất; không có nhu cầu điều chuyển hàng giữa các kho |
| Enum `PaymentState` | 8 trạng thái phức tạp bao gồm hoàn tiền và cọc | Tinh giản thành các trạng thái: PENDING, PAID, FAILED, CANCELLED | Loại bỏ luồng đặt cọc một phần và hoàn tiền trực tuyến trên hệ thống |
| Model `Complaint` | Chưa có trong schema cũ | Bổ sung model mới lưu trữ yêu cầu khiếu nại của khách | Đáp ứng yêu cầu tiếp nhận phản ánh; lưu ID, thông tin liên hệ, mô tả và ngày gửi |
| Model `Review` | Có quan hệ ràng buộc kiểm duyệt và đơn hàng | Chuyển đổi thành đánh giá mở tự do (không bắt buộc mua hàng) | Phù hợp với quyết định thiết kế cho phép đánh giá sản phẩm không giới hạn |

Bảng trên đóng vai trò là bản thiết kế chuyển đổi dữ liệu mục tiêu. Cần làm rõ rằng trong bản báo cáo này, nhóm trình bày kế hoạch chuyển đổi dưới góc độ thiết kế kiến trúc chuẩn hóa; các bảng không còn sử dụng đã được ẩn khỏi giao diện và vô hiệu hóa khỏi luồng nghiệp vụ thực thi.

### 2.3.4. Transaction, idempotency và concurrency

Mục tiêu của tiểu mục này là phân tích các giải pháp kỹ thuật giải quyết bài toán tranh chấp dữ liệu đồng thời và bảo đảm tính toàn vẹn giao dịch khi nhiều người dùng cùng mua một sản phẩm có số lượng tồn giới hạn.

Trong các dịp cao điểm khuyến mãi linh kiện phần cứng (Flash Sale), hiện tượng nhiều khách hàng cùng bấm đặt mua chiếc card màn hình hoặc bộ vi xử lý cuối cùng trong kho là tình huống thường xuyên xảy ra. Nếu không có cơ chế kiểm soát tương tranh, hệ thống sẽ rơi vào tình trạng bán vượt tồn kho vật lý (Overselling), dẫn đến tranh chấp và hủy đơn ngoài ý muốn.

![Hình 2.3.4. Ví dụ transaction tạo đơn và giữ tồn](drawio/hinh-2-3-4-transaction-tao-don.png)  
*Hình 2.3.4. Ví dụ transaction tạo đơn và giữ tồn*  
*Tệp nguồn sơ đồ:* [hinh-2-3-4-transaction-tao-don.drawio](drawio/hinh-2-3-4-transaction-tao-don.drawio)

Hình trên minh họa giải pháp kiểm soát tương tranh thông qua giao dịch tương tác của Prisma (`prisma.$transaction`). Khi yêu cầu tạo đơn hàng được gửi đến, toàn bộ các bước kiểm tra và ghi dữ liệu được đóng gói trong một transaction duy nhất:
1. Hệ thống thực hiện khóa dòng dữ liệu của SKU tương ứng trong bảng `StockQuant` bằng mệnh đề `SELECT ... FOR UPDATE` (hoặc kiểm tra điều kiện tương tranh lạc quan `available >= requestedQuantity`).
2. Nếu số lượng khả dụng không đủ, transaction lập tức kích hoạt cơ chế Rollback hoàn tác toàn bộ thao tác, ném ra ngoại lệ `INSUFFICIENT_STOCK` và trả về mã lỗi 409 Conflict cho client.
3. Nếu số lượng khả dụng thỏa mãn, hệ thống thực hiện cập nhật tăng trường `reserved`, đồng thời tạo mới bản ghi `Order`, các dòng `OrderLine` và bản ghi thanh toán `Payment` tương ứng.
4. Giao dịch được xác nhận (Commit), đảm bảo hoặc toàn bộ các bảng cùng được ghi nhận thành công, hoặc không có bất kỳ bảng nào bị ghi nhận rác (tính nguyên tử Atomicity).

Ngoài ra, hệ thống áp dụng cơ chế khóa trùng lặp (Idempotency Key) trên API tạo đơn hàng. Máy khách tạo một mã định danh duy nhất (UUID) cho mỗi phiên checkout và gửi kèm trong tiêu đề HTTP `Idempotency-Key`. Nếu khách hàng bấm nút đặt hàng nhiều lần do mạng chập chờn, máy chủ phát hiện khóa trùng sẽ trả về ngay kết quả đơn hàng đã tạo trước đó thay vì thực thi lệnh trừ kho lần thứ hai.

Các giải pháp kỹ thuật này đảm bảo hệ thống vận hành an toàn tuyệt đối dưới tải giao dịch đồng thời, triệt tiêu sai lệch số liệu tồn kho.

---

## 2.4. Các phương pháp phân tích và kiểm chứng được vận dụng

### 2.4.1. FDD, BPMN, Use Case, State, Sequence, DFD và ERD

Mục tiêu của tiểu mục này là hệ thống hóa các phương pháp và chuẩn ký pháp mô hình hóa kỹ thuật phần mềm được nhóm vận dụng trong suốt quá trình phát triển đề tài.

Mỗi phương pháp mô hình hóa trả lời cho một câu hỏi kỹ thuật chuyên biệt trong vòng đời phát triển phần mềm:
- Phân rã chức năng (FDD): Trả lời câu hỏi "Hệ thống bao gồm những phân hệ và tính năng lớn nào?". FDD cung cấp cái nhìn toàn cảnh về cấu trúc hệ thống, phân chia rõ giữa khu vực giao diện khách hàng phục vụ khách hàng và khu vực cổng quản trị phục vụ vận hành.
- Chuẩn ký pháp quy trình nghiệp vụ (BPMN 2.0): Trả lời câu hỏi "Quy trình kinh doanh diễn ra theo các bước nào, do ai thực hiện và có những rẽ nhánh kiểm soát nào?". BPMN là công cụ trọng tâm để mô hình hóa sự phối hợp giữa khách hàng, nhân viên bán hàng, kỹ thuật viên lắp ráp và thủ kho.
- Sơ đồ ca sử dụng (Use Case Diagram): Trả lời câu hỏi "Tác nhân nào tương tác với hệ thống qua những hành vi cụ thể nào?". Use Case phân định ranh giới hệ thống và là cơ sở để viết bảng đặc tả chi tiết 13 trường.
- Sơ đồ luồng dữ liệu (DFD): Trả lời câu hỏi "Dữ liệu từ đâu đi vào, được xử lý qua những tiến trình nào và lưu trữ tại những kho dữ liệu nào?".
- Sơ đồ quan hệ thực thể (ERD): Trả lời câu hỏi "Dữ liệu được tổ chức thành những bảng nào, có mối quan hệ và ràng buộc toàn vẹn khóa chính, khóa ngoại ra sao?".

Trong đồ án này, nhóm ưu tiên hàng đầu hai công cụ là BPMN 2.0 (mô tả quy trình động) và Use Case (mô tả yêu cầu tương tác), đồng thời sử dụng DFD và ERD để bảo đảm tính nhất quán của dữ liệu tĩnh.

### 2.4.2. Truy vết yêu cầu và phương pháp đánh giá

Mục tiêu của tiểu mục này là xác lập phương pháp truy vết chất lượng từ mục tiêu ban đầu cho đến các dòng mã nguồn và minh chứng kiểm thử thực tế.

Trong kỹ thuật phần mềm, ma trận truy vết (Traceability Matrix) là công cụ bắt buộc để kiểm soát phạm vi và ngăn ngừa hai lỗi phổ biến: hiện tượng "bỏ quên tính năng đã cam kết" (Under-delivery) và hiện tượng "xây dựng chức năng ngoài phạm vi gây lãng phí nguồn lực" (Scope Creep).

![Hình 2.4.2. Chuỗi truy vết từ yêu cầu tới minh chứng](drawio/hinh-2-4-2-chuoi-truy-vet.png)  
*Hình 2.4.2. Chuỗi truy vết từ yêu cầu tới minh chứng*  
*Tệp nguồn sơ đồ:* [hinh-2-4-2-chuoi-truy-vet.drawio](drawio/hinh-2-4-2-chuoi-truy-vet.drawio)

Sơ đồ trên mô tả chuỗi liên kết logic 7 cấp độ được áp dụng xuyên suốt đề tài. Mỗi Mục tiêu đề tài sinh ra một tập hợp các Yêu cầu chức năng (FR) và Yêu cầu phi chức năng (NFR). Mỗi FR lại chịu sự chi phối của các Quy tắc nghiệp vụ bắt buộc (BR). Từ các FR và BR, nhóm xây dựng các kịch bản Ca sử dụng (UC) và sơ đồ quy trình BPMN tương ứng. Các mô hình này là cơ sở để thiết kế kiến trúc, DFD và ERD, từ đó lập trình viên triển khai thành các component Angular phía máy khách và service Express phía máy chủ. Cuối cùng, mỗi tính năng đều được gắn mã trường hợp kiểm thử (TC) có log thực thi và ảnh chụp màn hình minh chứng.

Phương pháp đánh giá này giúp hội đồng đánh giá và người đọc báo cáo có thể kiểm chứng chéo bất kỳ tính năng nào: từ một nút bấm trên giao diện có thể truy ngược về mã FR tương ứng, hoặc từ một quy tắc nghiệp vụ có thể kiểm tra xem đoạn mã nào trong backend đang thực thi quy tắc đó.

---

## 2.5. Tổng hợp công nghệ và mức độ áp dụng

Mục tiêu của tiểu mục này là tổng hợp toàn bộ các công nghệ, thư viện và công cụ được sử dụng trong hệ thống EL-TECH, phân định minh bạch giữa những thành phần đã hiện thực hoàn chỉnh, những phần đã tinh giản theo phạm vi và những phần thuộc định hướng tương lai.

Dưới đây là ma trận tổng hợp toàn bộ công nghệ, vị trí file mã nguồn minh chứng và trạng thái triển khai thực tế của hệ thống:

**Bảng 2.5. Ma trận công nghệ tính năng bằng chứng triển khai**

| Công nghệ / Thư viện | Tính năng / Phân hệ áp dụng | Vị trí file minh chứng trong mã nguồn | Trạng thái triển khai | Giới hạn kỹ thuật hiện tại |
| :--- | :--- | :--- | :--- | :--- |
| Angular 22 | giao diện khách hàng & cổng quản trị | [fe/src/app/app.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/app.ts) | Đã hoàn thành | Đóng gói chung trong một dự án monolithic client |
| Angular Signals | Quản lý state PC Builder, Cart | [fe/src/app/app.config.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/app.config.ts) | Đã hoàn thành | Chưa triển khai Signals Store toàn cục (NgRx Signals) |
| Tailwind CSS & Spartan UI | Giao diện Dark & High Contrast | [fe/src/app/app.css](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/app.css) | Đã hoàn thành | Cần tiếp tục bổ sung các token màu tùy biến |
| Node.js & Express 4.x | REST API Server | [be/src/index.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/index.ts) | Đã hoàn thành | Chưa nâng cấp lên kiến trúc Fastify |
| Zod Schemas | Thẩm định dữ liệu đầu vào | [be/src/routes/checkout.routes.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/routes/checkout.routes.ts) | Đã hoàn thành | Cần chuẩn hóa đồng bộ thêm cho các API legacy |
| Prisma ORM | Tầng truy cập dữ liệu Type-safe | [be/src/lib/prisma.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/lib/prisma.ts) | Đã hoàn thành | Lược đồ đang trong giai đoạn tinh giản theo Target Scope |
| PostgreSQL 15 | Hệ quản trị cơ sở dữ liệu quan hệ | [be/prisma/schema.prisma](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/prisma/schema.prisma) | Đã hoàn thành | Vận hành trên Supabase với các chỉ mục cơ bản |
| Interactive Transactions | Tạo đơn và khóa giữ tồn kho | [be/src/services/order.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/order.service.ts) | Đã hoàn thành | Thời gian timeout transaction đặt mặc định 5000ms |
| Draw.io & CLI | Hệ thống 28 sơ đồ kỹ thuật | [scripts/export-drawio.ps1](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/scripts/export-drawio.ps1) | Đã hoàn thành | Tự động xuất ảnh PNG độ nét cao từ tệp XML nguồn |

Bảng ma trận trên thể hiện sự trung thực và tính kỷ luật công nghệ của nhóm thực hiện đề tài. Toàn bộ các công nghệ cốt lõi đều được đối chiếu trực tiếp với các tệp mã nguồn đang chạy thực tế trên môi trường cục bộ (`localhost:4200` và `localhost:3000`). Nhóm kiên quyết không đưa các công nghệ dự kiến chưa dùng vào danh sách đã hoàn thành, bảo đảm tính liêm chính và sự nhất quán cho toàn bộ báo cáo.



---

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



---

# CHƯƠNG 4. MÔ HÌNH HÓA VÀ THIẾT KẾ HỆ THỐNG

Chương này trình bày chi tiết toàn bộ thiết kế kiến trúc, các mô hình động và mô hình tĩnh của hệ thống EL-TECH Dragon Store. Hệ thống được trực quan hóa thông qua 8 quy trình nghiệp vụ BPMN 2.0, 2 sơ đồ Use Case nhóm, 8 bảng đặc tả Use Case chi tiết theo chuẩn 13 trường, sơ đồ kiến trúc tổng thể phân tầng, sơ đồ luồng dữ liệu DFD 3 cấp độ và lược đồ quan hệ thực thể ERD mục tiêu phân rã thành 6 phân cụm cốt lõi.

---

## 4.1. Phân rã chức năng và nguyên tắc mô hình hóa

Hệ thống EL-TECH được tổ chức thành hai phân hệ người dùng chính với sự phân tách độc lập về mặt chức năng và không gian trải nghiệm:
- Phân hệ Cửa hàng trực tuyến (giao diện khách hàng Portal): Phục vụ khách vãng lai và khách thành viên với các nhóm chức năng: Khám phá danh mục linh kiện rời và PC dựng sẵn; Công cụ xây dựng cấu hình PC Builder và kiểm tra tương thích phần cứng; Giỏ hàng và đặt hàng thanh toán QR/COD toàn phần; Cổng tra cứu tiến độ đơn hàng vãng lai bằng mã đơn hoặc OTP qua SĐT/Email; Quản lý hồ sơ và lịch sử đơn hàng của thành viên; Gửi đánh giá sản phẩm tự do và gửi yêu cầu khiếu nại.
- Phân hệ Quản trị vận hành (Admin Management Portal): Phục vụ nhân viên quản trị cửa hàng với các nhóm chức năng: Quản trị danh mục ngành hàng, mẫu sản phẩm và biến thể SKU; Cấu hình dàn máy bộ máy dựng sẵn (PC Bundle) và định mức linh kiện ảo (Virtual BOM); Quản trị đơn mua hàng PO, tiếp nhận hàng và quét mã Serial; Quản trị tồn kho tập trung và hạch toán giá vốn bình quân gia quyền (WAC)_TAG; Điều phối đơn hàng qua bảng Kanban 9 trạng thái; Cấu hình chiến dịch khuyến mãi, mã giảm giá và biểu phí giao hàng; Tiếp nhận hòm thư khiếu nại.

Nguyên tắc mô hình hóa xuyên suốt là tuân thủ nghiêm ngặt phạm vi tinh giản: không đưa vào các luồng đặt cọc một phần, hoàn tiền trực tuyến trên hệ thống, điều chuyển đa chi nhánh hay duyệt đánh giá thủ công.

---

## 4.2. Sơ đồ BPMN 2.0 các quy trình nghiệp vụ

Phần này trực quan hóa 8 quy trình kinh doanh cốt lõi bằng chuẩn ký pháp BPMN 2.0, phân định rõ trách nhiệm giữa các làn bơi (lane) và các điều kiện rẽ nhánh tại các cổng phân nhánh độc quyền (Exclusive Gateway).

### 4.2.1. Quy trình lựa chọn sản phẩm và đặt hàng

Quy trình đặt hàng mô tả hành trình từ lúc khách hàng tiếp cận linh kiện hoặc công cụ tự lắp ráp máy tính (PC Builder) cho đến khi đơn hàng được ghi nhận an toàn vào cơ sở dữ liệu.

![Hình 4.2.1. BPMN lựa chọn linh kiện PC và đặt hàng](drawio/hinh-4-2-1-bpmn-dat-hang.png)  
*Hình 4.2.1. BPMN lựa chọn linh kiện PC và đặt hàng*  
*Tệp nguồn sơ đồ:* [hinh-4-2-1-bpmn-dat-hang.drawio](drawio/hinh-4-2-1-bpmn-dat-hang.drawio)

Quy trình bắt đầu khi khách hàng (Guest hoặc Member) duyệt danh mục hoặc sử dụng công cụ tự lắp ráp máy tính (PC Builder) để cấu hình dàn máy tính. Khi bấm thêm vào giỏ hàng và tiến hành Checkout, luồng điều khiển chuyển xuống làn bơi của Hệ thống Backend. Backend thực hiện thẩm định giá niêm yết hiện hành, kiểm tra số lượng tồn kho khả dụng (`available = onHand - reserved - quarantine >= requestedQty`) và tính toán số tiền giảm trừ từ mã coupon hợp lệ.

Tại cổng phân nhánh chọn phương thức thanh toán, khách hàng lựa chọn một trong hai nhánh: Chuyển khoản qua mã VietQR 100% hoặc Thanh toán khi nhận hàng COD 100%. Quyết định thiết kế cốt lõi của EL-TECH là tuyệt đối không yêu cầu hay cung cấp tùy chọn đặt cọc một phần, kể cả đối với các bộ máy tính tự ráp giá trị cao.

Ngay sau khi phương thức được chọn, backend mở một giao dịch cơ sở dữ liệu cô lập (`prisma.$transaction`). Trong giao dịch này, hệ thống đồng thời tăng số lượng `reserved` trong bảng `StockQuant`, tạo bản ghi `Order` ở trạng thái `PENDING` và tạo bản ghi thanh toán `Payment`. Đơn hàng sau đó được trả về mã UUID cho khách hàng và đẩy sang làn bơi của Xưởng lắp ráp / Kho để chuẩn bị bàn giao.

### 4.2.2. Quy trình tra cứu đơn hàng

Quy trình tra cứu đơn hàng cung cấp cơ chế theo dõi tiến độ đơn minh bạch cho khách vãng lai, bảo vệ thông tin bằng mã xác thực một lần (OTP).

![Hình 4.2.2. BPMN tra cứu đơn](drawio/hinh-4-2-2-bpmn-tra-cuu.png)  
*Hình 4.2.2. BPMN tra cứu đơn*  
*Tệp nguồn sơ đồ:* [hinh-4-2-2-bpmn-tra-cuu.drawio](drawio/hinh-4-2-2-bpmn-tra-cuu.drawio)

Quy trình phân rã thành hai nhánh tra cứu chính tại cổng rẽ nhánh:
- Nhánh 1: Tra cứu trực tiếp bằng Mã đơn hàng (UUID v4). Khi khách nhập mã đơn, backend kiểm tra điều kiện an toàn: chỉ đơn hàng không gắn tài khoản (`userId IS NULL`) mới được hiển thị công khai. Nếu đơn thuộc về một tài khoản thành viên, hệ thống từ chối và yêu cầu người dùng đăng nhập nhằm chống lộ dữ liệu đơn hàng cá nhân.
- Nhánh 2: Tra cứu bằng Số điện thoại hoặc Email. Khách hàng nhập thông tin liên hệ, backend sinh mã OTP ngẫu nhiên gồm 6 chữ số có hiệu lực trong 5 phút và gửi qua cổng SMS/Email. Khách hàng bắt buộc phải nhập đúng mã OTP thì backend mới truy vấn và trả về danh sách các đơn hàng vãng lai tương ứng.

Sau khi xác thực thành công, màn hình hiển thị toàn bộ chi tiết đơn hàng, danh sách linh kiện và tiến độ di chuyển qua 9 trạng thái chuẩn hóa, giúp khách hàng an tâm theo dõi đơn hàng của mình.

### 4.2.3. Quy trình đánh giá sản phẩm

Quy trình thể hiện chính sách đánh giá mở tự do nhằm khuyến khích sự tương tác của cộng đồng phần cứng máy tính.

![Hình 4.2.3. BPMN đánh giá sản phẩm](drawio/hinh-4-2-3-bpmn-danh-gia.png)  
*Hình 4.2.3. BPMN đánh giá sản phẩm*  
*Tệp nguồn sơ đồ:* [hinh-4-2-3-bpmn-danh-gia.drawio](drawio/hinh-4-2-3-bpmn-danh-gia.drawio)

Người dùng truy cập trang chi tiết của bất kỳ linh kiện nào, chọn số sao đánh giá (từ 1 đến 5 sao), nhập tên hiển thị và viết nội dung nhận xét chi tiết. Khi bấm gửi, máy chủ Express kiểm tra cấu trúc dữ liệu qua Zod schema (xác thực điểm đánh giá nằm trong khoảng 1-5, nội dung không chứa chuỗi rác hoặc độ dài không hợp lệ).

Sau khi thẩm định, đánh giá được ghi nhận trực tiếp vào bảng `Review` trong cơ sở dữ liệu và hiển thị công khai ngay lập tức trên trang sản phẩm. Hệ thống không áp dụng bước kiểm duyệt thủ công của quản trị viên và không ràng buộc người gửi phải có đơn hàng đã mua trong quá khứ.

### 4.2.4. Quy trình mua hàng và nhập kho

Quy trình mô tả chuỗi nghiệp vụ nhập hàng từ nhà cung cấp, kiểm định chất lượng, gán số serial và cập nhật giá vốn tồn kho tại kho trung tâm.

![Hình 4.2.4. BPMN PO và nhập kho](drawio/hinh-4-2-4-bpmn-po-nhap-kho.png)  
*Hình 4.2.4. BPMN PO và nhập kho*  
*Tệp nguồn sơ đồ:* [hinh-4-2-4-bpmn-po-nhap-kho.drawio](drawio/hinh-4-2-4-bpmn-po-nhap-kho.drawio)

Quản trị viên khởi tạo đơn đặt mua hàng (PO) ở trạng thái `DRAFT` với danh sách linh kiện và đơn giá nhập dự kiến từ nhà cung cấp chính hãng, sau đó xác nhận gửi đơn (`CONFIRMED`). Khi hàng hóa được vận chuyển về kho cửa hàng, thủ kho tiến hành kiểm đếm thực tế.

Tại cổng phân nhánh kiểm tra số lượng: nếu nhà cung cấp giao đủ 100% số lượng, thủ kho thực hiện quét toàn bộ mã vạch Serial Number của từng linh kiện; nếu nhà cung cấp giao thiếu hàng, hệ thống hỗ trợ điều chỉnh giảm số lượng dòng PO theo thực tế nhận, loại bỏ hoàn toàn các luồng chuyển kho bù trừ phức tạp.

Khi xác nhận hoàn tất nhập kho (`COMPLETED`), hệ thống tự động: (1) tăng số lượng `onHand` trong `StockQuant`; (2) tạo các bản ghi `SerialUnit` ở trạng thái `IN_STOCK`; (3) ghi bút toán vào sổ cái `StockLedgerEntry`; và (4) tính toán lại giá vốn bình quân gia quyền (WAC)_TAG cho SKU theo số lượng và đơn giá thực nhận.

### 4.2.5. Quy trình xử lý đơn và lắp ráp

Quy trình phân tách rõ ràng luồng xử lý kỹ thuật giữa đơn hàng chỉ mua linh kiện rời và đơn hàng có chứa dàn máy PC lắp ráp theo định mức linh kiện ảo (Virtual BOM).

![Hình 4.2.5. BPMN chuẩn bị lắp ráp đơn](drawio/hinh-4-2-5-bpmn-chuan-bi-lap-rap.png)  
*Hình 4.2.5. BPMN chuẩn bị lắp ráp đơn*  
*Tệp nguồn sơ đồ:* [hinh-4-2-5-bpmn-chuan-bi-lap-rap.drawio](drawio/hinh-4-2-5-bpmn-chuan-bi-lap-rap.drawio)

Khi đơn hàng chuyển sang trạng thái đã xác nhận (`CONFIRMED`), hệ thống kiểm tra loại mặt hàng có trong đơn:
- Nếu đơn hàng chỉ gồm các linh kiện rời lẻ: đơn chuyển sang trạng thái `PREPARING` (Đang chuẩn bị hàng). Nhân viên kho tiến hành nhặt hàng từ kệ, quét mã serial xuất kho và đóng gói chống sốc.
- Nếu đơn hàng có chứa bộ bộ máy dựng sẵn (PC Bundle) (hoặc cấu hình tự chọn từ PC Builder): đơn chuyển sang trạng thái `ASSEMBLING` (Đang lắp ráp). Kỹ thuật viên tiếp nhận phiếu cấu hình định mức linh kiện ảo (Virtual BOM), lắp ráp CPU, Mainboard, tản nhiệt, gắn RAM và VGA vào thùng máy, đi dây nguồn gọn gàng và tiến hành kiểm tra độ ổn định nhiệt độ (Stress Test / Benchmark).

Sau khi hoàn tất khâu chuẩn bị hoặc lắp ráp, đơn hàng rẽ nhánh theo hình thức giao nhận mà khách đã chọn: chuyển sang `READY_FOR_PICKUP` nếu khách đăng ký nhận trực tiếp tại quầy, hoặc bàn giao bưu tá và chuyển sang `SHIPPING` nếu khách đăng ký giao hàng tận nhà.

### 4.2.6. Quy trình giao hàng

Quy trình điều phối hoạt động vận chuyển của bưu tá và cơ chế xử lý trường hợp giao hàng thất bại.

![Hình 4.2.6. BPMN giao nhận](drawio/hinh-4-2-6-bpmn-giao-nhan.png)  
*Hình 4.2.6. BPMN giao nhận*  
*Tệp nguồn sơ đồ:* [hinh-4-2-6-bpmn-giao-nhan.drawio](drawio/hinh-4-2-6-bpmn-giao-nhan.drawio)

Đơn vị giao vận tiếp nhận kiện hàng và thực hiện phát hàng đến địa chỉ của khách hàng. Tại cổng phân nhánh kết quả giao hàng:
- Nếu giao hàng thành công: khách hàng ký nhận, thanh toán đủ tiền mặt (nếu là đơn COD). Nhân viên quản trị cập nhật trạng thái đơn sang `COMPLETED` (Hoàn tất), kết thúc chu trình giao dịch.
- Nếu giao hàng thất bại (khách không nghe máy, hẹn lại giờ giao): đơn hàng chuyển sang trạng thái `DELIVERY_FAILED`. 

Đặc điểm nổi bật trong thiết kế của EL-TECH là cho phép nhân viên liên hệ lại với khách hàng và bấm nút "Giao lại" để chuyển trạng thái quay trở lại `SHIPPING`. Vòng lặp giao lại này được phép thực hiện không giới hạn số lần cho đến khi giao thành công hoặc có quyết định hủy đơn chính thức từ quản trị viên. Hệ thống không tự động chuyển hàng hoàn về kho khi chưa có quyết định hủy đơn dứt khoát.

### 4.2.7. Quy trình tiếp nhận khiếu nại

Quy trình xác lập ranh giới trách nhiệm rõ ràng giữa hệ thống phần mềm trực tuyến và hoạt động nghiệp vụ thực tế ngoài màn hình.

![Hình 4.2.7. BPMN tiếp nhận khiếu nại](drawio/hinh-4-2-7-bpmn-tiep-nhan-khieu-nai.png)  
*Hình 4.2.7. BPMN tiếp nhận khiếu nại*  
*Tệp nguồn sơ đồ:* [hinh-4-2-7-bpmn-tiep-nhan-khieu-nai.drawio](drawio/hinh-4-2-7-bpmn-tiep-nhan-khieu-nai.drawio)

Khách hàng truy cập biểu mẫu tiếp nhận khiếu nại trên website, điền họ tên, thông tin liên hệ, mã đơn hàng (không bắt buộc) và mô tả chi tiết vấn đề phát sinh (lỗi kỹ thuật linh kiện, giao sai hàng, hư hỏng trong quá trình vận chuyển...).

Khi bấm gửi, hệ thống backend lưu trữ nội dung phản ánh vào bảng `Complaint` trong cơ sở dữ liệu và hiển thị thông báo kèm mã số tiếp nhận. Trách nhiệm trực tuyến của phần mềm kết thúc tại đây. Toàn bộ các công đoạn xử lý sau đó gồm: nhân viên chăm sóc khách hàng gọi điện xác minh, hướng dẫn khách mang linh kiện tới kiểm tra, thỏa thuận đổi mới sản phẩm hoặc hoàn tiền mặt trực tiếp đều thuộc ranh giới vận hành ngoài màn hình (ngoài hệ thống trực tuyến).

### 4.2.8. Quy trình cấu hình khuyến mãi và mã giảm giá

Quy trình mô tả công tác quản trị chiến dịch ưu đãi của quản trị viên cửa hàng.

![Hình 4.2.8. BPMN cấu hình khuyến mãi và mã giảm giá](drawio/hinh-4-2-8-bpmn-khuyen-mai.png)  
*Hình 4.2.8. BPMN cấu hình khuyến mãi và mã giảm giá*  
*Tệp nguồn sơ đồ:* [hinh-4-2-8-bpmn-khuyen-mai.drawio](drawio/hinh-4-2-8-bpmn-khuyen-mai.drawio)

Quản trị viên đăng nhập vào phân hệ Admin, lựa chọn hình thức ưu đãi: giảm theo phần trăm hoặc giảm một khoản tiền cố định. Tiếp theo, quản trị viên thiết lập phạm vi tác động (áp dụng cho toàn bộ danh mục linh kiện, ví dụ giảm 10% cho Mainboard, hoặc áp dụng cho từng SKU cụ thể), cài đặt khoảng thời gian bắt đầu - kết thúc và giá trị đơn hàng tối thiểu.

Khi chiến dịch được kích hoạt, các quy tắc giảm giá sẽ tự động được tích hợp vào công thức tính toán tài chính của giỏ hàng và checkout mà không cần lập trình viên phải sửa đổi bất kỳ dòng mã nguồn nào.

---

## 4.3. Sơ đồ Use Case và đặc tả Use Case

Phần này trực quan hóa tương tác giữa người dùng và hệ thống qua 2 sơ đồ Use Case nhóm, kèm theo đặc tả chi tiết 8 Use Case tiêu biểu nhất của hệ thống theo mẫu 13 trường chuẩn.

### 4.3.1. Sơ đồ Use Case phân hệ Khách hàng

![Hình 4.3.1. Use Case khách hàng](drawio/hinh-4-3-1-use-case-khach-hang.png)  
*Hình 4.3.1. Use Case khách hàng*  
*Tệp nguồn sơ đồ:* [hinh-4-3-1-use-case-khach-hang.drawio](drawio/hinh-4-3-1-use-case-khach-hang.drawio)

Sơ đồ trên thể hiện mối quan hệ thừa kế giữa Khách hàng thành viên và Khách vãng lai. Khách vãng lai có quyền thực thi 5 ca sử dụng công khai gồm: UC-01 Cấu hình PC Builder (có quan hệ `<<include>>` với kiểm tra tương thích socket), UC-02 Đặt hàng thanh toán, UC-03 Tra cứu đơn vãng lai bằng OTP, UC-05 Gửi khiếu nại và Đánh giá sản phẩm mở tự do. Khách hàng thành viên kế thừa toàn bộ các ca sử dụng trên, đồng thời có thêm ca sử dụng UC-04 Quản lý hồ sơ và lịch sử đơn hàng cá nhân.

### 4.3.2. Sơ đồ Use Case phân hệ Quản trị viên

![Hình 4.3.2. Use Case quản trị viên](drawio/hinh-4-3-2-use-case-quan-tri.png)  
*Hình 4.3.2. Use Case quản trị viên*  
*Tệp nguồn sơ đồ:* [hinh-4-3-2-use-case-quan-tri.drawio](drawio/hinh-4-3-2-use-case-quan-tri.drawio)

Sơ đồ trên mô tả các ca sử dụng dành riêng cho Quản trị viên cửa hàng trên phân hệ quản trị, bao gồm: UC-06 Quản trị Catalog và định mức linh kiện ảo (Virtual BOM), UC-07 Tiếp nhận PO và nhập kho (có quan hệ `<<include>>` với hạch toán giá vốn giá vốn bình quân gia quyền (WAC)), UC-08 Điều phối đơn hàng qua 9 trạng thái, Cấu hình khuyến mãi/coupon và Tiếp nhận hòm thư khiếu nại.

---

### 4.3.3. Đặc tả 8 Use Case tiêu biểu (Chuẩn 13 trường)

Dưới đây là đặc tả chi tiết 8 ca sử dụng tiêu biểu của hệ thống áp dụng đúng 13 trường tiêu chuẩn kỹ thuật phần mềm:

#### Đặc tả UC-01: Cấu hình dàn máy tính (PC Builder)
1. **Use Case ID:** UC-01
2. **Use Case Name:** Cấu hình dàn máy tính cá nhân qua PC Builder
3. **Description:** Cho phép người dùng tự do lựa chọn 8 linh kiện phần cứng tiêu chuẩn, tự động lọc tương thích theo chuẩn chân cắm bo mạch chủ, kiểm tra công suất bộ nguồn khuyến nghị và thêm toàn bộ cấu hình vào giỏ hàng dưới dạng một bộ bộ máy dựng sẵn (PC Bundle).
4. **Actor(s):** Khách vãng lai, Khách thành viên
5. **Priority:** Cao (Cốt lõi)
6. **Trigger:** Người dùng truy cập trang `/pc-builder` từ thanh điều hướng chính
7. **Pre-Condition(s):** Cơ sở dữ liệu có các SKU linh kiện phần cứng đang ở trạng thái `ACTIVE` và có tồn kho khả dụng `available > 0`
8. **Post-Condition(s):** Cấu hình dàn máy được lưu tạm trong state Signals và LocalStorage; khi bấm lưu, toàn bộ cây linh kiện được đóng gói vào giỏ hàng
9. **Basic Flow:**
   - Người dùng lần lượt nhấn chọn linh kiện cho 8 ô tiêu chuẩn (CPU, Mainboard, RAM, VGA, SSD, PSU, Case, Tản nhiệt).
   - Với mỗi ô, modal hiển thị danh sách SKU tương thích với các linh kiện đã chọn trước đó (ví dụ: đã chọn CPU Intel LGA1700 thì danh sách Mainboard chỉ hiển thị bo mạch chủ có socket LGA1700).
   - Người dùng chọn một sản phẩm, hệ thống cập nhật vào ô linh kiện tương ứng.
   - Hệ thống tự động tính toán lại tổng tiền tạm tính và cập nhật thanh công suất bộ nguồn khuyến nghị dựa trên tổng TDP của CPU và VGA.
   - Người dùng nhấn nút "Thêm vào giỏ hàng", hệ thống chuyển hướng sang màn hình giỏ hàng với gói bộ máy dựng sẵn (PC Bundle) hoàn chỉnh.
10. **Alternative Flow:** Người dùng bấm nút "Làm mới cấu hình" để xóa toàn bộ các linh kiện đã chọn và bắt đầu lại từ đầu; hoặc bấm nút "Chia sẻ cấu hình" để sao chép đường link chứa mã cấu hình đã chọn.
11. **Exception Flow:** Một linh kiện vừa chọn bị người khác mua hết tồn kho trong lúc đang chọn cấu hình; hệ thống hiển thị thông báo lỗi và yêu cầu người dùng chọn linh kiện khác thay thế.
12. **Business Rules:** BR-01.1 (Chỉ chọn linh kiện PC, không có laptop/mobile), BR-01.2 (SKU phải ACTIVE và available > 0).
13. **Non-Functional Requirement:** NFR-06 (Thời gian cập nhật tổng tiền và tương thích dưới 50ms qua Angular Signals).

*Phân tích điểm kiểm soát:* Điểm mấu chốt của UC-01 là cơ chế phản ứng tức thời thông qua hàm `computed()` của Angular Signals, giúp kiểm tra tương thích chân cắm CPU-Mainboard ngay tại máy khách trước khi gửi yêu cầu thẩm định cuối cùng về máy chủ.

---

#### Đặc tả UC-02: Đặt hàng và thanh toán (Checkout)
1. **Use Case ID:** UC-02
2. **Use Case Name:** Đặt hàng và thanh toán trực tuyến
3. **Description:** Khách hàng tiến hành thanh toán giỏ hàng, nhập thông tin giao nhận, áp dụng mã giảm giá và lựa chọn thanh toán 100% qua chuyển khoản QR hoặc tiền mặt COD mà không cần đặt cọc.
4. **Actor(s):** Khách vãng lai, Khách thành viên
5. **Priority:** Cao (Cốt lõi)
6. **Trigger:** Khách hàng bấm nút "Tiến hành đặt hàng" từ trang Giỏ hàng `/cart`
7. **Pre-Condition(s):** Giỏ hàng có ít nhất một sản phẩm hợp lệ; số lượng đặt mua không vượt quá tồn kho khả dụng
8. **Post-Condition(s):** Đơn hàng được khởi tạo ở trạng thái `PENDING`, hàng tồn kho chuyển sang trạng thái `reserved`, mã đơn UUID v4 được cấp phát
9. **Basic Flow:**
   - Khách hàng điền thông tin họ tên, số điện thoại, địa chỉ nhận hàng và ghi chú đơn hàng.
   - Khách hàng nhập mã giảm giá Coupon (nếu có), hệ thống kiểm tra và trừ tiền.
   - Khách hàng chọn phương thức nhận hàng (Nhận tại quầy hoặc Giao tận nơi) và phương thức thanh toán (`QR_BANK` hoặc `COD`).
   - Khách hàng bấm nút "Xác nhận đặt hàng".
   - Backend mở ACID Transaction: thẩm định lại giá, khóa và tăng `reserved` trong `StockQuant`, tạo bản ghi `Order`, `OrderLine` và `Payment`.
   - Hệ thống hiển thị trang xác nhận đặt hàng thành công kèm thông tin thanh toán (mã VietQR nếu chọn chuyển khoản).
10. **Alternative Flow:** Nếu khách hàng chọn chuyển khoản QR, khách mở ứng dụng ngân hàng quét mã VietQR có sẵn số tiền và nội dung chuyển khoản để thanh toán 100%.
11. **Exception Flow:** Mã coupon không đủ điều kiện đơn hàng tối thiểu; hệ thống báo lỗi cụ thể và giữ nguyên tổng tiền trước giảm giá. Tồn kho linh kiện bị thiếu; giao dịch Rollback hoàn toàn và thông báo cho khách.
12. **Business Rules:** BR-01.3 (Giá do backend quyết định), BR-03.1 và BR-03.2 (Thanh toán toàn phần, tuyệt đối không đặt cọc).
13. **Non-Functional Requirement:** NFR-09 (Bảo đảm an toàn giao dịch qua `prisma.$transaction`), NFR-10 (Sử dụng kiểu Decimal).

*Phân tích điểm kiểm soát:* Điểm kiểm soát quan trọng nhất của UC-02 là việc loại bỏ hoàn toàn luồng đặt cọc một phần, giúp toàn bộ chu trình thanh toán diễn ra dứt khoát và giảm thiểu tối đa rủi ro tranh chấp công nợ.

---

#### Đặc tả UC-03: Tra cứu đơn hàng vãng lai
1. **Use Case ID:** UC-03
2. **Use Case Name:** Tra cứu tiến độ đơn hàng vãng lai
3. **Description:** Cho phép khách hàng không có tài khoản tra cứu thông tin chi tiết và tiến độ xử lý đơn hàng của mình thông qua mã đơn hoặc số điện thoại/email kèm xác thực OTP.
4. **Actor(s):** Khách vãng lai
5. **Priority:** Trung bình
6. **Trigger:** Khách hàng truy cập trang `/order-lookup`
7. **Pre-Condition(s):** Khách hàng có mã đơn hàng hợp lệ hoặc số điện thoại/email đã sử dụng khi đặt hàng
8. **Post-Condition(s):** Giao diện hiển thị chi tiết đơn hàng, linh kiện và tiến độ di chuyển qua 9 trạng thái chuẩn
9. **Basic Flow:**
   - Khách hàng chọn hình thức tra cứu: "Theo mã đơn hàng" hoặc "Theo số điện thoại/email".
   - Trường hợp chọn số điện thoại/email: khách nhập thông tin và bấm "Gửi mã OTP".
   - Backend sinh mã OTP 6 số ngẫu nhiên, lưu mã băm vào DB với hạn dùng 5 phút và gửi qua SMS/Email.
   - Khách hàng nhập mã OTP và bấm "Xác nhận".
   - Backend xác thực mã OTP, truy vấn danh sách các đơn hàng vãng lai (`userId IS NULL`) gắn với số điện thoại/email đó và hiển thị lên màn hình.
10. **Alternative Flow:** Trường hợp chọn tra cứu theo mã đơn hàng: khách nhập trực tiếp chuỗi UUID v4, backend kiểm tra nếu đúng đơn vãng lai thì hiển thị ngay lập tức mà không cần OTP.
11. **Exception Flow:** Nhập sai mã OTP quá 5 lần; hệ thống tạm khóa chức năng tra cứu của số điện thoại đó trong 15 phút để chống tấn công dò mã (brute-force).
12. **Business Rules:** BR-02.1 (Phân lập đơn vãng lai và đơn thành viên), BR-02.2 (Bắt buộc OTP khi tra cứu bằng thông tin liên hệ).
13. **Non-Functional Requirement:** NFR-01 (Bảo mật OTP, không trả về trong API response), NFR-02 (Rate-limit 5 lần / 15 phút).

*Phân tích điểm kiểm soát:* Ca sử dụng này thiết lập hàng rào bảo mật nghiêm ngặt để giải quyết bài toán quyền riêng tư cho khách vãng lai, ngăn chặn việc người lạ dò tìm thông tin số điện thoại để xem trộm lịch sử mua sắm.

---

#### Đặc tả UC-04: Quản lý lịch sử đơn hàng thành viên
1. **Use Case ID:** UC-04
2. **Use Case Name:** Xem lịch sử đơn hàng của tài khoản thành viên
3. **Description:** Khách hàng đã đăng nhập tài khoản có thể theo dõi danh sách toàn bộ các đơn hàng do mình sở hữu, xem trạng thái chi tiết và tải hóa đơn.
4. **Actor(s):** Khách hàng thành viên
5. **Priority:** Trung bình
6. **Trigger:** Khách hàng bấm vào mục "Lịch sử đơn hàng" trong trang quản lý tài khoản cá nhân
7. **Pre-Condition(s):** Khách hàng đã đăng nhập tài khoản thành công với JWT token hợp lệ
8. **Post-Condition(s):** Danh sách các đơn hàng của thành viên được hiển thị phân trang đầy đủ
9. **Basic Flow:**
   - Hệ thống gửi yêu cầu `GET /api/orders/my-orders` kèm Bearer Token xác thực.
   - Backend trích xuất `userId` từ token phiên đăng nhập, truy vấn bảng `Order` với điều kiện `userId = currentUser.id`.
   - Giao diện hiển thị danh sách đơn hàng được sắp xếp theo thời gian mới nhất, kèm trạng thái hiện tại (trong 9 trạng thái) và tổng tiền.
   - Khách hàng bấm chọn một đơn hàng cụ thể để xem chi tiết danh sách linh kiện và hành trình giao nhận.
10. **Alternative Flow:** Khách hàng bấm nút "Mua lại" trên một đơn hàng cũ để tự động nạp lại các linh kiện đó vào giỏ hàng hiện tại.
11. **Exception Flow:** Phiên đăng nhập hết hạn (Token expired); hệ thống tự động làm mới token qua Refresh Token hoặc điều hướng về trang đăng nhập nếu làm mới thất bại.
12. **Business Rules:** BR-02.4 (Tách biệt hoàn toàn đơn hàng thành viên, không cho phép xem chéo giữa các tài khoản).
13. **Non-Functional Requirement:** NFR-03 (Bảo vệ phiên làm việc bằng xác thực token an toàn).

*Phân tích điểm kiểm soát:* Điểm kiểm soát cốt lõi là việc lọc dữ liệu tuyệt đối theo định danh `userId` của token máy chủ giải mã, loại bỏ hoàn toàn khả năng người dùng sửa đổi tham số trên URL để xem đơn hàng của người khác (lỗi IDOR).

---

#### Đặc tả UC-05: Gửi yêu cầu khiếu nại
1. **Use Case ID:** UC-05
2. **Use Case Name:** Tiếp nhận yêu cầu khiếu nại của khách hàng
3. **Description:** Khách hàng gửi thông tin phản ánh chất lượng, lỗi sản phẩm hoặc sự cố giao hàng với nội dung tự do để cửa hàng tiếp nhận và xử lý ngoài màn hình.
4. **Actor(s):** Khách vãng lai, Khách thành viên
5. **Priority:** Trung bình
6. **Trigger:** Khách hàng truy cập trang Khiếu nại `/complaints`
7. **Pre-Condition(s):** Không yêu cầu đăng nhập; biểu mẫu mở công khai
8. **Post-Condition(s):** Bản ghi khiếu nại được tạo mới trong bảng `Complaint`, mã số tiếp nhận được trả về cho khách
9. **Basic Flow:**
   - Khách hàng điền họ tên, số điện thoại, email liên hệ, mã đơn hàng liên quan (tùy chọn) và nhập nội dung mô tả chi tiết sự cố.
   - Khách hàng bấm nút "Gửi khiếu nại".
   - Backend kiểm tra độ dài nội dung (10 đến 2000 ký tự) và lưu vào cơ sở dữ liệu.
   - Hệ thống hiển thị thông báo cảm ơn và cam kết thời gian phản hồi qua điện thoại trong vòng 24 giờ làm việc.
10. **Alternative Flow:** Không có luồng thay thế.
11. **Exception Flow:** Khách hàng nhập nội dung quá ngắn (dưới 10 ký tự) hoặc bỏ trống thông tin liên hệ; hệ thống báo lỗi đỏ dưới các trường tương ứng và chặn gửi.
12. **Business Rules:** BR-05.1 (Tiếp nhận nội dung tự do), BR-05.2 (Toàn bộ việc bồi hoàn, đổi trả sau tiếp nhận diễn ra ngoài màn hình).
13. **Non-Functional Requirement:** NFR-11 (Ghi nhận thời điểm tiếp nhận `submittedAt` chính xác phục vụ SLA chăm sóc khách hàng).

*Phân tích điểm kiểm soát:* Điểm kiểm soát là xác định ranh giới dứt khoát: hệ thống phần mềm chỉ chịu trách nhiệm thu thập và lưu giữ bằng chứng phản ánh, không xây dựng quy trình RMA hoàn tiền phức tạp trực tuyến.

---

#### Đặc tả UC-06: Quản trị danh mục và cấu hình định mức linh kiện ảo (Virtual BOM)
1. **Use Case ID:** UC-06
2. **Use Case Name:** Quản trị danh mục sản phẩm, biến thể SKU và định mức linh kiện ảo (Virtual BOM)
3. **Description:** Quản trị viên thực hiện tạo mới, cập nhật thông số kỹ thuật, giá niêm yết của linh kiện rời và đóng gói các dàn máy bộ máy dựng sẵn (PC Bundle) qua định mức linh kiện ảo (Virtual BOM).
4. **Actor(s):** Quản trị viên (Store Admin)
5. **Priority:** Cao
6. **Trigger:** Quản trị viên truy cập mục "Quản lý sản phẩm" trong cổng quản trị
7. **Pre-Condition(s):** Đã đăng nhập tài khoản có quyền `ADMIN`
8. **Post-Condition(s):** Thông tin sản phẩm, biến thể SKU và định mức linh kiện ảo (Virtual BOM) được cập nhật vào cơ sở dữ liệu và hiển thị ngay trên giao diện khách hàng
9. **Basic Flow:**
   - Quản trị viên tạo mẫu sản phẩm `ProductTemplate` (nhập tên, thương hiệu, danh mục, thông số socket/TDP).
   - Quản trị viên tạo các biến thể `ProductVariant` (SKU Code, giá niêm yết Decimal, hình ảnh).
   - Đối với dàn máy PC dựng sẵn: Quản trị viên tạo `PcBundle`, mở giao diện định mức linh kiện ảo (Virtual BOM) và thêm các dòng linh kiện con `PcBundleItem` tham chiếu đến các SKU đã có.
   - Quản trị viên thiết lập giá bán trọn bộ cho dàn máy và nhấn "Lưu thay đổi".
   - Hệ thống thẩm định và cập nhật vào PostgreSQL.
10. **Alternative Flow:** Quản trị viên chuyển trạng thái SKU sang `INACTIVE` để tạm ngừng kinh doanh linh kiện đó mà không cần xóa bản ghi trong DB.
11. **Exception Flow:** Xóa một SKU đang có trong đơn hàng cũ; hệ thống chặn thao tác xóa vật lý (Foreign Key Constraint) và tự động chuyển sang cơ chế xóa mềm (Soft Delete bằng cờ `isActive = false`).
12. **Business Rules:** BR-01.1 (Tuyệt đối không tạo danh mục Laptop/Mobile), BR-01.2 (Giá phải dùng kiểu Decimal).
13. **Non-Functional Requirement:** NFR-03 (Kiểm tra quyền Admin nghiêm ngặt), NFR-10 (Đảm bảo tính bất biến của tiền tệ).

*Phân tích điểm kiểm soát:* Điểm mấu chốt là bảo đảm mối quan hệ toàn vẹn giữa `PcBundleItem` và `ProductVariant`: dàn máy PC chỉ là một cấu trúc ảo tập hợp từ các SKU linh kiện có thật trong kho.

---

#### Đặc tả UC-07: Tiếp nhận đơn PO và nhập kho
1. **Use Case ID:** UC-07
2. **Use Case Name:** Tiếp nhận đơn mua hàng PO, quét serial và nhập kho
3. **Description:** Quản trị viên tạo đơn mua hàng từ nhà cung cấp, tiếp nhận linh kiện thực tế tại kho, quét số serial định danh và tự động tính toán lại giá vốn bình quân giá vốn bình quân gia quyền (WAC).
4. **Actor(s):** Quản trị viên (Thủ kho)
5. **Priority:** Cao
6. **Trigger:** Hàng hóa từ nhà cung cấp vận chuyển tới cửa hàng
7. **Pre-Condition(s):** Đơn mua hàng PO đã được tạo ở trạng thái `CONFIRMED`
8. **Post-Condition(s):** Số lượng `onHand` tăng lên, các đơn vị `SerialUnit` được tạo mới, giá vốn giá vốn bình quân gia quyền (WAC) được cập nhật vào sổ cái kho
9. **Basic Flow:**
   - Quản trị viên mở đơn PO tương ứng trên giao diện Admin.
   - Nhập danh sách mã Serial Number của từng linh kiện thực nhận (bằng đầu đọc mã vạch hoặc nhập tay).
   - Nếu giao đủ 100%: quản trị viên bấm "Hoàn tất nhập kho".
   - Hệ thống thực hiện: tăng `onHand` trong `StockQuant`, chuyển các `SerialUnit` sang trạng thái `IN_STOCK`, ghi nhận bút toán vào `StockLedgerEntry` và tính toán lại `wacUnitCost`.
   - Đơn PO chuyển trạng thái sang `COMPLETED`.
10. **Alternative Flow:** Trường hợp nhà cung cấp giao thiếu hàng: quản trị viên nhập số lượng thực nhận, hệ thống tự động điều chỉnh số lượng dòng PO tương ứng với thực tế và tính giá vốn bình quân gia quyền (WAC) theo số thực nhận.
11. **Exception Flow:** Quét trùng một số Serial Number đã tồn tại trong hệ thống; hệ thống cảnh báo đỏ và yêu cầu kiểm tra lại nhãn linh kiện.
12. **Business Rules:** BR-04.1 (Bảo toàn số dư tồn kho), BR-04.2 (Một kho duy nhất), BR-04.3 (Hạch toán giá vốn bình quân gia quyền (WAC) tự động).
13. **Non-Functional Requirement:** NFR-12 (Sổ cái kho bất biến, chỉ cho phép INSERT).

*Phân tích điểm kiểm soát:* Điểm kiểm soát là công thức giá vốn bình quân gia quyền (WAC) tự động cập nhật ngay thời điểm nhập kho, bảo đảm số liệu giá vốn phản ánh trung thực biến động thị trường phần cứng.

---

#### Đặc tả UC-08: Xử lý và lắp ráp đơn hàng
1. **Use Case ID:** UC-08
2. **Use Case Name:** Điều phối vòng đời 9 trạng thái đơn hàng và lắp ráp PC
3. **Description:** Quản trị viên theo dõi đơn hàng trên bảng Kanban, chuyển đổi trạng thái qua 9 bước chuẩn, điều phối kỹ thuật viên lắp ráp dàn máy và bàn giao giao nhận.
4. **Actor(s):** Quản trị viên (Kỹ thuật viên)
5. **Priority:** Cao
6. **Trigger:** Đơn hàng mới phát sinh từ khách hàng (`PENDING`)
7. **Pre-Condition(s):** Đơn hàng đã được lưu trữ trong cơ sở dữ liệu
8. **Post-Condition(s):** Đơn hàng luân chuyển qua các trạng thái tương ứng cho đến khi `COMPLETED` hoặc `CANCELLED`
9. **Basic Flow:**
   - Quản trị viên xác nhận thông tin thanh toán, chuyển đơn sang `CONFIRMED`.
   - Nếu đơn là linh kiện rời: chuyển sang `PREPARING` để nhặt hàng; nếu là bộ máy dựng sẵn (PC Bundle): chuyển sang `ASSEMBLING` để kỹ thuật viên lắp ráp theo định mức linh kiện ảo (Virtual BOM).
   - Sau khi hoàn thành: nếu nhận tại quầy chuyển sang `READY_FOR_PICKUP`; nếu giao tận nhà chuyển sang `SHIPPING` (hệ thống trừ đồng thời `onHand` và `reserved` trong `StockQuant`).
   - Khi giao thành công: chuyển sang `COMPLETED`, ghi nhận doanh thu.
10. **Alternative Flow:** Nếu giao hàng thất bại, quản trị viên chuyển sang `DELIVERY_FAILED`, sau đó liên hệ lại khách và bấm "Giao lại" để quay về `SHIPPING`.
11. **Exception Flow:** Khách hàng yêu cầu hủy đơn khi hàng chưa xuất kho; quản trị viên chuyển sang `CANCELLED`, hệ thống tự động hoàn lại số lượng `reserved` về tồn kho khả dụng `available`.
12. **Business Rules:** BR-03.3 (Đúng 9 trạng thái chuẩn), BR-04.4 (Cho phép lặp lại giao hàng không giới hạn lượt).
13. **Non-Functional Requirement:** NFR-11 (Lưu lịch sử mọi bước chuyển trạng thái vào `OrderStatusHistory`).

*Phân tích điểm kiểm soát:* Điểm kiểm soát quan trọng nhất là tính nghiêm ngặt của máy trạng thái (máy trạng thái hữu hạn): trạng thái chỉ được phép chuyển dịch theo đúng đồ thị có hướng, không cho phép nhảy cóc trạng thái (như từ `PENDING` nhảy thẳng lên `COMPLETED`).

---

## 4.4. Thiết kế kiến trúc hệ thống

Mục tiêu của tiểu mục này là phân tích kiến trúc tổng thể của hệ thống EL-TECH theo mô hình đa tầng độc lập, làm rõ vai trò và trách nhiệm kỹ thuật của từng tầng.

![Hình 4.4. Sơ đồ kiến trúc tổng thể Angular Express Prisma PostgreSQL](drawio/hinh-4-4-kien-truc-tong-the.png)  
*Hình 4.4. Sơ đồ kiến trúc tổng thể Angular -> Express -> Prisma -> PostgreSQL*  
*Tệp nguồn sơ đồ:* [hinh-4-4-kien-truc-tong-the.drawio](drawio/hinh-4-4-kien-truc-tong-the.drawio)

Sơ đồ trên mô tả chi tiết 5 phân tầng kỹ thuật của hệ thống EL-TECH:
- Tầng Trình diễn (Client Presentation Tier): Ứng dụng Single Page Application (SPA) phát triển trên nền tảng Angular 22 với kiến trúc Standalone Components, kết hợp Tailwind CSS và bộ giao diện Spartan UI theo phong cách NVIDIA High Contrast. Tầng này chịu trách nhiệm hiển thị giao diện khách hàng, giao diện Admin và quản lý trạng thái phản ứng cục bộ qua Angular Native Signals.
- Tầng Định tuyến và Bảo vệ (Routing & Middleware Tier): Xây dựng trên nền tảng Node.js với framework Express 4.x. Tầng này đảm nhận chức năng phân phối luồng yêu cầu, thiết lập chính sách CORS, giới hạn tần suất yêu cầu (Rate-limiting) để chống brute-force mã OTP, xác thực phân quyền qua JWT Bearer Token và thẩm định cấu trúc dữ liệu đầu vào qua các schema Zod nghiêm ngặt.
- Tầng Xử lý Nghiệp vụ (Business Domain Services Tier): Bao gồm các dịch vụ độc lập như `CatalogService`, `PcBuildService`, `PricingEngine`, `OrderService` và `InventoryService`. Đây là nơi thực thi toàn bộ 5 nhóm quy tắc nghiệp vụ (BR), tính toán giá trị đơn hàng, kiểm tra tính tương thích socket và điều phối trạng thái vòng đời đơn hàng.
- Tầng Ánh xạ Dữ liệu (Persistence Tier - Prisma ORM): Đóng vai trò là cầu nối truy cập dữ liệu an toàn kiểu (Type-safe). Tầng này quản lý các phiên giao dịch tương tác cô lập (`prisma.$transaction`) nhằm bảo đảm tính nguyên tử cho các nghiệp vụ nhạy cảm như tạo đơn giữ tồn kho hay nhập kho tính giá vốn bình quân gia quyền (WAC).
- Tầng Cơ sở Dữ liệu (Database Tier - PostgreSQL): Lưu trữ bền vững toàn bộ dữ liệu nghiệp vụ trên hệ quản trị cơ sở dữ liệu quan hệ PostgreSQL 15 (Supabase), với hệ thống khóa chính, khóa ngoại, chỉ mục hiệu năng và các ràng buộc dữ liệu toàn vẹn.

---

## 4.5. Thiết kế luồng dữ liệu

Phần này phân tích sự vận động của các dòng thông tin trong hệ thống thông qua Sơ đồ luồng dữ liệu (DFD) từ cấp ngữ cảnh đến cấp chi tiết.

### 4.5.1. DFD ngữ cảnh và cấp 0

Sơ đồ luồng dữ liệu cấp ngữ cảnh (Level 0 Context Diagram) xác định đường biên giao tiếp giữa hệ thống EL-TECH với 4 thực thể bên ngoài:

![Hình 4.5.1.1. DFD ngữ cảnh EL-TECH](drawio/hinh-4-5-1-1-dfd-ngu-canh.png)  
*Hình 4.5.1.1. DFD ngữ cảnh EL-TECH*  
*Tệp nguồn sơ đồ:* [hinh-4-5-1-1-dfd-ngu-canh.drawio](drawio/hinh-4-5-1-1-dfd-ngu-canh.drawio)

Khách hàng gửi yêu cầu tìm kiếm, cấu hình máy tính, đặt hàng và khiếu nại vào hệ thống; nhận lại kết quả báo giá, mã đơn và tiến độ giao hàng. Quản trị viên cập nhật thông tin sản phẩm, đơn mua PO và trạng thái đơn hàng; nhận lại báo cáo tồn kho và doanh thu. Nhà cung cấp nhận đơn đặt hàng PO và phản hồi biên bản giao hàng kèm mã serial. Dịch vụ OTP bên ngoài tiếp nhận yêu cầu gửi mã xác thực khi khách hàng thực hiện tra cứu bằng số điện thoại hoặc email. Hệ thống tuyệt đối không có dòng dữ liệu hoàn tiền trực tuyến trên sơ đồ ngữ cảnh.

Tiếp theo, sơ đồ luồng dữ liệu cấp 0 (Level 0 DFD) phân rã hệ thống thành 7 quá trình chính và 4 kho dữ liệu cốt lõi:

![Hình 4.5.1.2. DFD cấp 0 các quá trình chính](drawio/hinh-4-5-1-2-dfd-cap-0.png)  
*Hình 4.5.1.2. DFD cấp 0 các quá trình chính*  
*Tệp nguồn sơ đồ:* [hinh-4-5-1-2-dfd-cap-0.drawio](drawio/hinh-4-5-1-2-dfd-cap-0.drawio)

Bảy quá trình chính bao gồm: 1.0 Khám phá Catalog & Cấu hình PC Builder; 2.0 Xử lý Giỏ hàng & Đặt hàng Checkout; 3.0 Tra cứu Đơn vãng lai & Xác thực OTP; 4.0 Tiếp nhận Khiếu nại & Đánh giá SP; 5.0 Quản trị Catalog & định mức linh kiện ảo (Virtual BOM); 6.0 Quản trị Mua hàng PO & Tồn kho giá vốn bình quân gia quyền (WAC); 7.0 Điều phối Đơn hàng & Lắp ráp giao nhận. 

Bốn kho dữ liệu trung tâm gồm: D1 (Kho Catalog & BOM), D2 (Kho Đơn hàng & Thanh toán), D3 (Kho Tồn kho & Serial), D4 (Kho Khiếu nại & Đánh giá). Các kho dữ liệu này phản ánh mô hình lưu trữ tập trung tại một cửa hàng, không phân tán dữ liệu theo chi nhánh.

### 4.5.2. DFD chi tiết mua hàng và sau mua

Sơ đồ luồng dữ liệu DFD cấp 1 phân rã sâu quá trình 2.0 (Xử lý Đơn hàng và Thanh toán):

![Hình 4.5.2.1. DFD cấp 1 xử lý đơn và thanh toán](drawio/hinh-4-5-2-1-dfd-cap-1-don-hang.png)  
*Hình 4.5.2.1. DFD cấp 1 xử lý đơn và thanh toán*  
*Tệp nguồn sơ đồ:* [hinh-4-5-2-1-dfd-cap-1-don-hang.drawio](drawio/hinh-4-5-2-1-dfd-cap-1-don-hang.drawio)

Quá trình 2.0 được chia nhỏ thành 4 tiến trình con: 2.1 Kiểm tra giá niêm yết và tính toán coupon; 2.2 Khóa tồn kho khả dụng và tăng `reserved` trong kho D3; 2.3 Khởi tạo bản ghi Order, OrderLine và Payment trong kho D2; 2.4 Tạo dữ liệu mã VietQR chuyển khoản hoặc xác nhận phiếu giao hàng COD. Dữ liệu luân chuyển bảo đảm tính nhất quán cao, không phát sinh luồng hoàn cọc.

Sơ đồ luồng dữ liệu DFD cấp 1 tiếp theo phân rã chi tiết quá trình 3.0 (Tra cứu OTP) và 4.0 (Đánh giá & Khiếu nại):

![Hình 4.5.2.2. DFD cấp 1 tra cứu và khiếu nại](drawio/hinh-4-5-2-2-dfd-cap-1-tra-cuu-khieu-nai.png)  
*Hình 4.5.2.2. DFD cấp 1 tra cứu và khiếu nại*  
*Tệp nguồn sơ đồ:* [hinh-4-5-2-2-dfd-cap-1-tra-cuu-khieu-nai.drawio](drawio/hinh-4-5-2-2-dfd-cap-1-tra-cuu-khieu-nai.drawio)

Tiến trình 3.1 xác thực mã đơn UUID (chỉ lọc đơn vãng lai không có `userId`). Tiến trình 3.2 tiếp nhận mã OTP và đối chiếu trước khi trả về danh sách đơn từ kho D2. Tiến trình 4.1 ghi nhận đánh giá mở trực tiếp vào kho D4.1. Tiến trình 4.2 tiếp nhận nội dung khiếu nại tự do vào kho D4.2 mà không phát sinh tiến độ giải quyết tranh chấp trên hệ thống phần mềm.

---

## 4.6. Thiết kế cơ sở dữ liệu mục tiêu

Phần này trình bày chi tiết lược đồ quan hệ thực thể (ERD) mục tiêu của EL-TECH, phân rã thành 6 phân cụm dữ liệu bảo đảm chuẩn hóa và tối ưu hóa truy vấn.

### 4.6.1. ERD tổng thể hệ thống

![Hình 4.6.1. ERD tổng thể EL-TECH mục tiêu](drawio/hinh-4-6-1-erd-tong-the.png)  
*Hình 4.6.1. ERD tổng thể EL-TECH mục tiêu*  
*Tệp nguồn sơ đồ:* [hinh-4-6-1-erd-tong-the.drawio](drawio/hinh-4-6-1-erd-tong-the.drawio)

Sơ đồ trên cung cấp cái nhìn toàn cảnh về 6 phân cụm thực thể: (1) Cụm Catalog & định mức linh kiện ảo (Virtual BOM); (2) Cụm Khách hàng & Auth; (3) Cụm Giỏ hàng & Đơn hàng; (4) Cụm Thanh toán QR/COD; (5) Cụm Kho & Đơn mua PO; (6) Cụm Đánh giá & Khiếu nại. Mối liên kết khóa ngoại giữa các cụm được thiết kế chặt chẽ, bảo đảm tính toàn vẹn dữ liệu tham chiếu (Referential Integrity).

### 4.6.2. ERD catalog, SKU và bộ máy dựng sẵn (PC Bundle)

![Hình 4.6.2. ERD danh mục, SKU, bộ máy dựng sẵn (PC Bundle) và định giá](drawio/hinh-4-6-2-erd-catalog-bundle.png)  
*Hình 4.6.2. ERD danh mục, SKU, bộ máy dựng sẵn (PC Bundle) và định giá*  
*Tệp nguồn sơ đồ:* [hinh-4-6-2-erd-catalog-bundle.drawio](drawio/hinh-4-6-2-erd-catalog-bundle.drawio)

Phân cụm này thể hiện kiến trúc định mức linh kiện ảo (Virtual BOM) cốt lõi:
- Bảng `Category` chứa danh mục linh kiện (CPU, RAM, VGA...).
- Bảng `ProductTemplate` lưu trữ thông tin sản phẩm chung và trường JSON `specs` lưu các thông số kỹ thuật động (socket, TDP, kích thước).
- Bảng `ProductVariant` (SKU) quản lý giá niêm yết `price` kiểu `Decimal(12,2)`, mã vạch và trạng thái `ACTIVE`.
- Bảng `PcBundle` đại diện cho dàn máy PC hoàn chỉnh, liên kết với các SKU linh kiện con thông qua bảng trung gian `PcBundleItem` có lưu số lượng `quantity` và cờ bắt buộc `isMandatory`.

### 4.6.3. ERD giỏ hàng, khách và đơn hàng

![Hình 4.6.3. ERD giỏ hàng, tài khoản, tra cứu và đơn hàng](drawio/hinh-4-6-3-erd-cart-order.png)  
*Hình 4.6.3. ERD giỏ hàng, tài khoản, tra cứu và đơn hàng*  
*Tệp nguồn sơ đồ:* [hinh-4-6-3-erd-cart-order.drawio](drawio/hinh-4-6-3-erd-cart-order.drawio)

Phân cụm này làm rõ sự phân tách quyền sở hữu đơn hàng:
- Khách thành viên có bản ghi trong bảng `User` liên kết với `Order` qua khóa ngoại `userId`.
- Khách vãng lai đặt đơn sẽ có trường `userId` mang giá trị `NULL`, và thông tin liên hệ được lưu trong trường JSON `guestContact`.
- Bảng `OrderLookupOtp` lưu trữ mã băm OTP phục vụ xác thực tra cứu đơn vãng lai.
- Bảng `OrderStatusHistory` tự động ghi vết mọi lần chuyển đổi trạng thái của đơn hàng (`fromStatus`, `toStatus`, `createdAt`).

### 4.6.4. ERD thanh toán giản lược

![Hình 4.6.4. ERD thanh toán QR và COD không cọc](drawio/hinh-4-6-4-erd-payment.png)  
*Hình 4.6.4. ERD thanh toán QR và COD không cọc*  
*Tệp nguồn sơ đồ:* [hinh-4-6-4-erd-payment.drawio](drawio/hinh-4-6-4-erd-payment.drawio)

Lược đồ thanh toán được tinh giản tối đa:
- Mỗi đơn hàng `Order` có quan hệ 1-1 với một bản ghi `Payment`.
- Trường `method` chỉ chấp nhận hai giá trị `QR_BANK` hoặc `COD`.
- Trường `amount` luôn phản ánh 100% giá trị của `Order.totalAmount`.
- Loại bỏ hoàn toàn các thực thể phức tạp như tiền cọc (`DepositDisposition`) hay yêu cầu hoàn tiền (`RefundRequest`).

### 4.6.5. ERD mua hàng, tồn kho và serial một cửa hàng

![Hình 4.6.5. ERD nhà cung cấp, PO, tồn kho và serial](drawio/hinh-4-6-5-erd-stock-po.png)  
*Hình 4.6.5. ERD nhà cung cấp, PO, tồn kho và serial*  
*Tệp nguồn sơ đồ:* [hinh-4-6-5-erd-stock-po.drawio](drawio/hinh-4-6-5-erd-stock-po.drawio)

Phân cụm kho thể hiện mô hình hạch toán tập trung:
- Bảng `Supplier` liên kết 1-nhiều với đơn mua hàng `PurchaseOrder` và các dòng chi tiết `PurchaseOrderLine`.
- Bảng `StockQuant` lưu số dư tồn kho duy nhất cho mỗi SKU (`onHand`, `reserved`, `quarantine`, `wacUnitCost`).
- Bảng `SerialUnit` lưu mã serial duy nhất của từng linh kiện vật lý.
- Bảng `StockLedgerEntry` đóng vai trò sổ cái kế toán kho bất biến, ghi nhận chi tiết biến động số lượng và giá vốn bình quân giá vốn bình quân gia quyền (WAC) sau mỗi giao dịch xuất nhập.

### 4.6.6. ERD đánh giá và yêu cầu khiếu nại

![Hình 4.6.6. ERD Review tự do và Complaint intake](drawio/hinh-4-6-6-erd-review-complaint.png)  
*Hình 4.6.6. ERD Review tự do và Complaint intake*  
*Tệp nguồn sơ đồ:* [hinh-4-6-6-erd-review-complaint.drawio](drawio/hinh-4-6-6-erd-review-complaint.drawio)

Phân cụm này thể hiện cơ chế tiếp nhận cởi mở:
- Bảng `Review` chỉ tham chiếu khóa ngoại tới `ProductVariant`, không có khóa ngoại bắt buộc trỏ tới `OrderLine` hay điều kiện đã mua hàng, giúp người dùng tự do gửi đánh giá sao và nhận xét.
- Bảng `Complaint` lưu trữ các trường tối thiểu: mã khiếu nại, tên khách, số điện thoại, email, mã đơn hàng tùy chọn (`orderCode`), nội dung phản ánh tự do (`description`) và thời điểm gửi `submittedAt`. Lược đồ không có các trường quy trình xử lý giải quyết tranh chấp (Case Resolution Workflow) trên giao diện web.

Toàn bộ thiết kế hệ thống từ BPMN, Use Case, Kiến trúc phân tầng, DFD đến ERD trên đây đã sẵn sàng để chuyển sang Chương 5 nhằm đối chiếu với các màn hình giao diện người dùng thực tế của EL-TECH.



---

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



---

# CHƯƠNG 6. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

Chương 6 tổng kết toàn bộ kết quả đạt được của đồ án phát triển nền tảng thương mại điện tử chuyên doanh linh kiện máy tính và máy tính dựng sẵn EL-TECH, đối chiếu khách quan với 5 mục tiêu nghiên cứu ban đầu. Đồng thời, chương thẳng thắn chỉ ra những hạn chế kỹ thuật và khoảng cách tồn tại giữa thiết kế mục tiêu và sản phẩm thực tế, vạch ra lộ trình nâng cấp và hoàn thiện hệ thống trong các giai đoạn phát triển tiếp theo.

## 6.1. Kết quả đạt được

Đồ án đã hoàn thành việc xây dựng và tích hợp một hệ thống thương mại điện tử chuyên ngành phần cứng hoàn chỉnh, vận hành thực tế trên nền tảng web hiện đại với Frontend sử dụng Angular 22 Standalone kết hợp Spartan UI/Tailwind CSS, Backend sử dụng Node.js Express với Prisma ORM, và cơ sở dữ liệu quan hệ PostgreSQL. Hệ thống đã đáp ứng đầy đủ các luồng quy trình kinh doanh trọng yếu từ tiếp cận danh mục sản phẩm, cấu hình máy tính cá nhân hóa, giao dịch thanh toán dứt điểm không cần đặt cọc, đến theo dõi tiến độ đơn hàng và vận hành quản trị kho vận tập trung.

Đối chiếu với 5 mục tiêu nghiên cứu cụ thể đã xác lập tại Chương 1, mức độ hoàn thành thực tế được đánh giá chi tiết như sau:
- Mục tiêu 1 (Khảo sát và mô hình hóa quy trình nghiệp vụ): Đã thực hiện khảo sát đối chuẩn 3 hệ thống hàng đầu tại thị trường Việt Nam (GEARVN, HACOM, Phong Vũ) theo bộ 11 tiêu chí định lượng; xây dựng thành công 8 mô hình quy trình chuẩn BPMN 2.0 phân định rõ trách nhiệm của các tác nhân, giải quyết triệt để bài toán đồng bộ dữ liệu giữa cấu hình máy dựng sẵn (định mức linh kiện ảo (Virtual BOM)) và tồn kho linh kiện thực tế.
- Mục tiêu 2 (Phân tích và đặc tả yêu cầu hệ thống): Đã chuẩn hóa 30 yêu cầu chức năng (FR-01 đến FR-30), 10 yêu cầu phi chức năng (NFR), 14 quy tắc nghiệp vụ bất biến (BR), 8 ca sử dụng chi tiết (UC-01 đến UC-08) và ma trận truy vết yêu cầu toàn diện, xác lập ranh giới vận hành rõ ràng cho mô hình một cửa hàng duy nhất.
- Mục tiêu 3 (Thiết kế kiến trúc hệ thống và cơ sở dữ liệu): Đã thiết kế hoàn chỉnh kiến trúc phân tầng Layered Architecture kết hợp DFD 3 cấp độ; xây dựng lược đồ cơ sở dữ liệu gồm 43 thực thể quan hệ chặt chẽ, bảo đảm nguyên tắc hạch toán kép (sổ kho đối ứng kép hai chiều), kiểm soát giá vốn bình quân gia quyền (WAC)_TAG và tính toàn vẹn dữ liệu trong các giao dịch đa bảng thông qua Prisma Transaction.
- Mục tiêu 4 (Xây dựng công cụ cấu hình máy tính PC Builder tương tác): Đã hiện thực hóa thành công công cụ tự lắp ráp máy tính (PC Builder) với 8 ngăn linh kiện tiêu chuẩn, tích hợp thuật toán kiểm tra tính tương thích phần cứng theo thời gian thực (Socket CPU và Bo mạch chủ, chuẩn RAM, công suất bộ nguồn khuyến nghị) và cơ chế tính giá tự động theo linh kiện thành phần.
- Mục tiêu 5 (Hiện thực hóa hệ thống giao diện và kiểm thử vận hành): Đã hiện thực hóa đầy đủ 25 màn hình giao diện thực tế (14 màn hình giao diện khách hàng và 11 màn hình cổng quản trị) với hệ thống nhận diện thương hiệu công nghệ tương phản cao đạt chuẩn tiếp cận WCAG 2.1 AA, vận hành ổn định trên môi trường kiểm thử cục bộ.

Bên cạnh các kết quả về phần mềm, đồ án đã giúp nhóm sinh viên vận dụng nhuần nhuyễn các kỹ năng kỹ thuật quan trọng trong thực tiễn: quản lý trạng thái phản ứng bất đồng bộ bằng Angular Signals, xử lý kiểm thực dữ liệu nghiêm ngặt ở ranh giới hệ thống với thư viện Zod, kỹ thuật ánh xạ quan hệ đối tượng (ORM) chuyên sâu, và tư duy thiết kế kiến trúc phần mềm hướng miền nghiệp vụ (Domain-driven Design).

Tuy nhiên, kết quả đạt được mới chỉ dừng lại ở phạm vi một sản phẩm mẫu hoàn chỉnh (bản thử nghiệm mẫu khả thi tối thiểu (MVP)) hoạt động trong môi trường phát triển cục bộ, chưa trải qua kiểm thử tải thực tế với lưu lượng truy cập lớn của hàng ngàn người dùng đồng thời trên môi trường điện toán đám mây.

## 6.2. Hạn chế của đề tài

Trong quá trình phân tích và triển khai, đề tài phân định rõ ràng giữa hai khái niệm hoàn toàn khác biệt: quyết định cắt giảm phạm vi nghiệp vụ có chủ đích (Quyết định điều chỉnh phạm vi nghiệp vụ) và các khiếm khuyết kỹ thuật hoặc lỗ hổng tồn tại trong mã nguồn hiện hữu (Khiếm khuyết kỹ thuật tồn đọng). Nhóm thực hiện kiên quyết không sử dụng các quyết định phạm vi để bao biện cho những thiếu sót về mặt kỹ thuật.

Về quyết định phạm vi nghiệp vụ có chủ đích (Quyết định điều chỉnh phạm vi nghiệp vụ):
- Giới hạn mô hình một cửa hàng và một kho hàng duy nhất: Hệ thống loại bỏ hoàn toàn các thực thể và quy trình điều chuyển nội bộ giữa các chi nhánh (`StockTransfer`) nhằm tập trung tối đa nguồn lực vào việc tối ưu hóa độ chính xác của sổ kho và tính toán giá vốn giá vốn bình quân gia quyền (WAC) tại một điểm bán lẻ duy nhất.
- Tinh giản phương thức thanh toán dứt điểm: Chỉ hỗ trợ thanh toán 100% bằng chuyển khoản VietQR hoặc 100% tiền mặt khi nhận hàng (COD), loại bỏ hoàn toàn tính năng đặt cọc một phần để tránh các rủi ro kế toán và tranh chấp giữ tiền cọc của khách hàng.
- Quy trình giải quyết khiếu nại và đổi trả ngoại tuyến: Hệ thống chỉ đóng vai trò tiếp nhận thông tin phản ánh (Intake Form) và chuyển giao cho bộ phận chăm sóc khách hàng liên hệ trực tiếp; không xây dựng cổng hoàn tiền tự động (On-screen Refund Workflow) hoặc cổng RMA phức tạp trên website do đòi hỏi thẩm định hiện trạng vật lý của phần cứng tại quầy kỹ thuật.
- Danh mục sản phẩm chuyên sâu: Loại bỏ hoàn toàn ngành hàng thiết bị di động (Laptop, Điện thoại thông minh) để tập trung duy nhất vào linh kiện máy tính để bàn rời và thùng máy dựng sẵn theo năng lực thực tế của cửa hàng.

Về các khiếm khuyết kỹ thuật và khoảng cách triển khai (Khiếm khuyết kỹ thuật và khoảng cách triển khai):
- Cơ chế xác thực OTP tra cứu đơn hàng: Chức năng gửi mã OTP bảo mật qua SMS/Email cho khách vãng lai khi tra cứu đơn hàng hiện đang sử dụng cơ chế giả lập (Mocking Provider) ghi log mã vào hệ thống thay vì tích hợp trực tiếp với cổng dịch vụ viễn thông bên thứ ba (như Twilio hoặc SendGrid), tiềm ẩn rủi ro nếu áp dụng trực tiếp cho môi trường sản xuất.
- Thuật toán kiểm tra tương thích phần cứng: Quy tắc tương thích giữa Card đồ họa và Chiều dài vỏ case (VGA Length vs Case Max Clearance), hoặc Chiều cao tản nhiệt khí và Chiều rộng thân case mới chỉ dựa trên so sánh thông số số học tĩnh dạng văn bản thô, chưa xử lý được các trường hợp đặc biệt khi lắp thêm quạt tản nhiệt hoặc gắn két làm mát tản nhiệt nước (Radiator AIO) ở mặt trước.
- Hệ thống phân quyền quản trị chi tiết (phân quyền chi tiết dựa trên vai trò): Phân hệ Admin hiện mới chỉ phân tách hai vai trò cơ bản là Quản trị viên (Admin) và Khách hàng (User); chưa hỗ trợ phân quyền chi tiết theo từng chức năng chuyên biệt (như Thủ kho chỉ được xem và nhập kho PO, Kế toán chỉ được duyệt thanh toán, Nhân viên kỹ thuật chỉ được cập nhật trạng thái lắp ráp).
- Cơ chế giải tỏa tồn kho giữ chỗ tự động (cơ chế hết hạn tạm giữ số lượng tồn kho): Các đơn hàng chọn thanh toán chuyển khoản VietQR nhưng khách hàng không hoàn tất chuyển tiền trong thời hạn quy định (sau 15 phút) hiện vẫn cần thao tác kiểm tra và hủy thủ công của điều phối viên thay vì có một dịch vụ nền (tiến trình tác vụ nền định kỳ) tự động hủy đơn và hoàn trả số lượng khả dụng vào kho.

Những hạn chế nêu trên là cơ sở thực tiễn để định hình phương hướng hoàn thiện hệ thống trong các giai đoạn phát triển tiếp theo của dự án.

## 6.3. Hướng phát triển

Trên cơ sở nhận diện đầy đủ các hạn chế và khoảng cách triển khai, lộ trình phát triển hệ thống EL-TECH được chia thành hai nhóm nhiệm vụ rõ rệt: các nhiệm vụ kỹ thuật hoàn thiện sản phẩm cốt lõi và các đề xuất tính năng mở rộng trong tương lai.

Các nhiệm vụ hoàn thiện và củng cố nền tảng cốt lõi:
- Tích hợp cổng dịch vụ xác thực số thực tế: Thay thế cơ chế mock OTP bằng việc tích hợp API chính thức của các nhà cung cấp hạ tầng tin nhắn SMS Brandname hoặc Email giao dịch bảo mật (như AWS SES, Twilio), bảo đảm mã xác thực được chuyển giao đến đúng thiết bị của khách hàng trong vòng 5 giây.
- Triển khai dịch vụ tác vụ nền định kỳ (dịch vụ xử lý tác vụ nền định kỳ): Xây dựng dịch vụ nền sử dụng Redis và BullMQ để quản lý hàng đợi tác vụ; tự động kiểm tra thời hạn thanh toán VietQR, tự động hủy các giao dịch quá hạn và phát lệnh giải tỏa số lượng linh kiện đang bị tạm giữ trong bảng Stock Quant về trạng thái sẵn sàng bán (ATP).
- Hoàn thiện bộ quy tắc kiểm tra tương thích PC Builder: Nâng cấp thuật toán kiểm tra kích thước vật lý không gian ba chiều (3D Clearances), cho phép tính toán kích thước chiếm dụng thực tế khi cấu hình tản nhiệt nước Custom, kiểm tra độ dày khe PCIe của VGA và số cổng kết nối nguồn phụ (6-pin, 8-pin, 12VHPWR) của bộ nguồn máy tính.
- Nâng cấp phân quyền truy cập dựa trên thuộc tính (ABAC): Bổ sung các nhóm quyền chuyên biệt cho nhân sự vận hành: Nhân viên tư vấn bán hàng, Kỹ thuật viên lắp ráp PC, Nhân viên kiểm kê kho hàng và Quản lý tài chính.

Các tính năng tiềm năng mở rộng trong tương lai (không thuộc phạm vi MVP hiện tại):
- Mở rộng mô hình quản trị đa chi nhánh và trung tâm phân phối: Thiết kế lại cơ chế điều chuyển kho nội bộ (`StockTransfer`), bổ sung thuật toán chọn kho xuất hàng tự động dựa trên khoảng cách địa lý gần nhất với địa chỉ người nhận.
- Cổng quản lý bảo hành và bảo trì phần cứng điện tử (e-Warranty & RMA Portal): Cho phép khách hàng tra cứu thời hạn bảo hành của từng linh kiện thông qua số Serial Number duy nhất, tạo phiếu yêu cầu bảo hành trực tuyến và theo dõi tiến độ thẩm định lỗi phần cứng từ trung tâm bảo hành của hãng.
- Tích hợp cổng thanh toán trực tuyến tự động (cổng thanh toán điện tử trực tuyến): Mở rộng hỗ trợ kết nối trực tiếp với cổng thanh toán VNPAY, MoMo hoặc PayOS có webhook đồng bộ hóa trạng thái tức thì, giảm tải tác vụ kiểm tra sao kê ngân hàng thủ công.
- Tích hợp API đơn vị vận chuyển chuyên nghiệp: Kết nối trực tiếp với hệ thống của Giao Hàng Tiết Kiệm (GHTK), Giao Hàng Nhanh (GHN) hoặc Viettel Post để tự động đẩy vận đơn, lấy mã theo dõi (mã vận đơn theo dõi kiện hàng) thời gian thực và in phiếu gửi hàng chuẩn hóa ngay tại quầy đóng gói.

Việc vạch rõ các tính năng mở rộng giúp định hướng phát triển kiến trúc hệ thống theo hướng linh hoạt, dễ mở rộng mà không làm xáo trộn cấu trúc dữ liệu cốt lõi đã được xây dựng vững chắc.

## 6.4. Kết luận chung

Đồ án "Phát triển website bán linh kiện máy tính và hỗ trợ tư vấn lắp ráp PC EL-TECH" đã hoàn thành mục tiêu thiết kế và hiện thực hóa một hệ thống thương mại điện tử chuyên ngành phần cứng hoàn chỉnh, đáp ứng tốt các yêu cầu nghiệp vụ phức tạp của thị trường bán lẻ công nghệ thông tin. Bằng việc kết hợp chặt chẽ giữa khảo sát thực tiễn thị trường, chuẩn hóa quy trình phân tích thiết kế hệ thống, ứng dụng các công nghệ hiện đại hàng đầu (Angular 22 Signals, Express, Prisma ORM, PostgreSQL) và tuân thủ nghiêm ngặt các nguyên tắc bất biến trong quản trị kho vận và thanh toán, hệ thống đã chứng minh được tính khả thi kỹ thuật và tiềm năng ứng dụng thực tế.

Mặc dù sản phẩm hiện nay vẫn còn một số khoảng cách triển khai cần được hoàn thiện và kiểm thử thêm trước khi có thể đưa vào vận hành thương mại hóa thực tế ngoài thị trường, những kết quả nghiên cứu và mã nguồn đạt được của đồ án là nền tảng kỹ thuật vững chắc, đóng góp một mô hình tham chiếu chất lượng cao cho việc xây dựng các nền tảng thương mại điện tử chuyên ngành kỹ thuật số tại Việt Nam.



---

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



---

