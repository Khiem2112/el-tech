# 07 — Hợp đồng dùng chung cho frontend và backend

## 1. Kiến trúc frontend đề xuất

Tách `app.html/app.ts` monolith thành các lớp:

- `core/`: auth client, API client/interceptors, route guards, global error mapping, session/cart token.
- `shared/ui/`: Spartan atoms và molecules dùng chung.
- `shared/models/`: DTO/result types sinh hoặc chia sẻ từ contract; không dùng Prisma model trực tiếp trong UI.
- `features/storefront/`: home, shell, navigation.
- `features/catalog/`: listing, search, product detail, compare.
- `features/pc-build/`: prebuilt và custom builder.
- `features/cart/`: cart state/API/drawer/page.
- `features/checkout/`: checkout session, forms, payment QR.
- `features/auth/`: login/register/recovery/contact verification.
- `features/orders/`: lookup, history, detail, tracking, amendments.
- `features/account/`: profile, security, notification preferences.
- `features/reviews/` và `features/notifications/`.

Mỗi feature có routes, pages/containers, presentational components, signals service, form schemas và tests. Component không tự tính final money/eligibility/state transition.

## 2. Route guards và authorization

- `authGuard`: chỉ dùng cho account pages, không dùng cho storefront/cart/checkout.
- `checkoutGuard`: kiểm tra cart/session/step prerequisites, không kiểm tra tiền/tồn cuối cùng.
- `orderAccessResolver`: lấy order bằng account session hoặc guest order session; 403 khác 404.
- `paymentGuard`: chỉ mở QR page cho active charge đúng order/session.
- `reviewEligibilityResolver`: server authoritative.
- Guard giữ returnUrl an toàn; không cho open redirect.

## 3. State services

### CartState

- `cart`, `loading`, `stale`, `lineErrors`, `token`.
- Computed chỉ cho presentation estimate.
- Mutations có request state theo line, rollback/Retry.

### CheckoutState

- Contact, verification handles/status, fulfillment, address/branch, payment selection, accepted quote, cart version, submit idempotency key.
- Persist an toàn qua refresh; không lưu raw OTP/password.
- Reset chỉ sau order outcome đã xác định.

### AuthState

- Better-Auth session, linked Customer summary, session freshness.
- Không coi User email verified là đủ thay checkout phone verification.

### OrderState

- Order snapshot, transition timeline, payment state, actions/eligibilities trả từ server.
- UI dùng `allowedActions` từ server để render CTA, nhưng server vẫn recheck command.

## 4. Hợp đồng response

Success dùng envelope nhất quán:

```text
{ success: true, data, meta? }
```

Domain failure:

```text
{ success: false, error: { code, ruleId, messageKey, details?, retryable, correlationId } }
```

`messageKey` map sang copy tiếng Việt; không hiển thị raw database/provider error. `ruleId` phục vụ trace/support, ví dụ `CUS-004`, `PRO-008`, `CHK-012`.

## 5. Các domain error UI phải xử lý rõ

- `CUSTOMER_IDENTITY_CONFLICT` → blocking identity conflict dialog.
- `CONTACT_NOT_VERIFIED` → quay đúng contact field/OTP action.
- `PRICE_QUOTE_STALE` → price reconfirm dialog.
- `COUPON_QUOTA_EXHAUSTED` → coupon inline error, không auto submit giá mới.
- `SKU_NOT_SELLABLE` → line error + sửa giỏ.
- `NO_SINGLE_BRANCH_CAN_FULFILL` → checkout blocker, giữ cart.
- `INSUFFICIENT_STOCK` → affected line/build components.
- `PAYMENT_REVIEW_REQUIRED` → hold UI, cấm top-up.
- `PAYMENT_EXPIRED` → expired outcome + order link.
- `ORDER_TRANSITION_NOT_ALLOWED` → refresh order và giải thích state mới.
- `ORDER_CANCEL_NOT_ALLOWED` → cancel-not-allowed dialog.
- `REVIEW_NOT_ELIGIBLE`/`REVIEW_ALREADY_EXISTS` → refresh review CTA.
- `RATE_LIMITED` → countdown/retry-after.

## 6. Loading, empty, stale và error

Mọi list/page có state độc lập:

1. Request đang chạy, chưa cache → skeleton matching layout.
2. Request lỗi → error state + Retry.
3. Success zero, chưa từng có data → first-use state + CTA.
4. Success zero sau filter/search → no-results + clear filter.
5. Cache cũ trong refetch → giữ data, đánh dấu stale/subtle progress.

Không dùng `items.length === 0` cho cả năm trường hợp. Indicator delay khoảng 150–300ms và minimum display 300–500ms để tránh flash.

## 7. Form conventions

- Angular Reactive Forms + Zod; form `novalidate`.
- Label luôn hiển thị phía trên; placeholder chỉ là format hint.
- Validate on blur, sau lỗi thì live revalidate.
- Submit lỗi dài có error summary và focus vào summary/field đầu.
- Không clear dữ liệu vì 4xx/5xx/session expiry.
- Checkout một topic mỗi route; browser Back/UI Back giữ state.
- Correct `type`, `inputmode`, `autocomplete`; OTP paste toàn mã.
- Button copy nêu outcome, tránh `Submit/OK/Yes`.

## 8. Modal/sheet accessibility contract

- Dùng Spartan/CDK primitives; focus trap, title/description programmatic.
- Khi mở lưu trigger; đóng trả focus về trigger.
- Escape đóng dialog không consequential; đang submit thì ngăn double action nhưng không trap vĩnh viễn.
- Background scroll lock.
- Safe action focus mặc định trong destructive confirm.
- Mobile dialog phức tạp chuyển bottom sheet/full-screen.
- Toast không nằm dưới modal; blocking error không chỉ hiện toast.

## 9. Accessibility và responsive definition

- WCAG AA: text/error contrast, visible focus, error không dùng màu đơn độc.
- Keyboard hoàn chỉnh cho nav, mega-menu, filters, gallery, rating, comparison và modal.
- Touch target tối thiểu 44×44 CSS px.
- `aria-live` cho cart count, verify success, payment state và async result count.
- `prefers-reduced-motion` tắt shimmer/motion không cần thiết.
- Test 360px, 768px, 1024px, 1280px và ultrawide; checkout action không bị che bởi mobile browser UI.

## 10. Idempotency và concurrency

Client tạo/giữ một idempotency key cho mỗi consequential intent:

- Submit order.
- Apply/reserve coupon trong order submission.
- Cancel order.
- Accept amendment.
- Start payment charge nếu endpoint yêu cầu.
- Create/edit review theo command contract.

Khi network timeout, client query outcome hoặc retry cùng key; không sinh key mới ngay. Backend unique/transaction/locking vẫn là authority.

## 11. Money, date và snapshot

- API gửi money dạng string/decimal-safe DTO; client không dùng float cho final calculations.
- VND whole đồng, thousand separator và alignment nhất quán.
- Absolute timestamp kèm timezone; relative time chỉ ở feed, tooltip absolute.
- Order detail dùng snapshot fields, không join live catalog để thay nội dung lịch sử.
- Payment and Order state là hai field/components riêng trên mọi page.

## 12. Analytics tối thiểu

Theo dõi event không chứa raw email/phone/address/OTP:

- Search submitted/no-results/filter applied/product viewed.
- Add/remove cart, cart error, checkout started/step completed.
- OTP requested/verified/failed theo channel, không log code/contact.
- Quote changed, coupon failed theo stable error code.
- Order submitted/outcome, QR state viewed, checkout abandoned.
- Order lookup attempted/success, cancel attempted/outcome.
- Review opened/submitted/outcome.

Funnel và error metrics phải phân biệt guest/account, device class và feature branch nhưng không làm lộ PII.

## 13. Test pyramid

- Unit: Zod schemas, presentation mappers, state reducers/computed, money DTO format.
- Component: forms, OTP dialog, cart line, filters, state badges, cancel/review dialogs.
- Contract: FE DTO parsing với API fixtures cho mọi domain error/state.
- Integration backend: transaction, idempotency, concurrency, snapshots.
- E2E: guest QR, guest COD, Custom Build COD deposit, account login cart merge, guest lookup, cancel/refund pending, completed review.
- Accessibility: axe/static checks + keyboard/manual screen reader smoke.
- Responsive visual: key pages và modal ở breakpoint chuẩn.

## 14. Security/privacy checklist

- Opaque cart/guest session tokens trong secure storage/cookie theo architecture; không URL/log.
- OTP rate limit, expiry, single use; masked contact.
- CSRF/session/cookie flags theo Better-Auth.
- Return URL allow-list.
- Không expose order/contact từ order code alone.
- API authorization recheck trên mọi order/review/notification command.
- Không log OTP, password, QR secrets, full address/contact hoặc provider raw payload ra client.
