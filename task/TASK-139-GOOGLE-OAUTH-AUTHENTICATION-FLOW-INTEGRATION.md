# Task: TASK-139 - Tích Hợp Xác Thực Đăng Nhập Google OAuth Với Google Identity Services Và Xác Minh Phía Backend

- Feature: Storefront & Backend Google OAuth Integration
- Governing Spec: Biến môi trường hệ thống tại [be/.env](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/.env) (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`), quy chuẩn danh tính khách hàng tại [.agents/skills/business-logic/features/customer-identity.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/.agents/skills/business-logic/features/customer-identity.md) (CUS-001, CUS-002, CUS-003, CUS-004)
- Scope: all
- Status: Done
- Backlinks: [TASK-09](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/task/TASK-09-AUTH-MODAL-AND-CUSTOMER-PROFILE.md), [TASK-106](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/task/TASK-106-AUTH-MODAL-RESET-AND-SUCCESS-NOTIFICATION.md), [TASK-117](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/task/TASK-117-CUSTOMER-AUTH-DB-PERSISTENCE-AND-REQUIRED-FIELDS.md)

## Objective

Xây dựng và hoàn thiện luồng xác thực đăng nhập một chạm bằng tài khoản Google (Google OAuth 2.0 / Google Identity Services) cho khách hàng trên Storefront, đồng bộ xác minh chữ ký token an toàn phía Backend, hỗ trợ cả môi trường phát triển cục bộ (`http://localhost:4200`) và môi trường chạy thực tế trên Vercel (`https://el-tech.vercel.app`):

- Phía Backend:
  - Cài đặt thư viện `google-auth-library` để giải mã và xác minh tính toàn vẹn của Google ID Token (JWT).
  - Cập nhật `be/src/routes/auth.routes.ts`: Thay đổi `googleAuthSchema` sang nhận trường `credential` bắt buộc (Google ID Token chuỗi base64 JWT) thay vì nhận thông tin email/tên thô.
  - Cập nhật `be/src/services/auth.service.ts`:
    - Khởi tạo `OAuth2Client` sử dụng `process.env.GOOGLE_CLIENT_ID`.
    - Viết hàm xác thực chữ ký token từ Google, kiểm tra audience khớp với Client ID đã đăng ký và trích xuất payload bảo mật (`email`, `name`, `picture`, `sub`).
    - Tìm kiếm hoặc khởi tạo bản ghi `User` (đánh dấu `emailVerified: true`), liên kết bản ghi `Account` (với `providerId: 'google'` và `accountId: sub`), tự động liên kết bản ghi `Customer` và tạo phiên làm việc `Session`.
    - Trả về token phiên làm việc cùng thông tin người dùng cho Frontend.
    - Xử lý các tình huống lỗi: Token hết hạn, chữ ký không hợp lệ, audience không khớp sẽ trả về mã lỗi 401 `INVALID_GOOGLE_TOKEN`.
- Phía Frontend:
  - Tích hợp thư viện Google Identity Services (GIS) thông qua script chính thức `https://accounts.google.com/gsi/client`.
  - Khai báo cấu hình `GOOGLE_CLIENT_ID` tập trung trong hệ thống tại `fe/src/app/core/constants/auth.constants.ts`.
  - Cập nhật `fe/src/app/core/auth/auth.service.ts`:
    - Xây dựng phương thức `loginWithGoogleCredential(credential: string): Promise<boolean>` gửi ID Token lên endpoint `POST /v1/auth/google`.
    - Cập nhật và lưu trữ phiên đăng nhập (`token` và `currentUser`) vào Signals và LocalStorage.
  - Cập nhật `fe/src/app/features/auth/auth-modal.component.ts`:
    - Gắn bộ lắng nghe sự kiện đăng nhập Google khi người dùng bấm vào nút "Tiếp tục nhanh với Google".
    - Kích hoạt Google GIS Popup / Prompt để người dùng chọn tài khoản Google.
    - Khi nhận được `credential`, tự động gửi yêu cầu xác thực về backend, đóng modal, hiển thị thông báo thành công và chuyển hướng về trang trước đó hoặc `/dang-nhap-thanh-cong`.
    - Hiển thị thông báo lỗi thân thiện nếu người dùng tắt popup hoặc xác thực thất bại.
- Kiểm thử tự động:
  - Đảm bảo toàn bộ lệnh kiểm tra `npm run check:be` và `npm run check:fe` đạt exit code 0.

## Technical Context And Dependencies

- Pre-requisites:
  - Cấu hình `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET` đã có sẵn tại [be/.env](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/.env).
  - Tên miền `https://el-tech.vercel.app` và `http://localhost:4200` đã được cấp phép trong Google Cloud Console.
- Reusable Assets:
  - `be/src/services/auth.service.ts`
  - `be/src/routes/auth.routes.ts`
  - `fe/src/app/core/auth/auth.service.ts`
  - `fe/src/app/features/auth/auth-modal.component.ts`
  - `be/prisma/schema.prisma` (Models: `User`, `Account`, `Customer`, `Session`)
- Target Files:
  - `be/package.json`
  - `be/src/routes/auth.routes.ts`
  - `be/src/services/auth.service.ts`
  - `fe/src/index.html`
  - `fe/src/app/core/constants/auth.constants.ts` (Tạo mới)
  - `fe/src/app/core/auth/auth.service.ts`
  - `fe/src/app/features/auth/auth-modal.component.ts`

## Checklist

- [x] Cài đặt thư viện `google-auth-library` vào backend:
  - Thêm `google-auth-library` vào dependencies của [be/package.json](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/package.json).
- [x] Cập nhật endpoint xác thực Google trong [be/src/routes/auth.routes.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/routes/auth.routes.ts):
  - Định nghĩa schema `googleAuthSchema` với trường `credential` là chuỗi token bắt buộc.
  - Chuyển tiếp payload chứa `credential` sang `authService.loginWithGoogle`.
- [x] Hoàn thiện phương thức xác thực chữ ký Google ID Token tại [be/src/services/auth.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/auth.service.ts):
  - Khởi tạo đối tượng `OAuth2Client` với `process.env.GOOGLE_CLIENT_ID`.
  - Thực hiện xác minh chữ ký `client.verifyIdToken({ idToken, audience })`.
  - Trích xuất thông tin người dùng đã xác minh: email, họ tên, ảnh đại diện, Google Sub ID.
  - Xử lý logic cơ sở dữ liệu: Tìm kiếm hoặc tạo mới `User`, cập nhật `Account` với `providerId: 'google'`, tạo `Customer` và cấp phát `Session`.
  - Ném `DomainError('INVALID_GOOGLE_TOKEN', { status: 401 })` khi token giả mạo hoặc hết hạn.
- [x] Khai báo thư viện Google Identity Services tại [fe/src/index.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/index.html):
  - Nhúng thẻ `<script src="https://accounts.google.com/gsi/client" async defer></script>`.
- [x] Tạo file hằng số cấu hình Google OAuth tại [fe/src/app/core/constants/auth.constants.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/core/constants/auth.constants.ts):
  - Khai báo hằng số `GOOGLE_CLIENT_ID` lấy từ giá trị đã cấu hình trên Google Cloud Console.
- [x] Nâng cấp phương thức đăng nhập Google tại [fe/src/app/core/auth/auth.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/core/auth/auth.service.ts):
  - Viết hàm `loginWithGoogleCredential(credential: string)` gửi ID Token lên backend qua API `POST /v1/auth/google`.
  - Lưu trữ session trả về và cập nhật signals `currentUser`, `authToken`.
- [x] Cập nhật giao diện và luồng kích hoạt đăng nhập tại [fe/src/app/features/auth/auth-modal.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/auth/auth-modal.component.ts):
  - Khởi tạo Google One Tap hoặc OAuth Popup qua `google.accounts.id`.
  - Khi người dùng hoàn tất xác thực trên popup của Google, nhận `credential` và gọi `authService.loginWithGoogleCredential`.
  - Đóng modal và chuyển hướng người dùng mượt mà về trang đích kèm thông báo thành công.
- [x] Chạy kiểm thử tự động toàn diện:
  - Chạy `npm run check:be` (typecheck và lint backend).
  - Chạy `npm run check:fe` (typecheck, lint và build template frontend).
  - Đảm bảo toàn bộ lệnh kiểm tra thoát với mã lỗi 0.

## Acceptance Criteria

- Criterion 1: Khi người dùng bấm vào nút "Tiếp tục nhanh với Google" trong modal đăng nhập, popup của Google xuất hiện cho phép lựa chọn tài khoản Google để đăng nhập.
- Criterion 2: Khi người dùng chọn tài khoản, Google trả về ID Token (credential), frontend gửi token này lên endpoint `/v1/auth/google` của backend.
- Criterion 3: Phía Backend xác thực thành công chữ ký số của token với Google Client ID, tự động tạo mới hoặc cập nhật thông tin người dùng trong cơ sở dữ liệu PostgreSQL và trả về phiên làm việc hợp lệ.
- Criterion 4: Giao diện frontend cập nhật trạng thái đăng nhập, đóng modal, hiển thị tên và avatar người dùng trên thanh Header, hỗ trợ trơn tru cả ở môi trường `http://localhost:4200` và `https://el-tech.vercel.app`.
- Criterion 5: Các trường hợp token không hợp lệ hoặc người dùng hủy thao tác được xử lý an toàn, hiển thị thông báo lỗi rõ ràng mà không gây treo ứng dụng.

