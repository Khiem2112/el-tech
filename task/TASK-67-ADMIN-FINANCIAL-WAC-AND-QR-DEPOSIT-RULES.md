# Task: TASK-67 - Chuẩn Hóa Tính Toán Giá Vốn WAC, Đối Soát QR Và Xử Lý Cọc Custom PC

- Feature: Financial Accounting, WAC Decimal Arithmetic, Manual QR Matching & Custom PC Deposit Rules
- Governing Spec: [report/admin_subsystem_business_logic_issues_report.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/report/admin_subsystem_business_logic_issues_report.md) (ISS-007, ISS-016, ISS-017), [PRC-004, INV-017, FQ36-A, PAY-003, PAY-010, PAY-011, PAY-015](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/.agents/skills/business-logic/features/)
- Scope: backend
- Priority: P1 (High)
- Status: Complete

## Objective

Khắc phục 3 lỗi nghiêm trọng liên quan đến tính toán tiền tệ và hạch toán dòng tiền:
1. ISS-007: Tính giá vốn bình quân gia quyền (WAC) bằng kiểu số thực `Number` và hàm `.toFixed(2)` sinh ra số lẻ thập phân cho đồng VND, vi phạm nguyên tắc `PRC-004` và tích lũy sai số kế toán kho.
2. ISS-016: Khối lệnh `resolveQrDiscrepancy` không kiểm tra `actualReceived === expectedAmount`, cho phép khớp tay ngay cả khi khách chuyển thiếu tiền (vi phạm `FQ36-A`), đồng thời gán cứng `payment.state = PaymentState.PAID`, làm mất nghĩa vụ thu tiền COD 90% còn lại đối với đơn Custom PC có thu cọc.
3. ISS-017: Biến `isDepositForfeited` không kiểm tra phương thức thanh toán, tự động tịch thu cọc 10% ngay cả đối với đơn Custom PC đã thanh toán trả trước 100% qua VietQR. Ngoài ra, trong `processManualRefund`, khi xác nhận hoàn tiền một phần, hệ thống tự động gán `payment.state = REFUNDED` thay vì giữ `PARTIALLY_PAID` (`PAY-015`), làm sai lệch báo cáo doanh thu giữ cọc.

## Technical Context And Dependencies

- Pre-requisites: TASK-64
- Reusable Assets:
  - [be/src/services/admin/po-receipt.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/admin/po-receipt.service.ts)
  - [be/src/services/admin/transfer.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/admin/transfer.service.ts)
  - [be/src/services/admin/order-exception.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/admin/order-exception.service.ts)
  - [be/src/services/admin/order-closing.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/admin/order-closing.service.ts)
- Target Files:
  - `be/src/services/admin/po-receipt.service.ts`
  - `be/src/services/admin/transfer.service.ts`
  - `be/src/services/admin/order-exception.service.ts`
  - `be/src/services/admin/order-closing.service.ts`

## Sub-agent Delegation Strategy

Giao nhiệm vụ cho sub-agent chuyên trách kế toán kho và tài chính thanh toán (`task-implementer`):
- Sử dụng triệt để thư viện `Prisma.Decimal` hoặc `decimal.js` cho toàn bộ các phép tính toán nhân chia cộng trừ giá vốn.
- Rà soát cẩn thận các trạng thái thanh toán `PaymentState` (`PAID`, `PARTIALLY_PAID`, `REFUNDED`) trong mọi luồng hoàn tiền và đối soát.

## Checklist

- [x] Trong phương thức tính giá vốn tại [po-receipt.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/admin/po-receipt.service.ts#L198-L201) và [transfer.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/admin/transfer.service.ts#L910-L918):
  - Chuyển toàn bộ công thức sang đối tượng `Decimal`: `currentOnHand.mul(currentWac).add(incomingQty.mul(incomingCost)).div(newOnHand)`.
  - Làm tròn số nguyên không phần thập phân cho đồng VND: `.toDecimalPlaces(0, Decimal.ROUND_HALF_UP)`.
- [x] Trong phương thức `resolveQrDiscrepancy` tại [order-exception.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/admin/order-exception.service.ts#L617-L640):
  - Bắt buộc kiểm tra `actualReceived === reviewCharge.expectedAmount` mới cho phép thực hiện `MANUAL_MATCH`. Trường hợp chuyển thiếu tiền, từ chối khớp tay và bắt buộc chuyển sang quy trình hủy đơn hoàn tiền theo quyết định `FQ36-A`.
  - Phân biệt loại khoản thu: Nếu `reviewCharge.chargeType === PaymentChargeType.CUSTOM_BUILD_DEPOSIT`, trạng thái của `Payment` phải là `PaymentState.PARTIALLY_PAID` để giữ nguyên nghĩa vụ thu số tiền COD còn lại khi giao máy; chỉ cập nhật `PaymentState.PAID` khi khoản thu là thanh toán toàn bộ đơn hàng.
- [x] Trong phương thức `cancelOrder` tại [order-closing.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/admin/order-closing.service.ts#L477-L504): Cờ tịch thu tiền cọc `isDepositForfeited` chỉ áp dụng khi `order.paymentMethod === PaymentMethod.COD` và `order.depositRequired > 0`. Đối với đơn trả trước 100% qua VietQR, `refundableAmount` phải bằng 100% số tiền đã nhận.
- [x] Trong phương thức `processManualRefund` tại [order-exception.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/admin/order-exception.service.ts#L874-L883): Nếu đơn hàng có một phần tiền cọc bị tịch thu (số tiền thực hoàn nhỏ hơn tổng tiền đã thu), trạng thái `Payment.state` phải giữ là `PARTIALLY_PAID`, chỉ cập nhật `REFUNDED` khi đã hoàn trả đủ 100% số tiền đã nhận.

## Acceptance Criteria

- Criterion 1: Giá vốn bình quân gia quyền WAC sau khi nhập hàng và điều chuyển giữa các chi nhánh luôn là số nguyên đồng VND, không có phần thập phân.
- Criterion 2: Không thể khớp thủ công các giao dịch chuyển khoản VietQR thiếu tiền.
- Criterion 3: Khớp cọc thành công cho đơn Custom PC COD duy trì trạng thái `PARTIALLY_PAID`, hiển thị chính xác số tiền COD còn phải thu tại quầy hoặc lúc giao hàng.
- Criterion 4: Đơn hàng Custom PC trả trước 100% khi hủy được hoàn đủ 100% tiền, không bị trừ nhầm cọc.
- Criterion 5: Lệnh `npm run check:be` chạy thành công với exit code 0.

## Verification Commands

- Command 1: npm run check:be
