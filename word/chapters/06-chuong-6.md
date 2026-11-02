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

