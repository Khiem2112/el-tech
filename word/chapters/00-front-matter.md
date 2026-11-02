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

