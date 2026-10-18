# 02 — Đăng nhập, đăng ký và định danh khách hàng

## 1. Mô hình định danh

- `User`: tài khoản đăng nhập do Better-Auth quản lý.
- `Customer`: hồ sơ nghiệp vụ sở hữu đơn hàng, coupon usage, review và notification.
- Một Customer có thể tồn tại mà không có User; guest checkout không bị ép đăng ký (`CUS-007`).
- Email và phone có thể trùng giữa các Customer; chỉ email `User` dùng cho đăng nhập là duy nhất (`CUS-003`).
- Mỗi User vừa xác minh tạo một Customer mới của riêng tài khoản. Không tự liên kết, merge hoặc chuyển quyền Customer guest cũ, kể cả khi contact trùng (`CUS-015`).
- Guest checkout có contact trùng nhiều Customer phải đăng nhập hoặc liên hệ Admin; không tự chọn profile (`CUS-016`).

## 2. Đăng ký tài khoản

### Route và mục tiêu

- Route: `/dang-ky`.
- Actor: guest muốn có account; không phải điều kiện để mua.
- Outcome: User được tạo, email tài khoản được xác minh, rồi backend tạo Customer mới liên kết duy nhất với User đó.

### Cấu trúc trang

1. Compact auth header: logo và link `Tiếp tục mua sắm`.
2. Heading: `Tạo tài khoản EL-TECH`.
3. Benefit copy ngắn: theo dõi tất cả đơn, nhận thông báo trong web, quản lý bảo mật.
4. Form một cột:
   - Họ tên.
   - Email.
   - Mật khẩu, show/hide, checklist yêu cầu.
   - Đồng ý điều khoản bắt buộc; marketing là checkbox riêng, không pre-check.
5. Primary CTA: `Tạo tài khoản`.
6. Divider và OAuth nếu provider được cấu hình.
7. Link `Đã có tài khoản? Đăng nhập`.
8. Privacy/terms links.

### Flow

1. Validate on blur; lỗi submit focus summary/field đầu tiên.
2. Backend tạo User ở trạng thái chờ xác minh.
3. Điều hướng `/xac-minh-email?purpose=signup`; không coi đăng ký hoàn tất khi email chưa verify.
4. Khi verify thành công, backend tạo Customer mới trong transaction và liên kết với User. Không lookup/link Customer guest cũ theo contact.
5. Nếu có `returnUrl`, quay lại đúng deep link sau khi hoàn tất.

### Trạng thái lỗi

- Email đã có User: đề xuất đăng nhập/khôi phục mật khẩu, không xác nhận thêm dữ liệu Customer.
- Password yếu: lỗi inline, không clear form.
- Network/server: giữ toàn bộ input trừ password theo policy bảo mật; cho retry.
- OAuth canceled: quay lại form với message không chặn.

### Tiêu chí nghiệm thu

- Không route nào bắt guest đăng ký trước khi dùng giỏ/checkout.
- Submit lặp không tạo hai User.
- Account không bao giờ tự chiếm Customer guest cũ chỉ vì contact trùng; lịch sử guest tiếp tục dùng OTP theo từng order.
- Toàn bộ control có autocomplete phù hợp và keyboard access.

## 3. Đăng nhập

### Route và cấu trúc trang

- Route: `/dang-nhap?returnUrl=`.
- Email input.
- Password input với show/hide và link `Quên mật khẩu?`.
- Checkbox `Duy trì đăng nhập` nếu Better-Auth policy hỗ trợ.
- Primary CTA `Đăng nhập`.
- OAuth section nếu cấu hình.
- Link đăng ký và link `Tra cứu đơn không cần tài khoản`.

### Hành vi

- Sau success dùng replace navigation đến `returnUrl` đã allow-list hoặc `/tai-khoan`.
- Nếu đang có guest cart, giữ opaque token và gọi server merge; merge SKU/build trùng, reprice và revalidate (`CHK-002`).
- Nếu session hết hạn giữa checkout/profile, dùng `SessionExpiredDialog`; đăng nhập lại xong trở về form còn nguyên dữ liệu.

### Lỗi

- Credentials không đúng: message chung đủ rõ, không làm lộ account existence quá mức.
- Account chưa verify: CTA gửi lại email xác minh.
- Rate limit: countdown và thời điểm thử lại.
- Guest cart merge có line lỗi: giữ các line hợp lệ, đánh dấu line cần xử lý; không âm thầm xóa.

## 4. Xác minh email tài khoản

### Route `/xac-minh-email`

1. Heading nêu email đã gửi tới dạng mask.
2. Hướng dẫn mở link hoặc nhập OTP tùy Better-Auth adapter.
3. OTP field hỗ trợ paste/autocomplete one-time-code.
4. Resend với countdown và rate limit.
5. Link đổi email/quay lại đăng nhập.
6. Success state có CTA tiếp tục về `returnUrl`.

Link/OTP hết hạn phải có CTA tạo mã mới; đã dùng không tạo session lần hai.

## 5. Quên và đặt lại mật khẩu

### `/quen-mat-khau`

- Một email field và CTA `Gửi hướng dẫn đặt lại`.
- Success copy không xác nhận email có tồn tại hay không.
- Cho quay lại đăng nhập.

### `/dat-lai-mat-khau`

- New password + show/hide + requirements.
- Confirm chỉ khi Better-Auth bắt buộc; ưu tiên một field và hiển thị rõ giá trị qua toggle.
- Token invalid/expired: error page trong auth shell với CTA yêu cầu link mới.
- Success: CTA đăng nhập; tùy policy revoke các session cũ và gửi security email.

## 6. Xác minh liên hệ tại checkout

### Vị trí trong checkout

Nằm trong step `/thanh-toan/lien-he`, không dùng checkbox giả lập.

### Cấu trúc section

1. Tên người nhận.
2. Email + badge `Chưa xác minh/Đã xác minh`, nút `Gửi mã`.
3. Phone + badge, nút `Gửi mã`.
4. Giải thích hai kênh đều bắt buộc để bảo vệ quyền xem đơn.
5. CTA `Tiếp tục` chỉ thực thi validate; không nên disabled mơ hồ.

### `ContactOtpDialog`

- Title theo contact: `Xác minh email` hoặc `Xác minh số điện thoại`.
- Contact đã mask và nút `Đổi`.
- Một OTP input, paste toàn mã, countdown.
- CTA `Xác minh` và `Gửi lại mã`.
- Lỗi sai/hết hạn/rate-limit inline; không đóng dialog.
- Success đóng dialog, focus về badge tương ứng và announce cho screen reader.

### Quy tắc

- Thay đổi giá trị sau verify làm mất trạng thái verify của đúng contact đó.
- Cả hai verification phải còn hiệu lực khi submit order; backend kiểm tra lại trong transaction.
- Trường hợp một contact đã thuộc Customer nhưng contact còn lại chưa có không được âm thầm gắn trong checkout (`CUS-003`, order resolution case 3). Hiển thị flow profile update/hỗ trợ thích hợp.
- Xung đột hai Customer trả `CUSTOMER_IDENTITY_CONFLICT`, không tạo Customer thứ ba.

## 7. Tra cứu đơn không tài khoản

### `/tra-cuu-don`

1. Heading `Theo dõi đơn hàng`.
2. Mã đơn.
3. Chọn nhận OTP qua email hoặc điện thoại; UI không hiển thị contact đầy đủ trước ownership check.
4. CTA `Gửi mã xác minh`.
5. Link đăng nhập dành cho khách có tài khoản.
6. Privacy note: biết mã đơn thôi chưa đủ để xem dữ liệu.

### `/tra-cuu-don/xac-thuc`

1. Tóm tắt mã đơn + kênh đã mask.
2. OTP input, resend countdown, đổi phương thức.
3. Success tạo guest session time-limited, scope đúng Customer và Order (`CUS-011`, `CUS-012`).
4. Redirect `/don-hang/:orderCode` bằng replace navigation.

### Trạng thái bảo mật

- Mã đơn sai và contact không khớp dùng copy không làm lộ dữ liệu.
- OTP/link đã dùng hoặc hết hạn không tạo session mới.
- Guest session không được liệt kê đơn khác, review line khác hoặc notification khác.
- Guest session hết hạn khi đang xem đơn: re-auth OTP tại chỗ rồi về lại đúng order.

## 8. Hồ sơ và thay đổi contact

### Route `/tai-khoan/ho-so`

Sections:

1. Tên hiển thị/người nhận mặc định nếu nghiệp vụ chấp nhận.
2. Email hiện tại + trạng thái verify + CTA `Thay đổi`.
3. Phone hiện tại + trạng thái verify + CTA `Thay đổi`.
4. Account linkage status; không hiển thị internal Customer/User IDs.

### Flow đổi email/phone

Không phải form edit trực tiếp. Mở routed sub-flow hoặc sheet nhiều bước:

1. Re-auth account nếu session không còn fresh.
2. Xác minh contact cũ.
3. Nhập contact mới; contact có thể trùng hồ sơ Customer khác.
4. Xác minh contact mới.
5. Confirm consequence; backend update + audit actor/time/old/new/reason (`CUS-008`, `CUS-010`).
6. Success screen; order snapshot cũ không đổi (`CUS-006`).

Contact mới trùng Customer khác không tạo merge hay chuyển quyền; backend chỉ cập nhật Customer thuộc User hiện tại sau khi cả hai contact cũ/mới được xác minh.

## 9. Bảo mật và session

### Route `/tai-khoan/bao-mat`

- Đổi mật khẩu qua current password/fresh auth.
- Danh sách session: device, approximate location, last active, badge `Thiết bị này`.
- Revoke từng session; `Đăng xuất các thiết bị khác` có confirm nêu hậu quả.
- Không triển khai 2FA/passkey nếu Better-Auth configuration và nghiệp vụ chưa được duyệt; có thể để backlog, không hiển thị UI giả.

## 10. Kiểm thử bắt buộc

- Guest browse/cart/checkout không bị auth guard.
- Deep link login quay lại đúng trang.
- Guest cart merge không duplicate SKU/build và luôn reprice.
- Hai request đăng ký/xác minh song song không tạo duplicate Customer cho cùng một User.
- Guest checkout với nhiều Customer cùng contact pair trả `CUSTOMER_IDENTITY_AMBIGUOUS`; account checkout chỉ dùng Customer liên kết với User.
- Guest session không đọc chéo order/notification/review.
- OTP resend, expiry, used token, rate limit và duplicate submit.
