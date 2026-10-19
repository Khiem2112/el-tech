# <Tên tính năng> — UX Flow v1

> Sao chép vào `docs/<feature-name>/flows/v1.md`. Tài liệu này mô tả hành vi và
> thông tin người dùng quan sát được; không nêu component, endpoint, model DB hay
> chi tiết thư viện.

## Thông tin tài liệu

| Thuộc tính | Giá trị |
| --- | --- |
| Trạng thái | `Draft \| In review \| Approved \| Superseded` |
| Owner | `<tên hoặc vai trò>` |
| Cập nhật lần cuối | `<YYYY-MM-DD>` |
| Nguồn nghiệp vụ | `<plan, rule IDs, research, quyết định người dùng>` |

## Approval

- **Status:** `Pending | Approved`
- **Approver:** `<tên hoặc vai trò>`
- **Approval date:** `<YYYY-MM-DD>`
- **Decision/constraints:** `<điều kiện phê duyệt hoặc N/A>`

## 1. Outcome

- **Actor:** `<Guest Buyer / Customer / actor liên quan>`
- **Trigger:** `<ý định hoặc sự kiện bắt đầu>`
- **Job to be done:** `<việc người dùng cần hoàn thành>`
- **Successful outcome:** `<kết quả quan sát được>`
- **In scope:** `<phạm vi>`
- **Out of scope:** `<không thuộc flow>`

## 2. Evidence, Assumptions & Constraints

- **Evidence available:** `<nghiên cứu, dữ liệu, rule đã duyệt>`
- **Evidence gaps:** `<dữ liệu chưa có; không giả định là sự thật>`
- **Business constraints:** `<rule IDs về tiền, tồn, quyền, lifecycle>`
- **Source of truth:** `<hệ thống/bản ghi quyết định trạng thái>`
- **Consequential actions:** `<hành động cần idempotency/xác nhận/audit>`

## 3. Surfaces & Entry Points

| Bề mặt | Hình thức | Điểm vào | Mục tiêu và hành động chính |
| --- | --- | --- | --- |
| `<Tên>` | `Page / Dialog / Sheet / Popover` | `<route/trigger nghiệp vụ>` | `<người dùng thấy và làm gì>` |

## 4. State Model

| State | Ý nghĩa với người dùng | Hành động được phép | Điều kiện thoát/kết thúc |
| --- | --- | --- | --- |
| `<State>` | `<meaning>` | `<allowed/blocked actions>` | `<transition>` |

## 5. Primary Path

1. **<Tên bước> — <bề mặt>**
   - **User intent/action:** `<ý định và thao tác>`
   - **System feedback:** `<phản hồi tức thời và dữ liệu hiển thị>`
   - **State preserved:** `<dữ liệu/ngữ cảnh được giữ>`
   - **Next safe action:** `<CTA hoặc điều hướng tiếp theo>`

## 6. Decisions & Alternative Paths

| Điều kiện/quyết định | Chủ thể quyết định | Hành vi hệ thống | Next safe action |
| --- | --- | --- | --- |
| `<condition>` | `<Buyer/System/Admin>` | `<observable behavior>` | `<recovery/next step>` |

## 7. Failure, Interruption & Recovery

| Tình huống | Thông tin/state được giữ | Phản hồi cho người dùng | Recovery |
| --- | --- | --- | --- |
| First load | `<...>` | `<skeleton/progress trung thực>` | `<...>` |
| Empty first-use | `<...>` | `<orientation + CTA>` | `<...>` |
| Zero results | `<filters/query>` | `<giải thích + clear>` | `<...>` |
| Stale data | `<last known good state>` | `<timestamp/banner>` | `<refresh/reconfirm>` |
| Validation/domain error | `<user work>` | `<field/section error>` | `<fix and continue>` |
| Network/unknown outcome | `<intent + idempotency context>` | `<không khẳng định sai>` | `<query outcome/retry same intent>` |
| Permission/session expiry | `<safe local work>` | `<không lộ dữ liệu>` | `<reauth và quay lại>` |
| Duplicate/race | `<single intended outcome>` | `<current authoritative state>` | `<refresh/reconcile>` |

## 8. Responsive, Accessibility & Navigation Contract

- **Mobile:** `<collapse order, sticky action, full-screen/sheet behavior>`
- **Desktop/tablet:** `<content width, sticky regions, master/detail behavior>`
- **Keyboard/focus:** `<tab order, Escape, focus return, error focus>`
- **Screen reader:** `<labels, aria-live, state announcements>`
- **Back/refresh/deep link:** `<state preservation and history behavior>`
- **Reduced motion/contrast/touch:** `<requirements>`

## 9. Measurement Without PII

- **Key events:** `<entry, progress, success, recovery, abandonment>`
- **Success signal:** `<observable metric when available>`
- **Forbidden data:** `<email, phone, address, OTP, secrets>`

## 10. Acceptance Criteria

- [ ] Primary path đạt outcome mà không yêu cầu kiến thức hoặc thao tác ngoài phạm vi.
- [ ] Mọi decision branch có phản hồi và next safe action rõ ràng.
- [ ] Loading, empty, zero-result, stale, error và interrupted state không bị trộn lẫn.
- [ ] Consequential action chống submit trùng và không làm mất work khi outcome chưa rõ.
- [ ] Quyền truy cập, privacy, tiền, tồn và lifecycle tuân thủ rule IDs đã dẫn.
- [ ] Back, refresh, deep link, mobile, keyboard và screen reader có hành vi quan sát được.
- [ ] Không quảng bá capability ngoài MVP.

## 11. Open Questions & Decision Log

- [ ] `<câu hỏi cần duyệt>`

- `<YYYY-MM-DD> — <quyết định> — <người quyết định/lý do>`
