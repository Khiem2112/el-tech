# Task: TASK-06 - Multi-Step Checkout va Dedicated Order Success Receipt

- Feature: Checkout Flow & Order Confirmation
- Governing Spec: [docs/cart-checkout-payment/flows/v1.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/docs/cart-checkout-payment/flows/v1.md)
- Scope: frontend
- Status: Complete

## Objective

Nang cap toan dien quy trinh thanh toan tai [fe/src/app/features/checkout/checkout-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/checkout/checkout-page.component.ts) va xay dung trang xac nhan don hang doc lap `OrderSuccessPageComponent` theo dung chuan tu [ui-templates/store-front/checkout.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/checkout.html) va [order-success.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/order-success.html). Cung cap lua chon nhan hang tai Showroom Hub hoac Giao tan noi 2H, xac thuc OTP, phuong thuc thanh toan VietQR tu dong, tuy chon xuat hoa don VAT va trang bien nhan in an chuyen nghiep voi ma OTP nhan may.

## Technical Context And Dependencies

- Pre-requisites: TASK-02 (CartService checkout transition)
- Reusable Assets:
  - [fe/src/app/forms/checkout.schema.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/forms/checkout.schema.ts)
  - [fe/src/app/core/api/api-client.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/core/api/api-client.service.ts)
  - [fe/src/app/services/cart.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/services/cart.service.ts)
  - [fe/src/app/components/atoms](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms)
  - [fe/src/app/lib/vnd.pipe.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/lib/vnd.pipe.ts)
- Target Files:
  - `fe/src/app/features/checkout/checkout-page.component.ts`
  - `fe/src/app/features/checkout/order-success-page.component.ts`
  - `fe/src/app/features/storefront/storefront.routes.ts`

## Checklist

- [x] Hoan thien form thong tin khach hang tai `CheckoutPageComponent`: Ho ten, So dien thoai, Email kem nut gui va xac thuc ma OTP phong chong spam
- [x] Xay dung bo lua chon hinh thuc nhan hang (Fulfillment Segmented Control):
  - Nhan truc tiep tai Showroom (HN 45 Thai Ha, HCM 280 3/2, DN 112 Ham Nghi) voi thoi gian san sang
  - Giao hang tan nha (Hoa toc 2H noi thanh hoac Tieu chuan toan quoc) co khung nhap dia chi chi tiet
- [x] Thiet ke danh sach phuong thuc thanh toan: VietQR (Quet ma chuyen khoan tu dong), Thanh toan khi nhan hang (COD) va Chuyen khoan ngan hang truc tiep
- [x] Tich hop tuy chon yeu cau xuat hoa don do VAT: Ma so thue, Ten cong ty, Dia chi doanh nghiep va email nhan hoa don dien tu
- [x] Xay dung trang `OrderSuccessPageComponent` doc lap tai route `/dat-hang-thanh-cong/:code` theo mau `order-success.html`:
  - Hero Ribbon thong bao: "Dat hang thanh cong!", Ma don hang `#ELT-XXXXX`, trang thai don
  - Nut in bien nhan hoa don (`window.print()`) voi CSS an header/footer khi in
  - Hop huong dan thanh toan VietQR (neu chua hoan tat) kem ma QR, noi dung chuyen khoan chuan xac va dong ho dem nguoc giu hang
  - Hop ma OTP nhan may tai quay Showroom Hub (neu chon nhan tai cua hang)
  - Thong tin ky thuat vien phu trach va nut chuyen tiep sang trang Theo doi don hang

## Acceptance Criteria

- Criterion 1: Khi dat hang thanh cong, gio hang trong `CartService` phai duoc xoa sach va nguoi dung duoc chuyen huong muot ma den trang `/dat-hang-thanh-cong/:code`.
- Criterion 2: Voi don hang chon thanh toan VietQR, trang xac nhan phai the hien day du ma QR dong, so tien can thanh toan va cu phap chuyen khoan chinh xac.
- Criterion 3: Chuc nang in don hang (`window.print()`) phai co style `@media print` rieng biet giup trang in sach se, khong bi cat thong tin quan trong.
- Criterion 4: Cac truong form phai duoc kiem tra tinh hop le bang Zod schema truoc khi cho phep tien hanh submit don hang.

## Verification Commands

- Command 1: npm run check:fe
