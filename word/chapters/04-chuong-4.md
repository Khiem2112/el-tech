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

