# <Tên tính năng> — v<Number> Diff

> Đặt tại `docs/<feature-name>/<flows|specs>/v<Number>-diff.md`. Chỉ ghi delta
> so với base version; không chép lại toàn bộ baseline.

| Thuộc tính | Giá trị |
| --- | --- |
| Version | `v<Number>` |
| Base version | `[<previous version>](<previous-version-file>)` |
| Status | `Draft \| In review \| Approved \| Superseded` |
| Owner | `<tên hoặc vai trò>` |
| Last updated | `<YYYY-MM-DD>` |
| Change type | `Added \| Changed \| Removed \| Clarified` |

## Approval

- **Status:** `Pending | Approved`
- **Approver:** `<tên hoặc vai trò>`
- **Approval date:** `<YYYY-MM-DD>`
- **Decision/constraints:** `<ghi chú>`

## Summary

- **Reason for change:** `<vì sao baseline không còn đủ>`
- **Affected sections:** `<section/anchor>`
- **Compatibility/migration:** `<ảnh hưởng tới dữ liệu, code, rollout>`

## Added

- `<requirement mới và section bị ảnh hưởng>`

## Changed

- **Replaces:** `<rule/section cũ>`
- **With:** `<rule/hành vi mới>`

## Removed

- `<rule/section bị bỏ và lý do>`

## Unchanged Requirements

Mọi requirement của baseline không được nêu rõ trong diff này vẫn còn hiệu lực.
