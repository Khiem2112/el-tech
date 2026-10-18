# 05 — Theo dõi đơn, tài khoản, thông báo và đánh giá

## 1. Lịch sử đơn `/tai-khoan/don-hang`

### Quyền

- Chỉ User session đã liên kết đúng Customer.
- Guest session không được dùng route liệt kê này; guest chỉ xem order đã authorize.

### Cấu trúc desktop

1. Account sidebar.
2. H1 `Đơn hàng của tôi` + tổng count.
3. Toolbar:
   - Search theo order code/product name.
   - Filter trạng thái order.
   - Filter trạng thái payment.
   - Sort mới nhất/cũ nhất.
4. List rows/cards, không cần data table rộng:
   - Order code + created date.
   - 1–2 product thumbnails + remaining count.
   - Fulfillment method/branch.
   - Order status badge.
   - Payment status badge riêng.
   - Frozen grand total.
   - Primary action `Xem chi tiết`.
   - Context action `Thanh toán`/`Hủy đơn`/`Đánh giá` khi eligible.
5. Cursor pagination hoặc page pagination; filter reflected in URL.

### Mobile

- Filter sheet.
- Mỗi order thành card với code, date, two statuses, total và một CTA chính.
- Không ngang-scroll bảng nhiều cột.

### States

- First-use: `Bạn chưa có đơn hàng` + CTA khám phá sản phẩm.
- Filtered empty: clear filters, không onboarding copy.
- Fetch failed: giữ cache + Retry.
- Refetch: giữ list, progress subtle.

## 2. Chi tiết đơn `/don-hang/:orderCode`

### Quyền sở hữu

- Account session đúng Customer hoặc guest session time-limited scope đúng order (`CUS-012`).
- Không authorize chỉ từ order code.

### Cấu trúc trang

1. Breadcrumb/back + order code + created time.
2. Hero status block:
   - Customer-facing order label.
   - Payment label riêng.
   - Hold reason rõ nếu có.
   - Next expected action và actor chịu trách nhiệm.
3. Progress timeline dựa trên transition history, không dựng từ timestamp giả.
4. Action bar theo eligibility:
   - Thanh toán QR/charge bổ sung.
   - Hủy đơn.
   - Chấp nhận amendment.
   - Xác nhận redelivery choice nếu được yêu cầu.
   - Viết đánh giá khi completed.
5. Items/BOM snapshot:
   - Product/SKU snapshot, quantity, unit price, promotions/coupon allocation.
   - Build grouping và assembly service.
   - Không lấy tên/giá/spec hiện tại ghi đè snapshot.
6. Fulfillment:
   - Pickup branch snapshot, hoặc delivery address snapshot.
   - Manual delivery update/tracking note; không carrier map/webhook promise.
7. Payment summary:
   - Method, state, paid amount, amount outstanding.
   - Deposit amount/disposition cho Custom Build COD.
   - Amendment charge riêng; không rewrite original total.
8. Price breakdown frozen.
9. Receiver/contact snapshot được mask phù hợp.
10. Notification/activity feed liên quan.
11. Help section.

### Customer-facing state copy

- `PENDING_PAYMENT`: Chờ thanh toán.
- `PENDING_COD_CONFIRMATION`: Chờ cửa hàng xác nhận COD.
- `CONFIRMED`: Đã xác nhận và giữ đủ linh kiện.
- `PREPARING_COMPONENTS`: Đang chuẩn bị linh kiện.
- `ASSEMBLING`: Đang lắp ráp; chỉ xuất hiện khi có assembly service.
- `READY_FOR_PICKUP`: Sẵn sàng nhận tại cửa hàng.
- `SHIPPING`: Đang giao hàng.
- `DELIVERY_FAILED`: Giao hàng chưa thành công — cần chọn hướng xử lý.
- `RETURNING`: Đang hoàn về chi nhánh.
- `RETURNED_TO_BRANCH`: Đã về chi nhánh.
- `COMPLETED`: Hoàn tất.
- `ON_HOLD`: Cần xử lý, kèm reason cụ thể.
- `CANCELLED`: Đã hủy, kèm reason/refund state nếu có.

Không gom `ON_HOLD` thành một message chung; map theo `PAYMENT_REVIEW`, `PAID_BUT_OUT_OF_STOCK`, `PICKUP_EXPIRED`.

## 3. Hủy đơn

### Eligibility

Khách chỉ có thể tự hủy khi Order là `PENDING_PAYMENT`, `PENDING_COD_CONFIRMATION` hoặc `CONFIRMED` và chưa vào `PREPARING_COMPONENTS` (`ORD-012`, `ORD-015`).

### `CancelOrderDialog`

1. Title `Hủy đơn <code>?`.
2. Current status.
3. Consequence:
   - Release stock/coupon.
   - QR/prepaid eligible → refund pending thủ công.
   - Custom Build COD trước preparation → deposit refund pending.
4. Reason select + optional note.
5. Safe action `Giữ đơn hàng` được focus mặc định.
6. Destructive action `Hủy đơn`.

### Hành vi

- Pessimistic submit + idempotency key.
- Success cập nhật Order/Payment/refund section và notification.
- Nếu state vừa chuyển sang ineligible, server reject; mở `CancelNotAllowedDialog` với state mới.
- Không hứa tiền đã hoàn khi mới `REFUND_PENDING` (`PAY-016`).

## 4. Pickup expired và chuyển sang delivery

### Hiển thị

Sau 14 ngày `READY_FOR_PICKUP`, Order → `ON_HOLD/PICKUP_EXPIRED`; timeline và banner nêu hàng đang giữ trạng thái stock hiện tại (`ORD-022`, `INV-021`).

### Flow chấp nhận amendment

1. Entry từ email/order detail.
2. Xác minh ownership/contact nếu guest session không còn hiệu lực.
3. Nhập/xác minh delivery address.
4. Hiển thị phí theo cấu hình hiệu lực tại thời điểm accept và original eligible subtotal.
5. `AmendmentAcceptanceDialog`: address snapshot, fee, reason, payment consequence.
6. Prepaid order: tạo supplemental QR; chỉ shipping sau khi paid.
7. COD order: fee cộng vào remaining COD.
8. Original products/promotions/coupon/VAT/total không thay đổi (`PRC-009`, `PAY-019`).

## 5. Delivery failed và redelivery

### Order detail branch

- Banner `Giao hàng chưa thành công`.
- Hiển thị attempt count và các lựa chọn do Admin mở:
  - Xác nhận giao lại; chấp nhận fee amendment nếu có.
  - Không giao lại/chờ hàng quay về chi nhánh.
- Redelivery chỉ hợp lệ khi count < 2; transition thành công mới increment (`ORD-024`).
- Khi limit đạt hoặc không chọn, timeline theo `RETURNING → RETURNED_TO_BRANCH`; không hiển thị stock restored ở `DELIVERY_FAILED`.

## 6. Payment/refund exception display

### Payment review

- Persistent warning block, amount received (nếu được phép), reference mask, review deadline.
- Copy rõ: không gửi thêm tiền; cửa hàng đang kiểm tra.
- Sau timeout: Order canceled, reservation/coupon released, money received sang `REFUND_PENDING`.

### Paid but out of stock

- `ON_HOLD/PAID_BUT_OUT_OF_STOCK`.
- Khách chỉ xem hướng xử lý: hoàn tiền hoặc chấp thuận SKU replacement qua verified contact.
- Replacement chưa có self-service trong MVP; không render nút tự chọn nếu backend chưa có approved flow.

### Refund

- `REFUND_PENDING`: đã ghi nhận yêu cầu, chưa khẳng định tiền về.
- `REFUNDED`: reference/time sau Admin confirmation.
- Custom Build deposit `FORFEITED` hiển thị riêng khi cancellation sau preparation; không gọi là refund.

## 7. Account overview `/tai-khoan`

### Cấu trúc

1. Welcome/profile health.
2. Quick cards: đơn đang xử lý, cần thanh toán, notification chưa đọc.
3. Recent orders list tối đa 3–5.
4. Contact verification summary.
5. Security/session shortcuts.
6. Không có saved build, wishlist hoặc saved address cards trong MVP.

## 8. Hồ sơ `/tai-khoan/ho-so`

- Cấu trúc và contact-change flow theo `02-auth-and-identity.md`.
- Tên profile là form explicit Save + dirty guard.
- Email/phone không edit inline; dùng verified old/new flow.
- Order contact snapshot cũ luôn giữ nguyên (`CUS-006`).

## 9. Notification center

### Entry

- Header bell mở `NotificationSheet` cho 5–10 item gần nhất.
- `Xem tất cả` đến `/tai-khoan/thong-bao`.
- Accountless Customer chỉ truy cập notification trong authorized guest session (`CUS-014`).

### Trang `/tai-khoan/thong-bao`

1. H1 + unread count.
2. Filters: tất cả/chưa đọc/order/payment.
3. List newest first:
   - Icon + event title.
   - Specific order/payment message.
   - Timestamp.
   - Unread dot + bold.
   - Deep link đúng order/charge, không về home.
4. `Đánh dấu tất cả đã đọc` nếu API hỗ trợ.
5. Pagination/load-more.

### Sự kiện MVP

Order submitted; payment/deposit succeeded, failed, under review, refund pending/refunded; confirmed, canceled, preparing, assembling, ready for pickup, pickup expired, shipping, delivery failed, redelivery scheduled, returning, returned to branch, completed (`NOT-002`).

UI không hiển thị notification cho return/RMA, warranty, lost shipment/carrier claim (`NOT-003`). Dedupe theo recipient + event type + domain event ID.

## 10. Tùy chọn thông báo

Nếu preference model được bổ sung và duyệt:

- Route `/tai-khoan/tuy-chon-thong-bao`.
- Nhóm order/payment/security; row có email/SMS/in-app theo event category.
- Transactional/security bắt buộc được ghi rõ nếu không tắt được.
- Toggle apply server-side ngay; không chỉ lưu client.

Nếu chưa có model/rule chính thức, ẩn route khỏi MVP thay vì dựng UI không hoạt động.

## 11. Review sản phẩm

### Eligibility

- Chỉ Customer sở hữu Order Line từ Order `COMPLETED` (`REV-002`).
- Một active Review mỗi Order Line (`REV-004`).
- Review tham chiếu template, purchased SKU, order và order line.

### Entry

- CTA ở completed order line và product detail khi eligibility endpoint xác nhận.
- Không render CTA dựa trên client state alone.

### `ReviewDialog`

1. Product image/name + purchased variant.
2. Rating 1–5, keyboard/radio semantics.
3. Text review; character counter, không silently truncate.
4. Verified purchase explanation.
5. CTA `Gửi đánh giá`/`Lưu chỉnh sửa` và Cancel.
6. Submit errors giữ text/rating.

### Edit/history

- Edit mở cùng dialog ở mode edit.
- Backend giữ edit history (`REV-005`).
- Hidden review hiển thị thông báo phù hợp cho owner nếu product UI cần; không render public content.

## 12. Acceptance và kiểm thử

- Account chỉ liệt kê order của Customer liên kết.
- Guest session chỉ xem đúng authorized order và hết hạn đúng policy.
- Order detail render snapshot lịch sử dù catalog/price/contact đổi.
- `ASSEMBLING` không xuất hiện cho order không chọn assembly.
- Cancel eligibility race được server chặn và UI refresh state.
- Refund pending/refunded/forfeited không bị diễn đạt lẫn nhau.
- Pickup-to-delivery/redelivery amendment không rewrite original total.
- Delivery failed không làm stock quay lại trước `RETURNED_TO_BRANCH` reversal.
- Review bị chặn với non-completed/other-customer/duplicate order line.
- Notification retry không tạo duplicate UI item và deep link đúng order.
