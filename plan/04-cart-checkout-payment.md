# 04 — Giỏ hàng, checkout và thanh toán

## 1. Giỏ hàng

### Entry surfaces

- Desktop: `CartDrawer` để xem/sửa nhanh; CTA `Xem giỏ hàng` và `Thanh toán`.
- Mobile và deep link: routed page `/gio-hang`.
- Guest cart dùng opaque token; token không xuất hiện trong URL/log UI (`CHK-001`).

### Cấu trúc trang `/gio-hang`

1. Breadcrumb + H1 `Giỏ hàng` + item count.
2. Item list grouped theo:
   - SKU lẻ.
   - Prebuilt PC BOM.
   - Custom Build BOM.
3. Mỗi SKU line: ảnh, tên snapshot hiện tại, selected variant, unit estimate, promotion estimate, quantity stepper, remove.
4. PC line: tên build, badge prebuilt/custom, component summary expand/collapse, service selection, edit build nếu còn hợp lệ.
5. Coupon entry: một code/order; validate server và hiển thị lý do không đủ điều kiện.
6. Summary sticky desktop/bottom mobile:
   - Base subtotal.
   - Product promotion.
   - Coupon estimate/allocation summary.
   - Shipping hiện `Tính ở bước nhận hàng`.
   - Tổng tạm tính, VAT included note.
   - CTA `Tiến hành thanh toán`.
7. Trust note: giá/tồn/chi nhánh sẽ được xác nhận lại.

Coupon ở giỏ chỉ được preview eligibility; chưa reserve quota. Quota chỉ được validate và reserve atomically khi tạo Order (`PRO-007`).

### Tương tác và modal

- Quantity update: optimistic chỉ khi low-risk; server failure rollback + inline retry.
- Remove: thực hiện + Undo toast, không confirm cho line đơn giản.
- Remove whole build: confirm dialog nêu số component bị xóa.
- Edit Custom Build: quay lại builder với cart item draft; Save cập nhật đúng group.
- Login khi đang có cart: không ép; nếu người dùng chủ động login thì merge theo `CHK-002`.

### States

- Empty first/cleared: CTA `Khám phá sản phẩm`, CTA phụ `Tự lắp PC`.
- Line stale price: badge `Giá đã thay đổi`, summary dùng latest preview.
- SKU unavailable/discontinued: giữ line để giải thích, disable checkout tới khi remove/replace.
- Cart fetch error: giữ cache và retry; không hiển thị “giỏ trống”.
- Không có single branch fulfill: chỉ cảnh báo dự kiến ở cart; quyết định authoritative ở order submit.

## 2. Checkout session và guard

- Checkout gồm 4 routed steps; dữ liệu lưu vào client checkout service và server draft/session nếu cần.
- Mọi step có idempotency context, cart version và price version.
- Chỉ final submit mới tạo Order/Customer/reservation/coupon redemption trong một transaction.
- Back giữ dữ liệu. Refresh phục hồi theo token/session. Tab duplicate không được tạo hai đơn.
- Cart thay đổi trong tab khác làm checkout stale; hiển thị banner và yêu cầu revalidate.

## 3. Step 1 — Liên hệ `/thanh-toan/lien-he`

### Cấu trúc

1. Heading `Bước 1/4 — Thông tin liên hệ`.
2. Tên người nhận.
3. Email + verification badge/action.
4. Phone + verification badge/action.
5. OTP dialogs như `02-auth-and-identity.md`.
6. Contact/privacy note.
7. Sticky actions: `Quay lại giỏ`, `Tiếp tục nhận hàng`.

### Validation

- Email/phone normalization phía server.
- Cả hai contact verified trước final submit; step cho phép tiến tiếp chỉ sau validate hiện thời.
- Identity conflict là blocking banner/dialog; form data được giữ.
- Account login không thay thế checkout verification nếu contact/order rule chưa thỏa.

## 4. Step 2 — Nhận hàng `/thanh-toan/nhan-hang`

### Choice đầu trang

Radio cards: `Giao tận nơi` và `Nhận tại cửa hàng`.

### Delivery branch

1. Receiver name/phone lấy từ step 1 và cho sửa với verify impact rõ ràng.
2. Address fields một cột: line, ward, district, province/city; autocomplete chỉ khi service có thật, luôn có manual fallback.
3. Address validation result.
4. Delivery fee preview, free-shipping rule và estimated handling copy.
5. Hệ thống không cho khách tự chọn fulfillment branch; backend lọc service area + full stock rồi chọn theo priority (`CHK-005`).

### Pickup branch

1. Branch selector list/cards: name, address, hours, availability for whole cart.
2. Branch hết khả năng fulfill bị disabled kèm lý do.
3. Không hiển thị hoặc validate delivery address (`CHK-004`).
4. Fee bằng 0 (`PRC-006`).

### Lỗi

- Address ngoài service area: inline error và cho sửa.
- Không single branch fulfill whole cart: blocking error, giữ cart, không reserve/coupon/payment; CTA sửa giỏ (`CHK-012`).
- Availability changed: refresh branch list; không tự đổi pickup branch mà không báo.

## 5. Step 3 — Phương thức thanh toán `/thanh-toan/thanh-toan`

### Cấu trúc

1. Heading `Bước 3/4 — Thanh toán`.
2. Payment method cards chỉ render option eligible.
3. `QR chuyển khoản`: full amount đối với order thường/prebuilt.
4. `COD`: order component/prebuilt có thể dùng normal COD.
5. Custom Build + COD:
   - Hiển thị rõ phải đặt cọc QR.
   - Deposit preview = `min(grandTotal, max(roundVnd(grandTotal × 10%), 500.000đ))`.
   - COD remaining = grand total - deposit.
   - Copy về hoàn/forfeit deposit theo mốc trạng thái.
6. Summary amount và link quay lại thay fulfillment.

Không hiển thị COD surcharge vì MVP không có. Client chỉ preview; backend trả authoritative eligibility/amount.

## 6. Step 4 — Xác nhận `/thanh-toan/xac-nhan`

### Cấu trúc trang

1. Heading `Bước 4/4 — Kiểm tra và đặt hàng`.
2. Contact section + `Thay đổi` về step 1.
3. Fulfillment section + address hoặc branch + `Thay đổi`.
4. Payment section + deposit/COD explanation + `Thay đổi`.
5. Item/BOM section, service selection và quantity.
6. Price breakdown authoritative gần nhất:
   - Base line totals.
   - Product promotions.
   - Coupon và allocation summary.
   - Shipping.
   - VAT/rounding.
   - Grand total và amount due now.
7. Terms acknowledgement nếu pháp lý yêu cầu.
8. Primary CTA có amount/outcome: `Đặt hàng và tạo QR ...` hoặc `Đặt đơn COD`.

### Submit contract

- CTA vẫn focusable; click bắt đầu pessimistic mutation và disable chống double click.
- Gửi idempotency key + cart/version + accepted price quote.
- Backend trong transaction: reverify contact, identity, lifecycle, prices, promotion/coupon quota, branch allocation, stock rules; create/resolve Customer; snapshot order/contact/BOM/prices; reserve theo payment branch.
- Server trả một trong các outcome ổn định; UI không suy đoán từ HTTP/database error.

### Reconfirmation branches

- Price stale: `PriceChangedDialog` có before/after và explicit accept; không âm thầm đặt giá mới.
- Coupon quota exhausted: giữ checkout, yêu cầu bỏ/đổi coupon; không tự tạo order giá cao hơn (`PRO-008`).
- Stock/branch failed: giữ cart, không tạo order/payment.
- SKU lifecycle changed: chỉ rõ line cần remove/replace.
- Identity conflict: block, không create third Customer.
- Network unknown after submit: dùng idempotency key query outcome trước khi cho retry.

## 7. QR payment `/thanh-toan/:orderCode/qr`

### Cấu trúc

1. Compact header + order code.
2. Payment status badge riêng với Order status badge.
3. QR image, exact amount, immutable reference; không có edit control (`PAY-001`).
4. Copy buttons cho amount/reference nếu bank transfer manual fallback được phê duyệt.
5. Countdown 30 phút và absolute expiry time.
6. Instructions: trả đúng số tiền, một lần; không top-up underpayment.
7. Live status region polling/SSE: `Đang chờ`, `Đã thanh toán`, `Đang kiểm tra`, `Hết hạn`.
8. CTA `Xem chi tiết đơn`; không khuyến khích tạo payment attempt trùng.

### QR order thường

- Order được tạo `PENDING_PAYMENT`, Payment `PENDING`, full stock reserved atomically (`CHK-008`).
- Exact callback thành công → `CONFIRMED` nếu reservation vẫn valid (`ORD-004`).
- 30 phút không có positive matched transaction → Payment `EXPIRED`, Order `CANCELLED/PAYMENT_TIMEOUT`, release stock/coupon (`CHK-009`).

### Custom Build COD deposit

- QR chỉ cho required deposit; success → Payment `PARTIALLY_PAID`, disposition `HELD`, Order `CONFIRMED`, stock reserved (`PAY-012`, `CHK-011`).
- UI hiển thị deposit paid và COD remaining riêng.

### Ngoại lệ

- Wrong amount/ambiguous: `ON_HOLD/PAYMENT_REVIEW`, dừng 30-minute expiry và giữ reservation tối đa 24h; UI không cho top-up (`PAY-003`, `PAY-017`).
- Late exact: thử reserve lại. Thành công tiếp tục eligible path; thất bại `PAID_BUT_OUT_OF_STOCK` và chờ Admin refund/replacement approval (`PAY-004`).
- Invalid late: manual review, không auto restore.
- Callback duplicate không làm UI nhảy trạng thái/notification lặp.

## 8. COD flow

- Normal COD tạo Order `PENDING_COD_CONFIRMATION`, Payment `UNPAID`; chưa reserve stock (`CHK-010`).
- Confirmation page nói rõ đơn chưa được giữ hàng cho tới Admin confirm.
- Admin confirm thành công reserve toàn bộ và Order → `CONFIRMED`; fail thì customer nhận notification/action thích hợp.
- COD complete chỉ khi Admin ghi nhận đủ COD remaining + accepted amendment charges; Payment → `PAID` trong cùng transaction (`PAY-020`).

## 9. Confirmation `/dat-hang/:orderCode/thanh-cong`

### Cấu trúc

1. Outcome icon/headline cụ thể, không chỉ `Success`.
2. Order code + copy action.
3. Order status và Payment status riêng.
4. Next step theo payment branch:
   - QR: CTA thanh toán/countdown.
   - COD: đang chờ xác nhận, chưa giữ hàng.
   - Deposit paid: số đã trả và còn COD.
5. Contact channel sẽ nhận update.
6. CTA chính `Theo dõi đơn hàng`; CTA phụ `Tiếp tục mua sắm`.
7. Gợi ý tạo account chỉ là tùy chọn và không làm mất ownership hiện tại.

## 10. Pricing/coupon display rules

- Tiền dùng value từ server/Decimal serialization; không tính nghiệp vụ bằng JS float.
- VND whole đồng, định dạng locale nhất quán.
- Giá hiển thị đã gồm VAT; breakdown đủ tái tạo tổng (`PRC-005`).
- Pipeline: base → product promotion → eligible subtotal → one coupon allocation → shipping/COD fee → tax/rounding (`PRO-003`).
- Không total/discount âm; line allocation sum phải khớp discount.
- Order creation freeze snapshot; UI order detail không reprice lịch sử.

## 11. Acceptance và kiểm thử

- Guest cart survive refresh; merge account không duplicate line.
- Pickup không yêu cầu address và phí 0; delivery bắt buộc address hợp lệ.
- Không single branch → không Order/reservation/coupon/payment side effect.
- Duplicate submit/query retry tạo đúng một Order.
- Concurrent last unit/quota có tối đa một winner.
- Price stale và coupon exhausted cần explicit reconfirm/fix.
- QR exact, wrong amount, ambiguous, late exact, late invalid, expiry và race callback/expiry.
- Custom Build deposit + COD remaining luôn bằng frozen grand total.
- Payment và Order state luôn tách biệt trên tất cả màn hình.
