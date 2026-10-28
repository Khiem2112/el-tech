# TÀI LIỆU NGHIỆP VỤ HỆ THỐNG EL-TECH (BUSINESS REQUIREMENTS & SCOPE DEFINITION)

Tài liệu này tổng hợp toàn bộ các quy tắc, luồng xử lý và ranh giới nghiệp vụ của dự án EL-TECH (Hệ thống bán lẻ linh kiện máy tính, PC dựng sẵn và hỗ trợ tự cấu hình PC).

Tài liệu được chuẩn hóa trực tiếp từ bộ quy chuẩn nghiệp vụ tại thư mục business-logic (.agents/skills/business-logic) và các kết quả khảo sát nghiệp vụ tại QA-el-tech-business-logic.md (QA/QA-el-tech-business-logic.md).

---

## PHẦN 1: MỤC TIÊU VÀ NGUYÊN TẮC BẤT BIẾN CỐT LÕI

### 1. Mục Tiêu Sản Phẩm
EL-TECH giúp khách hàng tìm kiếm linh kiện máy tính chính hãng, xem đầy đủ thông số kỹ thuật, tự phối ghép hoặc chọn cấu hình PC phù hợp với ngân sách và theo dõi đơn hàng minh bạch. Về phía vận hành, hệ thống cung cấp cho Quản trị viên một giao diện kiểm soát tập trung về trạng thái đơn hàng, dòng tiền thanh toán và biến động tồn kho đa chi nhánh.

### 2. Các Nguyên Tắc Bất Biến (Core Invariants)
- Quyền quyết định thuộc về Máy chủ (Authoritative Backend): Mọi tính toán đơn giá, thuế VAT, chiết khấu khuyến mãi, mã giảm giá, tính khả dụng của tồn kho và điều kiện chuyển trạng thái đều do máy chủ quyết định tại thời điểm tạo đơn. Dữ liệu trên giao diện người dùng chỉ mang tính chất dự toán tham khảo.
- Xuất kho từ một chi nhánh duy nhất (Single-origin Invariant): Mỗi đơn hàng bắt buộc phải được phân bổ và xuất kho từ duy nhất một chi nhánh có sẵn đầy đủ 100% các mặt hàng trong đơn. Tuyệt đối không chia nhỏ một đơn hàng để giao từ nhiều chi nhánh khác nhau.
- Bản chụp đơn hàng bất biến (Snapshot Invariant): Tại thời điểm tạo đơn hàng thành công, hệ thống khóa cố định bản chụp thông tin sản phẩm, danh sách linh kiện thành phần (BOM), đơn giá, chiết khấu, thông tin liên hệ và chi nhánh xuất hàng. Mọi thay đổi trong danh mục sau này không làm sai lệch dữ liệu lịch sử đơn hàng.
- Sổ kho bất biến và chống âm kho (Immutable Stock Ledger): Mọi biến động kho (tăng, giảm, giữ chỗ, giải phóng) bắt buộc phải xuất phát từ một chứng từ hoặc giao dịch nghiệp vụ hợp lệ. Tuyệt đối không cho phép tồn kho mang giá trị âm (Tồn thực tế, Tồn tạm giữ và Tồn khả dụng luôn lớn hơn hoặc bằng 0).
- Tiền tệ nguyên đồng (Whole VND Currency): Toàn bộ các giá trị tiền tệ trong hệ thống sử dụng đơn vị Việt Nam Đồng (VND), lưu trữ dưới dạng số thập phân chính xác (Decimal) và làm tròn đến hàng đơn vị (nguyên đồng, không có số thập phân lẻ).

---

## PHẦN 2: BẢNG PHÂN ĐỊNH PHẠM VI DỰ ÁN (IN-SCOPE MVP VÀ OUT-OF-SCOPE)

Bảng đối chiếu dưới đây phân định ranh giới giữa phạm vi thực hiện trong giai đoạn hiện tại (In-Scope MVP) và các tính năng nằm ngoài phạm vi hoặc thuộc lộ trình mở rộng sau này (Out-of-Scope / Future):

| Phân Hệ Nghiệp Vụ | Phạm Vi Triển Khai Giai Đoạn Hiện Tại (In-Scope MVP) | Nằm Ngoài Phạm Vi Giai Đoạn Này (Out-Of-Scope / Mở Rộng) |
| :--- | :--- | :--- |
| 1. Khách Hàng & Định Danh (Customer Identity) | - Mua hàng không cần đăng nhập (Guest checkout).<br>- Xác thực email và số điện thoại trước khi chốt đơn.<br>- Tra cứu đơn hàng công cộng bằng Mã đơn + OTP.<br>- Tạo hồ sơ Khách hàng khi phát sinh đơn đầu tiên.<br>- Khách hàng có tài khoản quản lý hồ sơ và lịch sử mua hàng của chính mình. | - Không tự động gộp (merge) hồ sơ khách vãng lai cũ vào tài khoản mới đăng ký.<br>- Không có hệ thống tích điểm thưởng, nâng hạng thành viên (Loyalty).<br>- Không hỗ trợ đăng nhập qua mạng xã hội (ngoại trừ định hướng Google Auth). |
| 2. Danh Mục & Sản Phẩm (Catalog & SKU) | - Cấu trúc 3 tầng: Danh mục (Category) -> Mẫu sản phẩm (Product Template) -> Biến thể thương mại (SKU).<br>- Thuộc tính kỹ thuật động theo từng danh mục linh kiện.<br>- Tìm kiếm và lọc đa diện (Faceted filter) theo thông số.<br>- Vòng đời SKU: Dự thảo -> Đang bán -> Tạm ngưng -> Ngừng kinh doanh. | - Không hỗ trợ người dùng tự gõ thuộc tính biến thể ngoài cấu hình.<br>- Không cho phép nhà bán hàng thứ ba đăng bán (không phải sàn Marketplace).<br>- Không xóa vật lý các SKU đã từng phát sinh giao dịch. |
| 3. Cấu Hình PC & Máy Dựng Sẵn (PC Builder & Bundles) | - Bộ máy dựng sẵn (Prebuilt PC) và Máy tự chọn (Custom Build) quản lý dưới dạng danh sách linh kiện ảo (Virtual BOM).<br>- Cho phép thay đổi linh kiện thành phần từ cấu hình mẫu.<br>- Hiển thị ước tính công suất tiêu thụ điện và cảnh báo tương thích cơ bản mang tính chất tư vấn tham khảo.<br>- Tùy chọn dịch vụ lắp ráp trọn gói.<br>- Đóng gói dàn PC thành một thẻ cấu hình hợp nhất trong giỏ hàng. | - Không lưu hồ sơ cấu hình PC tự chọn vào tài khoản (Saved Builds).<br>- Không hỗ trợ tạo liên kết chia sẻ cấu hình lên mạng xã hội (Shared Builds).<br>- Không có bộ máy tự động chặn đặt hàng do xung đột phần cứng cơ khí chuyên sâu. |
| 4. Giá Bán & Khuyến Mãi (Pricing & Promotions) | - Áp dụng một giá bán niêm yết bán lẻ duy nhất trên toàn hệ thống (không có giá riêng theo chi nhánh).<br>- Khuyến mãi tự động theo sản phẩm (áp dụng trực tiếp).<br>- Mã giảm giá đơn hàng (tối đa 1 mã/đơn, kiểm tra hạn mức toàn hệ thống và hạn mức từng khách).<br>- Khóa bản chụp giá và chiết khấu khi tạo đơn thành công. | - Không hỗ trợ giá bán khác nhau giữa các chi nhánh.<br>- Không hỗ trợ cộng dồn nhiều mã giảm giá cùng lúc trên một đơn.<br>- Không hỗ trợ đa ngoại tệ (chỉ dùng VND).<br>- Không có chính sách công nợ hoặc bán buôn B2B. |
| 5. Tồn Kho & Điều Chuyển (Inventory & Transfers) | - Quản lý tồn kho theo SKU và từng chi nhánh (On-hand, Reserved, Quarantine, Available).<br>- Quản lý mã sê-ri cho các nhóm linh kiện giá trị cao/bảo hành.<br>- Quy trình điều chuyển kho nội bộ giữa các chi nhánh (3 bước: Yêu cầu -> Đang chuyển -> Đã nhận; nhận đủ 100%, hòa nhập giá vốn).<br>- Khóa giữ tồn kho tạm thời (30 phút cho đơn QR, khi duyệt cho đơn COD). | - Không hỗ trợ bán âm kho hoặc đặt hàng trước (Backorder).<br>- Không xuất một đơn từ nhiều chi nhánh khác nhau.<br>- Không có quy trình kiểm kê định kỳ phức tạp hoặc cân chỉnh kho tự do không qua chứng từ. |
| 6. Đặt Hàng & Thanh Toán (Checkout & Payments) | - Thu thập phương thức giao nhận: Giao tận nơi hoặc Nhận tại chi nhánh.<br>- Nhận tại chi nhánh không bắt buộc nhập địa chỉ nhà.<br>- Thanh toán chuyển khoản qua mã QR động (VietQR, thời hạn 30 phút).<br>- Thanh toán COD cho linh kiện lẻ và máy dựng sẵn.<br>- Bắt buộc đặt cọc tối thiểu 10% (tối thiểu 500.000 VNĐ) qua mã QR đối với đơn máy PC tự ráp chọn COD.<br>- Tách biệt hoàn toàn trạng thái thanh toán và trạng thái đơn hàng. | - Không có cổng hoàn tiền tự động qua hệ thống.<br>- Không hỗ trợ quẹt thẻ POS tại quầy.<br>- Không hỗ trợ chuyển khoản bổ sung/chuyển bù tiền thiếu qua mã QR.<br>- Không hỗ trợ trả góp hoặc ví điện tử. |
| 7. Vận Hành Đơn Hàng & Lắp Ráp (Fulfillment & Assembly) | - Vòng đời đơn hàng 13 trạng thái chuẩn.<br>- Trừ tồn kho thực tế đúng thời điểm (đơn lắp ráp trừ khi sang Đang lắp ráp, đơn giao hàng trừ khi bàn giao, đơn nhận tại quầy trừ khi khách nhận).<br>- Xử lý sự cố giao hàng: Giao lại tối đa 2 lần; nếu thất bại chuyển hoàn về chi nhánh nhập kho mới phục hồi tồn.<br>- Đơn nhận tại quầy quá 14 ngày chuyển sang tạm giữ chờ liên hệ.<br>- Trạng thái "Đang lắp ráp" (ASSEMBLING) chỉ là trạng thái giám sát tiến độ của đơn hàng. | - Không quản lý chi tiết quy trình lắp ráp (không lập lệnh sản xuất công xưởng, không phân công thợ kỹ thuật, không kiểm tra checklist lắp ráp nội bộ).<br>- Không kiểm soát chất lượng (QC inspection/testing).<br>- Không quản lý vận chuyển chuyên sâu (không tích hợp API bưu tá, không theo dõi tracking bưu tá thời gian thực, không quản lý đội xe/tối ưu tuyến đường).<br>- Không cho phép giao hàng từng phần. |
| 8. Mua Hàng Từ Nhà Cung Cấp (Purchasing & Inbound) | - Tạo đơn mua hàng (PO) cho từng chi nhánh cụ thể.<br>- Nhận đủ 100% một lần duy nhất (Exact Receipt Invariant); nếu giao thiếu thì hủy PO cũ và tạo PO mới theo số lượng thực nhận.<br>- Quét nạp mã sê-ri khi nhận hàng.<br>- Tính giá vốn hàng tồn kho theo phương pháp Bình quân gia quyền theo từng SKU và chi nhánh.<br>- Xuất trả hàng nhà cung cấp (Supplier Return) đối với linh kiện cách ly hỏng lỗi hoặc linh kiện tồn kho đối chiếu từ phiếu nhập kho gốc (PUR-011 đến PUR-014). | - Không quản lý biên bản đối soát công nợ, khấu trừ tiền hàng hoặc biên lai nợ với nhà cung cấp (Credit Notes / Payables).<br>- Không làm đổi hàng với nhà cung cấp.<br>- Không nhận hàng nhiều lần từ một PO.<br>- Không có quy trình phê duyệt PO nhiều cấp bậc.<br>- Không kiểm soát chất lượng kiểm thử linh kiện khi nhập kho. |
| 9. Đánh Giá Sản Phẩm (Verified Reviews) | - Chỉ áp dụng đánh giá (số sao và nhận xét) cho các sản phẩm trong các đơn hàng đã đạt trạng thái Hoàn thành.<br>- Mỗi món hàng trong một đơn hoàn thành chỉ được gửi đúng một bài đánh giá (cho phép sửa, lưu vết lịch sử).<br>- Quản trị viên có quyền ẩn bài đánh giá vi phạm nội dung. | - Không hỗ trợ luồng trả hàng/đổi hàng (RMA) hoặc khiếu nại của khách hàng trong MVP.<br>- Không có tính năng bình luận hỏi đáp tự do dưới bài viết sản phẩm.<br>- Người chưa từng mua sản phẩm hoặc đơn chưa hoàn tất không được quyền đánh giá. |
| 10. Tài Chính & Báo Cáo (Finance & Analytics) | - Theo dõi các chỉ số kinh doanh cơ bản: Doanh thu (từ các đơn hoàn thành), Chi phí giá vốn hàng bán (theo phương pháp bình quân gia quyền) và Lợi nhuận gộp.<br>- Quy trình kiểm tra thanh toán chuyển khoản thủ công.<br>- Quy trình hoàn tiền thủ công bằng chuyển khoản ngân hàng ngoài app. | - Không có phân hệ kế toán chuyên sâu (sổ cái, bảng cân đối kế toán).<br>- Không giám sát số dư tài khoản ngân hàng của doanh nghiệp.<br>- Không quản lý công nợ chi tiết hay đối soát tự động.<br>- Không có hệ thống báo cáo phân tích kinh doanh nâng cao. |

---

## PHẦN 3: BẢN ĐỒ TÁC NHÂN VÀ PHÂN QUYỀN HỆ THỐNG

### 1. Khách Vãng Lai (Guest Buyer)
- Định nghĩa: Người mua chưa có tài khoản đăng nhập trên hệ thống.
- Quyền hạn: Xem danh mục, tìm kiếm, lọc thông số, phối ghép PC Builder, thêm vào giỏ và đặt hàng.
- Ràng buộc: Bắt buộc cung cấp và xác thực số điện thoại cùng email trước khi gửi đơn. Hệ thống tạo một hồ sơ Khách hàng (Customer Profile) gắn liền với thông tin này trong cùng giao dịch tạo đơn.
- Truy cập sau mua: Tra cứu trạng thái đơn hàng bằng Mã đơn hàng kèm Số điện thoại/Email, xác thực qua mã OTP; được quyền gửi đánh giá sản phẩm sau khi đơn hoàn tất.

### 2. Khách Hàng Có Tài Khoản (Registered Customer)
- Định nghĩa: Người mua đã tạo tài khoản định danh trên website.
- Quyền hạn: Quản lý thông tin cá nhân, sổ địa chỉ nhận hàng; theo dõi lịch sử và tiến độ đơn hàng tập trung; gửi đánh giá nhận xét cho các sản phẩm đã mua thành công.
- Ràng buộc định danh: Tài khoản đăng nhập (User) và hồ sơ nghiệp vụ (Customer) là hai thực thể độc lập. Khi một tài khoản mới đăng ký, hệ thống tạo một hồ sơ khách hàng mới gắn với tài khoản đó, không tự động gộp lịch sử đơn cũ của khách vãng lai nhằm tránh sai lệch dữ liệu.

### 3. Quản Trị Viên Hệ Thống (System Admin)
- Định nghĩa: Nhân sự quản trị duy nhất trong phạm vi MVP (chưa phân tách vai trò nhân viên chi nhánh hay phân quyền kỹ thuật).
- Quyền hạn và trách nhiệm:
  - Quản trị danh mục sản phẩm, mẫu sản phẩm, biến thể (SKU) và thuộc tính kỹ thuật động.
  - Quản lý chính sách giá niêm yết toàn hệ thống, chương trình khuyến mãi tự động và mã giảm giá.
  - Quản lý tồn kho các chi nhánh, tạo và xác nhận lệnh điều chuyển linh kiện nội bộ giữa các chi nhánh.
  - Xử lý đơn hàng: Tiếp nhận đơn, xác nhận đơn COD, kích hoạt chuẩn bị linh kiện, giám sát trạng thái lắp ráp, cập nhật trạng thái bàn giao vận chuyển, xử lý sự cố giao hàng thất bại hoặc quá hạn nhận tại quầy.
  - Quản lý mua hàng và xuất trả: Tạo đơn mua hàng gửi nhà cung cấp, xác nhận nhập kho đủ 100% một lần cho chi nhánh tiếp nhận; lập và xác nhận phiếu xuất trả nhà cung cấp đối với linh kiện cách ly hỏng lỗi đối chiếu từ phiếu nhập gốc.
  - Quản trị dòng tiền cơ bản: Kiểm tra xem khách hàng chuyển khoản đã đủ tiền hay chưa, cập nhật trạng thái đơn khi hủy và thực hiện hoàn tiền thủ công qua ứng dụng ngân hàng bên ngoài; theo dõi doanh thu, chi phí giá vốn và lợi nhuận gộp cơ bản.

### 4. Các Tác Nhân Bên Ngoài (External Actors)
- Hệ thống ngân hàng/Cổng thanh toán QR: Tiếp nhận giao dịch chuyển khoản quét mã QR từ người mua, gửi thông báo xác nhận biến động số dư.
- Đơn vị giao vận: Tiếp nhận kiện hàng đã đóng gói từ chi nhánh và thực hiện giao hàng đến địa chỉ người mua, thu hộ tiền mặt đối với đơn COD.

---

## PHẦN 4: LUỒNG NGHIỆP VỤ MUA SẮM (CUSTOMER WORKFLOWS)

### 1. Luồng Duyệt Danh Mục, Tìm Kiếm Đa Diện Và Thông Số Động
- Chỉ các SKU có trạng thái "Đang bán" (Active) mới xuất hiện trên giao diện để khách hàng mua sắm.
- Mỗi danh mục sản phẩm sở hữu một bộ thông số kỹ thuật động được định nghĩa sẵn (ví dụ: Mainboard có Socket, RAM có chuẩn Bus, VGA có chiều dài và dung lượng VRAM).
- Bộ lọc đa diện (Faceted filter) cho phép khách hàng thu hẹp phạm vi tìm kiếm theo nhiều thông số cùng lúc.
- Mỗi sản phẩm hiển thị minh bạch giá bán lẻ niêm yết toàn hệ thống, giá sau khuyến mãi tự động (nếu có) và trạng thái còn hàng hay hết hàng tại từng chi nhánh cụ thể.

### 2. Luồng Phối Ghép Cấu Hình PC (PC Builder) Và Dịch Vụ Lắp Ráp
- Khách hàng có thể tự phối ghép từ cấu hình trống hoặc tùy biến từ một bộ máy dựng sẵn (Prebuilt PC).
- Dàn máy PC được quản lý dưới dạng danh sách linh kiện thành phần (Virtual BOM), không tồn tại dưới dạng một mã tồn kho máy thành phẩm độc lập.
- Hệ thống tính toán công suất tiêu thụ điện ước tính của dàn máy và hiển thị cảnh báo tương thích cơ bản mang tính chất tư vấn tham khảo, không chặn quy trình đặt hàng của khách.
- Khách hàng có thể tích chọn "Dịch vụ lắp ráp trọn gói" (đi dây nguồn, kiểm tra hoạt động cơ bản, bàn giao toàn bộ vỏ hộp linh kiện).
- Khi nhấn đưa vào giỏ hàng, toàn bộ các linh kiện thành phần được gom chung vào một thẻ cấu hình hợp nhất.
- Giới hạn MVP: Hệ thống không hỗ trợ lưu hồ sơ cấu hình PC tự chọn vào tài khoản cá nhân và không hỗ trợ tạo liên kết chia sẻ cấu hình lên mạng xã hội.

### 3. Luồng Giỏ Hàng Và Tính Toán Chi Phí
- Giỏ hàng của khách vãng lai được lưu trữ tạm thời theo phiên làm việc của trình duyệt và không thực hiện giữ chỗ hàng hóa trong kho.
- Khách hàng có thể áp dụng tối đa 1 mã giảm giá cấp đơn hàng (Order Coupon). Hệ thống kiểm tra hạn mức sử dụng còn lại của mã trên toàn hệ thống và hạn mức của khách hàng.
- Thứ tự tính toán giá: Đơn giá gốc niêm yết -> Giảm giá sản phẩm tự động -> Giảm trừ mã giảm giá phân bổ theo tỷ lệ dòng hàng -> Phí vận chuyển (nếu có). Tổng mức giảm giá không bao giờ vượt quá tổng giá trị hàng hóa.
- Khi khách hàng đăng nhập, các sản phẩm từ giỏ hàng tạm được gộp vào giỏ hàng tài khoản và máy chủ tính toán lại toàn bộ mức giá cũng như kiểm tra lại tình trạng còn hàng thực tế.

### 4. Luồng Đặt Hàng Và Phân Bổ Chi Nhánh Xuất Hàng
- Điều kiện gửi đơn: Cung cấp họ tên, số điện thoại, email và lựa chọn phương thức nhận hàng (Giao tận nơi hoặc Nhận tại chi nhánh).
- Quy tắc xuất kho đơn chi nhánh (Single-origin Invariant): Toàn bộ đơn hàng chỉ được xuất từ duy nhất một chi nhánh có sẵn 100% tất cả các linh kiện trong đơn.
  - Nếu chọn nhận tại chi nhánh: Khách hàng chỉ được chọn các chi nhánh đang có sẵn đầy đủ toàn bộ linh kiện. Nhận tại chi nhánh không yêu cầu nhập địa chỉ nhà.
  - Nếu chọn giao tận nơi: Hệ thống tự động chọn chi nhánh có đủ hàng theo thứ tự ưu tiên khu vực phục vụ do cửa hàng cấu hình.
  - Nếu không có chi nhánh nào có đủ 100% hàng: Hệ thống từ chối nhận đơn, giữ nguyên sản phẩm trong giỏ để khách hàng đổi món hoặc chờ Quản trị viên điều chuyển kho nội bộ.
- Quy tắc giữ tồn kho (Stock Reservation):
  - Đơn chọn thanh toán QR: Hệ thống tự động khóa giữ chỗ tồn kho tương ứng tại chi nhánh xuất hàng trong thời hạn 30 phút.
  - Đơn chọn thanh toán COD thông thường: Tồn kho chỉ được giữ chỗ sau khi Quản trị viên gọi điện xác thực và duyệt đơn sang trạng thái "Đã xác nhận".
  - Đơn máy PC tự ráp chọn COD: Bắt buộc người mua phải thanh toán khoản tiền đặt cọc tối thiểu 10% (tối thiểu 500.000 VNĐ) qua mã QR trong 30 phút. Tồn kho chỉ được khóa giữ sau khi giao dịch đặt cọc này thành công.

### 5. Luồng Thanh Toán QR Động Và Quản Trị Đặt Cọc
- Mỗi đơn hàng hoặc mỗi khoản đặt cọc phát sinh đúng 1 mã QR thanh toán duy nhất với số tiền chính xác từng đồng và nội dung chuyển khoản định danh không trùng lặp.
- Khách hàng chuyển đúng và đủ trong 30 phút: Đơn hàng chuyển sang "Đã xác nhận" (hoặc "Đã thanh toán một phần" nếu là tiền cọc), khóa giữ tồn kho chính thức.
- Quá 30 phút không nhận được tiền: Đơn hàng tự động hủy với lý do hết hạn thanh toán; toàn bộ tồn kho tạm giữ và hạn mức mã giảm giá được giải phóng ngay lập tức.
- Khách hàng chuyển thiếu tiền hoặc sai cú pháp: Hệ thống không hỗ trợ chuyển bù tiền qua mã QR. Giao dịch bất thường sẽ dừng đếm ngược 30 phút, chuyển đơn hàng sang trạng thái "Tạm giữ xử lý ngoại lệ" trong tối đa 24 giờ để nhân viên đối chiếu liên hệ. Nếu không giải quyết được, đơn bị hủy, nhả tồn kho và nhân viên tự mở ứng dụng ngân hàng bên ngoài chuyển khoản trả lại số tiền đã nhận cho khách.
- Khách hàng chuyển tiền muộn sau khi đơn đã hủy: Nếu kho còn đủ hàng, Quản trị viên kích hoạt lại đơn; nếu hàng đã bán cho khách khác, đơn chuyển sang diện tạm giữ và nhân viên chuyển khoản trả lại 100% tiền cho khách.

### 6. Luồng Tra Cứu Đơn Hàng, Hủy Đơn Và Đánh Giá Sản Phẩm
- Tra cứu đơn hàng: Khách vãng lai tra cứu đơn bằng Mã đơn hàng kèm Số điện thoại hoặc Email, xác thực qua mã OTP một lần gửi về điện thoại/email.
- Hủy đơn hợp lệ từ phía khách hàng: Khách hàng chỉ được phép tự hủy đơn trên hệ thống khi đơn hàng đang ở các trạng thái ban đầu ("Chờ thanh toán", "Chờ duyệt COD", "Đã xác nhận") và chưa bước vào khâu "Chuẩn bị linh kiện". Khách hàng được hoàn lại 100% số tiền đã trả trước nếu hủy đơn hợp lệ.
- Khóa quyền tự hủy: Ngay khi đơn hàng chuyển sang "Chuẩn bị linh kiện" hoặc "Đang lắp ráp", quyền tự hủy của khách hàng bị khóa hoàn toàn.
- Đánh giá sản phẩm (Reviews):
  - Chỉ áp dụng cho các sản phẩm thuộc đơn hàng đã đạt trạng thái "Hoàn thành".
  - Mỗi món hàng trong một đơn hoàn thành chỉ được gửi đúng một bài đánh giá kèm số sao nhận xét. Cho phép người mua chỉnh sửa bài đánh giá đã gửi.
  - Quản trị viên có quyền ẩn các bài đánh giá vi phạm quy chuẩn nội dung.
- Giới hạn MVP: Hệ thống không hỗ trợ luồng khiếu nại hoặc trả hàng/đổi hàng (RMA) sau khi đơn đã hoàn thành.

---

## PHẦN 5: LUỒNG NGHIỆP VỤ QUẢN TRỊ VÀ VẬN HÀNH KHO (ADMIN & OPERATIONS)

### 1. Quản Trị Tồn Kho 4 Trạng Thái Và Mã Sê-Ri
- Đơn vị theo dõi: Tồn kho được quản lý chi tiết theo từng biến thể linh kiện (SKU) tại từng chi nhánh cửa hàng độc lập.
- 4 trạng thái tồn kho cốt lõi của mỗi linh kiện tại một chi nhánh:
  - Tồn kho thực tế (On-hand): Tổng số lượng sản phẩm vật lý thực sự đang hiện diện trên giá kệ của chi nhánh.
  - Tồn kho tạm giữ (Reserved): Số lượng sản phẩm đang nằm trong kho nhưng đã được cam kết giữ chỗ cho các đơn hàng của khách.
  - Tồn kho cách ly (Quarantine): Số lượng sản phẩm bị lỗi kỹ thuật, hỏng vỏ hộp hoặc qua kiểm định không đạt tiêu chuẩn xuất xưởng; bị khóa không cho phép bán lẻ.
  - Tồn kho khả dụng (Available): Số lượng thực tế hiển thị trên website mà khách có thể đặt mua.
    Công thức: Tồn khả dụng = Tồn thực tế - Tồn tạm giữ - Tồn cách ly.
- Quản trị mã số sê-ri (Serial Numbers): Áp dụng bắt buộc cho các nhóm linh kiện giá trị cao và gắn liền với bảo hành chính hãng (CPU, Mainboard, VGA, Nguồn, SSD). Mỗi mã sê-ri là duy nhất trên toàn hệ thống, được quét ghi nhận khi nhập kho và gắn vào đơn hàng khi xuất kho.
- Khả năng cung ứng dàn máy PC ảo: Số lượng bộ máy PC tối đa có thể ráp được tại một chi nhánh bằng số lượng nhỏ nhất của linh kiện thành phần khả dụng chia cho định mức yêu cầu trong cấu hình dàn máy. Khi khách đặt mua dàn PC, hệ thống khóa giữ tồn kho tạm giữ cho từng linh kiện thành phần, không tạo ra mã tồn kho máy thành phẩm.

### 2. Luồng Nhập Kho Mua Hàng Từ Nhà Cung Cấp (Purchasing & Inbound)
- Đơn mua hàng (Purchase Order): Quản trị viên khởi tạo đơn mua hàng ở trạng thái Bản nháp (Draft), lựa chọn nhà cung cấp và chỉ định chính xác một chi nhánh cửa hàng tiếp nhận lô hàng. Sau khi thống nhất giá và số lượng, Quản trị viên chuyển đơn sang trạng thái Đã xác nhận (Confirmed).
- Quy tắc nhận hàng nguyên vẹn một lần duy nhất (Exact Receipt Invariant):
  - Chi nhánh chỉ thực hiện nhận hàng đúng một lần duy nhất cho toàn bộ đơn mua hàng; bắt buộc số lượng thực tế nhận được phải khớp đúng 100% với đơn mua đã duyệt.
  - Nhân viên kho kiểm tra tính nguyên vẹn của tem bao bì và quét toàn bộ mã sê-ri của từng linh kiện.
- Xử lý tình huống nhà cung cấp giao thiếu số lượng:
  - Hệ thống tuyệt đối cấm sửa số lượng trên đơn mua đã duyệt và không cho phép nhận hàng từng phần.
  - Quy trình xử lý: Quản trị viên hủy đơn mua cũ với lý do "Nhà cung cấp giao thiếu hàng". Đồng thời hệ thống tạo một đơn mua hàng mới thay thế với số lượng bằng đúng số lượng thực tế nhận được. Nhân viên kho tiến hành nhận hàng theo đơn mua mới này. Phần hàng còn thiếu nếu giao sau sẽ được tạo bằng một đơn mua hoàn toàn mới.
- Xác nhận nhập kho và tính giá vốn:
  - Khi đã kiểm đếm đủ 100% số lượng và nạp mã sê-ri hợp lệ, Quản trị viên xác nhận nhập kho: Tăng Tồn kho thực tế tại chi nhánh, chuyển mã sê-ri sang "Sẵn sàng bán", chuyển trạng thái đơn mua sang "Đã nhận hàng" rồi "Đóng đơn".
  - Tính giá vốn bình quân gia quyền: Giá vốn mới = (Tổng giá trị tồn cũ + Tổng giá trị hàng mới nhập) / (Số lượng tồn cũ + Số lượng mới nhập). Giá vốn này được theo dõi riêng theo từng SKU và chi nhánh để làm căn cứ tính chi phí giá vốn hàng bán và lợi nhuận gộp.
- Xuất trả hàng nhà cung cấp (Supplier Return): Hỗ trợ xuất trả linh kiện cho nhà cung cấp từ phiếu nhập kho đã xác nhận (PUR-011 đến PUR-014) nhằm xử lý linh kiện cách ly hỏng lỗi (quarantineDamaged) hoặc giảm tồn kho thực tế (onHand). Giới hạn MVP: Không quản lý công nợ nhà cung cấp, không quản lý thỏa thuận đổi hàng bù trừ tài chính và không có quy trình kiểm soát chất lượng (QC) kiểm thử chuyên sâu khi nhận hàng.

### 3. Luồng Điều Chuyển Linh Kiện Nội Bộ Giữa Các Chi Nhánh (Internal Transfers)
- Mục đích: Luân chuyển hàng từ chi nhánh dư sang chi nhánh thiếu để phục vụ nhu cầu bán lẻ hoặc gom đủ 100% hàng cho một đơn hàng của khách. Điều chuyển nội bộ không phải là giao dịch mua bán, không phát sinh doanh thu hay công nợ.
- Quy trình 3 bước chuẩn hóa:
  - Bước 1 - Đã yêu cầu (Requested): Quản trị viên tạo phiếu điều chuyển, chỉ định chi nhánh chuyển đi (nguồn), chi nhánh nhận đến (đích), danh sách linh kiện và các mã sê-ri cụ thể. Chỉ được phép hủy phiếu khi ở trạng thái này.
  - Bước 2 - Đang vận chuyển (In Transit): Chi nhánh nguồn lấy hàng xuất kho, bấm xác nhận xuất hàng. Số lượng linh kiện bị trừ khỏi Tồn thực tế của chi nhánh nguồn và chuyển vào chỉ số "Đang trên đường chuyển". Mã sê-ri chuyển sang "Đang điều chuyển". Không được phép hủy phiếu khi đã xuất hàng.
  - Bước 3 - Đã nhận hàng (Received): Chi nhánh đích nhận kiện hàng, kiểm đếm đủ 100% số lượng và quét mã sê-ri. Quản trị viên bấm xác nhận đã nhận hàng: Giải phóng chỉ số "Đang trên đường chuyển", tăng Tồn thực tế tại chi nhánh đích, chuyển mã sê-ri sang "Sẵn sàng bán". Giá vốn bình quân của lô hàng điều chuyển được hòa nhập vào giá vốn của chi nhánh đích theo phương pháp bình quân gia quyền.
- Quy tắc nhận hàng nguyên vẹn: Chi nhánh đích chỉ xác nhận đã nhận khi toàn bộ số lượng thực tế đã đến nơi đầy đủ 100%. Không có quy trình nhận hàng từng phần. Chi nhánh đích chỉ có thể dùng linh kiện điều chuyển để giữ chỗ cho đơn hàng sau khi lệnh điều chuyển đã đạt trạng thái "Đã nhận hàng".

### 4. Vòng Đời Đơn Hàng Và Giám Sát Khâu Lắp Ráp
- Vòng đời đơn hàng gồm 13 trạng thái chuẩn phản ánh tiến độ xử lý vật lý của sản phẩm.
- Thời điểm xuất kho trừ Tồn thực tế theo từng loại đơn:
  - Đơn có chọn dịch vụ lắp ráp máy tính: Trừ Tồn thực tế ngay tại thời điểm chuyển trạng thái từ "Chuẩn bị linh kiện" sang "Đang lắp ráp", vì lúc này linh kiện đã được bóc seal bao bì để lắp vào khung máy.
  - Đơn giao tận nơi không có lắp ráp: Trừ Tồn thực tế tại thời điểm bàn giao kiện hàng cho đơn vị vận chuyển và chuyển trạng thái sang "Đang giao hàng".
  - Đơn nhận tại quầy không có lắp ráp: Hàng lưu ở mức Tồn tạm giữ tại quầy trong suốt 14 ngày; chỉ trừ Tồn thực tế khi khách hàng đến nhận máy thành công và chuyển đơn sang "Hoàn thành".
- Giám sát khâu lắp ráp PC: Trạng thái "Đang lắp ráp" (ASSEMBLING) chỉ là một trạng thái chuyển tiếp trên tiến trình đơn hàng để Quản trị viên và khách hàng giám sát rằng đơn hàng đang được lắp ráp. Hệ thống không tạo lệnh sản xuất công xưởng, không phân công thợ kỹ thuật, không quản lý checklist kiểm tra lắp ráp nội bộ.

### 5. Giao Nhận Hàng Hóa Và Xử Lý Sự Cố Giao Hàng
- Quản lý vận chuyển trong MVP: Quản trị viên cập nhật trạng thái vận chuyển trên hệ thống khi bàn giao cho đơn vị giao vận hoặc khi nhận được thông tin phản hồi từ bên giao vận. Hệ thống không tích hợp API kết nối hãng vận chuyển, không theo dõi định vị bưu tá thời gian thực và không quản lý đội xe riêng.
- Xử lý đơn nhận tại chi nhánh quá hạn 14 ngày:
  - Sau 14 ngày kể từ khi đơn chuyển sang "Sẵn sàng nhận tại chi nhánh" mà khách không đến lấy, hệ thống tự động chuyển đơn sang trạng thái "Tạm giữ xử lý ngoại lệ" với lý do "Quá hạn nhận hàng tại chi nhánh".
  - Đơn hàng được giữ nguyên để nhân viên liên hệ khách hàng đề xuất chuyển sang giao tận nơi (có tính phí vận chuyển phát sinh).
- Xử lý sự cố giao hàng không thành công:
  - Khi đơn vị vận chuyển báo giao không thành công lần đầu, đơn chuyển sang "Giao hàng thất bại". Cửa hàng liên hệ khách để thống nhất hẹn giao lại (hỗ trợ tối đa không quá 2 lần giao lại).
  - Nếu sau 2 lần giao lại vẫn không thành công hoặc khách từ chối nhận hàng, đơn chuyển sang "Hàng đang chuyển hoàn", kiện hàng được chở quay về chi nhánh xuất phát.
  - Thu hồi kho vật lý: Khi kiện hàng về đến chi nhánh, nhân viên kiểm đếm đủ 100% linh kiện nguyên vẹn, Quản trị viên chuyển đơn sang "Đã nhận lại tại chi nhánh" và xác nhận phiếu nhập kho hoàn trả để phục hồi Tồn thực tế. Chỉ sau bước này Quản trị viên mới được thực hiện hủy đơn hàng trên hệ thống.
  - Xử lý tài chính khi chuyển hoàn: Đối với đơn đã thanh toán trước toàn bộ, nhân viên chuyển khoản hoàn tiền cho khách; đối với đơn PC tự ráp chọn COD, khoản tiền đặt cọc bị tịch thu (Forfeited) để bù đắp chi phí hàng bóc seal và công thợ.

### 6. Quản Trị Tài Chính Cơ Bản Và Hoàn Tiền Thủ Công
- Tách biệt trạng thái thanh toán và trạng thái đơn hàng:
  - Trạng thái thanh toán phản ánh dòng tiền: Chưa thanh toán (Unpaid), Chờ xử lý thanh toán (Pending), Đã thanh toán một phần (Partially Paid - khi mới nộp cọc PC), Đã thanh toán đầy đủ (Paid), Thanh toán thất bại (Failed), Hết hạn thanh toán (Expired), Chờ hoàn tiền (Refund Pending), Đã hoàn tiền (Refunded).
  - Trạng thái khoản tiền cọc PC: Đang tạm giữ (Held), Đã khấu trừ vào đơn (Applied), Chờ hoàn tiền cọc (Refund Pending), Đã hoàn cọc (Refunded), Tịch thu cọc (Forfeited).
- Báo cáo kinh doanh cơ bản: Quản trị viên theo dõi Doanh thu (từ các đơn hoàn thành), Chi phí giá vốn hàng bán (tính theo giá vốn bình quân gia quyền) và Lợi nhuận gộp. Hệ thống không có phân hệ kế toán chuyên sâu và không giám sát số dư tài khoản ngân hàng của doanh nghiệp.
- Quy trình kiểm tra thanh toán chuyển khoản: Quản trị viên đối chiếu xem khách hàng đã chuyển đúng và đủ tiền hay chưa đối với các giao dịch chuyển khoản thủ công hoặc giao dịch bất thường cần xử lý ngoại lệ.
- Quy trình hoàn tiền thủ công (Manual Refund):
  - Ứng dụng web không có tính năng tự động chuyển tiền ngân hàng ra bên ngoài. Toàn bộ hoạt động chuyển tiền hoàn đều do con người thực hiện thủ công.
  - Khi phát sinh đơn hàng cần hoàn tiền hợp lệ, hệ thống ghi nhận trạng thái thanh toán là "Chờ hoàn tiền".
  - Nhân viên chủ động liên hệ khách hàng lấy thông tin tài khoản ngân hàng, mở ứng dụng ngân hàng bên ngoài và thực hiện lệnh chuyển khoản chay trả tiền cho khách.
  - Sau khi chuyển tiền thành công, nhân viên quay lại hệ thống, nhập mã tham chiếu giao dịch ngân hàng kèm thời gian chuyển tiền và bấm xác nhận chuyển trạng thái thanh toán sang "Đã hoàn tiền". Thao tác này lưu vết kiểm toán đầy đủ người thực hiện và thời điểm thực hiện.

---

## PHẦN 6: MA TRẬN 13 TRẠNG THÁI ĐƠN HÀNG VÀ ĐIỀU KIỆN CHUYỂN TIẾP

### 1. Danh Sách 13 Trạng Thái Đơn Hàng Chuẩn
1. Chờ thanh toán (PENDING_PAYMENT): Đơn mới tạo chờ quét mã QR thanh toán đủ tiền hoặc nộp tiền cọc PC tự ráp (thời hạn 30 phút).
2. Chờ duyệt COD (PENDING_COD_CONFIRMATION): Đơn COD thông thường chờ Quản trị viên gọi điện thoại xác nhận.
3. Đã xác nhận (CONFIRMED): Đơn đã nhận đủ tiền/tiền cọc hoặc đã duyệt COD thành công; đã khóa giữ tồn kho tại chi nhánh xuất hàng.
4. Chuẩn bị linh kiện (PREPARING_COMPONENTS): Quản trị viên kích hoạt chuẩn bị hàng; nhân viên kho nhặt hàng từ kệ. Khóa quyền tự hủy của khách hàng.
5. Đang lắp ráp (ASSEMBLING): Áp dụng cho đơn có chọn dịch vụ lắp ráp máy tính. Trừ Tồn thực tế của các linh kiện thành phần; trạng thái hiển thị phục vụ giám sát tiến độ.
6. Sẵn sàng nhận tại chi nhánh (READY_FOR_PICKUP): Đơn nhận tại quầy đã chuẩn bị/lắp ráp xong, lưu giữ tại quầy chờ khách đến lấy trong vòng 14 ngày.
7. Đang giao hàng (SHIPPING): Đơn giao tận nơi đã đóng gói, trừ Tồn thực tế (nếu chưa ráp) và bàn giao cho đơn vị vận chuyển.
8. Giao hàng thất bại (DELIVERY_FAILED): Đơn vị vận chuyển giao hàng không thành công lần 1 hoặc lần 2.
9. Hàng đang chuyển hoàn (RETURNING): Giao thất bại quá 2 lần hoặc khách từ chối nhận, hàng đang trên đường chở quay về chi nhánh xuất phát.
10. Đã nhận lại tại chi nhánh (RETURNED_TO_BRANCH): Kiện hàng vật lý đã về đến chi nhánh, nhân viên kiểm đếm nguyên vẹn và xác nhận phiếu nhập hoàn kho để phục hồi Tồn thực tế.
11. Hoàn thành (COMPLETED): Đơn hàng kết thúc trọn vẹn; khách đã nhận hàng và cửa hàng đã thu đủ 100% tiền hàng. Kích hoạt quyền đánh giá sản phẩm.
12. Tạm giữ xử lý ngoại lệ (ON_HOLD): Đơn bị dừng tạm thời để con người can thiệp xử lý (chờ kiểm tra chuyển khoản thiếu/sai cú pháp tối đa 24 giờ; hết hàng do chuyển tiền muộn; hoặc quá hạn nhận tại quầy 14 ngày).
13. Đã hủy (CANCELLED): Đơn hàng chấm dứt hoàn toàn kèm lý do giải trình cụ thể.

### 2. Bảng Ma Trận Chuyển Trạng Thái Đơn Hàng

| Trạng Thái Ban Đầu | Trạng Thái Kế Tiếp | Điều Kiện Nghiệp Vụ Bắt Buộc | Tác Nhân Thực Hiện |
| :--- | :--- | :--- | :--- |
| Chờ thanh toán | Đã xác nhận | Khách hàng chuyển khoản đúng và đủ tiền qua mã QR trong 30 phút; khóa giữ tồn kho thành công. | Hệ thống tự động |
| Chờ thanh toán | Đã hủy | Quá 30 phút không nhận được tiền; tự động giải phóng tồn kho tạm giữ và hạn mức mã giảm giá. | Hệ thống tự động |
| Chờ thanh toán | Tạm giữ xử lý ngoại lệ | Khách chuyển thiếu tiền hoặc sai cú pháp; tạm dừng đếm ngược để chờ kiểm tra (tối đa 24 giờ). | Hệ thống tự động |
| Chờ thanh toán | Đã hủy | Khách hàng tự nhấn nút Hủy đơn trên trang tra cứu khi chưa thanh toán. | Khách hàng |
| Chờ duyệt COD | Đã xác nhận | Quản trị viên gọi điện xác thực thông tin đơn thành công và chi nhánh có đủ hàng để khóa giữ tồn. | Quản trị viên |
| Chờ duyệt COD | Đã hủy | Khách hàng tự nhấn Hủy đơn trên trang tra cứu, hoặc Quản trị viên liên hệ không được/khách báo hủy. | Khách hàng / Quản trị viên |
| Đã xác nhận | Chuẩn bị linh kiện | Quản trị viên kích hoạt chuẩn bị hàng; nhân viên kho bắt đầu đi nhặt linh kiện từ kệ kho. | Quản trị viên |
| Đã xác nhận | Đã hủy | Khách hàng tự hủy đơn trước khi đơn vào khâu chuẩn bị; giải phóng tồn tạm giữ và hoàn tiền 100%. | Khách hàng |
| Chuẩn bị linh kiện | Đang lắp ráp | Đơn có chọn dịch vụ lắp ráp PC; hệ thống thực hiện lệnh xuất kho trừ Tồn thực tế của toàn bộ linh kiện. | Quản trị viên |
| Chuẩn bị linh kiện | Đang giao hàng | Đơn giao tận nơi không có lắp ráp; hệ thống trừ Tồn thực tế và bàn giao cho bên vận chuyển. | Quản trị viên |
| Chuẩn bị linh kiện | Sẵn sàng nhận tại chi nhánh | Đơn nhận tại quầy không có lắp ráp; hàng đưa ra quầy và vẫn bảo lưu ở mức Tồn tạm giữ. | Quản trị viên |
| Chuẩn bị linh kiện | Đã hủy | Hủy đơn ngoại lệ do Quản trị viên thực hiện (kèm lý do); nếu là đơn PC tự ráp có cọc thì tịch thu cọc. | Quản trị viên |
| Đang lắp ráp | Đang giao hàng | Lắp ráp hoàn tất; đóng gói máy và bàn giao cho bên vận chuyển (không trừ kho lần 2). | Quản trị viên |
| Đang lắp ráp | Sẵn sàng nhận tại chi nhánh | Lắp ráp hoàn tất; chuyển máy ra quầy giao dịch chờ khách đến lấy (không trừ kho lần 2). | Quản trị viên |
| Sẵn sàng nhận tại chi nhánh | Hoàn thành | Khách đến quầy nhận máy, kiểm tra hàng hài lòng, thu đủ tiền còn lại; trừ Tồn thực tế nếu là đơn chưa ráp. | Quản trị viên |
| Sẵn sàng nhận tại chi nhánh | Tạm giữ xử lý ngoại lệ | Đơn hàng lưu tại quầy quá 14 ngày khách không đến lấy; hệ thống chuyển sang diện quá hạn nhận hàng. | Hệ thống tự động |
| Đang giao hàng | Giao hàng thất bại | Đơn vị vận chuyển báo giao không thành công lần đầu; cập nhật thất bại và hẹn giao lại. | Quản trị viên |
| Đang giao hàng | Hoàn thành | Giao hàng thành công đến tay người mua và thu đủ toàn bộ số tiền COD còn lại (nếu có). | Quản trị viên |
| Giao hàng thất bại | Đang giao hàng | Xác nhận giao lại lần 2 sau khi đã thống nhất thời gian với khách hàng. | Quản trị viên |
| Giao hàng thất bại | Hàng đang chuyển hoàn | Giao thất bại quá 2 lần hoặc khách từ chối nhận hàng; bắt đầu vận chuyển quay về chi nhánh. | Quản trị viên |
| Hàng đang chuyển hoàn | Đã nhận lại tại chi nhánh | Kiện hàng đã về đến chi nhánh; kiểm đếm đủ 100% nguyên vẹn và xác nhận phiếu nhập hoàn kho. | Quản trị viên |
| Đã nhận lại tại chi nhánh | Đã hủy | Sau khi đã nhập kho hoàn trả đầy đủ, Quản trị viên hủy đơn; tiền cọc PC bị tịch thu, tiền hàng trả trước được hoàn lại. | Quản trị viên |
| Tạm giữ xử lý ngoại lệ | Đã xác nhận / Sẵn sàng nhận | Xử lý xong sự cố ngoại lệ (khách đã nộp bổ sung tiền đúng, hoặc khách đến quầy nhận hàng). | Quản trị viên |
| Tạm giữ xử lý ngoại lệ | Đang giao hàng | Khách đồng ý chuyển từ nhận tại quầy sang giao tận nơi, đã thanh toán phí vận chuyển phát sinh. | Quản trị viên |
| Tạm giữ xử lý ngoại lệ | Đã hủy | Quá hạn 24 giờ kiểm tra thanh toán không giải quyết được, hoặc khách từ chối tiếp tục; hoàn tiền đã nhận cho khách. | Quản trị viên |

---

## PHẦN 7: BẢNG THAM CHIẾU MÃ QUY TẮC NGHIỆP VỤ CHUẨN (BUSINESS LOGIC CODES)

Bảng dưới đây ánh xạ các mã quy tắc chuẩn từ thư mục nghiệp vụ .agents/skills/business-logic:

| Nhóm Quy Tắc | Mã Quy Tắc | Nội Dung Cốt Lõi | Tệp Quy Tắc Nguồn |
| :--- | :--- | :--- | :--- |
| Phạm vi cốt lõi | CORE-001 đến CORE-004 | Quyết định FQ01 - FQ36 có hiệu lực cao nhất; phạm vi nằm ngoài MVP phải trả về kết quả không hỗ trợ rõ ràng. | [core-scope.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/.agents/skills/business-logic/features/core-scope.md) |
| Định danh khách hàng | CUS-001 đến CUS-016 | Mua hàng không cần đăng nhập; xác thực email và điện thoại; tạo hồ sơ Customer khi chốt đơn; tài khoản mới nhận Customer mới. | [customer-identity.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/.agents/skills/business-logic/features/customer-identity.md) |
| Danh mục & PC Builder | CAT-001 đến PCB-008 | Cấu trúc Danh mục -> Template -> SKU; thông số kỹ thuật động; PC là BOM ảo; không lưu build; Đang lắp ráp chỉ là trạng thái giám sát. | [catalog-and-pc-builds.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/.agents/skills/business-logic/features/catalog-and-pc-builds.md) |
| Giá & Khuyến mãi | PRC-001 đến PRO-014 | Một giá niêm yết toàn hệ thống; tối đa 1 coupon/đơn; khuyến mãi tự động theo sản phẩm; khóa bản chụp giá khi tạo đơn. | [pricing-and-promotions.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/.agents/skills/business-logic/features/pricing-and-promotions.md) |
| Giỏ hàng & Thanh toán | CHK-001 đến PAY-020 | Đơn hàng xuất từ 1 chi nhánh duy nhất; QR động 30 phút; cọc PC tự ráp 10% (tối thiểu 500.000 VNĐ); hoàn tiền thủ công ngoài app. | [checkout-and-payments.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/.agents/skills/business-logic/features/checkout-and-payments.md) |
| Tồn kho & Điều chuyển | INV-001 đến TRF-006 | Quản lý 4 trạng thái tồn kho; cấm âm kho; quản lý mã sê-ri; điều chuyển 3 bước nhận đủ 100%; tính giá vốn bình quân gia quyền. | [inventory-and-transfers.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/.agents/skills/business-logic/features/inventory-and-transfers.md) |
| Mua hàng nhà cung cấp | PUR-001 đến PUR-016 | PO gắn với 1 chi nhánh; nhận đủ 100% một lần duy nhất; giao thiếu thì hủy PO cũ tạo PO mới theo số thực nhận; xuất trả hàng nhà cung cấp đối chiếu phiếu nhập gốc (PUR-011 đến PUR-014). | [purchasing.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/.agents/skills/business-logic/features/purchasing.md) |
| Đơn hàng & Vận hành | ORD-001 đến ORD-026 | 13 trạng thái đơn hàng; trừ tồn kho đúng thời điểm; quyền tự hủy khóa từ khâu chuẩn bị; giao thất bại tối đa 2 lần; thu hồi kho khi về chi nhánh. | [orders-and-fulfillment.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/.agents/skills/business-logic/features/orders-and-fulfillment.md) |
| Đánh giá & Thông báo | REV-001 đến NOT-007 | Đánh giá chỉ dành cho đơn Hoàn thành (1 review/dòng hàng, có thể sửa); không có khiếu nại/trả hàng; gửi thông báo sự kiện đơn hàng. | [reviews-and-notifications.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/.agents/skills/business-logic/features/reviews-and-notifications.md) |

---

## PHẦN 8: CÂU HỎI THƯỜNG GẶP VỀ NGHIỆP VỤ CỐT LÕI (CORE BUSINESS FAQS)

### Câu Hỏi 1: Tại sao hệ thống MVP không hỗ trợ lưu lại cấu hình PC tự chọn (Saved Builds) hoặc chia sẻ lên mạng xã hội?
- Trả lời: Trong phạm vi MVP, mục tiêu cốt lõi của công cụ PC Builder là hỗ trợ người mua phối ghép nhanh dàn linh kiện tương thích để đưa thẳng vào giỏ hàng và tiến hành đặt mua. Việc lưu trữ nhiều bản thảo cấu hình, chia sẻ liên kết công khai hoặc quản trị cộng đồng cấu hình đòi hỏi hệ thống quản lý trạng thái phức tạp và lưu trữ phiên bản linh kiện thay đổi liên tục, do đó được xếp vào lộ trình nâng cấp ở giai đoạn mở rộng tiếp theo.

### Câu Hỏi 2: Tại sao khách hàng không có quyền tạo yêu cầu trả hàng, đổi hàng hay khiếu nại trực tuyến sau khi đã nhận máy?
- Trả lời: Đối với các mặt hàng linh kiện công nghệ cao và máy tính lắp ráp, rủi ro phát sinh từ việc người dùng tự lắp sai cách hoặc cắm sai nguồn điện rất lớn. Để đảm bảo an toàn vận hành trong giai đoạn MVP, hệ thống chỉ ghi nhận trạng thái đến khi đơn hàng Hoàn thành. Toàn bộ các yêu cầu bảo hành hoặc xử lý sự cố phần cứng sau khi mua sẽ được thực hiện trực tiếp giữa khách hàng và bộ phận chăm sóc khách hàng của cửa hàng qua kênh hỗ trợ trực tiếp bên ngoài hệ thống.

### Câu Hỏi 3: Tại sao đơn hàng máy tính tự ráp chọn thanh toán COD lại bắt buộc phải đặt cọc trước 10%?
- Trả lời: Một bộ PC tự ráp gồm nhiều linh kiện giá trị cao. Khi đơn hàng bước vào khâu xử lý, kỹ thuật viên phải bóc vỏ hộp và xé seal niêm phong của từng linh kiện để lắp vào khung máy. Nếu khách hàng từ chối nhận hàng khi shipper giao đến nơi, các linh kiện đã bị bóc seal sẽ bị mất giá trị thương mại nghiêm trọng và cửa hàng phải chịu toàn bộ phí tháo dỡ, lắp ráp. Khoản tiền cọc tối thiểu 10% (tối thiểu 500.000 VNĐ) là ràng buộc trách nhiệm để bảo đảm đơn hàng được tiếp nhận nghiêm túc. Khoản tiền cọc này sẽ bị tịch thu nếu đơn bị hủy từ khâu chuẩn bị linh kiện trở đi.

### Câu Hỏi 4: Tại sao mỗi đơn hàng chỉ được xuất từ duy nhất một chi nhánh mà không cho phép tách đơn giao từ nhiều chi nhánh?
- Trả lời: Quy tắc xuất kho đơn chi nhánh (Single-origin Invariant) giúp tối ưu hóa chi phí vận chuyển cho khách hàng, tránh việc một đơn hàng bị tính nhiều lần phí ship và giảm thiểu tối đa rủi ro thất lạc hàng hóa. Nếu không có chi nhánh nào có đủ 100% linh kiện, giỏ hàng được giữ nguyên để Quản trị viên thực hiện lệnh điều chuyển kho gom hàng về một chi nhánh trước khi khách đặt lại.

### Câu Hỏi 5: Tại sao khi nhà cung cấp giao thiếu hàng, hệ thống bắt buộc phải hủy đơn mua cũ và tạo đơn mua mới thay vì nhận hàng từng phần?
- Trả lời: Quy tắc nhận hàng nguyên vẹn một lần (Exact Receipt Invariant) đảm bảo sổ kho và giá vốn hàng tồn kho luôn phản ánh chính xác 100% thực tế tại từng thời điểm. Việc cho phép nhận hàng từng phần sẽ làm phát sinh các đơn mua treo dở dang, sai lệch công nợ dự kiến và gây sai lệch nghiêm trọng cho thuật toán tính giá vốn bình quân gia quyền. Do đó, hủy đơn cũ với lý do giải trình rõ ràng và tạo đơn mới đúng số lượng thực nhận là giải pháp chuẩn mực để quản trị minh bạch.

### Câu Hỏi 6: Tính năng Xuất trả Nhà cung cấp (Supplier Return) được hỗ trợ ở mức độ nào trong MVP?
- Trả lời: Trong phạm vi MVP, hệ thống hỗ trợ nghiệp vụ Xuất trả Nhà cung cấp đối với các linh kiện cách ly hỏng lỗi (quarantineDamaged) hoặc linh kiện tồn kho cần xuất trả, dựa trên việc đối chiếu chính xác phiếu nhập kho gốc đã hợp lệ theo quy tắc PUR-011 đến PUR-014. Khi xác nhận phiếu xuất trả, hệ thống tự động ghi nhận phiếu xuất kho đảo ngược và giảm trừ tồn kho tương ứng. Các nghiệp vụ tài chính phát sinh sau đó như cấn trừ công nợ, biên bản ghi có (Credit Note) hoặc theo dõi đổi hàng bù trừ không được tự động hóa trong MVP mà được thỏa thuận thủ công ngoài hệ thống.

### Câu Hỏi 7: Tại sao ứng dụng không tích hợp cổng tự động hoàn tiền mà nhân viên phải tự chuyển khoản thủ công bên ngoài?
- Trả lời: Trong giai đoạn MVP, nhằm loại trừ triệt để nguy cơ gian lận tài chính, tránh lỗi kỹ thuật bắn nhầm tiền tự động từ tài khoản doanh nghiệp và giảm bớt độ phức tạp khi tích hợp cổng tài chính, toàn bộ việc hoàn tiền đều do con người kiểm tra. Nhân viên cửa hàng chủ động liên hệ khách hàng để xác minh số tài khoản, sử dụng app ngân hàng chuyển khoản chay ngoài đời thực, sau đó quay lại hệ thống nhập mã tham chiếu giao dịch và thời gian chuyển để lưu vết kiểm toán đầy đủ.

### Câu Hỏi 8: Trạng thái "Đang lắp ráp" (ASSEMBLING) được quản lý như thế nào trong hệ thống?
- Trả lời: Trạng thái "Đang lắp ráp" chỉ đóng vai trò là một mốc trạng thái chuyển tiếp trên tiến trình xử lý đơn hàng. Nó cho phép Quản trị viên và người mua biết được đơn hàng đang được lắp ráp, đồng thời kích hoạt lệnh trừ Tồn kho thực tế của các linh kiện thành phần cấu thành dàn máy. Hệ thống không đi sâu vào việc lập lệnh sản xuất công xưởng, không phân công thợ kỹ thuật, không kiểm soát thời gian ráp và không có checklist kiểm tra lỗi kỹ thuật nội bộ trong MVP.

### Câu Hỏi 9: Hệ thống quản lý khâu vận chuyển hàng hóa đến mức độ nào trong giai đoạn hiện tại?
- Trả lời: Hệ thống không tích hợp trực tiếp qua API của các công ty chuyển phát nhanh (như GHTK, GHN, Viettel Post...), không theo dõi hành trình xe giao hàng theo thời gian thực và không quản lý đội xe riêng. Quản trị viên chỉ cập nhật trạng thái đơn hàng trên hệ thống (chuyển sang Đang giao hàng khi bàn giao bưu tá, chuyển sang Hoàn thành khi khách đã nhận, hoặc chuyển sang Giao thất bại khi bên vận chuyển phản hồi sự cố).
