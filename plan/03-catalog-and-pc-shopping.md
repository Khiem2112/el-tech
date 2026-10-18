# 03 — Khám phá sản phẩm, PC dựng sẵn và Custom Build

## 1. Trang chủ `/`

### Mục tiêu

Đưa khách vào một trong ba job chính: tìm linh kiện, chọn PC dựng sẵn, hoặc tự lắp PC.

### Cấu trúc trang

1. Hero: value proposition, CTA `Xem linh kiện`, CTA phụ `Xem PC dựng sẵn`.
2. Category shortcuts: CPU, GPU, mainboard, RAM, storage, PSU, case, cooling, monitor/phụ kiện theo Category thật từ API.
3. Promotion strip: chương trình đang hiệu lực; giá hiển thị đã gồm VAT.
4. Product sections: nổi bật/mới/khuyến mãi; card không tự bịa stock.
5. Prebuilt PC section: mục tiêu sử dụng/price band/BOM summary.
6. Custom Build explainer: “chọn linh kiện và nhận cảnh báo tư vấn”; không hứa auto compatibility.
7. Branch summary: địa chỉ/giờ mở cửa, không map.
8. Trust/support content và footer.

Loading theo section; một widget lỗi không làm trắng cả trang. Empty promotion thì ẩn section, không hiển thị “không có dữ liệu”.

## 2. Catalog `/san-pham` và category listing

### Cấu trúc desktop

1. Breadcrumb.
2. H1 category + description ngắn.
3. Toolbar: result count, applied filter chips, sort, view density.
4. Sidebar filter 240–280px từ `specificationSchema` của Category:
   - Brand/manufacturer.
   - Price range.
   - Stock/availability nếu backend cung cấp theo context chi nhánh.
   - Filterable dynamic specifications theo type/unit/allowed values.
5. Product grid 3–4 cột.
6. Load-more hoặc pagination; chọn pagination nếu cần quay lại đúng vị trí.
7. SEO/category supporting content sau result list nếu có.

### Product card

- Ảnh có aspect ratio cố định.
- Brand + model + tên template.
- Variant summary; nếu nhiều variant hiển thị `Từ ...` chỉ khi đúng.
- Giá server hiện hành, giá trước/discount nếu promotion hợp lệ.
- Badge lifecycle/stock dùng wording `Có thể đặt`/`Tạm hết` thay vì số giả.
- Rating count nếu có review active.
- CTA chính xem chi tiết; quick add chỉ khi SKU đã xác định.
- Checkbox/nút so sánh chỉ cho comparable category.

### Mobile

- Toolbar sticky: `Lọc (n)` và `Sắp xếp`.
- Filter dùng `MobileFilterSheet`, giữ draft đến khi Apply.
- Product grid 2 cột hoặc list một cột tùy độ dài tên; touch target tối thiểu 44px.

### States

- First load: skeleton đúng card geometry.
- Refetch: giữ grid cũ và progress nhỏ.
- No results: echo query/filter + `Xóa n bộ lọc`.
- API error: inline region + Retry, không dùng empty state giả.
- SKU paused/discontinued từ cache: disable quick add và refresh data.

## 3. Tìm kiếm `/tim-kiem?q=`

### Search overlay

- Query input autofocus.
- Debounce 150–300ms; request cũ bị cancel.
- Nhóm suggestion: sản phẩm, category, PC dựng sẵn.
- Keyboard Up/Down/Enter/Escape.
- Recent searches lưu local và cho xóa.

### Results page

1. H1 `Kết quả cho “...”` và count.
2. Did-you-mean/near match khi backend hỗ trợ.
3. Filter/sort giống catalog; URL giữ state.
4. Related categories nếu product result bằng 0.
5. No-results recovery: sửa chính tả, clear filter, browse all.

Không search bằng internal SKU-only jargon; index tên, brand, model, chipset/family và spec được phê duyệt.

## 4. Product detail

### Route

`/san-pham/:categorySlug/:productSlug` đại diện Product Template; Variant/SKU selection phản ánh bằng query hoặc fragment ổn định.

### Cấu trúc trang

1. Breadcrumb.
2. Hero 2 cột:
   - Gallery ảnh/video có thumbnail và zoom accessible.
   - Brand, product name/model, rating summary.
   - Variant selector chỉ gồm variation attributes thật.
   - Giá/promotion/discount breakdown.
   - Availability note và branch context nếu người dùng chọn pickup.
   - Quantity stepper giới hạn theo server response nhưng không coi đó là reservation.
   - CTA `Thêm vào giỏ`, `Mua ngay`, `Thêm so sánh`.
3. Benefits/delivery/pickup summary.
4. Tabs hoặc anchored sections:
   - Mô tả.
   - Thông số kỹ thuật từ schema, nhóm theo meaning.
   - Đánh giá đã verified purchase.
5. Related products cùng category.

### Modal/sheet

- Gallery lightbox: full screen, history entry trên mobile.
- Branch availability sheet: branch name, address, hours, status; không map và không hứa giữ hàng.
- Variant change warning chỉ cần khi thay variant ảnh hưởng item đang chỉnh trong cart/build.

### Rules

- Chỉ `ACTIVE` SKU được add mới (`CAT-012`).
- Dữ liệu template/spec không được dùng thay SKU cho cart/stock.
- Price/availability hiển thị là snapshot đọc; checkout vẫn revalidate.

## 5. So sánh sản phẩm `/so-sanh`

### Phạm vi

So sánh tối đa 4 SKU trong cùng category/comparable schema. Không kết luận “tương thích” hay “tốt nhất” tự động.

### Cấu trúc

1. Breadcrumb + H1.
2. Sticky product header: ảnh, tên, giá, CTA add cart.
3. Toggle `Chỉ hiện điểm khác nhau`.
4. Specification matrix: row label/unit cố định, mỗi SKU một column.
5. Availability/promotion row có timestamp/refetch.
6. Mobile: selector từng sản phẩm + hiển thị 2 column tại một thời điểm; không ép bảng 4 cột ngang khó dùng.
7. Empty state: CTA chọn category/product.

`CompareLimitDialog` cho phép bỏ/thay SKU; comparison selection có thể lưu session/local, không được quảng bá là saved build.

## 6. PC dựng sẵn

### Listing `/pc-dung-san`

- Hero giải thích virtual bundle được cấu thành từ linh kiện.
- Filters: mức giá, nhu cầu (metadata trình bày), CPU/GPU family, dịch vụ lắp ráp nếu có.
- Card: tên offer, component highlights, tổng giá hiện hành, khả năng build tại context branch.
- Availability phải derive từ tất cả component, không dùng tồn “PC thành phẩm” (`PCB-001`, `INV-015`).

### Detail `/pc-dung-san/:slug`

1. Gallery/presentation identity.
2. Price summary từ component lines + service - bundle promotion.
3. BOM grouped list: component, SKU, qty, unit price/discount.
4. Branch availability summary.
5. Assembly service choice nếu được cấu hình.
6. CTA `Thêm cấu hình vào giỏ`.
7. CTA `Tùy chỉnh cấu hình`: tạo Custom Build snapshot mới, không mutate prebuilt source (`PCB-004`).
8. Notes: hệ thống chưa tự động xác nhận tương thích; tư vấn chỉ advisory.

Khi một component không còn ACTIVE hoặc thiếu tại mọi branch phù hợp, disable purchase với action quay lại listing; không tự thay thế.

## 7. Custom Build `/tu-lap-pc`

### Nguyên tắc

- Build là virtual BOM chứa component SKU; không có independent stock.
- Không lưu/chia sẻ build trong MVP (`PCB-007`). State tồn tại trong guest session/cart.
- Warnings chỉ advisory và không block checkout (`PCB-006`).

### Cấu trúc desktop

1. Breadcrumb + heading + scope note.
2. Main list theo nhóm linh kiện: CPU, mainboard, RAM, GPU, storage, PSU, case, cooling và nhóm khác theo catalog.
3. Mỗi slot có selected SKU card, quantity, replace/remove.
4. `Chọn linh kiện` mở product selection sheet/drawer hoặc routed sub-view có filter theo category.
5. Advisory panel: cảnh báo do metadata/quy tắc tư vấn hiện có; wording không khẳng định kiểm tra tương thích hoàn chỉnh.
6. Sticky summary bên phải:
   - Component subtotal.
   - Promotion.
   - Assembly service.
   - Estimated grand total.
   - CTA `Thêm cấu hình vào giỏ`.
7. Availability panel theo branch chỉ là read-time estimate.

### Mobile

- Danh sách slot một cột.
- Sticky bottom bar: số component, tổng dự tính, `Xem cấu hình`.
- Product picker là full-screen route/sheet với Back giữ build state.

### Product selection sheet

- Title category đang chọn.
- Search/filter/spec.
- Product list với selected state.
- Quick compare tối đa category limit.
- CTA `Chọn linh kiện này`; replace cần confirm nếu làm mất quantity/note hiện tại.

### States

- First-use empty: giải thích bắt đầu từ category bất kỳ, không ép sequence giả.
- Component paused/discontinued: badge lỗi trên slot, CTA thay thế, block add-to-cart cho build mới.
- Price changed: update estimate và announce; final checkout vẫn xác nhận.
- No branch buildable: vẫn cho chỉnh build nhưng block checkout submission; giải thích cần thay component/đợi transfer, không backorder.

## 8. Đánh giá trên product detail

- Rating distribution và count.
- Sort mới nhất/hữu ích nếu có metric; MVP tối thiểu mới nhất.
- Mỗi review: rating, text, verified purchase badge, SKU/variation, date, edited marker.
- Review hidden không render nội dung.
- CTA viết review chỉ hiện nếu session sở hữu completed order line chưa có active review (`REV-002`–`REV-004`).

## 9. Acceptance và kiểm thử

- Category dynamic filters render đúng datatype/unit/allowed values.
- URL giữ query/filter/sort sau refresh và Back.
- Product card/template không bị dùng làm stock identity; add cart luôn có SKU.
- Paused/discontinued không add mới nhưng vẫn render trong snapshot đơn cũ.
- Prebuilt/custom availability tính theo component minimum, không có finished-PC stock.
- Tùy chỉnh prebuilt không mutate source offer.
- Build không được quảng bá là saved/shared hoặc compatibility-certified.
- Skeleton/no-result/error/stale states khác nhau và responsive.
