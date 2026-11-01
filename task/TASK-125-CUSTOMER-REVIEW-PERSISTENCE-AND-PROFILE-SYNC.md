# Task: TASK-125 - Đồng Bộ Luồng Đánh Giá Sản Phẩm Vào Database, Nền Trắng Modal Và Quản Lý Đánh Giá Tại Profile

- Feature: Customer Review Database Persistence, White Modal Theme & Profile Review Center
- Governing Spec: Đồng bộ luồng đánh giá sản phẩm với cơ sở dữ liệu PostgreSQL, chuẩn hóa giao diện modal nền trắng và hiển thị lịch sử đánh giá cá nhân
- Scope: shared
- Status: Complete

## Objective

Hoàn thiện toàn diện tính năng đánh giá sản phẩm trên Storefront và Backend:
1. Chuyển đổi giao diện modal viết đánh giá sang nền trắng đồng bộ với thiết kế giao diện sáng (white theme) của hệ sinh thái EL-TECH Storefront.
2. Tăng chiều cao trường nhập nhận xét (textarea) để người dùng có không gian trải nghiệm viết đánh giá thoải mái, chi tiết.
3. Bổ sung tab quản lý "Đánh giá của tôi" trên trang Thông tin cá nhân (Profile) để người dùng xem lại toàn bộ các đánh giá linh kiện mà họ đã gửi.
4. Đảm bảo toàn bộ luồng gửi đánh giá từ storefront thực sự lưu trữ dữ liệu vào bảng `Review` trong cơ sở dữ liệu PostgreSQL qua Prisma và API Backend, thay vì giả lập thời gian phản hồi.

## Technical Context And Dependencies

- Pre-requisites: Hoàn thành TASK-100, TASK-101, TASK-122.
- Reusable Assets:
  - Spartan UI / Core Directives: `appButton`, `appInput`.
  - Atoms / Icons: `AppIconModule` (`lucide-angular`).
  - Auth State: `AuthService.currentUser()` chứa `id`, `customerId`, `name`, `email`.
  - Api Client: `ApiClientService` (`get`, `post`).
  - Prisma Client: Model `Review` liên kết `Customer`, `ProductTemplate`, `ProductVariant`.
- Target Files:
  - `fe/src/app/features/catalog/review-modal.component.ts`
  - `fe/src/app/features/catalog/product-detail-page.component.ts`
  - `fe/src/app/features/catalog/catalog.service.ts`
  - `fe/src/app/features/profile/profile-page.component.ts`
  - `be/src/routes/review.routes.ts`
  - `be/src/services/review.service.ts`

## Checklist

- [x] Cập nhật giao diện Modal Viết Đánh Giá (`fe/src/app/features/catalog/review-modal.component.ts`):
  - Chuyển toàn bộ background modal từ tông màu tối (`bg-surface-dark`, `bg-surface-elevated`, `text-white`) sang tông nền trắng sáng (`bg-white`, `border-line`, `text-foreground`).
  - Header và Footer modal sử dụng nền `bg-surface-alt` kết hợp viền phân tách `border-line` thanh lịch.
  - Cập nhật màu sắc các nút tiêu chí nhanh (technical criteria pills) sang nền trắng, viền xám nhạt khi chưa chọn và nền xanh `bg-primary` nổi bật khi được chọn.
  - Hộp đánh giá 5 sao sử dụng nền `bg-surface-alt` với các ngôi sao có độ tương phản cao, màu vàng rõ nét khi chọn.
  - Tăng chiều cao của textarea nhận xét: thiết lập `rows="5"` hoặc `min-h-[140px]` để người dùng dễ dàng theo dõi và nhập văn bản dài.
  - Loại bỏ hoàn toàn bộ đếm giả lập `setTimeout` cục bộ trong phương thức `submitReview`, kết nối trực tiếp với trạng thái xử lý bất đồng bộ từ luồng gửi thật.
- [x] Cập nhật Backend API và Service Đánh Giá (`be/src/routes/review.routes.ts` & `be/src/services/review.service.ts`):
  - Mở rộng `createSchema` trong `review.routes.ts` để hỗ trợ nhận diện linh hoạt: `customerId` (UUID), `productSlug`, `productTemplateId`, `skuId`, `authorName`, `rating`, `text`.
  - Trong `review.service.ts` hàm `create`:
    - Tự động liên kết `Customer` hợp lệ nếu nhận `customerId` (tìm theo `id` hoặc `userId`).
    - Tìm và gán `productTemplateId` cùng `skuId` hợp lệ từ `productSlug` nếu chưa có sẵn.
    - Lưu bản ghi đánh giá vào bảng `Review` với `isVisible: true` và `isActive: true`.
  - Bổ sung endpoint `GET /v1/reviews/customer` trong `review.routes.ts`:
    - Tiếp nhận tham số truy vấn `customerId` hoặc `email`.
    - Kiểm tra và gọi hàm `reviewService.listByCustomer(identifier)`.
  - Cài đặt phương thức `listByCustomer` trong `review.service.ts`:
    - Truy vấn danh sách đánh giá từ bảng `Review` theo `customerId` của khách hàng.
    - Nạp kèm thông tin quan hệ `productTemplate` (id, tên, slug, media) để hiển thị chi tiết sản phẩm được đánh giá.
    - Trả về danh sách DTO đánh giá gồm: `id`, `rating`, `text`, `createdAt`, `isVisible`, `product: { id, name, slug, media }`.
- [x] Kết nối gửi đánh giá thực tế từ Trang Chi Tiết Sản Phẩm (`fe/src/app/features/catalog/product-detail-page.component.ts` & `catalog.service.ts`):
  - Cập nhật `catalog.service.ts`: mở rộng kiểu dữ liệu của `submitReview` để truyền thêm `customerId?: string`.
  - Tiêm `AuthService` vào `ProductDetailPageComponent`.
  - Trong hàm `onReviewSubmitted`:
    - Lấy thông tin tài khoản hiện tại từ `auth.currentUser()` (nếu đã đăng nhập) và truyền `customerId` vào payload gửi đánh giá.
    - Gọi API `this.catalog.submitReview(...)` thực sự gửi dữ liệu về backend và chờ phản hồi thành công.
    - Khi nhận phản hồi thành công, cập nhật danh sách hiển thị đánh giá tức thì và đóng modal.
    - Xử lý bắt lỗi khi gửi thất bại và hiển thị thông báo lỗi thân thiện mà không làm mất nội dung người dùng vừa nhập.
- [x] Thêm Tab "Đánh Giá Của Tôi" Tại Trang Thông Tin Cá Nhân (`fe/src/app/features/profile/profile-page.component.ts`):
  - Mở rộng trạng thái `activeTab` để hỗ trợ giá trị `'reviews'`: `signal<'orders' | 'profile' | 'reviews'>`.
  - Thêm mục điều hướng "Đánh giá của tôi" vào thanh menu bên trái với icon `Star`, kèm badge hiển thị số lượng đánh giá đã gửi.
  - Khai báo signal lưu trữ danh sách đánh giá cá nhân `customerReviews`, trạng thái tải `isLoadingReviews` và lỗi `reviewsError`.
  - Cài đặt phương thức `loadCustomerReviews()` gọi endpoint `/reviews/customer` khi người dùng chuyển sang tab `reviews` hoặc khi khởi tạo trang.
  - Xây dựng vùng hiển thị danh sách đánh giá:
    - Thẻ từng bài đánh giá gồm: tên sản phẩm (kèm liên kết chuyển đến trang chi tiết `/san-pham/:slug`), số sao xếp hạng, thời gian gửi, nội dung nhận xét chi tiết và nhãn trạng thái hiển thị.
    - Khối trạng thái trống (empty state) trực quan khi chưa có bài đánh giá nào, kèm nút bấm dẫn về danh mục linh kiện để khuyến khích trải nghiệm.
    - Khối hiển thị trạng thái đang tải (skeleton/spinner) và khối thông báo lỗi kết nối.

## Acceptance Criteria

- Criterion 1: Modal viết đánh giá hiển thị trên nền trắng sáng hiện đại, viền phân cách xám nhạt, độ tương phản chữ rõ nét theo design system EL-TECH.
- Criterion 2: Ô nhập nhận xét chi tiết có chiều cao rộng rãi (tối thiểu 140px/5 dòng), thao tác nhập liệu thuận tiện.
- Criterion 3: Người dùng sau khi gửi đánh giá sẽ thấy dữ liệu được lưu vĩnh viễn vào cơ sở dữ liệu PostgreSQL (kiểm chứng qua bảng `Review` trong Prisma và API phản hồi mã 201).
- Criterion 4: Trang thông tin cá nhân (`/tai-khoan`) có thêm tab "Đánh giá của tôi", hiển thị đầy đủ các đánh giá mà tài khoản đã gửi kèm thông tin sản phẩm và liên kết dẫn đến trang chi tiết sản phẩm tương ứng.
- Criterion 5: Kiểm tra tự động `npm run check:fe` và `npm run check:be` hoàn tất thành công với mã thoát 0.

## Verification Commands

- Command 1: `npm run check:fe`
- Command 2: `npm run check:be`

## Review & Fix Log

- Dual-Pass Review:
  - Pass A (Functional): Hoàn thành đầy đủ 5 tiêu chí nghiệm thu.
  - Pass B (Convention): Đảm bảo các chuẩn mực TypeScript, Signals, Standalone Components, không có icon/emoji.
- Remediation:
  - F-01: Bổ sung `@Input() errorMessage` trên `ReviewModalComponent` và hiển thị thông báo lỗi khi gửi thất bại trên `ProductDetailPageComponent`.
  - F-02: Bổ sung kiểm tra `isUuid` trong `review.service.ts` trước khi truy vấn các cột UUID tránh lỗi Postgres syntax error.
  - F-03: Xóa bỏ các chú thích đánh số thứ tự trong `profile-page.component.ts`.
- Final Gate:
  - `npm run check:be`: exit code 0.
  - `npm run check:fe`: exit code 0.
  - Review Verdict: PASS.
