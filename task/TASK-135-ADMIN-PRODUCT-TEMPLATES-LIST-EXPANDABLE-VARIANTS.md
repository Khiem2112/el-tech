# Task: TASK-135 - Hợp Nhất Mẫu & Biến Thể: Danh Sách Mẫu Mở Rộng Dropdown Biến Thể SKU

- Feature: Admin Product Catalog Unified List
- Governing Spec: Yêu cầu hợp nhất giao diện mẫu sản phẩm và biến thể SKU: Trang danh sách hiển thị các mẫu sản phẩm (Product Template), mỗi mẫu có thể nhấn dropdown để hiển thị các biến thể SKU bên dưới, theo dõi đầy đủ thông tin tồn kho và giá theo từng mẫu và từng biến thể
- Scope: shared
- Status: Complete

## Objective

Hợp nhất toàn diện trải nghiệm danh mục sản phẩm trên màn hình danh sách, loại bỏ sự phân mảnh giữa trang Mẫu sản phẩm và trang Biến thể SKU độc lập:
- Tái cấu trúc trang danh sách Mẫu sản phẩm ([admin-product-templates-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/templates/admin-product-templates-page.component.ts)) thành giao diện quản lý danh mục hợp nhất:
  - Mỗi dòng trên bảng là một Mẫu sản phẩm (Product Template) với các thông tin tổng hợp: Tên mẫu, danh mục, thương hiệu, trạng thái vòng đời, số lượng biến thể SKU, khoảng giá bán (từ giá thấp nhất đến cao nhất) và tổng số lượng tồn kho (tồn thực tế / tồn khả dụng).
  - Cung cấp nút bấm mũi tên (expand/dropdown) ở đầu mỗi dòng mẫu sản phẩm. Khi nhấn mở rộng, bung ra bảng con ngay bên dưới hiển thị danh sách toàn bộ các biến thể SKU trực thuộc: Mã SKU, Tên phân loại (variant label), Mã vạch (barcode), Giá niêm yết, Giá bán, Tồn kho thực tế (On-hand), Tồn kho khả dụng (Available), Trạng thái bán (Active/Inactive) và nút thao tác nhanh.
- Nâng cấp API backend [product-template.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/admin/product-template.service.ts) để truy vấn kèm danh sách biến thể `variants` cùng số dư tồn kho `stockQuant` khi trả về danh sách mẫu sản phẩm.
- Dọn dẹp menu điều hướng sidebar trong [admin-navigation.constants.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/constants/admin-navigation.constants.ts) và cấu hình chuyển hướng `/admin/catalog/variants` về `/admin/catalog/templates`.

## Technical Context And Dependencies

- Pre-requisites: Hoàn thành TASK-129.
- Reusable Assets: `ButtonDirective`, `SelectComponent`, `BadgeDirective`, `AdminProductTemplateService`, `ProductTemplateListItem`.
- Target Files:
  - `fe/src/app/features/admin/templates/admin-product-templates-page.component.ts`
  - `fe/src/app/features/admin/templates/services/admin-product-template.service.ts`
  - `fe/src/app/features/admin/admin.routes.ts`
  - `fe/src/app/features/admin/constants/admin-navigation.constants.ts`
  - `be/src/services/admin/product-template.service.ts`
  - `be/src/routes/admin/product-template.routes.ts`

## Checklist

- [x] Nâng cấp hàm truy vấn `getProductTemplates` trong [product-template.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/admin/product-template.service.ts) để nạp kèm mảng `variants` gồm các trường `sku`, `variationLabel`, `barcode`, `retailPrice`, `sellingPrice`, `isActive` cùng `stockQuant` (onHand, available, reserved) và tính toán khoảng giá (minPrice, maxPrice), tổng tồn của template.
- [x] Cập nhật kiểu `ProductTemplateListItem` trong [admin-product-template.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/templates/services/admin-product-template.service.ts) để tương thích với cấu trúc dữ liệu mới.
- [x] Tái cấu trúc bảng hiển thị trong [admin-product-templates-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/templates/admin-product-templates-page.component.ts): thêm cột nút mở rộng dropdown, hiển thị tổng tồn và khoảng giá trên dòng mẫu cha.
- [x] Xây dựng hàng mở rộng (expandable row template) hiển thị bảng con danh sách biến thể SKU trực thuộc với đầy đủ thông số: Mã SKU, nhãn biến thể, mã vạch, giá niêm yết, giá bán, tồn kho thực tế, tồn khả dụng và trạng thái.
- [x] Quản lý trạng thái mở rộng dòng bằng tập hợp mã id `expandedTemplateIds = signal<Set<number>>(new Set())` để đảm bảo thao tác đóng/mở độc lập, mượt mà.
- [x] Cập nhật [admin.routes.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/admin.routes.ts) chuyển hướng `catalog/variants` sang `catalog/templates`.
- [x] Dọn dẹp liên kết "Biến thể SKU" trên menu điều hướng [admin-navigation.constants.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/constants/admin-navigation.constants.ts), tập trung người dùng vào menu "Mẫu Sản Phẩm & Biến Thể".
- [x] Kiểm thử tự động `npm run check:fe` và `npm run check:be` đạt exit code 0.

## Acceptance Criteria

- Criterion 1: Trang danh sách mẫu sản phẩm hiển thị đầy đủ tổng tồn và khoảng giá theo từng mẫu; người dùng có thể nhấp mở rộng từng mẫu để xem danh sách biến thể SKU bên dưới với số tồn và giá chi tiết.
- Criterion 2: Thao tác mở rộng/thu gọn mượt mà, lưu trữ trạng thái mở rộng theo từng dòng mà không gây giật lag khi danh sách có nhiều bản ghi.
- Criterion 3: Tuyến đường `/admin/catalog/variants` tự động chuyển hướng về trang danh mục hợp nhất, menu điều hướng chỉ còn mục "Mẫu Sản Phẩm & Biến Thể".

## Verification Commands

- Command 1: `npm run check:fe`
- Command 2: `npm run check:be`

