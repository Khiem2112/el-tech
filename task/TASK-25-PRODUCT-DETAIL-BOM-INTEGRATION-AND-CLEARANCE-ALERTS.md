# Task: TASK-25 - Tích Hợp Nạp Linh Kiện Vào Cấu Hình PC, Thư Viện Ảnh Đa Góc Và Cảnh Báo Case Clearance Trang Chi Tiết Sản Phẩm

- Feature: Product Detail Hardware Diagnostics, BOM Modal, Multi-Angle Gallery & Star Histogram
- Governing Spec: [ui-templates/store-front/product-detail.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/product-detail.html)
- Scope: frontend
- Priority: P1 (Critical), P2 (Major) & P3 (Minor)
- Status: Completed

## Objective

Nâng cấp trang chi tiết sản phẩm [fe/src/app/features/catalog/product-detail-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4\web-nang-cao\project\fe\src\app\features\catalog\product-detail-page.component.ts) theo mẫu thiết kế [product-detail.html](file:///c:/University/Education%20program/HK1-nam-4\web-nang-cao\project\ui-templates\store-front\product-detail.html). Bổ sung nút hành động "Thêm vào Cấu hình PC" kèm cửa sổ Modal BOM cho phép đưa linh kiện vào dàn máy đang soạn thảo và kiểm tra tương thích tức thì; nâng cấp thư viện hình ảnh hỗ trợ danh sách thumbnail xem trước đa góc nhìn; bổ sung 3 pill thông số nhanh ở đầu trang; tích hợp hộp cảnh báo khoảng trống thùng máy (Case Clearance Alert); và hoàn thiện biểu đồ cột phân bổ sao đánh giá (Histogram 5 sao đến 1 sao).

## Technical Context And Dependencies

- Pre-requisites: TASK-04, TASK-20
- Reusable Assets:
  - [fe/src/app/features/catalog/product-detail-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4\web-nang-cao\project\fe\src\app\features\catalog\product-detail-page.component.ts)
  - [fe/src/app/services/pc-build.service.ts](file:///c:/University/Education%20program/HK1-nam-4\web-nang-cao\project\fe\src\app\services\pc-build.service.ts)
  - [fe/src/app/components/atoms](file:///c:/University/Education%20program/HK1-nam-4\web-nang-cao\project\fe\src\app\components\atoms)
  - [fe/src/app/lib/vnd.pipe.ts](file:///c:/University/Education%20program/HK1-nam-4\web-nang-cao\project\fe\src\app\lib\vnd.pipe.ts)
- Target Files:
  - `fe/src/app/features/catalog/product-detail-page.component.ts`

## Checklist

- [x] Tích hợp nút hành động "Thêm vào Cấu hình PC" và Modal BOM (PD-01):
  - Bổ sung nút "Thêm vào Cấu hình PC" nổi bật bên cạnh nút "Thêm vào giỏ hàng" và "Mua ngay".
  - Khi click, mở modal BOM hiển thị cấu hình máy tính hiện tại của người dùng, làm nổi bật vị trí slot linh kiện tương ứng sẽ được thay thế hoặc lắp vào.
  - Tự động kiểm tra tương thích cơ bản (chân cắm Socket, chuẩn khe cắm PCIe, công suất nguồn dự kiến) và cung cấp nút bấm xác nhận đưa vào dàn máy kèm chuyển hướng tới `/tu-lap-pc`.
- [x] Nâng cấp thư viện hình ảnh sản phẩm đa góc nhìn (PD-02):
  - Bổ sung dải thumbnail ảnh phụ bên dưới hoặc bên cạnh ảnh lớn chính.
  - Hỗ trợ click vào từng thumbnail để đổi ảnh lớn mượt mà.
  - Hiển thị huy hiệu ảnh chính hãng / tem bảo hành phân phối.
- [x] Bổ sung 3 khối pill thông số nhanh ở đầu trang chi tiết (PD-03):
  - Hiển thị 3 thẻ pill thông số kỹ thuật then chốt ngay dưới tiêu đề sản phẩm (ví dụ: Kiến trúc/Thế hệ, Chuẩn giao tiếp/khe cắm, và Công suất nguồn đề xuất tối thiểu).
- [x] Tích hợp hộp cảnh báo khoảng trống lắp đặt thùng máy (Case Clearance Alert) (PD-04):
  - Đối với các linh kiện có kích thước lớn hoặc tỏa nhiệt cao (như Card VGA dài trên 300mm hoặc tản nhiệt nước Radiator 360mm), hiển thị hộp cảnh báo màu vàng/xanh kỹ thuật lưu ý kích thước thùng máy tối thiểu cần thiết để người dùng không mua nhầm.
- [x] Hoàn thiện biểu đồ phân bổ sao đánh giá (Histogram) trong tab Đánh giá khách hàng (PD-05):
  - Triển khai thanh tỷ lệ phần trăm trực quan từ 5 sao xuống 1 sao (thanh màu xanh/vàng thể hiện số lượt và phần trăm đánh giá).
  - Tóm tắt điểm trung bình (ví dụ: 4.9 / 5.0) và tổng số lượt đánh giá đã kiểm định mua hàng.

## Acceptance Criteria

- Criterion 1: Người dùng có thể click nút "Thêm vào Cấu hình PC" trên trang chi tiết để nạp linh kiện vào bộ PC đang soạn thảo.
- Criterion 2: Thư viện ảnh hỗ trợ duyệt các ảnh phụ thumbnail và chuyển ảnh hiển thị lớn chính xác.
- Criterion 3: Các sản phẩm card màn hình hoặc tản nhiệt kích thước lớn hiển thị hộp cảnh báo Case Clearance rõ ràng.
- Criterion 4: Tab đánh giá hiển thị biểu đồ phân bổ số sao từ 5 sao đến 1 sao trực quan theo đúng thiết kế mẫu.

## Verification Commands

- Command 1: npm run check:fe
