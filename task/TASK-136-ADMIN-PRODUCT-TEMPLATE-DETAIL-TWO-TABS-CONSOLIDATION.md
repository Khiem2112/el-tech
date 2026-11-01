# Task: TASK-136 - Hợp Nhất Mẫu & Biến Thể: Chi Tiết Mẫu 2 Tab Với Bố Cục Biến Thể 2 Cột

- Feature: Admin Product Template Detail Two-Tab Layout
- Governing Spec: Yêu cầu hợp nhất trang chi tiết mẫu sản phẩm: Cấu trúc 2 tab gồm "Thông tin chung" (cấu hình mẫu và ảnh) và "Cấu hình chi tiết" (layout 2 cột: cột trái danh sách biến thể tóm tắt, cột phải thông tin chi tiết từng biến thể)
- Scope: frontend & backend
- Status: Pending

## Objective

Tái cấu trúc toàn diện màn hình Chi tiết mẫu sản phẩm ([admin-product-template-detail-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/templates/admin-product-template-detail-page.component.ts)) từ dạng trang cuộn dài thành hệ thống 2 tab chuyển đổi rõ ràng, hiện đại:
- **Tab 1: Thông Tin Chung**:
  - Khối cấu hình cơ bản của mẫu sản phẩm: Tên mẫu, slug, danh mục, thương hiệu, model code, chipset/vi kiến trúc, mô tả tóm tắt.
  - Khối thư viện ảnh sản phẩm: Thêm mới URL ảnh, danh sách xem trước, chọn ảnh chính (cover), xóa ảnh.
  - Khối thông số kỹ thuật động ([dynamic-spec-renderer.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/templates/components/dynamic-spec-renderer.component.ts)) theo schema của danh mục đã chọn.
- **Tab 2: Cấu Hình Chi Tiết (Quản Lý Biến Thể SKU)**:
  - Bố cục 2 cột (Master-Detail) chuyên nghiệp:
    - **Cột bên trái**: Danh sách các biến thể dạng thẻ/hàng thu gọn, hiển thị các trường: Mã SKU, Giá bán, Tồn kho khả dụng (Available) và Trạng thái (Đang bán / Dừng kinh doanh). Có nút bấm "+ Thêm biến thể". Biến thể đang được chọn được highlight rõ ràng.
    - **Cột bên phải**: Khối form chi tiết tương ứng của biến thể đang được chọn: Mã SKU, Nhãn phân loại (Variant Label), Mã vạch (Barcode), Giá bán niêm yết, Giá bán thực tế, Giá vốn WAC, Tồn kho thực tế / đang giữ / cách ly, Quy định quản lý theo sê-ri, Trọng lượng / kích thước đóng gói, và đặc biệt là **khối thông số kỹ thuật riêng của biến thể (`variant_spec` / `variantSpec`)** để quản lý các thông số kỹ thuật đặc thù của từng SKU (ví dụ: màu sắc, dung lượng, phiên bản ép xung, phụ kiện đi kèm), cùng công tắc kích hoạt kinh doanh. Cho phép lưu thay đổi biến thể ngay tại chỗ hoặc thêm mới trực tiếp mà không cần mở modal rời rạc.

## Technical Context And Dependencies

- Pre-requisites: Hoàn thành TASK-135.
- Reusable Assets: `ButtonDirective`, `SelectComponent`, `BadgeDirective`, `DynamicSpecRendererComponent`, `AdminProductTemplateService`, `ProductTemplateDetail`.
- Target Files:
  - `fe/src/app/features/admin/templates/admin-product-template-detail-page.component.ts`
  - `fe/src/app/features/admin/templates/services/admin-product-template.service.ts`
  - `be/src/services/admin/product-template.service.ts`

## Checklist

- [ ] Bổ sung tín hiệu quản lý tab `activeTab = signal<'general' | 'variants'>('general')` và tín hiệu biến thể được chọn `selectedVariantId = signal<number | null>(null)` trong [admin-product-template-detail-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/templates/admin-product-template-detail-page.component.ts).
- [ ] Thiết kế thanh chuyển đổi tab (Tab Navigation) ngay dưới phần header tóm tắt của trang chi tiết, tuân thủ token màu NVIDIA.
- [ ] Đóng gói toàn bộ phần nhập thông tin mẫu sản phẩm, thư viện ảnh media và thông số kỹ thuật động vào khung Tab 1 "Thông Tin Chung".
- [ ] Xây dựng bố cục 2 cột cho Tab 2 "Cấu Hình Chi Tiết":
  - Cột trái: Danh sách thẻ biến thể SKU thu gọn (Mã SKU, Giá bán, Tồn khả dụng, Trạng thái), hỗ trợ tìm kiếm biến thể và nút "+ Thêm biến thể".
  - Cột phải: Form biên tập chi tiết thông số biến thể đang được chọn: Mã SKU, variant label, barcode, giá bán, giá vốn, tồn kho, quản lý sê-ri, trạng thái.
  - Cột phải - Thông số riêng: Xây dựng khu vực biên tập cấu hình thông số kỹ thuật riêng của từng biến thể (`variant_spec` / `variantSpec`) để quản lý các trường đặc thù của từng SKU (như màu sắc, dung lượng, xung nhịp, thông số bổ trợ) độc lập với thông số chung của mẫu sản phẩm.
- [ ] Hỗ trợ tạo mới biến thể trực tiếp ngay trong Tab 2 bằng cách thiết lập trạng thái soạn thảo biến thể mới tại cột phải, bao gồm cả nhập thông số riêng `variant_spec`.
- [ ] Đồng bộ hóa việc lưu thay đổi biến thể (kèm trường `variant_spec` JsonB) với backend API thông qua [admin-product-template.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/templates/services/admin-product-template.service.ts) và [product-template.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/admin/product-template.service.ts).
- [ ] Kiểm thử tự động `npm run check:fe` và `npm run check:be` đạt exit code 0.

## Acceptance Criteria

- Criterion 1: Màn hình chi tiết chuyển đổi mượt mà giữa 2 tab "Thông Tin Chung" và "Cấu Hình Chi Tiết" mà không làm mất trạng thái hay dữ liệu đang soạn thảo.
- Criterion 2: Tab cấu hình chi tiết hiển thị chuẩn bố cục 2 cột: cột trái hiển thị danh sách gọn các biến thể (SKU, giá bán, tồn khả dụng, trạng thái), cột phải hiển thị chi tiết biến thể đang chọn.
- Criterion 3: Trường thông số kỹ thuật riêng của từng biến thể (`variant_spec`) được hiển thị, phân tách độc lập với thông số kỹ thuật chung của mẫu sản phẩm, hỗ trợ chỉnh sửa và lưu trữ chính xác dưới định dạng JsonB vào model `ProductVariant`.
- Criterion 4: Cho phép xem và chỉnh sửa linh hoạt cấu hình chi tiết, barcode, SKU, giá bán, variant label, variant_spec của từng biến thể mà không cần mở modal rời rạc.

## Verification Commands

- Command 1: `npm run check:fe`
- Command 2: `npm run check:be`

