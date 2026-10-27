# Task: TASK-93 - Chuẩn Hóa Cỡ Chữ Normal Text 14px Và Loại Bỏ Monospace Toàn Bộ Phân Hệ Khách Hàng (Storefront)

- Feature: Storefront Sans-Serif Normal Text 14px Standardization & Monospace Removal
- Governing Spec: [MASTER.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/design-system/el-tech/MASTER.md), [TASK-92-FOUNDATION-TYPOGRAPHY-TOKENS-AND-SHARED-COMPONENTS.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/task/TASK-92-FOUNDATION-TYPOGRAPHY-TOKENS-AND-SHARED-COMPONENTS.md)
- Scope: frontend
- Priority: P1 (High)
- Status: Complete

## Traceability & Graph Links

- Task Type: `ui-ux-refactor`
- Issue References: Hơn 150 vị trí trong phân hệ Storefront đang sử dụng phông chữ `font-mono` cho số tiền, mã đơn, mã SKU, nhãn spec; đồng thời nhiều nhãn thông tin chính, nút bấm và badge đang bị thu nhỏ xuống 9px, 10px, 11px hoặc 12px gây khó đọc cho khách hàng.
- Related Tasks:
  - [[TASK-01-SHELL-AND-TELEMETRY-HEADER]]
  - [[TASK-03-CATALOG-FILTERBAR-AND-GRID]]
  - [[TASK-05-PC-BUILDER-COMPATIBILITY-AND-SWAP]]
  - [[TASK-06-CHECKOUT-AND-ORDER-SUCCESS]]
  - [[TASK-79-FRONTEND-TABULAR-NUMERALS-CONTRAST-AND-MOTION-POLISH]]
  - [[TASK-92-FOUNDATION-TYPOGRAPHY-TOKENS-AND-SHARED-COMPONENTS]]

## Objective

1. Loại bỏ toàn bộ việc sử dụng phông monospace (`font-mono`):
   - Thay thế toàn bộ class `font-mono` trên toàn bộ các trang giao diện Storefront bằng phông sans-serif chuẩn của hệ thống.
   - Đối với các vị trí hiển thị số tiền VND, tỷ lệ phần trăm ưu đãi, mã đơn hàng, mã SKU, số lượng giỏ hàng, thông số bus/dung lượng: giữ nguyên hoặc bổ sung class `tabular` (`font-variant-numeric: tabular-nums`) để đảm bảo các con số có độ rộng cân bằng nhưng hiển thị bằng phông sans-serif hiện đại.

2. Chuẩn hóa cỡ chữ toàn bộ normal text lên mức 14px (`text-sm`):
   - Nâng cỡ chữ của tất cả các nhãn thông tin sản phẩm, thông số linh kiện (CPU, GPU, RAM, SSD, PSU), tiêu đề card sản phẩm, giá bán, nút hành động, trường form nhập liệu, nhãn lọc danh mục, chip trạng thái từ 11px/12px lên 14px (`text-sm`).
   - Xóa bỏ triệt để toàn bộ các class kích thước tùy tiện dưới 12px: `text-[9px]`, `text-[10px]`, `text-[11px]`.

3. Giới hạn nghiêm ngặt cỡ chữ 12px (`text-xs`):
   - Cỡ chữ 12px (`text-xs`) chỉ được phép xuất hiện tại các vị trí mô tả bổ sung không quan trọng:
     - Ghi chú phụ trợ về bản quyền, giấy phép ở chân trang (Footer).
     - Dòng nhắc phụ về định dạng tập tin hỗ trợ đính kèm dưới ô upload.
     - Dòng thời gian mờ phụ của trạng thái lịch sử đơn hàng.
     - Dòng mô tả hướng dẫn bổ trợ phía dưới nhãn chính của trường nhập liệu (helper text).

4. Rà soát và cập nhật chi tiết từng màn hình Storefront:
   - Header, Shell, Search gợi ý và Telemetry bar: [storefront-shell.component.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/storefront/storefront-shell.component.html), [storefront-shell.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/storefront/storefront-shell.component.ts).
   - Trang chủ và Bento Rig Showcase: [storefront-home.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/storefront/storefront-home.component.ts).
   - Trang danh mục và lưới sản phẩm: [catalog-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/catalog/catalog-page.component.ts).
   - Trang chi tiết sản phẩm và modal đánh giá: [product-detail-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/catalog/product-detail-page.component.ts), [review-modal.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/catalog/review-modal.component.ts).
   - Công cụ PC Builder và modal đổi linh kiện: [custom-build-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/pc-build/custom-build-page.component.ts), [component-swap-modal.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/pc-build/component-swap-modal.component.ts).
   - Giỏ hàng chính và ngăn kéo giỏ hàng trượt: [cart-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/cart/cart-page.component.ts), [cart-drawer.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/cart/cart-drawer.component.ts).
   - Trang thanh toán và trang biên nhận đặt hàng thành công: [checkout-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/checkout/checkout-page.component.ts), [order-success-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/checkout/order-success-page.component.ts).
   - Trang tra cứu đơn hàng, Kanban và hủy đơn: [order-lookup-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/orders/order-lookup-page.component.ts), [order-kanban-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/orders/order-kanban-page.component.ts), [order-cancel-modal.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/orders/order-cancel-modal.component.ts).
   - Trang thông tin tài khoản, đơn hàng của tôi và bảo hành/hoàn tiền: [profile-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/profile/profile-page.component.ts), [refund-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/refund/refund-page.component.ts), [auth-modal.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/auth/auth-modal.component.ts).

## Technical Context And Dependencies

- Target Files:
  - `fe/src/app/features/storefront/storefront-shell.component.html`
  - `fe/src/app/features/storefront/storefront-shell.component.ts`
  - `fe/src/app/features/storefront/storefront-home.component.ts`
  - `fe/src/app/features/catalog/catalog-page.component.ts`
  - `fe/src/app/features/catalog/product-detail-page.component.ts`
  - `fe/src/app/features/catalog/review-modal.component.ts`
  - `fe/src/app/features/pc-build/custom-build-page.component.ts`
  - `fe/src/app/features/pc-build/component-swap-modal.component.ts`
  - `fe/src/app/features/cart/cart-page.component.ts`
  - `fe/src/app/features/cart/cart-drawer.component.ts`
  - `fe/src/app/features/checkout/checkout-page.component.ts`
  - `fe/src/app/features/checkout/order-success-page.component.ts`
  - `fe/src/app/features/orders/order-lookup-page.component.ts`
  - `fe/src/app/features/orders/order-kanban-page.component.ts`
  - `fe/src/app/features/orders/order-cancel-modal.component.ts`
  - `fe/src/app/features/profile/profile-page.component.ts`
  - `fe/src/app/features/refund/refund-page.component.ts`
  - `fe/src/app/features/auth/auth-modal.component.ts`

## Checklist

- [x] Xóa bỏ toàn bộ class `font-mono` trong các tệp giao diện Storefront, thay bằng sans-serif kết hợp lớp `tabular` cho các vị trí hiển thị số liệu.
- [x] Thay thế toàn bộ class `text-[9px]`, `text-[10px]`, `text-[11px]` bằng `text-sm` (14px) hoặc `text-xs` (12px cho mô tả phụ).
- [x] Chuyển đổi các nhãn normal text đang dùng `text-xs` trong giỏ hàng, thông số cấu hình PC Builder, thẻ thông tin sản phẩm và form thanh toán lên `text-sm` (14px).
- [x] Xác nhận chỉ còn lại các dòng mô tả phụ không quan trọng là sử dụng `text-xs` (12px).
- [x] Kiểm tra hiển thị responsive không bị tràn khung hay xô lệch giao diện sau khi tăng kích thước chữ.
- [x] Chạy kiểm tra pre-commit gate `npm run check:fe` đạt exit code 0.

## Review & Verification Report

### Code Completion Summary

- Đã hoàn tất rà soát và loại bỏ toàn bộ `font-mono` cùng các kích thước phông tùy tiện dưới 12px trên toàn bộ 18 tệp giao diện Storefront:
  - Header & Telemetry Shell: Thông số độ trễ, số lượng giỏ hàng và danh mục gợi ý dùng sans-serif + tabular.
  - Bento Rig Showcase (Trang chủ): Thẻ thông số phần cứng, giá bán, chip giảm giá chuẩn hóa 14px sans-serif.
  - Catalog & Product Detail & Reviews: Toàn bộ thông số CPU/GPU, bus RAM, dung lượng SSD, sao đánh giá và form đánh giá đạt chuẩn 14px.
  - PC Builder & Component Swap Modal: Bảng danh sách linh kiện, bộ lọc socket/TDP và nút thay đổi linh kiện đạt chuẩn 14px text-sm.
  - Cart Page & Slide-over Drawer: Dòng sản phẩm, trường số lượng, tạm tính và phí vận chuyển hiển thị rõ nét sans-serif.
  - Checkout & Order Success: Toàn bộ input form, địa chỉ nhận hàng, phương thức thanh toán, mã đơn hàng đạt chuẩn 14px.
  - Order Lookup, Kanban & Cancel Modal: Mã tra cứu, thẻ Kanban các công đoạn và form lý do hủy đơn chuẩn hóa 14px.
  - Customer Profile, VietQR Payment & Refund RMA: Loại bỏ phông mono ở số tài khoản và cú pháp chuyển khoản, nâng cấp toàn bộ trường biểu mẫu và danh mục bảo hành lên 14px.
  - Auth Modal: Chuẩn hóa nhãn và input đăng nhập/đăng ký lên 14px, xóa bỏ các nhãn chữ nhỏ dưới 12px.

### Dual-Pass Code Review

- Pass A (Functional):
  - Xác nhận toàn bộ phân hệ Storefront hiển thị rõ ràng, dễ đọc với kích thước chữ 14px cho normal text.
  - Kiểm tra các số liệu tiền tệ, số lượng và mã đơn hàng dùng phông sans-serif với `tabular` thẳng hàng ngay ngắn.
  - Không còn chữ siêu nhỏ gây căng thẳng thị giác cho người dùng.
- Pass B (Convention):
  - Tuyệt đối không có emoji hoặc icon trang trí trong mã nguồn, log hoặc tài liệu.
  - Không có chú thích dạng đánh số thứ tự trong mã nguồn.
  - Pre-commit check `npm run check:fe` đạt exit code 0 hoàn hảo.
- Verdict: PASS.
