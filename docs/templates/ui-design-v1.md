# <Tên tính năng> — UI Design Contract v1

> Tạo sau khi governing flow được duyệt. Tài liệu này chốt bố cục, surface,
> interaction và responsive behavior; không chốt endpoint, model DB hoặc file
> triển khai Angular.

## Thông tin tài liệu

| Thuộc tính | Giá trị |
| --- | --- |
| Trạng thái | `Draft \| In review \| Approved \| Superseded` |
| Owner | `<tên hoặc vai trò>` |
| Cập nhật lần cuối | `<YYYY-MM-DD>` |
| Governing flow | `<link flow đã Approved>` |
| Pattern baseline | `docs/frontend-standards/interaction-patterns-v1.md` |

## Approval

- **Status:** `Pending | Approved`
- **Approver:** `<tên hoặc vai trò>`
- **Approval date:** `<YYYY-MM-DD>`
- **Decision/constraints:** `<ghi chú hoặc N/A>`

## 1. Design outcome and scope

- **User outcome:** `<outcome từ flow>`
- **Surfaces in scope:** `<screens/overlays>`
- **Out of scope:** `<không thiết kế>`
- **Nearest UI precedents inspected:** `<route/component/token evidence>`

## 2. Screen and surface inventory

| Surface | Entry | Form | Primary action | Exit/recovery |
| --- | --- | --- | --- | --- |
| `<name>` | `<route/trigger>` | `<page/dialog/sheet/popover>` | `<action>` | `<Back/close/retry>` |

## 3. Pattern decisions

| Decision | Pattern ID | Reason | Approved deviation |
| --- | --- | --- | --- |
| `<selection/filter/surface/etc.>` | `<ID>` | `<task evidence>` | `<none or explicit>` |

## 4. Layout contract

### Desktop/tablet

```text
<wireframe hoặc region order>
```

### Mobile

```text
<wireframe hoặc region order>
```

- **Reading order:** `<...>`
- **Scroll ownership:** `<...>`
- **Sticky/fixed regions:** `<...>`
- **Responsive transformations:** `<...>`

## 5. Action and state placement

| State/action | Location and hierarchy | User feedback | Preserved context |
| --- | --- | --- | --- |
| Primary action | `<...>` | `<...>` | `<...>` |
| Loading | `<...>` | `<...>` | `<...>` |
| First-use empty | `<...>` | `<...>` | `<...>` |
| Filtered zero-result | `<...>` | `<...>` | `<...>` |
| Error/stale | `<...>` | `<...>` | `<...>` |
| Pending/success | `<...>` | `<...>` | `<...>` |

## 6. Navigation, focus and accessibility

- **Back/refresh/deep link:** `<...>`
- **Overlay close/focus return:** `<...>`
- **Keyboard order and shortcuts:** `<...>`
- **Announcements:** `<result count, error, reorder, pending>`
- **Zoom, long labels and touch:** `<...>`

## 7. Component reuse and gaps

- **Verified available components:** `<registry entries + actual paths>`
- **Planned/gaps:** `<not yet available>`
- **Feature-local composition:** `<reason not shared>`

## 8. Open questions and decision log

- [ ] `<question>`
- `<YYYY-MM-DD> — <decision> — <owner/reason>`

## 9. Design acceptance criteria

- [ ] Mọi flow surface và branch quan trọng có vị trí UI rõ ràng.
- [ ] Desktop/mobile wireframe giữ cùng task và action hierarchy.
- [ ] Pattern IDs và deviation được ghi rõ.
- [ ] Loading, empty, zero-result, stale, error, pending và success không bị trộn.
- [ ] Back, refresh, overlay, scroll và focus có contract quan sát được.
- [ ] Component được đánh dấu Available đã được xác minh trong repository.
