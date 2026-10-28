# Tài liệu flow và specification

Thư mục `docs/` là nguồn tài liệu có version cho hành vi UX, thiết kế UI, chuẩn
frontend và hợp đồng triển khai của từng tính năng EL-TECH. Các tài liệu trong
`plan/` vẫn là đầu vào khám phá và roadmap; chúng không thay thế approval riêng
của flow/design/spec mới.

## Cấu trúc

```text
docs/
  <feature-name>/
    flows/
      v1.md
      v2-diff.md
    designs/
      v1.md
      v2-diff.md
    specs/
      v1.md
      v2-diff.md
    implementation-plans/
      v1.md
    reviews/
      <checkpoint>.md
  templates/
    flow-v1.md
    ui-design-v1.md
    spec-v1.md
    implementation-plan-v1.md
    version-diff.md
  frontend-standards/
    interaction-patterns-v1.md
    component-registry-v1.md
```

- `flows/`: hành trình quan sát được của khách hàng, độc lập với code.
- `designs/`: layout, surface, pattern, responsive và state placement đã duyệt.
- `specs/`: ánh xạ flow đã duyệt vào Angular, REST API, service, Prisma và test.
- `implementation-plans/`: chia spec thành phase nhỏ có review gate.
- `reviews/`: bằng chứng review theo checkpoint nếu cần lưu lâu dài.
- `frontend-standards/`: pattern IDs và registry component dùng chung, có version.

## Chu trình bắt buộc

1. Viết flow từ `templates/flow-v1.md` và đặt trạng thái `In review`.
2. Ghi approval rõ người duyệt và ngày duyệt. Chưa approval thì chưa viết code
   làm thay đổi hành vi.
3. Sau approval flow, viết UI design từ `templates/ui-design-v1.md` cho thay đổi
   customer-facing có layout/interaction đáng kể và tiếp tục qua approval design.
4. Sau approval design khi áp dụng, viết spec từ `templates/spec-v1.md`, kiểm tra
   module thật trong repo và tiếp tục qua approval spec.
5. Chia implementation thành các phase. Mỗi phase khai báo review mode/scope và
   validation tương ứng.
6. Code từng phase.
7. Review functional và convention thành hai pass độc lập khi dùng `mode=both`.
8. Fix blocker, chạy validation có mục tiêu, rồi re-review phần bị ảnh hưởng.
9. Chỉ đánh dấu `Implemented` khi mọi checkpoint đóng và không còn blocker.

Workflow chi tiết nằm tại
`.agents/skills/feature-delivery-workflow/SKILL.md`.

## Versioning

- `v1.md` là baseline đầy đủ và không bị ghi đè sau khi đã duyệt.
- Thay đổi vật liệu tạo `v<N>-diff.md` từ `templates/version-diff.md`.
- Đọc baseline cùng mọi diff được duyệt theo thứ tự tăng dần để dựng requirement
  hiện hành.
- Thay đổi actor, state, decision, tiền, tồn kho, quyền, recovery hoặc acceptance
  criteria phải đưa tài liệu bị ảnh hưởng về `Draft` và duyệt lại.
- Sửa lỗi giữ nguyên hành vi hoặc tinh chỉnh visual nhỏ không cần version flow mới.

Trạng thái hợp lệ cho flow/design/spec: `Draft`, `In review`, `Approved`, `Superseded`.
Không tự suy diễn `Approved` từ trạng thái của tài liệu trong `plan/`.

## Flow đang chờ duyệt

- [Khám phá sản phẩm và chọn cấu hình PC](storefront-and-pc-selection/flows/v1.md)
- [Định danh khách hàng và truy cập đơn](customer-identity-and-order-access/flows/v1.md)
- [Giỏ hàng, checkout và thanh toán](cart-checkout-payment/flows/v1.md)
- [Theo dõi đơn và hậu mãi trong phạm vi MVP](order-tracking-and-aftercare/flows/v1.md)

Chưa tạo design/spec cho bốn flow trên vì approval đang `Pending`. Sau khi
project owner duyệt flow, tạo UI design cần thiết trước rồi mới tạo spec; không
chuyển nguyên nội dung kế hoạch cũ thành file kỹ thuật.

## Phân hệ quản trị (Admin Portal)

- [Hướng dẫn và kiến trúc triển khai phân hệ Admin](admin-portal-implementation-guide.md)
- [Danh mục chi tiết các màn hình và hộp thoại phân hệ Admin](admin-portal-screens-and-modals.md)
- [Bộ giao diện mẫu UI Templates phân hệ Admin (30 màn hình, 39 hộp thoại)](../ui-templates/admin-portal/README.md)
