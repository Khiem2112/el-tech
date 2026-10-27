# Task: TASK-85 - Tinh Gọn Khung Giao Diện Shell Và Thanh Điều Hướng Admin Bằng Impeccable Distill

- Feature: Admin Shell, Global Navigation & Authentication Distillation
- Governing Spec: [MASTER.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/design-system/el-tech/MASTER.md), [SKILL.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/.agents/skills/impeccable/SKILL.md), [distill.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/.agents/skills/impeccable/reference/distill.md), [admin-portal-screens-and-modals.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/docs/admin-portal-screens-and-modals.md)
- Scope: frontend
- Priority: P1 (High)
- Status: Complete

## Traceability & Graph Links

- Task Type: `ui-ux-distill`
- Issue References: Khung giao diện Admin Shell, Header và Sidebar còn nhiều container bao bọc trùng lặp, đường viền ngăn cách thừa, chiếm dụng diện tích hiển thị nội dung vận hành trong chế độ Operate Mode.
- Related Tasks:
  - [[TASK-31-ADMIN-GLOBAL-SHELL-ACCORDION-NAVIGATION-AND-REVIEW-TOOLBAR]]
  - [[TASK-71-ADMIN-SHELL-LIGHT-THEME-AND-CLEANUP]]
  - [[TASK-82-ADMIN-DOUBLE-HEADER-FIX-AND-THEME-TOKEN-STANDARDIZATION]]

## Objective

Thực hiện tinh gọn giao diện (Distill) theo quy trình của kỹ năng Impeccable trên khung điều hướng tổng thể của hệ thống Admin:

1. Tinh gọn Thanh điều hướng bên [admin-sidebar.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/components/admin-sidebar.component.ts):
   - Loại bỏ các đường viền ngăn chia dày đặc không cần thiết giữa các nhóm menu.
   - Tối giản các huy hiệu trạng thái để chỉ giữ lại những tín hiệu cảnh báo quan trọng nhất dành cho nhân viên vận hành.
   - Làm phẳng cấu trúc DOM, loại bỏ các thẻ div bọc thừa bên trong từng mục điều hướng.
   - Tối ưu trạng thái thu gọn (collapsed) giúp nhân viên nhận biết biểu tượng nhanh chóng mà không bị rối mắt.

2. Tinh gọn Thanh tiêu đề trên [admin-header.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/components/admin-header.component.ts):
   - Chuẩn hóa chiều cao của header về kích thước tiêu chuẩn gọn gàng (h-14).
   - Loại bỏ các hành động phụ tranh chấp không gian với thanh tác vụ chính của trang nội dung con.
   - Tinh gọn khu vực thông tin tài khoản và nút chuyển đổi giao diện, đảm bảo độ tương phản tối ưu theo Design System.

3. Tinh gọn Thanh điều hướng vị trí [admin-breadcrumb.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/components/admin-breadcrumb.component.ts):
   - Tối giản ký hiệu phân cách và giảm mật độ chữ để trả lại tối đa khoảng không gian dọc cho dữ liệu nghiệp vụ.
   - Xử lý cắt ngắn thông minh (truncation) trên màn hình hẹp mà không làm biến dạng bố cục.

4. Tinh gọn Khung bao ngoài [admin-shell.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/admin-shell.component.ts):
   - Khắc phục triệt để hiện tượng thanh cuộn kép (double scrollbar).
   - Chuẩn hóa khoảng đệm (`p-4 sm:p-6`) giúp toàn bộ các trang con đồng nhất về mật độ thông tin.

5. Tinh gọn Trang đăng nhập quản trị [admin-login-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/auth/admin-login-page.component.ts):
   - Loại bỏ các chi tiết trang trí rườm rà không phù hợp với công cụ vận hành nội bộ.
   - Tập trung vào duy nhất một khối đăng nhập sắc nét với tiêu điểm rõ ràng, nhãn hiển thị trực quan và thông báo lỗi súc tích.

## Technical Context And Dependencies

- Target Files:
  - [admin-shell.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/admin-shell.component.ts)
  - [admin-header.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/components/admin-header.component.ts)
  - [admin-sidebar.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/components/admin-sidebar.component.ts)
  - [admin-breadcrumb.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/components/admin-breadcrumb.component.ts)
  - [admin-login-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/auth/admin-login-page.component.ts)

## Checklist

- [x] Kiểm tra hiện trạng và xác định các điểm phức tạp thị giác thừa trên khung Shell và Navigation.
- [x] Tinh gọn Sidebar: giảm các viền ngăn thừa, làm phẳng markup và tối ưu menu cấp hai.
- [x] Tinh gọn Header: tập trung vào tìm kiếm, thông báo quan trọng và thông tin tài khoản.
- [x] Tinh gọn Breadcrumb: thu gọn tinh tế và tiết kiệm chiều cao khung nhìn.
- [x] Tinh gọn Login: loại bỏ chi tiết trang trí thừa, giữ đúng tinh thần trang đăng nhập bảo mật và tập trung.
- [x] Chạy kiểm tra `npm run check:fe` với exit code 0.

## Review And Verification Log

- Pre-commit Verification:
  - `npm run check:fe`: Exit code 0 (TypeScript compilation, Angular build, ESLint).
  - `npm run check:be`: Exit code 0 (TypeScript check, ESLint).
- Code Review Pass A (Functional): Pass. Shell scrolling, responsive sidebar, breadcrumb truncation, header actions, and login form function smoothly.
- Code Review Pass B (Convention): Pass. Semantic tokens adhered, zero emojis/icons in text, zero numbered comment chains, pure TypeScript.
