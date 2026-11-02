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

