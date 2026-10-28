# Task: TASK-70 - Chuẩn Hóa Ranh Giới Hệ Thống, Quản Lý Biểu Phí Giao Hàng Và Sáp Nhập Khách Hàng

- Feature: System Boundary Alignment, Delivery Fee Future Scheduling & Customer Merge Scoping
- Governing Spec: [report/admin_subsystem_business_logic_issues_report.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/report/admin_subsystem_business_logic_issues_report.md) (ISS-006, ISS-008, ISS-009), [SUMMARY.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/SUMMARY.md), [CUS-003, CUS-010, CUS-015, PRC-006, PRC-007](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/.agents/skills/business-logic/features/)
- Scope: backend
- Priority: P2 (Medium)
- Status: Complete

## Objective

Giải quyết các vấn đề liên quan đến ranh giới phạm vi hệ thống, lịch hiệu lực biểu phí và tính toàn vẹn dữ liệu khách hàng:
1. ISS-006: Xung đột ranh giới phạm vi hệ thống giữa tài liệu [SUMMARY.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/SUMMARY.md) (ghi không làm trả hàng nhà cung cấp) và mã nguồn thực tế backend [supplier-return.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/admin/supplier-return.service.ts) cùng giao diện admin. Cần chuẩn hóa tài liệu và phạm vi chính thức.
2. ISS-008: Phương thức `mergeCustomerProfiles` trong `customer.service.ts` cho phép sáp nhập tài khoản khách hàng thành viên đã có tài khoản xác thực `userId !== null` và thiếu vết kiểm toán, vi phạm quy tắc `CUS-003` và `CUS-010`, dẫn tới tài khoản nguồn bị mất toàn bộ đơn hàng và giỏ hàng nhưng vẫn đăng nhập được.
3. ISS-009: Khi cấu hình biểu phí vận chuyển có hiệu lực trong tương lai (`effectiveFrom > now`), hàm tạo biểu phí không gán `effectiveTo` cho bản ghi hiện tại và vẫn gán `isActive = true` cho bản ghi tương lai, dẫn tới tồn tại nhiều bản ghi cùng có hiệu lực và áp dụng sớm mức phí mới khi chưa đến ngày.

## Technical Context And Dependencies

- Pre-requisites: TASK-64
- Reusable Assets:
  - [SUMMARY.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/SUMMARY.md)
  - [be/src/services/admin/customer.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/admin/customer.service.ts)
  - [be/src/services/admin/delivery-fee.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/admin/delivery-fee.service.ts)
  - [be/src/services/admin/order-exception.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/admin/order-exception.service.ts)
- Target Files:
  - `SUMMARY.md`
  - `be/src/routes/admin/customer.routes.ts`
  - `be/src/services/admin/customer.service.ts`
  - `be/src/services/admin/delivery-fee.service.ts`
  - `be/src/services/admin/order-exception.service.ts`
  - `fe/src/app/features/admin/customers/services/admin-customer.service.ts`

## Sub-agent Delegation Strategy

Giao nhiệm vụ cho sub-agent chuyên trách tài liệu phạm vi và logic quản trị khách hàng/cấu hình (`task-implementer`):
- Đồng bộ hóa tài liệu kiến trúc [SUMMARY.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/SUMMARY.md).
- Rà soát các câu truy vấn thời gian `effectiveFrom` và `effectiveTo`.
- Đảm bảo kiểm tra tài khoản thành viên trong quy trình sáp nhập khách hàng.

## Checklist

- [x] Cập nhật [SUMMARY.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/SUMMARY.md): Hợp thức hóa tính năng Xuất trả Nhà cung cấp (Supplier Return) trong phạm vi phân hệ Quản trị kho nội bộ để phục vụ quy trình xử lý linh kiện cách ly hỏng lỗi (`quarantineDamaged`) theo quy tắc `PUR-011` đến `PUR-014`.
- [x] Trong phương thức `mergeCustomerProfiles` tại [customer.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/admin/customer.service.ts#L604-L702):
  - Kiểm tra điều kiện: Nếu `sourceCustomer.userId !== null`, từ chối thao tác sáp nhập và trả về lỗi nghiệp vụ rõ ràng theo quy tắc `CUS-003` (chỉ cho phép sáp nhập khách vãng lai `userId === null` vào tài khoản thành viên hoặc gộp hai khách vãng lai).
  - Bổ sung tham số `adminId` của người thực hiện và tạo bản ghi nhật ký kiểm toán hành động sáp nhập hồ sơ khách hàng.
- [x] Trong [delivery-fee.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/admin/delivery-fee.service.ts#L156-L175):
  - Khi cấu hình biểu phí mới có `effectiveFromDate > now`, cập nhật trường `effectiveTo = effectiveFromDate` cho bản ghi biểu phí hiện đang có hiệu lực.
  - Chuẩn hóa toàn bộ các câu truy vấn lấy biểu phí vận chuyển hợp lệ (trong `delivery-fee.service.ts`, `order-exception.service.ts` và `checkout.service.ts`): bắt buộc phải có điều kiện `effectiveFrom <= now` và `(effectiveTo IS NULL OR effectiveTo > now)`.

## Acceptance Criteria

- Criterion 1: Tài liệu `SUMMARY.md` thống nhất với mã nguồn backend và giao diện quản trị về luồng xuất trả nhà cung cấp.
- Criterion 2: Không thể sáp nhập hồ sơ khách hàng đã có tài khoản đăng nhập thành viên.
- Criterion 3: Biểu phí vận chuyển tương lai không bị kích hoạt áp dụng trước ngày hiệu lực công bố.
- Criterion 4: Lệnh `npm run check:be` chạy thành công với exit code 0.

## Verification Commands

- Command 1: npm run check:be
- Command 2: npm run check:fe

## Review And Fix Log

- Pass A (Functional Review):
  - ISS-006: Tài liệu SUMMARY.md đã thống nhất với backend supplier-return.service.ts và giao diện quản trị, nêu rõ phạm vi xuất trả hàng nhà cung cấp đối với linh kiện cách ly hỏng lỗi dựa trên phiếu nhập kho gốc (PUR-011 đến PUR-014), không quản lý công nợ hay biên bản cấn trừ trong MVP.
  - ISS-008: mergeCustomerProfiles chặn tài khoản nguồn có userId !== null (DomainError CANNOT_MERGE_REGISTERED_CUSTOMER, ruleId CUS-003). Đã truyền adminId từ session adminUser và tạo bản ghi kiểm toán Notification CUSTOMER_PROFILE_MERGED (ruleId CUS-010). getMergeCandidates cũng giới hạn ứng viên nguồn userId: null.
  - ISS-009: createDeliveryFeeConfig khi effectiveFromDate > now tự động cập nhật effectiveTo = effectiveFromDate cho bản ghi cấu hình trước đó. Toàn bộ các truy vấn cấu hình biểu phí hợp lệ trong ensureDefaultConfig, getActiveConfig, getDeliveryFeeConfigs, order-exception.service.ts, checkout.service.ts và order.service.ts đều lọc chuẩn xác effectiveFrom <= now và (effectiveTo IS NULL OR effectiveTo > now).
- Pass B (Convention Review):
  - Typescript strict type check tuân thủ đầy đủ, không sử dụng any, không có interface thay type.
  - Không có emoji hay icon ở code, comment hay chuỗi thông báo.
  - Không có comment đánh số thứ tự dạng chuỗi.
  - Cả hai lệnh npm run check:be và npm run check:fe đều đạt exit code 0.
