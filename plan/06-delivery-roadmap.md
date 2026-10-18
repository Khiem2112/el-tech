# 06 — Roadmap triển khai và tiêu chí bàn giao

## 1. Chiến lược triển khai

Thực hiện theo vertical slice có thể chạy và kiểm thử, nhưng xây foundation trước để không tiếp tục phình `app.ts/app.html`. Mỗi phase chỉ được coi là xong khi có page states, domain errors, responsive, accessibility và tests tương ứng; không đánh dấu xong chỉ vì happy path render được.

## 2. Phase 0 — Chốt đặc tả và hợp đồng

### Công việc

- Duyệt các file kế hoạch trong `plan/` và ghi approver/date.
- Xác nhận route names, navigation labels và checkout 4 bước.
- Xác nhận account-linking flow giữa Better-Auth User và Customer guest hiện có.
- Xác nhận notification preference có thuộc MVP hay không.
- Chuẩn hóa OpenAPI/contract hoặc shared Zod DTO cho catalog, cart, quote, checkout, order, payment, auth, review, notification.
- Map stable domain error code ↔ rule ID ↔ UI recovery.
- Xác định API serialization cho Decimal/date/enums.

### Exit criteria

- Không còn quyết định nghiệp vụ bị đoán trong flow money/stock/identity/order ownership.
- Có fixture cho happy path và mọi error quan trọng trong `07-cross-cutting-contracts.md`.

## 3. Phase 1 — Frontend foundation và storefront shell

### Frontend

- Cấu hình Router và lazy feature routes.
- Tách AppShell/Header/MegaMenu/MobileNav/Footer/SystemBanner.
- Tạo API client, global response/error parsing, auth interceptor, correlation ID handling.
- Tạo shared primitives/molecules trên Spartan UI: page header, breadcrumb, status badge, money, skeleton, empty/error block, dialog/sheet wrapper.
- Chuyển tokens/style từ prototype vào design system, giữ dark mode chỉ nếu đã có requirement.
- Thiết lập i18n resource; bỏ hardcoded business error copy trong component.

### Backend

- Bootstrap Node/Fastify hoặc Express theo `TECH_STACK.md`.
- Prisma client singleton, config, health endpoint, structured error envelope.
- Read-only catalog/category/branch endpoints tối thiểu.

### Tests

- Shell keyboard navigation, mega-menu, mobile drawer.
- 404/500/error envelope parsing.
- Responsive smoke ở 360/768/1024/1280.

### Exit criteria

- Prototype monolith không còn là nơi chứa feature mới.
- Shell render trước data, content skeleton không layout shift lớn.

## 4. Phase 2 — Catalog, search và product detail

### Backend capabilities

- Category tree/specification schema.
- Product template + active variants/SKU.
- Faceted filter metadata, sort và pagination.
- Product promotion/price read model.
- Review summary/list public.
- Branch availability read model chỉ dùng để thông tin; không reserve.

### Frontend pages

- Home, catalog/category, search, product detail.
- Branch list/detail và các trang hướng dẫn/chính sách/hỗ trợ có route ổn định.
- Search overlay, mega-menu, filter sidebar/mobile sheet.
- Product card, variant selector, product gallery, spec groups.
- URL-persisted filter/sort/page.
- So sánh SKU theo comparable fields.

### Exit criteria

- Chỉ active SKU add được vào cart.
- Dynamic specifications không hardcode theo mock categories.
- Search/filter/no-result/error/stale states hoàn chỉnh.

## 5. Phase 3 — Prebuilt PC và Custom Build

### Backend capabilities

- Prebuilt offer + BOM read endpoints.
- Build price preview và branch buildable quantity derivation.
- Validate active SKU/build structure khi add cart.
- Không triển khai compatibility engine tự động.

### Frontend

- Prebuilt listing/detail.
- Custom Build slot list, product picker, summary, advisory warning.
- Edit build trong current session/cart.
- Mobile full-screen picker và sticky summary.

### Exit criteria

- Availability/price theo component lines.
- Tùy chỉnh prebuilt tạo custom snapshot riêng.
- Không có saved/shared build UI hoặc claim compatibility.

## 6. Phase 4 — Cart và authentication

### Backend capabilities

- Opaque guest cart, CRUD line/build/service.
- Cart merge khi login, dedupe + reprice + revalidate.
- Better-Auth register/login/logout/verify/recovery/session.
- Customer linkage rules và contact verification service.

### Frontend

- Cart drawer/page, quantity/remove/undo/coupon preview.
- Login/register/verify/forgot/reset pages.
- Auth state, returnUrl, account menu.
- Guest cart persistence và merge conflict UI.

### Exit criteria

- Refresh không mất guest cart.
- Login không bắt buộc trước checkout.
- Merge không duplicate, không silently drop invalid line.

## 7. Phase 5 — Checkout quote và identity verification

### Backend capabilities

- OTP email/phone for checkout, single use/rate limit.
- Identity resolution/conflict outcome.
- Checkout quote: price, promotions, coupon, fee, branch allocation preview.
- Delivery service-area validation và pickup branch eligibility.
- Quote version/expiry.

### Frontend

- 4-step checkout routes và CheckoutState recovery.
- OTP dialogs, contact badges.
- Delivery address/pickup selector.
- Payment eligibility/deposit preview.
- Review page và price/stock/coupon reconfirm branches.

### Exit criteria

- Pickup không có address validation, delivery có.
- Hai contact verified; conflict không auto merge.
- Client quote không được dùng làm final authority.

## 8. Phase 6 — Order submission, QR và COD

### Backend capabilities

- Transactional/idempotent submit order.
- Customer/order/contact/BOM/price snapshots.
- Atomic coupon reservation và branch stock reservation rules.
- Dynamic QR charge và idempotent callback.
- 30-minute expiry, 24-hour payment review, late payment handling.
- COD confirmation path và Custom Build deposit.
- Domain events/outbox cho notification.

### Frontend

- Final submit recovery khi timeout/unknown outcome.
- QR page live status/countdown.
- Success page theo QR/COD/deposit branch.
- Payment review/expired/paid-but-out-of-stock states.

### Exit criteria

- Duplicate submit/callback không duplicate side effects.
- Concurrent final stock/coupon tests có tối đa một winner.
- Order và Payment badges không bị gộp.
- Wrong/under/over payment không vào fulfillment và không có top-up UI.

## 9. Phase 7 — Order lookup, tracking và customer actions

### Backend capabilities

- Guest order lookup OTP/magic-link session scoped đúng order.
- Account order list và authorized order detail snapshot.
- Allowed customer actions/eligibility.
- Idempotent cancel + reservation/coupon release + refund pending.
- Amendment acceptance và supplemental charge.
- Manual event/history read model.

### Frontend

- Guest lookup/OTP.
- Account order history.
- Order detail/timeline/status copy.
- Cancel dialogs.
- Pickup expired → delivery amendment.
- Delivery failed/redelivery/returning states.
- Refund/deposit disposition UI.

### Exit criteria

- Order code alone không đọc được order.
- Snapshot không đổi khi catalog/contact thay đổi.
- Buyer self-cancel bị chặn từ preparation trở đi.
- Amendment không rewrite original order total.

## 10. Phase 8 — Account, notifications và reviews

### Backend capabilities

- Profile read/update; verified old/new contact change + audit.
- Session list/revoke.
- In-app notification list/read status, email/SMS attempt plumbing.
- Review eligibility/create/edit/history/hide read behavior.
- Notification preference chỉ khi scope được duyệt.

### Frontend

- Account overview/profile/security.
- Contact change sub-flow.
- Notification sheet/page.
- Review create/edit dialog và product review rendering.

### Exit criteria

- Guest/account permission boundaries được test.
- One active review/order line.
- Retry notification không duplicate in-app item.
- Profile change không rewrite order snapshot.

## 11. Phase 9 — Hardening và release

### Reliability

- Throttle/offline/stale cache/session expiry/duplicate tab.
- Retry policy và correlation ID support flow.
- Payment callback/expiry race, quote/cart stale race, cancellation/state transition race.
- Outbox replay và notification dedupe.

### Quality

- Accessibility keyboard + screen reader smoke.
- Responsive visual regression key routes/modals.
- Performance budgets: route lazy-loading, image optimization, skeleton CLS.
- Security review: authz, OTP, token storage, PII logging, open redirect, CSRF.
- Analytics funnel không chứa PII.

### Release strategy

- Feature flags theo vertical slice: catalog → cart/auth → checkout sandbox → payment/order pilot → account/review.
- Test provider callback trong staging/sandbox trước production.
- Runbook cho payment review, late payment, paid-out-of-stock và refund pending để Admin vận hành đúng.

## 12. Dependency order bắt buộc

1. Domain contract/error/state enum trước UI eligibility.
2. Catalog/SKU trước cart/build.
3. Guest cart trước checkout.
4. Contact verification + quote trước order submission.
5. Inventory/coupon atomic service trước QR/COD release.
6. Order/payment histories trước tracking UI.
7. Completed order ownership trước review.
8. Domain outbox trước notification channel retries.

Không mock happy path ở phase sau rồi coi là hoàn thành khi dependency authoritative chưa tồn tại.

## 13. Definition of Done cho mỗi page/modal

- Đúng route/entry/back behavior.
- Happy, loading, empty/no-result, stale, validation, business error và retry states.
- Desktop/tablet/mobile layout.
- Keyboard/focus/ARIA/live-region.
- Domain rule IDs được trace trong service/test, không nhất thiết lộ ra headline UI.
- Authorization và server recheck.
- Analytics event không PII.
- Unit/component/contract/E2E test phù hợp risk.
- Vietnamese copy nhất quán; không raw error.
- Không thêm tính năng ngoài scope.

## 14. Kịch bản E2E release bắt buộc

1. Guest mua SKU bằng QR, trả đúng, order confirmed.
2. Guest mua SKU COD, Admin confirm, complete sau ghi nhận đủ tiền.
3. Guest Custom Build COD, trả deposit, theo dõi remaining COD.
4. QR timeout release stock/coupon và cancel đúng một lần.
5. Wrong amount vào payment review, không có top-up.
6. Late exact payment reserve lại thành công và thất bại.
7. Hai khách tranh last unit/coupon quota chỉ một đơn thành công.
8. Login giữa cart merge line và reprice.
9. Guest tra cứu order bằng OTP; truy cập order khác bị chặn.
10. Khách hủy order eligible; refund chuyển pending rồi confirmed bởi Admin.
11. Hủy sau preparation bị chặn.
12. Pickup expired chấp nhận delivery amendment và supplemental payment.
13. Delivery failed redelivery dưới limit; return-to-branch path khi không redeliver.
14. Completed order line tạo một review; duplicate/other customer bị chặn.

## 15. Rủi ro cần theo dõi

- Prototype hiện dùng `number` cho money; cần thay contract decimal-safe trước checkout thật.
- `TECH_STACK.md` còn mô tả compatibility engine nhưng nghiệp vụ MVP cấm auto compatibility; business rules có precedence.
- Prisma schema đầy đủ nhưng chưa chứng minh có service transaction/locking/idempotency; UI không được dựa vào schema để coi nghiệp vụ đã hoàn thành.
- Notification preference và contact linking sau đăng ký cần xác nhận kỹ nếu chưa có endpoint/rule chi tiết.
- Carrier tracking, maps và RMA dễ bị hiểu nhầm là customer essentials nhưng đang ngoài MVP.
