# QA — EL-TECH Business Logic

**Feature / Context:** Khảo sát nghiệp vụ cho hệ thống bán linh kiện PC, bán PC dựng sẵn và hỗ trợ khách tự cấu hình/lắp ráp PC.  
**Project path:** `C:\University\Education program\HK1-nam-4\web-nang-cao\project`  
**Last updated:** 2026-10-18  
**Status:** `APPROVED — READY FOR BUSINESS LOGIC SKILL`

> Tệp này là nguồn câu hỏi chính thức theo workflow `implement-qa`. Không triển khai các phần phụ thuộc vào câu trả lời còn trống.

## Cách trả lời

- Điền trực tiếp sau dòng **Answer** của từng câu.
- Có thể trả lời `A`, `B`, `C`, hoặc mô tả phương án khác.
- Nếu chọn khác đề xuất, hãy ghi ngắn gọn lý do hoặc ví dụ thực tế.
- Nếu chưa thể quyết định, ghi `TBD — <người chịu trách nhiệm> — <hạn chốt>`.
- Nhãn **Recommended** chỉ là phương án khởi đầu để thảo luận, không được coi là quyết định đã duyệt.

Mẫu:

```text
Answer: A
Business reason: Giảm overselling khi hai khách mua SKU cuối cùng.
Exceptions: Đơn bán tại quầy giữ tồn ngay khi nhân viên tạo đơn.
Decision owner: Product Owner
```

## Mức ưu tiên

- **P0 — Blocking:** thiếu câu trả lời sẽ chặn mô hình dữ liệu/state machine hoặc làm thay đổi logic cốt lõi.
- **P1 — MVP:** cần chốt trước khi viết acceptance criteria và triển khai phiên bản đầu.
- **P2 — Later:** phần mở rộng, vẫn cần xác nhận có nằm ngoài MVP hay không.

## Baseline đã biết

- Khách không cần đăng nhập để xem, tìm kiếm và lọc sản phẩm.
- Khách cần cung cấp số điện thoại và email để mua hàng.
- Hàng bán gồm linh kiện lẻ, PC dựng sẵn và cấu hình PC do khách tự chọn.
- Mỗi đơn chỉ được nhập tối đa một mã giảm giá cấp đơn.
- Thanh toán dự kiến gồm QR ngân hàng và COD.
- Tồn kho được theo dõi theo `SKU/sản phẩm bán được + chi nhánh`.
- Hệ thống quản lý xuất kho cho đơn nhưng không quản lý đội vận chuyển hoặc tối ưu tuyến đường.
- Hồ sơ khách hàng chỉ xuất hiện sau giao dịch mua đầu tiên; khách được nhận diện bằng email và số điện thoại.
- Có mua hàng từ nhà cung cấp và nhập vào một chi nhánh.
- Có khuyến mãi cấp đơn và khuyến mãi gắn với sản phẩm.

## Khoảng trống bằng chứng hiện tại

Các skill JTBD và journey mapping yêu cầu quyết định dựa trên nghiên cứu người dùng/vận hành. Hiện dự án chưa có `PRODUCT.md`, dữ liệu phỏng vấn, analytics, chính sách bán hàng, quy trình kho thực tế hoặc flow đã được phê duyệt. Vì vậy:

- Các phương án “Recommended” dưới đây là giả thuyết thiết kế, chưa phải dữ kiện nghiên cứu.
- Cần trả lời Q01–Q04 bằng các tình huống đã xảy ra gần đây, không chỉ bằng mong muốn chung chung.
- Sau khi trả lời, business rules phải ghi rõ nguồn là `Business decision` hay `Validated evidence`.

---

# A. Outcome, JTBD và phạm vi vận hành

### Q01 — [P0] Struggling moment của người mua linh kiện

- **Context:** Danh sách tính năng chưa cho biết khoảnh khắc cụ thể khiến khách tìm đến EL-TECH.
- **Question:** Hãy kể lại một lần gần nhất khách gặp khó khăn khi chọn/mua linh kiện: họ đang làm gì, vướng ở đâu, đã thử giải pháp nào, điều gì làm họ mất niềm tin?
- **Suggested prompts:** Sai socket; không biết PSU đủ công suất; nhiều shop nhưng không biết nơi nào đủ hàng; sợ linh kiện không tương thích; giá thay đổi khi checkout.
- **Answer:** _Điền tình huống thực tế, không trả lời chung chung._
  không biết đầy đủ thông số kỹ thuật của 1 sản phẩm, tự chọn linh kiện tốn thời gian, sợ các linh kiện không tương thích, sợ mua hàng trên web không uy tín, sợ shop quịt mà không giao hàng, không có thông tin về trạng thái hàng đang giao, liệu có giao hàng nhanh và kịp lúc không ?

### Q02 — [P0] Job-to-be-Done chính của người tự build PC

- **Context:** JTBD phải mô tả kết quả khách muốn đạt, không phải tên tính năng “PC Builder”.
- **Question:** Hoàn thiện câu: “Khi ..., tôi muốn ..., để tôi có thể ...”. Kèm tiêu chí khiến khách chọn EL-TECH và lý do khiến họ bỏ sang giải pháp khác.
- **Suggested Options:**
  - **A (Recommended):** Khi có ngân sách và mục đích sử dụng cụ thể, tôi muốn chọn nhanh một cấu hình chắc chắn tương thích, còn hàng và đúng tổng ngân sách để có thể mua mà không cần tự nghiên cứu quá sâu.
  - **B:** Tập trung vào người đã am hiểu, cần công cụ kiểm tra chéo thông số và tồn kho.
  - **C:** Tập trung vào tư vấn viên bán hàng dựng cấu hình thay khách.
- **Answer:** A

### Q03 — [P0] Job-to-be-Done chính của nhân viên vận hành

- **Context:** Một trải nghiệm mua trơn tru phụ thuộc vào phân bổ kho, soạn hàng, lắp ráp và bàn giao phía sau.
- **Question:** Công việc quan trọng nhất mà quản lý/nhân viên cần hoàn thành là gì và điều gì đang gây sai sót hoặc mất thời gian?
- **Suggested Options:**
  - **A (Recommended):** Biết chính xác đơn nào cần làm gì tiếp theo, hàng nằm ở đâu, ai chịu trách nhiệm và ngoại lệ nào cần xử lý.
  - **B:** Ưu tiên tối đa tốc độ cập nhật catalog và giá.
  - **C:** Ưu tiên kiểm soát mua hàng và tồn kho.
- **Answer:** A

### Q04 — [P0] Phạm vi kênh bán của MVP

- **Context:** Kênh bán quyết định cách giữ tồn, tạo khách hàng và thanh toán.
- **Question:** MVP hỗ trợ kênh nào?
- **Suggested Options:**
  - **A (Recommended):** Website online + giao hàng + nhận tại chi nhánh; chưa có POS.
  - **B:** Chỉ website online và giao hàng.
  - **C:** Website + nhận tại cửa hàng + bán trực tiếp/POS dùng chung tồn kho.
- **Answer:** A

### Q05 — [P1] Phạm vi địa lý và dịch vụ lắp ráp

- **Context:** Địa bàn ảnh hưởng COD, phí giao hàng và cam kết thời gian.
- **Question:** Bán/giao ở đâu? Dịch vụ lắp ráp gồm phần cứng, cập nhật BIOS, stress test, cài hệ điều hành, đi dây, giao hộp linh kiện hay dịch vụ nào khác?
- **Suggested Options:**
  - **A (Recommended):** Chốt từng hạng mục dịch vụ và SLA; chưa hứa dịch vụ không có người chịu trách nhiệm.
  - **B:** “Lắp hoàn chỉnh” như một dịch vụ chung, chưa tách checklist.
  - **C:** Chỉ kiểm tra tương thích; khách tự lắp.
- **Answer:** nếu mua linh kiện lẻ thì chỉ giao như kiện hàng bình thường, nếu mua cả bộ PC thì khách có thể yêu cầu lắp ráp, kiểm tra tương thích, cài hệ điều hành và driver, cài PC ngay tại phòng khách, lắp màn hình, đi dây điện,... giao cả hộp linh kiện (khách chỉ cần tích lắp ráp toàn bộ là xong, không cần thao tác nhiều)

---

# B. Tài khoản, định danh và hồ sơ khách hàng

### Q06 — [P0] Guest checkout hay bắt buộc tạo tài khoản

- **Context:** “Không cần đăng nhập để xem” và “cần đăng ký SĐT + email để mua” có nhiều cách hiểu.
- **Question:** Trước khi đặt đơn, khách phải làm gì?
- **Suggested Options:**
  - **A (Recommended):** Guest checkout; xác minh số điện thoại, email; tạo hồ sơ khách khi đơn đầu tiên được xác nhận.
  - **B:** Bắt buộc đăng ký tài khoản và đăng nhập trước checkout.
  - **C:** Cho đặt đơn ngay; tự tạo tài khoản/hồ sơ sau mà không xác minh.
- **Answer:** A (lưu ý khi khách đã chốt đặt hàng thì được tính là "đơn đầu tiên được xác nhận" -> đã có hồ sơ khách)

### Q07 — [P0] Quy tắc duy nhất của email và số điện thoại

- **Context:** “Xác định bằng cặp email + phone” chưa nói rõ từng trường có thể trùng hay không.
- **Question:** Ràng buộc định danh chính xác là gì?
- **Suggested Options:**
  - **A (Recommended):** Email duy nhất và số điện thoại cũng duy nhất; một trong hai trùng nhưng trường kia khác thì yêu cầu xác minh/khôi phục tài khoản.
  - **B:** Chỉ đúng toàn bộ cặp mới là một khách; cùng email có thể thuộc nhiều hồ sơ nếu phone khác.
  - **C:** Số điện thoại là định danh chính; email là thuộc tính có thể thay đổi/trùng.
- **Answer:** A

### Q08 — [P0] Xác minh và xung đột định danh

- **Context:** Có thể xảy ra email thuộc khách A nhưng số điện thoại thuộc khách B.
- **Question:** Xác minh bằng OTP nào và xử lý xung đột ra sao?
- **Suggested Options:**
  - **A (Recommended):** OTP số điện thoại + link/OTP email; chặn tự động gộp hồ sơ, chuyển sang quy trình xác minh thủ công.
  - **B:** Chỉ OTP số điện thoại; cập nhật email sau.
  - **C:** Không xác minh trong MVP; nhân viên xử lý khi phát sinh.
- **Answer:** A

### Q09 — [P1] Thời điểm tạo hồ sơ khách hàng

- **Context:** Đơn QR có thể hết hạn; đơn COD có thể bị từ chối.
- **Question:** “Mua đơn đầu tiên” được tính ở mốc nào?
- **Suggested Options:**
  - **A (Recommended):** Khi đơn QR đã thanh toán hoặc đơn COD được nhân viên xác nhận.
  - **B:** Ngay khi bấm đặt hàng.
  - **C:** Chỉ khi giao hàng thành công.
- **Answer:** A

### Q10 — [P1] Đổi thông tin và hợp nhất hồ sơ

- **Context:** Đổi email/phone ảnh hưởng lịch sử đơn, giới hạn voucher và đánh giá đã mua.
- **Question:** Khách đổi email/phone bằng cách nào? Có cho gộp hai hồ sơ không, ai được làm và có audit không?
- **Suggested Options:**
  - **A (Recommended):** Xác minh cả thông tin cũ và mới; gộp hồ sơ chỉ do nhân viên có quyền, có audit và không làm mất lịch sử.
  - **B:** Cho khách tự sửa không cần xác minh.
  - **C:** Không cho đổi trong MVP.
- **Answer:** A

---

# C. Catalog, taxonomy, sản phẩm và SKU

### Q11 — [P0] Product, variant và SKU

- **Context:** Tồn kho phải gắn vào đơn vị bán cụ thể, trong khi trang catalog cần gom biến thể dễ hiểu.
- **Question:** Chọn mô hình bán hàng.
- **Suggested Options:**
  - **A (Recommended):** `Product` chứa nội dung chung; `SKU` là biến thể bán được, có giá/barcode/tồn riêng.
  - **B:** Mỗi product chính là một SKU, không có variant.
  - **C:** Mỗi loại sản phẩm có mô hình riêng.
- **Answer:** có 3 table: - product category (màn hình, bàn phím, mainboard, PSU, CPU, RAM,....), dùng để cấu hình các thông số kỹ thuật riêng cho từng loại linh kiện qua một cột json, - product template: chưa thông tin cấu hình chung của 1 loại sản phẩm, có giá gốc, các thông tin chung,... (tham khảo Odoo), ví dụ cấu hình cho GPU RTX 5060Ti của Nvidia - product variant: chưa thông tin hãng sản xuất (1 card RTX 5060Ti có thể được làm bới asus, msi, Gigabyte,...), mỗi product variant quy định giá của sản phẩm đó + kích cỡ + màu sắc, SKU được xác định như một product variant (cần tham khảo kỹ cách thiết các table của Odoo C:\University\Study\Programming\reference\odoo-all\odoo )

### Q12 — [P0] Bộ thuộc tính động theo loại linh kiện

- **Context:** CPU, mainboard, RAM, GPU, case, PSU có schema khác nhau; một số trường còn tham gia kiểm tra tương thích.
- **Question:** Quản trị viên được cấu hình thuộc tính đến mức nào?
- **Suggested Options:**
  - **A (Recommended):** Trường lõi/rule-critical được quản lý có kiểm soát; trường mô tả mở rộng được cấu hình động theo category.
  - **B:** Tất cả thuộc tính đều động và admin tự tạo.
  - **C:** Tất cả thuộc tính được lập trình cố định.
- **Answer:** tham khảo Odoo

### Q13 — [P0] Thay đổi định nghĩa thuộc tính đã có dữ liệu

- **Context:** Xóa/đổi kiểu trường có thể phá bộ lọc và rule tương thích.
- **Question:** Cho phép sửa/xóa thế nào?
- **Suggested Options:**
  - **A (Recommended):** Không xóa vật lý; version/deprecate; chặn đổi kiểu nếu đã có dữ liệu hoặc đang được rule sử dụng.
  - **B:** Admin được sửa/xóa tự do.
  - **C:** Khóa vĩnh viễn sau khi tạo.
- **Answer:** tham khảo Odoo (nói chung là các field tự chọn từng loại sản phẩm sẽ không được lưu như cột dưới db mà lưu dạng json)

### Q14 — [P0] Trường bắt buộc của SKU

- **Context:** Business logic cần biết dữ liệu tối thiểu trước khi SKU được phép bán.
- **Question:** Xác nhận các trường bắt buộc: mã SKU, barcode, tên, brand/model, category, giá, VAT, bảo hành, serial-required, cân nặng/kích thước, trạng thái, ảnh và thông số rule-critical.
- **Suggested Options:**
  - **A (Recommended):** Định nghĩa checklist “publish-ready” riêng theo category; thiếu trường rule-critical thì không được bán.
  - **B:** Chỉ bắt buộc tên, mã và giá.
  - **C:** Admin tự quyết định theo từng sản phẩm.
- **Answer:** một bộ rule chung được lưu ở product template

### Q15 — [P1] Taxonomy và faceted search

- **Context:** E-commerce linh kiện phù hợp IA dạng faceted; category và filter phải dùng ngôn ngữ khách hàng.
- **Question:** Danh mục gốc nào được hỗ trợ và thuộc tính nào được đánh dấu `filterable`, `sortable`, `comparable`, `compatibility-critical`?
- **Suggested Options:**
  - **A (Recommended):** Category là danh sách kiểm soát; filter sinh từ metadata thuộc tính; có quy trình duyệt label và đơn vị.
  - **B:** Filter hard-code cho từng trang.
  - **C:** Tìm kiếm toàn văn là chính, ít filter.
- **Answer:** A

### Q16 — [P1] Trạng thái vòng đời SKU

- **Context:** SKU đã có trong đơn cũ không được biến mất khi ngừng bán.
- **Question:** Chốt trạng thái và hành vi hiển thị.
- **Suggested Options:**
  - **A (Recommended):** `DRAFT → ACTIVE → PAUSED → DISCONTINUED`; đơn cũ giữ snapshot; discontinued vẫn truy cập được qua lịch sử nhưng không thêm mới vào giỏ.
  - **B:** Chỉ active/inactive.
  - **C:** Xóa SKU khỏi hệ thống khi ngừng bán.
- **Answer:** A

---

# D. PC dựng sẵn, PC tùy chọn và compatibility engine

### Q17 — [P0] Mô hình tồn kho của PC dựng sẵn

- **Context:** Cần phân biệt PC lắp sẵn có tồn với BOM ảo được lắp theo đơn.
- **Question:** Bộ PC dựng sẵn hoạt động thế nào?
- **Suggested Options:**
  - **A (Recommended):** Hỗn hợp: kit/BOM lắp theo đơn và PC thành phẩm đã lắp có SKU/serial/tồn riêng.
  - **B:** Chỉ BOM ảo; bán thì trừ từng linh kiện.
  - **C:** Chỉ SKU thành phẩm; lắp xong mới được bán.
- **Answer:** A

### Q18 — [P0] Giá bộ PC

- **Context:** Giá linh kiện thay đổi thường xuyên, nhưng bundle có thể có ưu đãi riêng.
- **Question:** Giá bộ được xác định và snapshot thế nào?
- **Suggested Options:**
  - **A (Recommended):** Tổng giá snapshot của linh kiện + phí dịch vụ − ưu đãi bundle; khóa khi tạo đơn.
  - **B:** Một giá cố định độc lập với linh kiện.
  - **C:** Luôn tính lại theo giá hiện tại cho đến lúc xuất kho.
- **Answer:** A

### Q19 — [P0] Sửa cấu hình PC dựng sẵn

- **Context:** Thay linh kiện có thể làm thay đổi SKU, giá, tương thích và bảo hành.
- **Question:** Khách có được thay linh kiện trong bộ dựng sẵn không?
- **Suggested Options:**
  - **A (Recommended):** Có; khi thay bất kỳ linh kiện, tạo một `Custom Build` mới dựa trên template, không sửa SKU bundle gốc.
  - **B:** Không; chỉ mua đúng bundle.
  - **C:** Cho thay trong danh sách option được admin cấu hình nhưng vẫn là cùng bundle.
- **Answer:** A

### Q20 — [P0] Thành phần bắt buộc và số lượng

- **Context:** Engine cần cardinality cho CPU, mainboard, RAM, storage, GPU, PSU, case, cooling và fan.
- **Question:** Nhóm nào bắt buộc; min/max của từng nhóm; build không GPU rời có hợp lệ khi CPU không có iGPU không?
- **Suggested Options:**
  - **A (Recommended):** Quy tắc min/max cấu hình theo `build type`; engine suy ra GPU bắt buộc nếu CPU không có iGPU.
  - **B:** Một bộ min/max chung cho mọi PC.
  - **C:** Chỉ cảnh báo, không chặn thiếu thành phần.
- **Answer:** C

### Q21 — [P0] Ma trận compatibility

- **Context:** Cần chốt rule nào là lỗi chặn và rule nào là cảnh báo có thể xác nhận.
- **Question:** Phân loại tối thiểu các rule: socket CPU, chipset/generation/BIOS, RAM type/bus/capacity/DIMM, board-case form factor, GPU length/thickness, cooler height/radiator, PSU form factor/wattage/connectors, PCIe/M.2/SATA lanes và số fan.
- **Suggested Options:**
  - **A (Recommended):** Lỗi vật lý/điện/chắc chắn không chạy là `BLOCK`; yêu cầu BIOS hoặc hiệu năng chưa tối ưu là `WARNING`; mọi rule có code và giải thích.
  - **B:** Tất cả không tương thích đều chặn.
  - **C:** Chỉ kiểm tra socket, RAM type và wattage trong MVP.
- **Answer:** không cần kiểm tra tương thích giữa các linh kiện với nhau (tạm thời chưa xử lý chuyện này)

### Q22 — [P0] Công thức PSU

- **Context:** “Tổng TDP” đơn giản có thể không phản ánh transient spike hoặc khuyến nghị GPU.
- **Question:** Nguồn dữ liệu và hệ số dự phòng là gì?
- **Suggested Options:**
  - **A (Recommended):** Dùng max của `(ước tính tải đỉnh × hệ số an toàn)` và `PSU khuyến nghị của GPU`; hệ số được cấu hình/version hóa.
  - **B:** Cộng TDP CPU + GPU + linh kiện rồi thêm phần trăm cố định.
  - **C:** Không tính; chỉ hiển thị wattage.
- **Answer:** C

### Q23 — [P0] Hành vi khi có warning

- **Context:** Warning cần có khả năng giải thích và truy vết nếu khách vẫn tiếp tục.
- **Question:** Khách được tiếp tục thế nào?
- **Suggested Options:**
  - **A (Recommended):** Cho tiếp tục sau khi xác nhận; lưu snapshot warning/version rule vào build và đơn.
  - **B:** Mọi warning đều chặn checkout.
  - **C:** Chỉ hiển thị, không cần xác nhận/lưu vết.
- **Answer:** chỉ lưu vét, không chặn

### Q24 — [P0] Nguồn tồn cho một custom build

- **Context:** Lắp ráp cần đủ linh kiện tại một nơi hoặc có quy trình điều chuyển.
- **Question:** Một build được lấy hàng từ nhiều chi nhánh không?
- **Suggested Options:**
  - **A (Recommended):** Phải gom đủ về một chi nhánh lắp ráp; có thể điều chuyển nội bộ trước khi bắt đầu lắp.
  - **B:** Chỉ được chọn linh kiện đã sẵn ở cùng một chi nhánh.
  - **C:** Cho xuất/giao linh kiện từ nhiều chi nhánh mà không gom.
- **Answer:** không quản lý quy trình lắp ráp, chỉ quản lý tới mức xuất linh kiện để lắp ghép PC và để khách biết trạng thái đơn PC là đang lắp ghép

### Q25 — [P1] Lưu và chia sẻ build

- **Context:** Build đã lưu có thể lỗi thời về giá/tồn/rule.
- **Question:** Khách có được lưu, đặt tên, chia sẻ, clone build không? Khi mở lại phải hiển thị gì?
- **Suggested Options:**
  - **A (Recommended):** Lưu selection; khi mở lại tính lại giá/tồn/compatibility và nêu rõ thay đổi.
  - **B:** Khóa toàn bộ dữ liệu tại lúc lưu.
  - **C:** Không lưu build trong MVP.
- **Answer:** C

---

# E. Giá và khuyến mãi

### Q26 — [P0] Phạm vi bảng giá

- **Context:** Giá toàn hệ thống và giá theo chi nhánh dẫn đến cách checkout khác nhau.
- **Question:** Giá được quản lý ở cấp nào?
- **Suggested Options:**
  - **A (Recommended):** Một giá bán online toàn hệ thống; có hiệu lực theo thời gian; chưa có giá riêng chi nhánh trong MVP.
  - **B:** Giá riêng theo từng chi nhánh.
  - **C:** Giá theo kênh + chi nhánh + nhóm khách.
- **Answer:** A

### Q27 — [P0] Thời điểm khóa giá

- **Context:** Giá có thể đổi sau khi khách thêm giỏ nhưng trước khi trả tiền.
- **Question:** Mốc nào tạo snapshot giá?
- **Suggested Options:**
  - **A (Recommended):** Giỏ chỉ là giá tham khảo; reprice khi checkout; khóa snapshot khi tạo đơn trong thời hạn thanh toán.
  - **B:** Khóa giá từ lúc thêm giỏ.
  - **C:** Có thể đổi đến lúc xuất kho.
- **Answer:** A

### Q28 — [P0] Ý nghĩa “khuyến mãi gán cho sản phẩm”

- **Context:** Có thể là giá sale tự động hoặc coupon chỉ hợp lệ khi mua sản phẩm.
- **Question:** Chọn semantics chính xác.
- **Suggested Options:**
  - **A (Recommended):** Product promotion là giảm tự động cho SKU/category trong thời gian hiệu lực, không cần nhập mã.
  - **B:** Là coupon được gán vào sản phẩm và khách vẫn phải nhập mã.
  - **C:** Là giá sale được ghi trực tiếp lên SKU, không có promotion entity.
- **Answer:** A

### Q29 — [P0] Cộng dồn và thứ tự tính giá

- **Context:** Cần một pipeline duy nhất để cart, order và refund cho cùng kết quả.
- **Question:** Product promotion có cộng với một order coupon không? Thứ tự tính là gì?
- **Suggested Options:**
  - **A (Recommended):** Cho cộng dồn nếu promotion không đánh dấu exclusive; tính `base price → product promo → order coupon allocation → shipping/COD fee → tax/rounding`.
  - **B:** Chỉ chọn lợi ích lớn nhất giữa product promo và coupon.
  - **C:** Luôn cộng dồn không giới hạn.
- **Answer:** A

### Q30 — [P0] Điều kiện và quota coupon

- **Context:** Cần ngăn over-redemption và xác định “mỗi khách”.
- **Question:** Coupon hỗ trợ điều kiện nào và quota được giữ/trừ lúc nào?
- **Suggested Options:**
  - **A (Recommended):** Thời gian, min subtotal, max discount, include/exclude SKU/category, payment/branch/customer eligibility, global quota, per-customer quota; reserve khi tạo đơn và hoàn quota theo policy hủy.
  - **B:** Chỉ code + phần trăm/số tiền + thời hạn.
  - **C:** Admin kiểm tra thủ công.
- **Answer:** A

### Q31 — [P0] Phân bổ giảm giá để hoàn tiền

- **Context:** Trả một dòng hàng cần biết discount thực tế của dòng đó.
- **Question:** Phân bổ order coupon như thế nào?
- **Suggested Options:**
  - **A (Recommended):** Theo tỷ lệ giá trị eligible line sau product promotion, xử lý phần dư làm tròn một cách xác định.
  - **B:** Không phân bổ; hoàn theo giá trước coupon.
  - **C:** Chia đều cho mọi dòng.
- **Answer:** A

### Q32 — [P1] Giá sàn, làm tròn và VAT

- **Context:** Decimal, thuế và nhiều lớp giảm giá có thể tạo giá âm hoặc sai lệch đối soát.
- **Question:** Giá đã gồm VAT chưa, precision/rounding ra sao, có giá sàn không?
- **Suggested Options:**
  - **A (Recommended):** Dùng VND Decimal, không có phần lẻ; không cho tổng discount vượt eligible subtotal; lưu breakdown trước/sau thuế.
  - **B:** Giá chưa VAT, cộng VAT cuối đơn.
  - **C:** Khác theo từng SKU.
- **Answer:** A

---

# F. Giỏ hàng, giữ tồn và phân bổ chi nhánh

### Q33 — [P0] Giỏ guest và merge cart

- **Context:** Khách chưa đăng nhập vẫn cần giỏ hàng; khi xác minh có thể đã có giỏ cũ.
- **Question:** Giỏ tồn tại bao lâu và gộp thế nào?
- **Suggested Options:**
  - **A (Recommended):** Guest cart bằng token; không giữ kho; khi đăng nhập/xác minh thì merge theo SKU/build ID, reprice và revalidate.
  - **B:** Guest cart chỉ trong browser, không merge.
  - **C:** Muốn dùng giỏ phải đăng nhập.
- **Answer:** A

### Q34 — [P0] Thời điểm giữ tồn

- **Context:** Giữ quá sớm làm tồn ảo; quá muộn gây overselling.
- **Question:** Bắt đầu giữ và hết hạn khi nào?
- **Suggested Options:**
  - **A (Recommended):** Không giữ ở cart; transactionally reserve khi tạo order; QR có TTL rõ ràng, COD giữ sau khi order được xác nhận.
  - **B:** Giữ ngay khi thêm giỏ.
  - **C:** Chỉ trừ khi thanh toán thành công.
- **Answer:** A

### Q35 — [P0] Thanh toán đến sau khi reservation hết hạn

- **Context:** Webhook hoặc chuyển khoản có thể đến muộn.
- **Question:** Xử lý tiền và tồn ra sao?
- **Suggested Options:**
  - **A (Recommended):** Ghi nhận tiền idempotent; thử reserve lại; nếu thiếu hàng chuyển `PAYMENT_REVIEW_REQUIRED`, không tự xác nhận fulfillment; nhân viên hoàn tiền hoặc thỏa thuận thay thế.
  - **B:** Tự hoàn tiền ngay.
  - **C:** Cho tồn âm và tiếp tục đơn.
- **Answer:** A

### Q36 — [P0] Một đơn xuất từ bao nhiêu chi nhánh

- **Context:** Multi-origin tăng độ phức tạp của shipping, trạng thái và refund.
- **Question:** Chính sách MVP là gì?
- **Suggested Options:**
  - **A (Recommended):** Một fulfillment origin cho mỗi đơn; ưu tiên chi nhánh đủ hàng, nếu thiếu thì điều chuyển trước.
  - **B:** Một đơn có nhiều fulfillment từ nhiều chi nhánh.
  - **C:** Tự tách thành nhiều đơn con.
- **Answer:** A

### Q37 — [P0] Thuật toán chọn chi nhánh

- **Context:** “Gần nhất” có thể xung đột với “đủ toàn bộ hàng”.
- **Question:** Thứ tự ưu tiên phân bổ là gì?
- **Suggested Options:**
  - **A (Recommended):** Nhận tại shop: shop khách chọn; giao hàng: chi nhánh đủ toàn bộ hàng gần địa chỉ nhất; nếu không có thì đề xuất điều chuyển/backorder.
  - **B:** Luôn chọn chi nhánh gần nhất dù phải tách đơn.
  - **C:** Nhân viên chọn thủ công mọi đơn.
- **Answer:** A

### Q38 — [P1] Backorder và thay thế SKU

- **Context:** Hết hàng có thể dẫn tới hủy, chờ nhập hoặc đổi linh kiện.
- **Question:** Có cho backorder không? Nhân viên được thay SKU sau khi đặt không?
- **Suggested Options:**
  - **A (Recommended):** MVP không tự backorder; mọi thay SKU cần báo giá lại, kiểm tra tương thích lại và khách xác nhận có audit.
  - **B:** Cho backorder với ETA.
  - **C:** Nhân viên tự thay SKU tương đương.
- **Answer:** hết hàng báo khách -> đề xuất hàng khác qua email hoặc SĐT (nếu khách đồng ý thì thay đổi, không thì hủy)

---

# G. Thanh toán QR và COD

### Q39 — [P0] Kiểu QR và nguồn xác nhận tiền

- **Context:** QR tĩnh/manual và QR động/webhook có mức tự động hóa rất khác nhau.
- **Question:** Dùng giải pháp nào trong MVP?
- **Suggested Options:**
  - **A (Recommended):** QR động có order reference duy nhất và webhook/callback; có màn hình review giao dịch lệch.
  - **B:** QR tĩnh; khách upload biên lai; nhân viên xác nhận.
  - **C:** QR động nhưng nhân viên vẫn xác nhận mọi giao dịch.
- **Answer:** A

### Q40 — [P0] Idempotency và giao dịch lệch

- **Context:** Callback có thể lặp, đến sai số tiền hoặc tham chiếu sai.
- **Question:** Chốt rule xử lý.
- **Suggested Options:**
  - **A (Recommended):** Unique provider transaction ID; callback lặp không tạo payment mới; đúng reference nhưng thiếu/thừa tiền chuyển review; không tự gắn giao dịch mơ hồ.
  - **B:** Giao dịch mới nhất ghi đè trạng thái.
  - **C:** Tất cả do nhân viên đối soát.
- **Answer:** A

### Q41 — [P0] Chính sách COD

- **Context:** PC lắp theo yêu cầu có rủi ro bom hàng cao hơn linh kiện lẻ.
- **Question:** COD bị giới hạn theo giá trị, địa bàn, lịch sử khách hoặc loại hàng không? Custom build có cần cọc?
- **Suggested Options:**
  - **A (Recommended):** Cấu hình custom/đơn giá trị cao yêu cầu cọc; COD có hạn mức và chặn khách có lịch sử giao thất bại.
  - **B:** Mọi đơn đều được COD không cần cọc.
  - **C:** Không hỗ trợ COD cho PC lắp ráp.
- **Answer:** A

### Q42 — [P0] Trạng thái thanh toán và hoàn tiền

- **Context:** Payment state không nên bị trộn với order/shipping state.
- **Question:** Xác nhận state tối thiểu và actor chuyển state.
- **Suggested Options:**
  - **A (Recommended):** `UNPAID → PENDING → PAID → PARTIALLY_REFUNDED/REFUNDED`; terminal khác gồm `FAILED`, `EXPIRED`; gateway cập nhật tự động, hoàn tiền cần quyền và audit.
  - **B:** Chỉ `UNPAID/PAID`.
  - **C:** Trạng thái thanh toán dùng chung với trạng thái đơn.
- **Answer:** A

---

# H. Order, fulfillment, assembly và giao hàng

### Q43 — [P0] Tách state machine

- **Context:** Một đơn đã trả tiền vẫn có thể chưa phân bổ kho; một kiện giao thất bại không đồng nghĩa payment thất bại.
- **Question:** Có đồng ý tách `Order`, `Payment`, `Fulfillment`, `Assembly` và `Return/RMA` state không?
- **Suggested Options:**
  - **A (Recommended):** Tách độc lập, order hiển thị trạng thái tổng hợp cho khách.
  - **B:** Dùng một trạng thái duy nhất cho toàn bộ vòng đời.
  - **C:** Chỉ tách payment; các state khác gộp vào order.
- **Answer:** B

### Q44 — [P0] Vòng đời Order

- **Context:** Cần durable states và terminal outcomes.
- **Question:** Chốt vòng đời order.
- **Suggested Options:**
  - **A (Recommended):** `PENDING_PAYMENT/PENDING_COD_CONFIRMATION → CONFIRMED → PROCESSING → COMPLETED`; terminal/exception: `CANCELLED`, `ON_HOLD`; hậu mãi dùng Return/RMA riêng.
  - **B:** Dùng trạng thái giao hàng làm trạng thái đơn.
  - **C:** Khác — ghi đầy đủ transition.
- **Answer:** A nhưng không có luồng Return/RMA

### Q45 — [P0] Vòng đời Fulfillment/giao hàng

- **Context:** Cần trải nghiệm theo dõi gần Shopee nhưng không quản lý tuyến đường.
- **Question:** Chốt state người dùng nhìn thấy và state nội bộ.
- **Suggested Options:**
  - **A (Recommended):** `UNALLOCATED → ALLOCATED → PICKING → ASSEMBLY/QC (nếu có) → READY_TO_HANDOFF → HANDED_TO_CARRIER → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED`; exception: `DELIVERY_FAILED`, `REDELIVERY`, `RETURNING`, `RETURNED`, `LOST`.
  - **B:** Chỉ `PROCESSING/SHIPPING/DELIVERED`.
  - **C:** Đồng bộ nguyên trạng thái từ từng carrier.
- **Answer:** A

### Q46 — [P0] Quyền chuyển trạng thái và điều kiện

- **Context:** Mỗi transition phải có owner, precondition, side effect và khả năng hoàn tác.
- **Question:** Ai được xác nhận COD, allocate branch, pick, xuất kho, bàn giao, đánh dấu giao thành công, hủy và hoàn tiền?
- **Suggested Options:**
  - **A (Recommended):** Role-based; transition server kiểm tra precondition; mọi transition consequential có actor/time/reason; không sửa state trực tiếp.
  - **B:** Admin làm mọi việc.
  - **C:** Bất kỳ nhân viên chi nhánh nào cũng được chuyển state.
- **Answer:** A

### Q47 — [P0] Thời điểm trừ tồn thực tế

- **Context:** Reservation và on-hand phải thay đổi tại các mốc khác nhau.
- **Question:** Mốc nào giảm `on_hand`?
- **Suggested Options:**
  - **A (Recommended):** Reserve khi order đủ điều kiện; giảm on-hand và release reserved khi xác nhận phiếu xuất/bàn giao nội bộ cho fulfillment.
  - **B:** Giảm on-hand ngay khi tạo đơn.
  - **C:** Chỉ giảm khi khách nhận hàng.
- **Answer:** A

### Q48 — [P0] Assembly order và QC

- **Context:** Lắp ráp tiêu hao linh kiện và tạo một máy có lịch sử/serial.
- **Question:** Khi nào tạo lệnh lắp; các state và checklist QC là gì?
- **Suggested Options:**
  - **A (Recommended):** Tạo sau khi order confirmed và đủ linh kiện tại branch; `WAITING_COMPONENTS → READY → ASSEMBLING → TESTING → PASSED/FAILED → HANDED_OFF`; lưu kỹ thuật viên, serial, test result và failure reason.
  - **B:** Lắp ráp chỉ là ghi chú trong order.
  - **C:** Tạo PC thành phẩm trước rồi nhập kho, không lắp theo đơn.
- **Answer:** B

### Q49 — [P0] Linh kiện lỗi trong lúc lắp

- **Context:** Cần xử lý stock, replacement, chênh giá và ETA.
- **Question:** Hệ thống làm gì khi QC phát hiện lỗi?
- **Suggested Options:**
  - **A (Recommended):** Chuyển serial lỗi sang quarantine; thử cấp cùng SKU; nếu đổi SKU/giá/ETA phải có khách xác nhận; lưu toàn bộ trace.
  - **B:** Kỹ thuật viên tự thay SKU tương đương.
  - **C:** Hủy toàn bộ đơn.
- **Answer:** Không quản lý lỗi khi lắp ráp linh kiện

### Q50 — [P1] Carrier integration

- **Context:** Dự án không quản lý vận chuyển nhưng vẫn cần tracking.
- **Question:** Trạng thái đến từ API/webhook carrier hay cập nhật thủ công?
- **Suggested Options:**
  - **A (Recommended):** MVP cho nhập carrier + tracking code và cập nhật webhook nếu nhà cung cấp hỗ trợ; giữ raw status + mapped status nội bộ.
  - **B:** Chỉ nhân viên cập nhật thủ công.
  - **C:** Chưa theo dõi sau khi bàn giao.
- **Answer:** giao diện admin chỉ thao tác chuyển đổi trạng thái của một đơn hàng, đã nhận đơn -> đang chuẩn bị linh kiện -> đang lắp ráp -> đang giao -> đã giao hàng hoàn thành

---

# I. Tồn kho, serial, điều chuyển và kiểm kê

### Q51 — [P0] Các bucket tồn kho

- **Context:** Một con số “quantity” không đủ cho order, inbound, damaged và transfer.
- **Question:** Chốt bucket và công thức available.
- **Suggested Options:**
  - **A (Recommended):** Theo SKU + branch có `on_hand`, `reserved`, `quarantine/damaged`; `available = on_hand − reserved − quarantine`; incoming/in-transit lấy từ chứng từ, không cộng available trước khi nhận.
  - **B:** Chỉ `quantity`.
  - **C:** Thêm bucket riêng cho display/open-box ngay MVP.
- **Answer:** A

### Q52 — [P0] Sổ kho và tồn âm

- **Context:** Cần truy vết mọi thay đổi và ngăn race condition.
- **Question:** Có cho tồn âm hoặc sửa quantity trực tiếp không?
- **Suggested Options:**
  - **A (Recommended):** Không tồn âm; mọi thay đổi qua immutable inventory transaction có reference/reason; balance cập nhật transactionally.
  - **B:** Quản lý chi nhánh được cho tồn âm.
  - **C:** Admin sửa quantity trực tiếp.
- **Answer:** A

### Q53 — [P0] Quản lý serial

- **Context:** CPU/GPU/mainboard/PSU có thể cần bảo hành theo serial; RAM/SSD có thể theo bộ/serial tùy chính sách.
- **Question:** Category nào bắt buộc serial và ghi nhận ở mốc nào?
- **Suggested Options:**
  - **A (Recommended):** `serialRequired` theo category/SKU; capture lúc nhận hàng, xác nhận khi pick/xuất, liên kết order line và assembly; serial duy nhất toàn hệ thống và có lịch sử location/status.
  - **B:** Chỉ ghi serial lúc bán.
  - **C:** Không quản lý serial trong MVP.
- **Answer:** A

### Q54 — [P0] Điều chuyển chi nhánh

- **Context:** Custom build có thể cần gom hàng; chênh lệch trong vận chuyển phải truy vết.
- **Question:** Chốt workflow transfer.
- **Suggested Options:**
  - **A (Recommended):** `REQUESTED → APPROVED → SHIPPED → IN_TRANSIT → RECEIVED`; có `PARTIALLY_RECEIVED`, discrepancy và cancel trước shipped; stock đổi bucket theo state.
  - **B:** Trừ branch nguồn và cộng branch đích ngay khi tạo phiếu.
  - **C:** Không hỗ trợ điều chuyển trong MVP.
- **Answer:** A

### Q55 — [P1] Kiểm kê và điều chỉnh

- **Context:** Chênh lệch kiểm kê không được che mất lịch sử.
- **Question:** Ai được kiểm kê/điều chỉnh, có cần phê duyệt và reason code không?
- **Suggested Options:**
  - **A (Recommended):** Count session theo branch/location; freeze hoặc record cut-off; adjustment cần reason và phê duyệt nếu vượt ngưỡng; audit đầy đủ.
  - **B:** Quản lý branch sửa balance trực tiếp.
  - **C:** Ngoài MVP.
- **Answer:** C

---

# J. Nhà cung cấp, mua hàng và nhập kho

### Q56 — [P0] Vòng đời Purchase Order

- **Context:** PO và receipt cần tách để nhận hàng nhiều lần.
- **Question:** Chốt state PO.
- **Suggested Options:**
  - **A (Recommended):** `DRAFT → SUBMITTED → APPROVED → SENT/CONFIRMED → PARTIALLY_RECEIVED → RECEIVED → CLOSED`; terminal `CANCELLED`.
  - **B:** Chỉ `OPEN/CLOSED`.
  - **C:** Không có phê duyệt PO.
- **Answer:** C

### Q57 — [P0] Phạm vi PO và nhận từng phần

- **Context:** Một PO tới nhiều branch phức tạp hơn receipt và giá vốn.
- **Question:** Một PO giao cho một hay nhiều chi nhánh? Có cho partial receipt không?
- **Suggested Options:**
  - **A (Recommended):** Mỗi PO có một receiving branch; cho nhiều receipt/partial receipt; muốn chia branch thì tạo PO riêng.
  - **B:** Một PO chia nhiều branch.
  - **C:** Phải nhận đủ một lần.
- **Answer:** 1 PO chỉ có 1 branch và chỉ nhận 1 lần, muốn chia branch thì tạo stock move (tham khảo Odoo)

### Q58 — [P0] Sai lệch khi nhận hàng

- **Context:** Có thể thiếu/thừa/sai SKU/sai serial/hàng lỗi.
- **Question:** Ai chấp nhận discrepancy và hàng vào bucket nào?
- **Suggested Options:**
  - **A (Recommended):** Receipt ghi actual; hàng sai/lỗi vào quarantine, không available; thừa hàng cần approval; serial trùng bị chặn; PO giữ mở cho phần thiếu.
  - **B:** Sửa PO theo hàng thực nhận.
  - **C:** Không cho lưu receipt nếu không khớp hoàn toàn.
- **Answer:** không quản lý kiểm kê hàng nhập

### Q59 — [P0] Giá vốn

- **Context:** Giá vốn ảnh hưởng báo cáo lợi nhuận và hoàn/return.
- **Question:** Dùng phương pháp nào?
- **Suggested Options:**
  - **A (Recommended):** Bình quân gia quyền theo SKU + branch, dùng Decimal; landed cost có thể bổ sung sau.
  - **B:** FIFO.
  - **C:** Specific identification theo serial.
  - **D:** Chưa quản lý giá vốn trong MVP.
- **Answer:** A

### Q60 — [P1] Supplier return

- **Context:** Hàng lỗi lúc nhập hoặc bảo hành cần trả nhà cung cấp.
- **Question:** Có quy trình return-to-vendor trong MVP không?
- **Suggested Options:**
  - **A (Recommended):** Có state đơn giản, liên kết receipt/serial, giảm quarantine khi shipped và ghi kết quả credit/replacement.
  - **B:** Theo dõi ngoài hệ thống.
  - **C:** Chỉ ghi inventory adjustment.
- **Answer:** A (tham khảo luồng trả hàng từ Odoo)

---

# K. Hủy, đổi trả, bảo hành và đánh giá

### Q61 — [P0] Hủy đơn

- **Context:** Hủy sau khi trả tiền/xuất kho/lắp ráp có side effect khác nhau.
- **Question:** Khách tự hủy đến state nào; sau đó ai duyệt?
- **Suggested Options:**
  - **A (Recommended):** Khách tự hủy trước `PROCESSING`; sau đó tạo request; hệ thống release reservation, restore coupon theo policy, và tạo refund nếu đã trả; không hủy trực tiếp hàng đã xuất.
  - **B:** Khách hủy bất kỳ lúc nào trước delivered.
  - **C:** Chỉ nhân viên được hủy.
- **Answer:** A

### Q62 — [P0] Đổi trả và hoàn một phần

- **Context:** Trả linh kiện trong bundle/custom build ảnh hưởng discount, phí lắp và tính nguyên vẹn của máy.
- **Question:** Có cho trả một phần không và refund tính thế nào?
- **Suggested Options:**
  - **A (Recommended):** Linh kiện lẻ cho partial return theo policy; bundle/custom PC cần kiểm tra riêng; refund dựa trên net paid đã phân bổ, trừ phí hợp lệ đã công bố.
  - **B:** Chỉ trả toàn bộ đơn.
  - **C:** Không đổi trả, chỉ bảo hành.
- **Answer:** không đổi trả

### Q63 — [P0] Hàng trả về và bảo hành/RMA

- **Context:** Hàng trả không được quay lại available trước khi kiểm tra; serial cần theo dõi kết quả.
- **Question:** Chốt workflow hậu mãi.
- **Suggested Options:**
  - **A (Recommended):** `REQUESTED → APPROVED → RECEIVED → INSPECTING → RESOLVED/REJECTED`; kết quả gồm restock, repair, replace, refund, return-to-vendor; mọi hàng vào quarantine trước.
  - **B:** Nhân viên cập nhật ghi chú tự do.
  - **C:** Ngoài MVP.
- **Answer:** không dổi trả

### Q64 — [P0] Quyền đánh giá đã mua

- **Context:** Cần chống review giả và xác định review gắn product hay SKU.
- **Question:** Ai được đánh giá và đánh giá thực thể nào?
- **Suggested Options:**
  - **A (Recommended):** Chỉ khách có order line đã delivered/completed; review gắn product và lưu SKU/order-line để xác minh; một review trên mỗi order line, được sửa có lịch sử.
  - **B:** Mọi tài khoản xác minh được đánh giá.
  - **C:** Khách vãng lai cũng được đánh giá.
- **Answer:** A

### Q65 — [P1] Comment và kiểm duyệt

- **Context:** Comment tự do và Q&A cần rule moderation khác nhau.
- **Question:** Comment là hỏi đáp sản phẩm hay thread tự do? Ai được ẩn/xóa?
- **Suggested Options:**
  - **A (Recommended):** Product Q&A một cấp reply; user report; moderator hide với reason/audit; cửa hàng có nhãn phản hồi chính thức.
  - **B:** Thread nhiều cấp như mạng xã hội.
  - **C:** Không có comment trong MVP, chỉ review.
- **Answer:** Chỉ user đã mua và nhận sản phẩm đó thì mới được comment/đánh giá

---

# L. Vai trò, chi nhánh, thông báo và báo cáo

### Q66 — [P0] RBAC và phạm vi chi nhánh

- **Context:** “Nhà quản trị” đang gom nhiều nhiệm vụ xung đột như giá, kho, mua hàng, thanh toán và hoàn tiền.
- **Question:** Chọn mô hình quyền.
- **Suggested Options:**
  - **A (Recommended):** Tách `System Admin`, `Catalog Manager`, `Branch Manager`, `Warehouse Staff`, `Purchasing`, `Finance`, `Customer Support`, `Technician`; user có thể thuộc nhiều branch; quyền gồm action + scope.
  - **B:** Chỉ Admin và Customer.
  - **C:** Admin toàn hệ thống + Staff theo branch, chưa tách chức năng.
- **Answer:** C

### Q67 — [P0] Phê duyệt và separation of duties

- **Context:** Điều chỉnh tồn, PO giá trị lớn và refund là hành động tài chính quan trọng.
- **Question:** Hành động nào cần approval hoặc “người tạo không tự duyệt”?
- **Suggested Options:**
  - **A (Recommended):** PO/refund/stock adjustment vượt ngưỡng cần approver khác; ngưỡng cấu hình; mọi từ chối có reason.
  - **B:** Manager tự tạo và duyệt.
  - **C:** Không có approval trong MVP.
- **Answer:** không có luồng approve stock

### Q68 — [P1] Thông báo khách hàng

- **Context:** Journey “chờ/lo lắng” sau thanh toán cần thông tin chủ động.
- **Question:** Sự kiện nào gửi email/SMS và kênh nào là nguồn chính?
- **Suggested Options:**
  - **A (Recommended):** Đặt đơn, thanh toán, xác nhận/hủy, bàn giao carrier, giao thành công/thất bại, return/RMA; template versioned, retry idempotent, có log delivery.
  - **B:** Chỉ email tạo đơn và giao hàng.
  - **C:** Không gửi tự động trong MVP.
- **Answer:** A, bên cạnh email/sms, cần có module notification, khi các sự kiện trên xảy ra -> bắn một notification cho khách

### Q69 — [P1] Báo cáo MVP

- **Context:** Báo cáo quyết định dữ liệu nào phải snapshot và audit từ đầu.
- **Question:** Xếp hạng 5 báo cáo bắt buộc: doanh thu/đơn; lợi nhuận; nhập-xuất-tồn; tồn thấp/tồn lâu; promotion; supplier; hủy/return/giao thất bại; hiệu suất lắp ráp.
- **Suggested Options:**
  - **A (Recommended):** Chốt 5 báo cáo, metric definition, timezone, quyền xem và nguồn dữ liệu trước khi thiết kế schema.
  - **B:** Làm dashboard tổng quan trước, định nghĩa metric sau.
  - **C:** Ngoài MVP.
- **Answer:** C

### Q70 — [P2] Bản đồ và chi nhánh gần nhất

- **Context:** “Gần nhất” cần định nghĩa khoảng cách và API.
- **Question:** Có trong MVP không; tính gần theo đường chim bay hay thời gian/quãng đường; có dùng tồn kho làm tiêu chí không?
- **Suggested Options:**
  - **A (Recommended):** Đưa sang phase 2; MVP cho danh sách chi nhánh + địa chỉ + giờ mở cửa; sau đó tích hợp map routing.
  - **B:** MVP dùng tọa độ và khoảng cách đường chim bay.
  - **C:** MVP tích hợp đầy đủ Google Maps/Mapbox.
- **Answer:** A

---

# M. Tình huống biên bắt buộc mô tả kết quả

Với mỗi tình huống, trả lời đủ: **state cuối**, **tác động tồn**, **tác động tiền/coupon**, **ai xử lý**, **khách thấy gì**, **có retry/resume không**.

### E01 — Hai khách mua SKU cuối cùng cùng lúc

- **Answer:** xử lý cho khách tạo đơn trước, báo lỗi khách tạo đơn sau

### E02 — QR callback đến hai lần

- **Answer:** cố làm cho nó call back chỉ 1 lần

### E03 — Khách trả tiền sau khi reservation hết hạn

- **Answer:** không làm field hạn cho reservation, khi nào khách đã hoàn thành đơn hàng -> trừ thẳng on-hand

### E04 — Số tiền chuyển khoản thiếu hoặc thừa

- **Answer:** khi quét mã QR để chuyển khoản, không có phép khách sửa số tiền chuyển và tin nhắn chuyển khoản

### E05 — Coupon hết quota đúng lúc hai khách cùng tạo đơn

- **Answer:** khách tạo đơn sau khi hết quota sẽ không được áp dụng coupou và báo lỗi cho khách

### E06 — Giá thay đổi khi khách đang ở checkout

- **Answer:** có thể tạo một đơn hàng nhưng trạng thái là chờ thanh toán, đơn hàng này sẽ lưu snapshot giá các sản phẩm -> không ảnh hưởng giá giảm

### E07 — Custom build hợp socket nhưng cần BIOS mới

- **Answer:** MVP không quản lý các sản phẩm có phù hợp nhau hay không, bộ phận tư vấn khách sẽ báo khách

### E08 — Một linh kiện trong saved build bị discontinued

- **Answer:** out of scope

### E09 — Linh kiện lỗi trong lúc assembly, SKU thay thế đắt hơn

- **Answer:** out of scope

### E10 — Chi nhánh nguồn gửi 10, chi nhánh đích nhận 9

- **Answer:**

### E11 — Receipt có serial trùng

- **Answer:** _..._

### E12 — Đơn đã xuất một phần rồi khách yêu cầu hủy

- **Answer:** _..._

### E13 — COD custom PC bị từ chối nhận

- **Answer:** out of scope

### E14 — Carrier báo delivered nhưng khách nói chưa nhận

- **Answer:** our of scope

### E15 — Khách trả một SKU từng nhận product promotion và order coupon

- **Answer:** phải trả toàn bộ

### E16 — Email thuộc khách A nhưng phone thuộc khách B

- **Answer:** một hồ sơ khách mới, không merge

### E17 — Admin sửa thuộc tính đang được compatibility rule sử dụng

- **Answer:** out of scope

### E18 — Giao thất bại, hàng hoàn về có dấu hiệu đã mở hộp

- **Answer:** out of scope

---

# N. Chốt MVP và tiêu chí thành công

### Q71 — [P0] Must-have / Later / Out-of-scope

- **Context:** Phạm vi hiện tại lớn, gồm commerce, OMS, WMS, procurement, assembly, CRM và hậu mãi.
- **Question:** Phân mỗi module vào một trong ba nhóm.
- **Suggested Options:**
  - **A (Recommended):** MVP ưu tiên catalog/SKU, compatibility builder, cart/checkout, payment, single-origin fulfillment, inventory ledger, basic PO/receipt và RBAC; map, multi-origin, advanced RMA/reporting sang phase sau.
  - **B:** Toàn bộ tính năng mô tả đều thuộc MVP.
  - **C:** MVP chỉ storefront + order; vận hành kho/mua hàng xử lý ngoài hệ thống.
- **Answer:**
- Must:
- ecommerce
- catalog/SKU
- cart/checkout
- inventory
- multi origin (nhiều chi nhánh, quản lý kho theo chi nhánh)
- Optional:
- Các phần còn lại

### Q72 — [P0] Non-goals rõ ràng

- **Context:** Non-goals ngăn scope creep và quyết định ngầm.
- **Question:** Ngoài quản lý đội vận chuyển/tuyến đường, xác nhận có loại trừ POS, kế toán/công nợ, loyalty, marketplace, dropshipping, multi-currency, quốc tế hóa và mobile app không.
- **Suggested Options:**
  - **A (Recommended):** Ghi rõ từng mục `OUT` hoặc `LATER`, không để mặc định mơ hồ.
  - **B:** Để quyết định trong lúc phát triển.
- **Answer:** chưa quan tâm phân quyền

### Q73 — [P1] Chỉ số thành công

- **Context:** Cần outcome đo được thay vì chỉ “đủ tính năng”.
- **Question:** Chốt baseline và target cho: độ chính xác tồn kho, tỷ lệ checkout thành công, thời gian xử lý đơn, tỷ lệ build bị lỗi tương thích, tỷ lệ giao thất bại/hủy, thời gian assembly và sai lệch receipt.
- **Suggested Options:**
  - **A (Recommended):** Mỗi metric có định nghĩa, nguồn, baseline, target, owner và kỳ đo; nếu chưa có baseline thì ghi kế hoạch đo.
  - **B:** Chỉ theo dõi doanh thu.
  - **C:** Chưa đo trong MVP.
- **Answer:** A

---

# Agreed Decisions — Summary for the Agent

Chỉ tick sau khi câu trả lời đã được người có thẩm quyền duyệt.

- [x] Identity/account model đã chốt.
- [x] Product–SKU–category–attribute model đã chốt.
- [x] Prebuilt PC, custom build và assembly model đã chốt.
- [x] Compatibility engine đã được chốt là ngoài MVP.
- [x] Pricing/promotion pipeline và refund allocation đã chốt.
- [x] Reservation, allocation và inventory ledger đã được cập nhật bởi FQ21–FQ36.
- [x] Order và Payment state machine; fulfillment/assembly boundary đã được cập nhật bởi FQ21–FQ36.
- [x] QR/COD, idempotency và late-payment recovery đã được cập nhật bởi FQ21–FQ36.
- [x] PO/receipt/supplier return đã chốt.
- [x] Cancellation và failed-delivery recovery đã chốt; customer return/RMA vẫn ngoài MVP.
- [x] MVP chỉ dùng Admin; chưa có Staff/RBAC chi tiết.
- [x] MVP/Later/Out-of-scope đã chốt.
- [x] Các edge case mới FQ21–FQ36 đã được chốt và chuẩn hóa lại vào feature rules.

## Approval

- **Status:** `Approved`
- **Approver:** Project owner (user)
- **Approval date:** 2026-10-18
- **Notes:** Approved again after FQ36. FQ01–FQ36 override any conflicting answer from Q01–Q73, E01–E18, or an earlier follow-up answer. Round 4 adds manual failed-delivery recovery, pickup readiness, corrected stock-issue timing, manual refunds, one-attempt fixed QR handling, guest OTP access, shipping-fee amendments, and PO replacement linkage.

> Chỉ khi `Status` được đổi thành `Approved`, các câu P0 đã có quyết định và người duyệt/ngày duyệt được ghi rõ, mới chuyển sang viết bộ business logic hoàn chỉnh.

## Đầu ra tiếp theo sau khi duyệt QA

1. Product brief: actor, JTBD, scope, non-goals và glossary.
2. Journey map + service blueprint cho người mua, nhân viên kho, mua hàng và kỹ thuật viên.
3. Information architecture: taxonomy linh kiện, faceted search, sitemap và nhãn điều hướng.
4. State-machine specifications cho Order, Payment, Fulfillment, Inventory Transfer, Purchase, Assembly và Return/RMA.
5. Business Rule Catalog có ID, priority, precondition, invariant, action, exception và source decision.
6. Use cases/user stories có acceptance criteria theo normal, empty, stale, partial-success, failure, cancel, retry và duplicate submission.
7. Logical ERD và data constraints phù hợp Prisma/PostgreSQL.
8. Traceability map từ `QA decision → Business rule → Use case → Test case`.

---

# O. Follow-up Round 2 — Các quyết định P0 còn mâu thuẫn

> Chỉ cần trả lời các câu dưới đây. Các câu trả lời vòng 1 được giữ nguyên để truy vết. Sau vòng này, agent sẽ đánh giá lại và chỉ tạo skill khi không còn mâu thuẫn ảnh hưởng tới dữ liệu, tiền hoặc tồn kho.

## Kết quả đối chiếu Odoo được dùng cho vòng hỏi này

- Odoo dùng `product.template` cho thông tin chung và `product.product` cho một tổ hợp giá trị thuộc tính; mỗi variant có internal reference/barcode riêng.
- Thuộc tính tạo variant là các giá trị như kích cỡ/màu/dung lượng. Odoo không mặc định coi hãng sản xuất là variant của một template.
- Odoo cho category định nghĩa schema của properties và template lưu giá trị properties; các thuộc tính tạo variant được quản lý riêng.
- Odoo tách `quantity`, `reserved_quantity`, stock move và stock picking. Reservation không đồng nghĩa hàng đã rời kho.
- Stock move/picking có state riêng và chỉ `done` mới xác nhận việc chuyển hàng vật lý.
- Return trong Odoo là một reverse stock move tham chiếu move gốc, không phải sửa/xóa giao dịch tồn đã hoàn tất.

### FQ01 — [P0] Định danh khách khi email và phone thuộc hai hồ sơ khác nhau

- **Conflict:** Q07/Q08 chọn email và phone đều duy nhất, nhưng E16 lại tạo hồ sơ mới khi email thuộc A và phone thuộc B. Hai rule không thể cùng đúng.
- **Question:** Chọn invariant duy nhất.
- **Suggested Options:**
  - **A (Recommended):** Email và phone đều unique; nếu chúng trỏ tới hai hồ sơ khác nhau thì chặn checkout, yêu cầu xác minh/hỗ trợ; tuyệt đối không tự tạo hồ sơ thứ ba và không tự merge.
  - **B:** Chỉ đúng cả cặp mới là một khách; cho phép email hoặc phone xuất hiện ở nhiều hồ sơ.
  - **C:** Phone unique, email có thể trùng.
- **Answer:** A

### FQ02 — [P0] Thời điểm tạo hồ sơ khách hàng

- **Conflict:** Ghi chú Q06 nói tạo hồ sơ ngay khi khách chốt đặt hàng; Q09 nói chỉ tạo sau khi QR đã thanh toán hoặc COD được xác nhận.
- **Question:** Mốc chính thức là gì?
- **Suggested Options:**
  - **A (Recommended):** Tạo `Customer` khi QR paid hoặc COD confirmed; trước đó order chỉ giữ snapshot contact/guest identity.
  - **B:** Tạo `Customer` ngay khi order được submit, kể cả order QR chưa thanh toán.
  - **C:** Tạo khi giao thành công.
- **Answer:** B

### FQ03 — [P0] Hãng sản xuất là Product Template hay Variant

- **Conflict:** Q11 mô tả “RTX 5060 Ti Nvidia” là template và ASUS/MSI/Gigabyte là variant; cách này khác semantics variant của Odoo và dễ gom nhầm các card có PCB, tản, kích thước, bảo hành và giá khác nhau.
- **Question:** Chốt identity của một template.
- **Suggested Options:**
  - **A (Recommended):** Mỗi model thương mại của một hãng là một template, ví dụ `ASUS Dual GeForce RTX 5060 Ti OC 16GB`; variant chỉ cho thuộc tính thật sự cùng một sản phẩm như màu/dung lượng/edition. `GPU chipset = RTX 5060 Ti` và `manufacturer = ASUS` là thuộc tính chung để lọc/so sánh.
  - **B:** Một template chung `RTX 5060 Ti`; ASUS/MSI/Gigabyte là variants dù khác thiết kế và thông số.
  - **C:** Không dùng Product Template/Variant; mỗi SKU là một Product độc lập.
- **Answer:** A

### FQ04 — [P0] Nơi định nghĩa và lưu thông số động

- **Conflict:** Q12/Q13 chỉ ghi “tham khảo Odoo”; Q14 nói rule ở template nhưng chưa chốt schema dữ liệu.
- **Question:** Chọn cấu trúc chính thức.
- **Suggested Options:**
  - **A (Recommended):** Category định nghĩa metadata field (`key`, label, type, unit, required, filterable, comparable); Product Template lưu giá trị chung bằng JSON; Variant chỉ lưu override/giá trị biến thể được cho phép; SKU, barcode, giá, trạng thái, brand và các foreign key lõi vẫn là cột quan hệ.
  - **B:** Category chỉ có một JSON schema và mỗi Variant lưu toàn bộ JSON value riêng.
  - **C:** Tất cả thông số đều là cột cố định trong database.
- **Answer:** A

### FQ05 — [P0] Mô hình PC dựng sẵn và Custom Build khi không quản lý assembly

- **Conflict:** Q17 chọn mô hình hỗn hợp có PC thành phẩm tồn riêng, nhưng Q24/Q48/Q49 xác nhận không quản lý quy trình lắp hoặc lỗi lắp.
- **Question:** Chọn mô hình tồn kho MVP.
- **Suggested Options:**
  - **A (Recommended):** PC dựng sẵn đã lắp là SKU thành phẩm có on-hand/serial riêng; BOM chỉ để hiển thị linh kiện. Custom Build là container của component SKU, reserve/xuất từng linh kiện; `ASSEMBLING` chỉ là order status thủ công, không tạo finished-good inventory và không có assembly order/QC.
  - **B:** Cả PC dựng sẵn và Custom Build đều là BOM ảo; luôn trừ từng linh kiện.
  - **C:** Mọi PC đều là SKU thành phẩm; custom build phải được nhập kho thành phẩm trước khi bán.
- **Answer:** B

### FQ06 — [P0] “Multi-origin” trong phạm vi MVP

- **Conflict:** Q36 chọn một đơn chỉ xuất từ một chi nhánh; Q71 ghi Must có “multi origin”.
- **Question:** “Multi origin” có nghĩa nào?
- **Suggested Options:**
  - **A (Recommended):** Hệ thống có nhiều chi nhánh và tồn riêng, nhưng mỗi order chỉ có một fulfillment branch; nếu thiếu thì stock transfer về branch đó trước khi xuất.
  - **B:** Một order có thể xuất nhiều chi nhánh và giao nhiều kiện.
  - **C:** Hệ thống tự tách thành nhiều order con, mỗi order con một branch.
- **Answer:** A

### FQ07 — [P0] Reservation, thời hạn và mốc trừ on-hand

- **Conflict:** Q34/Q35/Q47 chọn reserve khi tạo order, có TTL và trừ on-hand khi xuất; E03 lại nói không có hạn reservation và chỉ trừ on-hand khi đơn hoàn thành.
- **Question:** Chọn một lifecycle tồn kho.
- **Suggested Options:**
  - **A (Recommended):** Cart không reserve; QR order reserve ngay trong transaction và hết hạn sau một TTL cấu hình; COD reserve khi được xác nhận; validate stock picking/xuất kho thì giảm on-hand và reserved; giao thành công không trừ tồn lần nữa.
  - **B:** Reserve khi order được xác nhận nhưng không có TTL; giữ đến khi hủy hoặc xuất; xuất kho thì giảm on-hand.
  - **C:** Không reserve; chỉ giảm on-hand khi order hoàn thành/giao thành công.
- **Answer:** A
- **Nếu chọn A, TTL QR:** 30 phút

### FQ08 — [P0] Payment state và Order state

- **Conflict:** Q42 dùng payment state riêng; Q43 chọn một state machine duy nhất; Q44/Q45 lại chọn các state riêng.
- **Question:** Chọn ranh giới state chính thức.
- **Suggested Options:**
  - **A (Recommended):** `Payment` có state riêng; fulfillment được đơn giản hóa và gộp vào `Order` cho MVP. Order đi qua `PENDING_PAYMENT/PENDING_COD_CONFIRMATION → CONFIRMED → PREPARING_COMPONENTS → ASSEMBLING (nếu khách chọn) → SHIPPING → COMPLETED`, terminal `CANCELLED`, exception `ON_HOLD`.
  - **B:** Tách hoàn toàn Order, Payment và Fulfillment như Q42/Q44/Q45.
  - **C:** Một state duy nhất bao gồm cả thanh toán và giao hàng.
- **Answer:** A

### FQ09 — [P0] Mức chi tiết tracking giao hàng

- **Conflict:** Q45 chọn flow chi tiết có carrier/failed/redelivery/returning; Q50 chỉ muốn admin đổi 5 trạng thái đơn thủ công.
- **Question:** Flow nào thuộc MVP?
- **Suggested Options:**
  - **A (Recommended):** Chỉ flow thủ công `CONFIRMED → PREPARING_COMPONENTS → ASSEMBLING(optional) → SHIPPING → COMPLETED`; chưa tích hợp carrier, không quản lý failed/redelivery/lost.
  - **B:** Flow chi tiết Q45 nhưng nhân viên cập nhật thủ công.
  - **C:** Flow chi tiết và nhận webhook carrier.
- **Answer:** A

### FQ10 — [P0] PO không phê duyệt nhưng vẫn cần state

- **Conflict:** Q56 chọn “không có phê duyệt” nhưng chưa xác định vòng đời PO; Q57 yêu cầu một PO chỉ nhận một lần.
- **Question:** Chốt state PO tối thiểu.
- **Suggested Options:**
  - **A (Recommended):** `DRAFT → CONFIRMED → RECEIVED → CLOSED`; terminal `CANCELLED`; không có approval và không partial receipt.
  - **B:** `DRAFT → CONFIRMED → CLOSED/CANCELLED`; receipt chỉ là thuộc tính của PO.
  - **C:** Chỉ `OPEN/CLOSED`.
- **Answer:** A

### FQ11 — [P0] Nhập hàng thiếu/thừa/sai SKU và serial trùng

- **Conflict:** Q58 nói không quản lý kiểm kê hàng nhập, nhưng việc cập nhật tồn vẫn phải có hành vi xác định khi dữ liệu thực nhận không khớp PO.
- **Question:** Khi xác nhận receipt một lần, hệ thống xử lý sai lệch thế nào?
- **Suggested Options:**
  - **A (Recommended):** Receipt phải khớp đủ PO; nếu thiếu/thừa/sai SKU thì chặn validate để nhân viên sửa PO hoặc từ chối nhận; serial trùng luôn bị chặn. Không có partial/backorder/discrepancy workflow.
  - **B:** Nhập đúng số thực nhận, tự sửa số lượng PO và đóng PO.
  - **C:** Cho partial receipt và tạo backorder như Odoo.
- **Answer:** A

### FQ12 — [P0] Stock transfer nhận thiếu

- **Conflict:** Q54 chọn transfer có `PARTIALLY_RECEIVED/discrepancy`; E10 chưa trả lời.
- **Question:** Branch nguồn gửi 10 nhưng branch đích nhận 9 thì làm gì?
- **Suggested Options:**
  - **A (Recommended):** Đích nhận 9 vào on-hand; 1 giữ trong bucket `in_transit/discrepancy`; transfer chuyển `PARTIALLY_RECEIVED`; admin resolve bằng nhận bù, trả nguồn hoặc ghi mất với audit.
  - **B:** Không cho nhận; toàn bộ 10 tiếp tục in-transit đến khi khớp.
  - **C:** Tự động coi đủ 10 và tạo stock adjustment sau.
- **Answer:** Không quản lý kiểm tra xem stock transfer có thực hiện đúng không.

### FQ13 — [P0] Supplier Return chính xác gồm gì

- **Conflict:** Q60 chọn return-to-vendor theo Odoo, nhưng không có inspection/discrepancy workflow và chưa chốt kế toán.
- **Question:** Phạm vi supplier return MVP là gì?
- **Suggested Options:**
  - **A (Recommended):** Chỉ cho tạo reverse stock move từ receipt đã `RECEIVED`; chọn SKU/serial/số lượng; khi validate thì trừ on-hand/quarantine và lưu liên kết move gốc; không quản lý supplier credit/công nợ.
  - **B:** Quản lý cả credit note/công nợ và replacement.
  - **C:** Ngoài MVP.
- **Answer:** A

### FQ14 — [P0] Customer return, warranty và refund

- **Conflict:** Q62/Q63 nói không đổi trả; E15 nói phải trả toàn bộ; Q42/Q61 vẫn có refund cho đơn đã thanh toán bị hủy.
- **Question:** Chốt ranh giới hậu mãi.
- **Suggested Options:**
  - **A (Recommended):** Không có customer return/RMA/warranty trong MVP. Refund chỉ xảy ra khi order prepaid bị hủy trước khi stock issue/shipping; sau khi shipping thì không cho hủy trên hệ thống.
  - **B:** Cho trả toàn bộ order sau khi giao; không partial return.
  - **C:** Có warranty/RMA nhưng không có trả hàng thương mại.
- **Answer:** A

### FQ15 — [P0] Hủy đơn sau khi đã xuất một phần

- **Conflict:** E12 chưa trả lời; business rule không thể để stock đã issue biến mất khi hủy.
- **Question:** MVP có cho xuất/giao một phần order không?
- **Suggested Options:**
  - **A (Recommended):** Không partial fulfillment; chỉ validate xuất khi đủ toàn bộ order. Nếu đã issue thì chặn cancel và yêu cầu reverse stock move trước (chỉ admin nội bộ).
  - **B:** Cho partial fulfillment; phần chưa xuất được hủy, phần đã xuất tiếp tục giao.
  - **C:** Cho cancel trực tiếp và tự cộng lại toàn bộ tồn.
- **Answer:** A

### FQ16 — [P0] COD và tiền cọc cho PC lắp ráp

- **Conflict:** Q41 chọn chính sách có hạn mức/cọc nhưng chưa có con số hoặc điều kiện, nên checkout chưa thể quyết định phương thức hợp lệ.
- **Question:** Chốt chính sách MVP.
- **Suggested Options:**
  - **A (Recommended):** Custom Build/PC yêu cầu thanh toán QR toàn bộ; COD chỉ áp dụng linh kiện lẻ và PC thành phẩm.
  - **B:** Custom Build được COD nhưng phải cọc **_% hoặc _** VND; order từ \_\_\_ VND trở lên cần cọc.
  - **C:** Mọi order đều được COD, không cọc/hạn mức.
- **Answer:** B

### FQ17 — [P1] Comment và Review có phải hai thực thể riêng

- **Conflict:** Q65 mới chốt điều kiện “đã mua và nhận hàng”, chưa chốt semantics hoặc moderation.
- **Question:** Chọn phạm vi MVP.
- **Suggested Options:**
  - **A (Recommended):** Chỉ có `Review` gồm số sao + nội dung; không có comment/Q&A riêng; admin được ẩn review với reason và audit.
  - **B:** Có `Review` đã mua và `Product Q&A`; chỉ người đã mua mới được hỏi/trả lời.
  - **C:** Có thread comment nhiều cấp.
- **Answer:** A

### FQ18 — [P1] Quyền tối thiểu của Admin và Staff theo chi nhánh

- **Conflict:** Q66 chọn Admin + Staff theo branch; Q72 nói chưa quan tâm phân quyền. Vẫn cần giới hạn tối thiểu để tránh nhân viên chi nhánh sửa giá/toàn kho.
- **Question:** Chọn baseline quyền MVP.
- **Suggested Options:**
  - **A (Recommended):** Admin quản lý catalog/giá/promotion/supplier và xem mọi branch; Staff chỉ quản lý order, stock move/receipt/transfer của branch được gán; không có approval workflow.
  - **B:** Admin toàn quyền; Staff cũng toàn quyền trừ quản lý user.
  - **C:** Chỉ có một role Admin trong MVP, chưa có Staff account.
- **Answer:** C

### FQ19 — [P1] Non-goals của MVP

- **Conflict:** Q72 không trả lời danh sách non-goals.
- **Question:** Xác nhận phạm vi loại trừ.
- **Suggested Options:**
  - **A (Recommended):** `OUT`: POS, kế toán/công nợ, loyalty, marketplace, dropshipping, multi-currency, mobile app, carrier integration, compatibility engine, saved build, customer return/RMA, advanced reporting và stock count. `LATER`: bản đồ chi nhánh.
  - **B:** Các mục trên đều `LATER`, không mục nào bị loại trừ.
  - **C:** Ghi danh sách khác.
- **Answer:** A

## Round 2 Approval Gate

- [x] FQ01–FQ16 đã có câu trả lời không mâu thuẫn.
- [x] FQ17–FQ19 đã chốt hoặc được đánh dấu rõ là ngoài MVP.
- [x] `Approval.Status` ở phần trên đã được đổi thành `Approved`.
- [x] Có tên approver và ngày duyệt.

---

# P. Follow-up Round 3 — Chính sách tiền cọc còn thiếu

### FQ20 — [P0] Công thức cọc COD cho Custom Build

- **Context:** FQ16 chọn phương án B nhưng chưa điền tỷ lệ/số tiền hoặc ngưỡng. Đây là dữ liệu bắt buộc để tính số tiền QR, số tiền COD còn lại, payment state và refund.
- **Question:** Chốt đầy đủ công thức và điều kiện hoàn cọc.
- **Suggested Options:**
  - **A (Recommended):** Mọi Custom Build trả cọc `10%` trên grand total sau giảm giá, tối thiểu `500.000 VND`; phần còn lại thu COD. Payment chuyển `PARTIALLY_PAID` khi nhận cọc. Hoàn toàn bộ cọc nếu hủy trước `PREPARING_COMPONENTS`; từ trạng thái đó trở đi khách không được tự hủy.
  - **B:** Mọi Custom Build trả cọc cố định `1.000.000 VND`; phần còn lại thu COD. Điều kiện hoàn cọc giống phương án A.
  - **C:** Quy tắc khác — ghi đủ: đối tượng áp dụng, tỷ lệ/số tiền, mức tối thiểu/tối đa, ngưỡng giá trị order, cách làm tròn, số tiền COD còn lại và điều kiện hoàn/mất cọc.
- **Answer:** A

## Final Approval Gate

- [x] FQ20 đã chốt.
- [x] `Approval.Status` là `Approved`.
- [x] Đã ghi approver và ngày duyệt.
- [x] Đã tạo `.agents/skills/business-logic/SKILL.md` và các feature references.

---

# Q. Follow-up Round 4 — Recovery flow sau phản biện vận hành

> Vòng này mở lại một phần đặc tả đã duyệt vì có thay đổi phạm vi MVP, state machine, thời điểm stock issue và xử lý tiền. FQ21–FQ30 ghi lại lựa chọn project owner đã trả lời trong chat. FQ31–FQ35 là các hệ quả còn thiếu, không được tự suy đoán khi triển khai.

### FQ21 — [P0] Giao hàng thất bại và hàng quay về chi nhánh

- **Context:** COD có thể bị từ chối nhận. Nếu chỉ có `SHIPPING → COMPLETED`, Order và tồn kho sẽ bị kẹt khi kiện hàng quay lại.
- **Decision:** Bổ sung flow tối thiểu `SHIPPING → DELIVERY_FAILED`; sau đó có thể giao lại `→ SHIPPING` hoặc `→ RETURNING → RETURNED_TO_BRANCH → CANCELLED`.
- **Stock invariant:** Không reverse stock khi vừa báo giao thất bại. Chỉ tạo linked reverse stock move khi chi nhánh xác nhận đã nhận lại đủ SKU/serial thực tế.
- **Answer:** A

### FQ22 — [P0] Checkout khi không chi nhánh nào đủ toàn bộ đơn

- **Context:** Một Order chỉ có một fulfillment branch và chỉ reserve sau khi branch đó có đủ hàng.
- **Decision:** Không tạo Order, không giữ coupon quota, không reserve và không thu tiền. Giữ Cart, báo rõ không có chi nhánh nào đủ toàn bộ đơn; Admin có thể điều chuyển độc lập và khách checkout lại sau khi transfer đã `RECEIVED`.
- **Answer:** A

### FQ23 — [P0] Thời điểm stock issue cho đơn lắp ráp

- **Context:** Linh kiện đã rời quyền kiểm soát của kho khi được bàn giao sang bàn lắp ráp, không phải khi máy được giao cho đơn vị vận chuyển.
- **Decision:** `PREPARING_COMPONENTS` chỉ picking/staging và vẫn dùng reservation. Với đơn có dịch vụ lắp ráp, validate full stock issue khi chuyển `PREPARING_COMPONENTS → ASSEMBLING`. Với đơn không lắp ráp, validate stock issue khi bàn giao giao vận.
- **Answer:** A

### FQ24 — [P0] Cọc Custom Build khi hủy từ PREPARING_COMPONENTS

- **Context:** Cần chốt số tiền cọc sau khi cửa hàng đã bắt đầu chuẩn bị/lắp ráp.
- **Decision:** Từ `PREPARING_COMPONENTS` trở đi, khoản cọc COD Custom Build luôn bị giữ lại khi Order bị hủy, không phân biệt nguyên nhân hủy. Trước mốc này vẫn hoàn toàn bộ cọc theo FQ20.
- **Answer:** C

### FQ25 — [P0] QR chuyển thiếu tiền trước khi hết hạn

- **Context:** Một giao dịch dương có thể khớp duy nhất với Order nhưng nhỏ hơn expected amount.
- **Decision:** Callback đầu tiên có số tiền dương và khớp duy nhất sẽ dừng timeout 30 phút, chuyển Order sang `ON_HOLD/PAYMENT_REVIEW` và tiếp tục giữ reservation tối đa 24 giờ. Quyết định ban đầu cho phép chuyển bù đã bị FQ36-A thay thế: QR chỉ có một lần thanh toán, không có top-up.
- **Answer:** A

### FQ26 — [P0] Cơ chế hoàn tiền MVP

- **Context:** Chuyển khoản QR ngân hàng không được giả định luôn có API refund.
- **Decision:** Hoàn tiền thủ công. Payment chuyển `REFUND_PENDING`; Admin nhập mã giao dịch hoàn và thời điểm hoàn trước khi chuyển `REFUNDED`. Các lệnh refund phải idempotent và được audit.
- **Answer:** A

### FQ27 — [P0] Guest tra cứu đơn và đánh giá

- **Context:** Customer business profile không đồng nghĩa có Better-Auth account.
- **Decision:** Mã đơn + OTP gửi tới contact đã xác minh là cơ chế xác thực chính. Magic link dùng một lần là tiện ích bổ sung. Sau xác thực, cấp guest session có thời hạn; quyền review vẫn được kiểm tra theo Customer + Order Line đã `COMPLETED`.
- **Answer:** A

### FQ28 — [P0] Thời hạn chờ khách đến nhận tại chi nhánh

- **Context:** Pickup cần state riêng thay vì dùng `SHIPPING`.
- **Decision:** Thêm `READY_FOR_PICKUP`. Khách có 14 ngày kể từ khi Order vào state này để đến nhận. Nếu quá hạn, gửi email đề nghị chuyển sang giao hàng và thông báo phí giao hàng áp dụng.
- **Checkout input invariant:** Nếu khách chọn pickup thì không yêu cầu và không validate địa chỉ giao hàng; chỉ yêu cầu branch nhận hàng, người nhận và contact đã xác minh. Địa chỉ chỉ trở thành bắt buộc nếu khách chấp nhận đổi sang delivery qua `OrderAmendment`.
- **Answer:** Phương án tùy chỉnh — thời hạn 2 tuần; quá hạn thì email đề nghị ship với phí giao hàng.
- **Resolved consequence:** Theo FQ31-B, khách không phản hồi thì Order chuyển/giữ ở `ON_HOLD/PICKUP_EXPIRED` vô thời hạn cho tới khi Admin liên hệ được. Theo FQ32-A, nếu khách đồng ý delivery thì dùng `OrderAmendment` và khoản phí bổ sung, không sửa ngầm product-line/coupon snapshot.

### FQ29 — [P0] Phí giao hàng và chọn fulfillment branch

- **Context:** Grand total QR phải xác định được trước khi thanh toán; map/route optimization nằm ngoài MVP.
- **Decision:** Pickup miễn phí. Delivery dùng một mức phí cố định và ngưỡng miễn phí do Admin cấu hình; không thu thêm phí COD. Trong các branch đủ toàn bộ hàng, hệ thống lọc theo vùng phục vụ rồi chọn theo priority do Admin cấu hình; không dùng khoảng cách bản đồ trong MVP.
- **Answer:** A

### FQ30 — [P0] PO được giao thiếu so với số lượng đã confirmed

- **Context:** Partial receipt/backorder vẫn ngoài MVP và PO confirmed không được sửa ngầm.
- **Decision:** Hủy PO cũ với reason `SUPPLIER_SHORT_SHIPMENT`, clone thành PO mới có số lượng thực nhận và liên kết `supersedesPurchaseOrderId`; receipt phải khớp chính xác PO mới. Phần giao sau, nếu có, dùng PO khác.
- **Answer:** A

## Open Questions — Chỉ còn các hệ quả của quyết định Round 4

### FQ31 — [P0] Kết quả cuối khi khách pickup không phản hồi email

- **Context:** Sau 14 ngày hệ thống mới chỉ biết gửi đề nghị giao hàng; Order không thể nằm `READY_FOR_PICKUP` vô thời hạn.
- **Question:** Khách có bao lâu để phản hồi email và nếu hết hạn thì xử lý Order/tiền/tồn thế nào?
- **Suggested Options:**
  - **A (Recommended):** Cho 3 ngày phản hồi. Hết hạn thì Admin hủy: Order chưa stock-issue release reservation; Order đã issue phải reverse stock trước; COD chưa thu tiền không refund; prepaid hoàn toàn bộ; riêng cọc COD Custom Build đã qua `PREPARING_COMPONENTS` bị giữ theo FQ24.
  - **B:** Giữ Order `ON_HOLD/PICKUP_EXPIRED` vô thời hạn cho tới khi Admin liên hệ được.
  - **C:** Sau 14 ngày tự động chuyển sang giao hàng COD mà không cần khách xác nhận.
- **Answer:** B

### FQ32 — [P0] Thu phí khi đổi từ pickup sang delivery

- **Context:** Order đã snapshot phí và grand total; không được sửa trực tiếp tổng tiền lịch sử khi khách đổi phương thức fulfillment.
- **Question:** Ghi nhận và thu phí giao hàng phát sinh theo cách nào?
- **Suggested Options:**
  - **A (Recommended):** Tạo `OrderAmendment` loại `PICKUP_TO_DELIVERY`, snapshot địa chỉ/phí mới và yêu cầu khách xác nhận bằng OTP. Đơn prepaid thu phí bằng supplemental QR trước `SHIPPING`; đơn COD cộng khoản charge đã duyệt vào số COD còn phải thu. Không thay đổi product-line price, promotion hoặc coupon snapshot.
  - **B:** Hủy Order pickup và tạo Order delivery mới với giá hiện tại.
  - **C:** Admin sửa trực tiếp grand total của Order cũ.
- **Answer:** A

### FQ33 — [P0] Hết 24 giờ PAYMENT_REVIEW mà khách chưa chuyển đủ

- **Context:** FQ25 dừng timeout 30 phút và giữ tồn 24 giờ nhưng chưa có terminal outcome.
- **Question:** Khi review TTL kết thúc mà tổng tiền nhận vẫn thiếu thì làm gì?
- **Suggested Options:**
  - **A (Recommended):** Hủy Order với reason `PAYMENT_REVIEW_TIMEOUT`, release reservation/coupon, tạo refund toàn bộ số tiền thực nhận ở trạng thái `REFUND_PENDING`; không tịch thu khoản chuyển thiếu.
  - **B:** Tiếp tục `ON_HOLD` vô thời hạn để Admin xử lý.
  - **C:** Hủy Order và giữ khoản tiền đã nhận.
- **Answer:** khách chỉ có thể chuyển 1 lần thông qua mã QR nhận tiền cố định (tích hợp sePay hoặc VietQR)
- **Normalized resolution:** FQ36-A loại bỏ nhánh chuyển bù. Giao dịch không hợp lệ hoặc không thể gán chắc chắn trong 24 giờ làm Order bị hủy, release reservation/coupon và hoàn toàn bộ số tiền thực nhận qua `REFUND_PENDING`.

### FQ34 — [P0] Số lần giao lại và tiền khi kiện hàng quay về

- **Context:** FQ21 cho phép redelivery nhưng chưa giới hạn số lần hoặc định nghĩa settlement theo payment method.
- **Question:** Chọn policy giao lại và kết quả tiền khi hàng đã `RETURNED_TO_BRANCH`.
- **Suggested Options:**
  - **A (Recommended):** Tối đa 2 lần giao lại sau khi khách xác nhận lịch. Khi hàng quay về: COD chưa thu thì không refund; prepaid hoàn toàn bộ; cọc COD Custom Build đã qua `PREPARING_COMPONENTS` bị giữ theo FQ24. Phí giao lại là shipping charge mới và phải được khách duyệt.
  - **B:** Chỉ giao một lần; thất bại là trả hàng và hủy.
  - **C:** Không giới hạn số lần, Admin quyết định thủ công.
- **Answer:** A

### FQ35 — [P0] Biểu diễn khoản cọc bị giữ lại

- **Context:** `PARTIALLY_PAID` mô tả số tiền đã nhận nhưng chưa cho biết khoản cọc của Order đã hủy được hoàn hay bị giữ.
- **Question:** Lưu trạng thái khoản cọc bị giữ bằng mô hình nào?
- **Suggested Options:**
  - **A (Recommended):** Giữ Payment state là `PARTIALLY_PAID`; thêm `depositDisposition = HELD | APPLIED | REFUND_PENDING | REFUNDED | FORFEITED`. Khi Order hủy và giữ cọc thì disposition là `FORFEITED`.
  - **B:** Thêm Payment state `DEPOSIT_FORFEITED`.
  - **C:** Không có state có cấu trúc; chỉ ghi chú trong audit log.
- **Answer:** A

### FQ36 — [P0] Một lần thanh toán QR nhưng callback không khớp

- **Context:** Project owner chốt chỉ một lần chuyển qua QR số tiền cố định, nên không còn luồng chuyển bù. Hệ thống vẫn cần outcome an toàn nếu SePay/VietQR trả về số tiền không đúng, reference mơ hồ hoặc giao dịch đến sau expiry.
- **Question:** Xác nhận cách xử lý giao dịch duy nhất nhưng không hợp lệ.
- **Suggested Options:**
  - **A (Recommended):** Không cho chuyển bù. Chuyển Order sang `ON_HOLD/PAYMENT_REVIEW`; Admin đối soát. Nếu tiền nhận không đủ hoặc không thể gán chắc chắn thì hủy Order, release reservation/coupon và hoàn toàn bộ số tiền thực nhận qua `REFUND_PENDING`. Nếu giao dịch đúng nhưng đến muộn thì giữ recovery rule PAY-004: thử reserve lại, hết hàng thì `PAID_BUT_OUT_OF_STOCK`.
  - **B:** Cho tạo một QR bổ sung để chuyển phần còn thiếu, khôi phục quyết định FQ25 ban đầu.
  - **C:** Giả định QR luôn đúng tuyệt đối và không xây dựng nhánh callback sai tiền/mơ hồ.
- **Answer:** A

## Round 4 Approval Gate

- [x] FQ21–FQ30 đã ghi nhận đúng câu trả lời trong chat.
- [x] FQ31, FQ32, FQ34 và FQ35 đã được project owner trả lời.
- [x] FQ33/FQ36 đã chốt một outcome duy nhất, không mâu thuẫn với FQ25.
- [x] Đã kiểm tra lại Order/Payment/Inventory state machine và mọi terminal outcome.
- [x] Đã cập nhật đồng bộ các feature references của `business-logic`.
- [x] `Approval.Status` đã được đổi lại thành `Approved`, kèm approver và ngày duyệt.
