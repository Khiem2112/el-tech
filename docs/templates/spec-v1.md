# <Tên tính năng> — Technical Specification v1

> Sao chép vào `docs/<feature-name>/specs/v1.md` sau khi flow và UI design bắt
> buộc tương ứng đã được duyệt. Xác nhận module thật trong repo trước khi ghi
> đường dẫn file. Không dùng ví dụ trong template như bằng chứng rằng component,
> API hoặc model đã tồn tại.

## Thông tin tài liệu

| Thuộc tính | Giá trị |
| --- | --- |
| Trạng thái | `Draft \| In review \| Approved \| Superseded \| Implemented` |
| Owner | `<tên hoặc vai trò>` |
| Reviewer/Approver | `<tên hoặc vai trò>` |
| Cập nhật lần cuối | `<YYYY-MM-DD>` |
| Governing flow | `<link flow version đã Approved>` |
| Governing UI design | `<link design đã Approved hoặc Not applicable + reason>` |
| Frontend pattern IDs | `<SURFACE/SELECT/FILTER/ORDER/PAGE IDs áp dụng>` |
| Rule sources | `<business-rule files và rule IDs>` |

## Approval

- **Status:** `Pending | Approved`
- **Approver:** `<tên hoặc vai trò>`
- **Approval date:** `<YYYY-MM-DD>`
- **Decision/constraints:** `<ghi chú hoặc N/A>`

## 1. Scope & Traceability

- **Outcome:** `<kết quả cần triển khai>`
- **In scope:** `<capabilities>`
- **Out of scope:** `<không triển khai>`

| Flow/design section / acceptance criterion | Spec sections | Planned evidence |
| --- | --- | --- |
| `<flow anchor>` | `<UI/API/domain/test>` | `<test/review evidence>` |

## 2. Repository Baseline & Reuse Evidence

- **Frontend precedent:** `<Angular route/component/service/styles đã kiểm tra>`
- **Backend precedent:** `<route/controller/service/schema đã kiểm tra>`
- **Shared contracts:** `<DTO/Zod schema/error mapping đã kiểm tra>`
- **Reusable primitives:** `<registry entries + path/API đã xác minh>`
- **New modules justified:** `<module mới và lý do reuse không đủ>`

## 3. Route, Surface & Component Structure

| Action | File/path thực tế | Trách nhiệm | Reuse/extension |
| --- | --- | --- | --- |
| `Create/Update` | `<path>` | `<route/page/component/service>` | `<existing module hoặc N/A>` |

- **Shell/layout:** `<storefront/checkout/account shell>`
- **Surface choice:** `<page/dialog/sheet/popover và lý do>`
- **Pattern conformance:** `<pattern IDs + deviations đã Approved>`
- **Responsive behavior:** `<mobile/tablet/desktop>`
- **Navigation/history:** `<deep link, Back, refresh, returnUrl>`

## 4. Frontend State & Interaction

- **Server data:** `<Angular HttpClient/API client, cache/reload policy>`
- **Client state:** `<Signals service; owned state và computed presentation state>`
- **Form state:** `<Reactive Forms + Zod schemas; validation timing>`
- **URL state:** `<query/filter/sort/page/selected id>`
- **Loading/empty/stale/error:** `<distinct render contract>`
- **Duplicate prevention:** `<pending state/idempotency context>`

## 5. API & Layer Mapping

| User action | REST endpoint | Request contract | Response/domain errors | UI result |
| --- | --- | --- | --- | --- |
| `<action>` | `<method path>` | `<Zod DTO>` | `<stable codes>` | `<state/feedback>` |

| Controller/route | Service | Data source/external system | Transaction/idempotency |
| --- | --- | --- | --- |
| `<route>` | `<service>` | `<Prisma/provider>` | `<boundary>` |

Controllers parse/authenticate/format responses. Services own business logic and
DB access. Frontend components never call Prisma or backend services directly.

## 6. Domain, Persistence & Security

- **Rule mapping:** `<rule ID → enforcement location>`
- **Authorization/ownership:** `<actor and server recheck>`
- **Models/migration:** `<none hoặc exact change/backfill/rollback>`
- **Snapshots/audit:** `<historical fields and actor/time/reason>`
- **Money/stock/concurrency:** `<Decimal, locks/atomic conditions, invariants>`
- **Sensitive data:** `<masking, logging, token/cookie handling>`

## 7. Error & Recovery Mapping

| Stable error/condition | UI location | Work preserved | Recovery/next action |
| --- | --- | --- | --- |
| `<code>` | `<field/banner/dialog/page>` | `<state>` | `<action>` |

## 8. i18n, Accessibility & Visual Contract

- **i18n:** `<resource paths, required keys, no raw provider errors>`
- **Accessibility:** `<semantics, label, focus, aria-live, keyboard>`
- **Visual reuse:** `<styles.css tokens, Spartan primitives, nearest precedent>`
- **Responsive:** `<360/768/1024/1280 and overflow behavior>`
- **Motion/contrast:** `<reduced motion and WCAG requirements>`

## 9. Reliability, Performance & Observability

- **Caching/revalidation:** `<policy>`
- **Pagination/search/debounce:** `<limits and cancellation>`
- **Timeout/retry:** `<eligible conditions>`
- **Idempotency/race handling:** `<same-key recovery and authoritative query>`
- **Logs/metrics/analytics:** `<correlation ID, no PII>`

## 10. Phase-Gated Implementation Plan

| Phase | Deliverable | Dependencies | Review mode/scope | Validation | Exit criteria |
| --- | --- | --- | --- | --- | --- |
| `1` | `<small vertical slice>` | `<approved contracts>` | `<functional/convention/both + scope>` | `<targeted checks>` | `<observable result>` |

Mỗi phase dùng `mode=both` phải review functional trước, convention sau. Critical
và High findings là blocker; fix xong phải re-run validation và review bị fail.

## 11. Testing Scenarios

| # | Scenario | Given | When | Then | Level |
| --- | --- | --- | --- | --- | --- |
| 1 | Happy path | `<...>` | `<...>` | `<...>` | `<unit/component/contract/integration/E2E>` |
| 2 | Validation | `<...>` | `<...>` | `<...>` | `<...>` |
| 3 | Permission | `<...>` | `<...>` | `<...>` | `<...>` |
| 4 | Stale/race/duplicate | `<...>` | `<...>` | `<...>` | `<...>` |
| 5 | Failure and retry | `<...>` | `<...>` | `<...>` | `<...>` |
| 6 | Responsive/accessibility | `<...>` | `<...>` | `<...>` | `<...>` |

## 12. Risks, Assumptions & Open Questions

- **Assumptions:** `<cách xác nhận>`
- **Risks:** `<data/dependency/security/performance/rollout>`
- [ ] `<câu hỏi còn mở>`
- **Decision log:** `<date — decision — owner/reason>`

## 13. Acceptance Criteria

- [ ] Mọi acceptance criterion của flow có implementation và evidence tương ứng.
- [ ] Approved UI design và frontend pattern IDs được trace vào component, state và test.
- [ ] Business rule, authorization và validation nằm đúng layer và được recheck server-side.
- [ ] Loading, empty, stale, error, session expiry và unknown outcome có recovery an toàn.
- [ ] Type/lint/test/a11y/responsive checks được chạy theo scope và risk.
- [ ] Không thêm dependency, schema hoặc capability ngoài nội dung đã duyệt.
- [ ] Tất cả review blocker đã fix và re-review đạt PASS.
