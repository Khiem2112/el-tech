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

