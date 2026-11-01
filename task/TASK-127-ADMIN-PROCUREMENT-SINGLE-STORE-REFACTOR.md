# Task: TASK-127 - Đơn Mua Hàng PO & Trả Hàng Nhà Cung Cấp Tập Trung Một Kho

- Feature: Admin Procurement & Supplier Returns Single Store Consolidation
- Governing Spec: Quy tắc một cửa hàng Showroom EL-TECH, loại bỏ chọn chi nhánh nhận/trả hàng nhà cung cấp
- Scope: shared
- Status: Complete

## Objective

Đồng bộ luồng mua sắm nhập hàng PO và xuất trả nhà cung cấp về một điểm tiếp nhận tập trung:
1. Màn hình Chi tiết đơn PO ([admin-purchase-order-detail-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/procurement/admin-purchase-order-detail-page.component.ts)): xóa bỏ dropdown chọn chi nhánh nhận hàng (`selectedBranchId`), mặc định địa điểm nhận hàng là Showroom EL-TECH.
2. Hộp thoại nghiệm thu đơn PO ([validate-po-receipt-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/procurement/components/validate-po-receipt-dialog.component.ts)): nhập hàng trực tiếp vào kho Showroom EL-TECH, tự động cộng tồn kho và tính giá vốn WAC tại kho duy nhất.
3. Màn hình Xuất trả nhà cung cấp ([admin-supplier-returns-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/procurement/admin-supplier-returns-page.component.ts)): loại bỏ lựa chọn chi nhánh xuất trả, xuất trừ tồn kho trực tiếp tại Showroom EL-TECH.

## Technical Context And Dependencies

- Pre-requisites: Hoàn thành TASK-118, TASK-126.
- Target Files:
  - `fe/src/app/features/admin/procurement/admin-purchase-order-detail-page.component.ts`
  - `fe/src/app/features/admin/procurement/components/validate-po-receipt-dialog.component.ts`
  - `fe/src/app/features/admin/procurement/admin-supplier-returns-page.component.ts`
  - `be/src/services/admin/po-receipt.service.ts`
  - `be/src/services/admin/supplier-return.service.ts`

## Checklist

- [x] Cập nhật [admin-purchase-order-detail-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/procurement/admin-purchase-order-detail-page.component.ts):
  - Xóa trường chọn chi nhánh nhận hàng khỏi form tạo và sửa PO.
  - Hiển thị cố định "Kho nhận hàng: Showroom EL-TECH".
- [x] Cập nhật [validate-po-receipt-dialog.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/procurement/components/validate-po-receipt-dialog.component.ts) & [po-receipt.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/admin/po-receipt.service.ts):
  - Nhập hàng tăng số lượng On-hand trực tiếp vào chi nhánh showroom chính.
- [x] Cập nhật [admin-supplier-returns-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/admin/procurement/admin-supplier-returns-page.component.ts) & [supplier-return.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/admin/supplier-return.service.ts):
  - Loại bỏ dropdown chọn chi nhánh xuất trả hàng; xuất trực tiếp từ kho Showroom EL-TECH.

## Acceptance Criteria

- Criterion 1: Đơn mua hàng PO tạo mới hoặc xem chi tiết cố định điểm giao nhận tại Showroom EL-TECH không yêu cầu chọn chi nhánh.
- Criterion 2: Nghiệm thu PO cập nhật tồn kho chính xác cho showroom duy nhất.
- Criterion 3: Phiếu xuất trả hàng nhà cung cấp vận hành trực tiếp từ kho Showroom EL-TECH.
- Criterion 4: Kiểm thử tự động `npm run check:fe` và `npm run check:be` hoàn tất thành công với mã thoát 0.

## Verification Commands

- Command 1: `npm run check:fe`
- Command 2: `npm run check:be`

## Review & Fix Log

- Dual-Pass Review:
  - Pass A (Functional): PASS - Đáp ứng đầy đủ 4 tiêu chí nghiệm thu.
  - Pass B (Convention): PASS - Tuân thủ OnPush change detection, signals, zero emojis/icons, zero numbered comments.
- Remediation:
  - Cập nhật fallback mock object trong `supplier-return.service.ts` từ tên cũ sang `{ id: 1, code: 'STORE-MAIN', name: 'Showroom EL-TECH' }`.
- Final Gate:
  - `npm run check:be`: exit code 0.
  - `npm run check:fe`: exit code 0.
  - Review Verdict: PASS.

