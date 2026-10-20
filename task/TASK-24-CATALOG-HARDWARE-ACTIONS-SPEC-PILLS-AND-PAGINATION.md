# Task: TASK-24 - Nâng Cấp Nút Hành Động + Build PC, Pill Thông Số Kỹ Thuật Và Phân Trang Catalog

- Feature: Hardware Catalog Interactions, Spec Mono Pills & Standard Pagination
- Governing Spec: [ui-templates/store-front/product-list.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/product-list.html)
- Scope: frontend
- Priority: P1 (Critical) & P2 (Major)
- Status: Completed

## Objective

Nâng cấp giao diện danh sách linh kiện [fe/src/app/features/catalog/catalog-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4\web-nang-cao\project\fe\src\app\features\catalog\catalog-page.component.ts) theo mẫu thiết kế [product-list.html](file:///c:/University/Education%20program/HK1-nam-4\web-nang-cao\project\ui-templates\store-front\product-list.html). Bổ sung nút hành động "+ Build PC" trên từng thẻ sản phẩm để nạp linh kiện trực tiếp vào cấu hình đang dựng, hiển thị các nhãn thông số kỹ thuật cốt lõi (VRAM, Bus, TDP) dạng mono pill trên thẻ, hiển thị nhãn giảm giá và giá gốc gạch ngang, bổ sung bộ lọc tình trạng hàng (Sẵn hàng tại Showroom / Đặt trước) và tích hợp khối phân trang (Pagination) ở chân danh sách.

## Technical Context And Dependencies

- Pre-requisites: TASK-03, TASK-18, TASK-19
- Reusable Assets:
  - [fe/src/app/features/catalog/catalog-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4\web-nang-cao\project\fe\src\app\features\catalog\catalog-page.component.ts)
  - [fe/src/app/services/pc-build.service.ts](file:///c:/University/Education%20program/HK1-nam-4\web-nang-cao\project\fe\src\app\services\pc-build.service.ts)
  - [fe/src/app/services/cart.service.ts](file:///c:/University/Education%20program/HK1-nam-4\web-nang-cao\project\fe\src\app\services\cart.service.ts)
  - [fe/src/app/components/atoms](file:///c:/University/Education%20program/HK1-nam-4\web-nang-cao\project\fe\src\app\components\atoms)
- Target Files:
  - `fe/src/app/features/catalog/catalog-page.component.ts`
  - `fe/src/app/features/catalog/catalog.service.ts`
  - `fe/src/app/components/atoms/pagination/pagination.component.ts` (tùy chọn tạo mới reusable atom)

## Checklist

- [x] Tích hợp nút hành động "+ Build PC" trên thẻ sản phẩm (CT-01):
  - Bổ sung nút bấm "+ Build PC" cạnh nút Thêm vào giỏ hàng trên cả 2 chế độ hiển thị (Grid view và List view).
  - Kết nối với `PcBuildService`: tự động xác định slot tương thích của linh kiện dựa trên danh mục (ví dụ: sản phẩm CPU sẽ gán vào slot CPU, VGA vào slot Card đồ họa).
  - Hiển thị thông báo phản hồi nhanh (toast/badge) khi nạp thành công và cung cấp nút chuyển nhanh sang `/tu-lap-pc` để đối soát nguồn và kích thước.
- [x] Bổ sung các pill thông số kỹ thuật cốt lõi trên card sản phẩm (CT-02):
  - Trích xuất tự động các thuộc tính quan trọng từ `commonSpec` hoặc `variantSpec` (ví dụ: VRAM đối với VGA, Bus và chuẩn DDR đối với RAM, Socket và TDP đối với CPU, Form Factor đối với Mainboard/Case).
  - Hiển thị thành các pill nhỏ phông đơn khoảng (mono font) thanh lịch trên ảnh hoặc dưới tên sản phẩm theo đúng phong cách thiết kế phần cứng của Master Design System.
- [x] Bổ sung nhãn phần trăm giảm giá và hiển thị giá gốc gạch ngang (CT-03):
  - Hiển thị huy hiệu giảm giá (ví dụ: "-12%") góc trên thẻ sản phẩm khi có chương trình khuyến mãi.
  - Hiển thị giá niêm yết cũ dạng gạch ngang (`line-through text-muted`) bên cạnh giá bán thực tế.
- [x] Bổ sung bộ lọc Tình trạng hàng trên thanh lọc bên trái (CT-04):
  - Tùy chọn: "Tất cả tình trạng", "Sẵn hàng tại Showroom (Lấy ngay)", "Đặt hàng trước (2-3 ngày)".
  - Cập nhật tín hiệu lọc đồng bộ với danh sách sản phẩm hiển thị.
- [x] Tích hợp thành phần phân trang (Pagination) ở chân danh mục sản phẩm (CT-05):
  - Hiển thị số trang hiện tại, các nút chuyển trang Trước / Sau và nút số trang cụ thể (1, 2, 3... Trang cuối).
  - Đồng bộ số trang với URL query param `?page=N`.
  - Tự động cuộn mượt (smooth scroll) lên đầu danh sách khi chuyển trang.

## Acceptance Criteria

- Criterion 1: Người dùng có thể click nút "+ Build PC" trên thẻ bất kỳ linh kiện nào để đưa món đó vào cấu hình máy tính đang soạn thảo mà không gặp lỗi.
- Criterion 2: Thẻ sản phẩm hiển thị tối thiểu 2-3 thông số kỹ thuật cốt lõi dạng pill mono giúp nhận diện nhanh thuộc tính phần cứng.
- Criterion 3: Sản phẩm có ưu đãi hiển thị rõ ràng giá gốc gạch ngang và tỷ lệ phần trăm giảm giá.
- Criterion 4: Khối phân trang ở chân trang hoạt động chuẩn xác, hiển thị đúng số lượng trang và hỗ trợ chuyển trang mượt mà.

## Verification Commands

- Command 1: npm run check:fe
