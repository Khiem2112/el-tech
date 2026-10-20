# Task: TASK-26 - Kiểm Tra Tồn Kho Chi Nhánh PC Builder, Ô Linh Kiện Trống Nét Đứt Và Đổi Món Giỏ Hàng

- Feature: PC Builder Branch Availability, Empty Slot States, Service Checkboxes, Swap Thumbnails & Cart Progress Bar
- Governing Spec: [ui-templates/store-front/pc-build.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/pc-build.html) và [ui-templates/store-front/cart.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/cart.html)
- Scope: frontend
- Priority: P1 (Critical) & P2 (Major)
- Status: Completed

## Objective

Nâng cấp trình tự dựng PC [fe/src/app/features/pc-build/custom-build-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/pc-build/custom-build-page.component.ts), modal đổi linh kiện [fe/src/app/features/pc-build/component-swap-modal.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/pc-build/component-swap-modal.component.ts) và giỏ hàng [fe/src/app/features/cart/cart-drawer.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/cart/cart-drawer.component.ts) theo mẫu thiết kế [pc-build.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/pc-build.html) và [cart.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/cart.html). Bổ sung bộ chọn chi nhánh và kiểm tra tính sẵn sàng của toàn bộ linh kiện tại kho; chuẩn hóa các ô linh kiện trống dạng viền nét đứt kèm nút kêu gọi hành động; chuyển đổi các gói dịch vụ kỹ thuật thành checkbox có thể bật/tắt; bổ sung thumbnail hình ảnh và bộ lọc thông số chi tiết trong Component Swap Modal; kết nối nút "Đổi món" trực tiếp từ giỏ hàng mở modal thay thế; và hiển thị thanh tiến trình miễn phí vận chuyển trong giỏ hàng.

## Technical Context And Dependencies

- Pre-requisites: TASK-05, TASK-20, TASK-21
- Reusable Assets:
  - [fe/src/app/features/pc-build/custom-build-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/pc-build/custom-build-page.component.ts)
  - [fe/src/app/features/pc-build/component-swap-modal.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/pc-build/component-swap-modal.component.ts)
  - [fe/src/app/features/cart/cart-drawer.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/cart/cart-drawer.component.ts)
  - [fe/src/app/services/pc-build.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/services/pc-build.service.ts)
  - [fe/src/app/services/cart.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/services/cart.service.ts)
- Target Files:
  - `fe/src/app/features/pc-build/custom-build-page.component.ts`
  - `fe/src/app/features/pc-build/component-swap-modal.component.ts`
  - `fe/src/app/features/cart/cart-drawer.component.ts`
  - `fe/src/app/features/cart/cart-page.component.ts`

## Checklist

- [x] Tích hợp bộ chọn chi nhánh và kiểm tra tồn kho tại cột tóm tắt Builder (PB-01):
  - Bổ sung dropdown chọn Showroom bàn giao máy (Hà Nội Thái Hà, TP.HCM 280 3/2, Đà Nẵng Hàm Nghi).
  - Kiểm tra trạng thái tồn kho thực tế của toàn bộ các linh kiện đã chọn trong cấu hình tại chi nhánh đó.
  - Hiển thị badge: "Đủ linh kiện tại chi nhánh (Sẵn sàng lắp ngay)" hoặc "Cần điều chuyển 1-2 món từ kho tổng (Chờ 24h)".
- [x] Chuẩn hóa giao diện ô linh kiện chưa chọn dạng viền nét đứt (PB-02):
  - Thiết kế các slot còn trống (như Vỏ Case, Tản nhiệt, Quạt...) với viền `border-2 border-dashed border-line hover:border-primary`.
  - Nút kêu gọi hành động nổi bật: "+ Chọn Vỏ Case Tương Thích", "+ Chọn Tản Nhiệt", v.v.
- [x] Chuyển đổi gói dịch vụ kỹ thuật sang dạng checkbox tự chọn (PB-03):
  - Gói Lắp ráp và đi dây chuyên nghiệp (0đ / Miễn phí).
  - Gói Cài đặt hệ điều hành và chạy Stress Test FurMark/Cinebench 24h (0đ / Miễn phí).
  - Hỗ trợ lưu trạng thái tùy chọn dịch vụ này vào payload đơn hàng khi thêm cấu hình vào giỏ hàng.
- [x] Nâng cấp Component Swap Modal với ảnh đại diện thumbnail và bộ lọc thông số động (SW-01, SW-02):
  - Hiển thị thumbnail ảnh sản phẩm nhỏ bên cạnh tên linh kiện trong danh sách hoán đổi.
  - Bổ sung bộ lọc thông số kỹ thuật động theo từng danh mục slot (CPU: Socket, số nhân; RAM: Chuẩn DDR, Bus MHz; VGA: Dung lượng VRAM, độ dài; PSU: Công suất Watt; Case: Form factor).
- [x] Kết nối nút "Đổi món" trong giỏ hàng với Component Swap Modal (CA-01):
  - Trong accordion chi tiết cấu hình PC của Cart Drawer và Cart Page, khi người dùng click "Đổi món" ở một linh kiện con, mở modal swap tương ứng để đổi sản phẩm trực tiếp trong giỏ hàng mà không cần reset cấu hình.
- [x] Bổ sung dải tiến trình miễn phí vận chuyển trong giỏ hàng (CA-02):
  - Thanh tiến trình phần trăm đạt ngưỡng miễn phí ship (ví dụ: Miễn phí vận chuyển cho đơn hàng từ 5.000.000đ).
  - Hiển thị thông báo động: "Mua thêm X để được MIỄN PHÍ VẬN CHUYỂN TOÀN QUỐC" hoặc "Bạn đã đạt điều kiện miễn phí vận chuyển!".

## Acceptance Criteria

- Criterion 1: Builder có trường chọn chi nhánh và thể hiện được trạng thái sẵn sàng của toàn bộ linh kiện đã chọn.
- Criterion 2: Ô linh kiện chưa chọn hiển thị viền nét đứt và nút kêu gọi hành động chuẩn xác.
- Criterion 3: Component Swap Modal có hình ảnh thumbnail của từng linh kiện và bộ lọc thông số kỹ thuật hoạt động đúng.
- Criterion 4: Nút "Đổi món" trong giỏ hàng kích hoạt modal hoán đổi linh kiện thành công.
- Criterion 5: Thanh tiến trình miễn phí giao hàng trong giỏ hiển thị trực quan và tính toán chính xác số tiền còn thiếu.

## Verification Commands

- Command 1: npm run check:fe
