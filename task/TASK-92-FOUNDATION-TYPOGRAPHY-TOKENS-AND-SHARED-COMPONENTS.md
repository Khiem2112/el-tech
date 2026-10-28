# Task: TASK-92 - Thống Nhất Typography Sans-Serif Toàn Hệ Thống, Cập Nhật Token Và Chuẩn Hóa Cỡ Chữ Cho Component Dùng Chung

- Feature: System-wide Sans-Serif Typography, Master Tokens & Shared Component Font Standardization
- Governing Spec: [MASTER.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/design-system/el-tech/MASTER.md), [styles.css](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/styles.css)
- Scope: frontend
- Priority: P1 (High)
- Status: Complete

## Traceability & Graph Links

- Task Type: `design-system-typography`
- Issue References: Loại bỏ hoàn toàn font monospace khỏi hệ thống, thống nhất font sans-serif cho toàn bộ normal text lên cỡ 14px (text-sm), xóa bỏ toàn bộ cỡ chữ dưới 12px (text-[9px], text-[10px], text-[11px]), chỉ cho phép 12px (text-xs) với mô tả bổ sung phụ.
- Related Tasks:
  - [[TASK-10-DESIGN-SYSTEM-TOKEN-AUDIT-AND-STANDARDIZATION]]
  - [[TASK-17-TYPOGRAPHY-AND-HEADER-DROPDOWN-CLEANUP]]
  - [[TASK-76-FRONTEND-COLOR-PALETTE-STANDARDIZATION-AND-AI-SLOP-REMOVAL]]
  - [[TASK-79-FRONTEND-TABULAR-NUMERALS-CONTRAST-AND-MOTION-POLISH]]

## Objective

1. Cập nhật và khóa chặt quy chuẩn Typography trong tài liệu thiết kế gốc:
   - Tại [design-system/el-tech/MASTER.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/design-system/el-tech/MASTER.md), quy định rõ ràng rằng toàn bộ giao diện chỉ sử dụng duy nhất họ phông chữ Sans-Serif (`Inter, ui-sans-serif, system-ui, -apple-system, sans-serif`).
   - Cấm triệt để việc sử dụng phông chữ monospace (`font-mono`, `monospace`) cho mã số, SKU, giá cả, thông số kỹ thuật hay văn bản thông thường.
   - Khi cần căn chỉnh độ rộng cố định giữa các ký tự số (chống rung giật khi cuộn hoặc nhảy số), bắt buộc sử dụng lớp `tabular` (`font-variant-numeric: tabular-nums`) trên nền phông sans-serif chuẩn.
   - Thiết lập chuẩn kích thước chữ:
     - Cỡ chữ chính cho toàn bộ normal text (nhãn, bảng, nút bấm, trường nhập liệu, trạng thái, giá tiền, thông số kỹ thuật): chuẩn `14px` (`text-sm` / `0.875rem`).
     - Cỡ chữ phụ trợ: chuẩn `12px` (`text-xs` / `0.75rem`), chỉ được áp dụng cho các dòng mô tả bổ sung không quan trọng (secondary helper text, timestamps, chú thích nhỏ bên dưới).
     - Xóa bỏ hoàn toàn mọi biến thể chữ siêu nhỏ dưới 12px (`text-[9px]`, `text-[10px]`, `text-[11px]`).

2. Chuẩn hóa cấu hình CSS toàn cục:
   - Trong [fe/src/styles.css](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/styles.css), kiểm tra và khóa chặt cấu hình thẻ `body`: `font-size: 14px`, `font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.
   - Đảm bảo thẻ `code`, `pre`, `kbd` hoặc bất kỳ phần tử nào mặc định không bị ép sang monospace mà tuân thủ sans-serif nếu không phải là trình soạn thảo mã nguồn chuyên biệt.

3. Chuẩn hóa toàn bộ các Spartan UI Atoms, Molecules và Organisms dùng chung:
   - [badge.directive.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms/badge/badge.directive.ts): Cập nhật kích thước chữ mặc định của Badge từ 10px/11px/12px lên chuẩn 14px (`text-sm`) hoặc tối thiểu 12px (`text-xs`) cho badge phụ, không dùng `font-mono`.
   - [button.directive.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms/button/button.directive.ts): Đảm bảo text nút bấm luôn có kích thước tối thiểu 14px (`text-sm font-semibold`), loại bỏ class `text-xs` trên các nút hành động chính.
   - [input.directive.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms/input/input.directive.ts): Giữ vững chuẩn chữ nhập liệu và placeholder ở mức 14px (`text-sm`), không cho phép 12px làm khó đọc.
   - [select.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms/select/select.component.ts): Đảm bảo giá trị lựa chọn và danh sách sổ xuống có cỡ chữ 14px đồng bộ.
   - Các component hiển thị bảng biểu, hộp thoại (dialog/modal), thanh điều hướng dùng chung: rà soát và thay thế toàn bộ `font-mono` thành sans-serif + `tabular`.

## Technical Context And Dependencies

- Target Files:
  - [design-system/el-tech/MASTER.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/design-system/el-tech/MASTER.md)
  - [fe/src/styles.css](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/styles.css)
  - [fe/src/app/components/atoms/badge/badge.directive.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms/badge/badge.directive.ts)
  - [fe/src/app/components/atoms/button/button.directive.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms/button/button.directive.ts)
  - [fe/src/app/components/atoms/input/input.directive.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms/input/input.directive.ts)
  - [fe/src/app/components/atoms/select/select.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms/select/select.component.ts)
  - Các tệp trong thư mục [fe/src/app/components/atoms](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms)

## Checklist

- [x] Cập nhật tài liệu thiết kế [MASTER.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/design-system/el-tech/MASTER.md) ghi nhận chính sách cấm monospace, chuẩn hóa normal text 14px và chỉ cho phép 12px với mô tả phụ.
- [x] Rà soát [styles.css](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/styles.css) đảm bảo không có cấu hình ép font monospace và body giữ vững 14px.
- [x] Nâng cấp kích thước chữ của các biến thể Badge trong `badge.directive.ts` lên 14px (hoặc 12px cho compact tag phụ), loại bỏ `font-mono`.
- [x] Kiểm tra `button.directive.ts`, `input.directive.ts`, `select.component.ts` đạt chuẩn font 14px sans-serif.
- [x] Rà soát các components dùng chung khác trong `components/atoms/` đảm bảo không còn `font-mono` và không có cỡ chữ dưới 12px.
- [x] Chạy kiểm tra pre-commit gate `npm run check:fe` đạt exit code 0.

## Review & Verification Report

### Code Completion Summary

- Đã cập nhật tài liệu thiết kế MASTER.md khẳng định quy chuẩn phông Sans-Serif toàn hệ thống, cấm triệt để font-mono, chuẩn hóa kích thước normal text 14px (text-sm) và chỉ cho phép 12px (text-xs) đối với mô tả phụ trợ.
- Đã cấu hình styles.css kế thừa font sans-serif cho code, pre, kbd.
- Đã nâng cấp các component dùng chung:
  - badge.directive.ts: bổ sung thuộc tính size ('sm' | 'md'), chuẩn hóa mặc định 14px (text-sm), hỗ trợ 12px (text-xs) cho thẻ phụ, kích hoạt tabular-nums.
  - button.directive.ts: chuẩn hóa biến thể sm từ text-xs lên text-sm (14px).
  - select.component.ts: chuẩn hóa cỡ chữ input tìm kiếm, option item, và kích thước sm lên text-sm (14px), description/count dùng text-xs tabular, loại bỏ hoàn toàn text-[10px].
- npm run check:fe đã chạy thành công và đạt exit code 0.

### Dual-Pass Code Review

- Pass A (Functional):
  - Xác nhận toàn bộ component dùng chung tuân thủ sans-serif và hiển thị đúng cỡ chữ 14px.
  - Không còn bất kỳ thẻ code, badge, hay nút bấm dùng chung nào bị lệch sang font monospace.
- Pass B (Convention):
  - Tuyệt đối không có emoji hoặc icon trang trí trong mã nguồn, log hoặc tài liệu.
  - Không có chú thích dạng đánh số thứ tự trong mã nguồn.
- Verdict: PASS
