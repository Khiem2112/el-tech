# Task: TASK-09 - Customer Authentication Modal va Profile Account Center

- Feature: Customer Identity & Account Dashboard
- Governing Spec: [docs/customer-identity-and-order-access/flows/v1.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/docs/customer-identity-and-order-access/flows/v1.md)
- Scope: frontend
- Status: Complete

## Objective

Xay dung he thong xac thuc nguoi dung `AuthModalComponent` theo chuan [ui-templates/store-front/auth.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/auth.html) va trung tam quan ly tai khoan khach hang `ProfilePageComponent` tai route `/tai-khoan` theo [ui-templates/store-front/profile-page.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/profile-page.html). Cung cap modal dang nhap/dang ky co tich hop Google OAuth 1-click va form email/phone, bang dieu khien ca nhan hien thi the don hang dang xu ly kem ma OTP nhan may tai quay Showroom Hub va quan ly thong tin bao mat.

## Technical Context And Dependencies

- Pre-requisites: TASK-01 (Shell profile trigger button), TASK-07 (Orders data)
- Reusable Assets:
  - [fe/src/app/core/api/api-client.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/core/api/api-client.service.ts)
  - [fe/src/app/components/atoms](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms)
  - [fe/src/app/lib/vnd.pipe.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/lib/vnd.pipe.ts)
- Target Files:
  - `fe/src/app/features/auth/auth-modal.component.ts`
  - `fe/src/app/features/profile/profile-page.component.ts`
  - `fe/src/app/features/storefront/storefront.routes.ts`

## Checklist

- [x] Xay dung `AuthModalComponent` doc lap co the kich hoat tu bat ky dau (Header, Cart Drawer, Checkout):
  - Segmented Switcher chuyen doi 1 cham giua 2 tab: "Dang nhap" va "Dang ky tai khoan"
  - Nut dang nhap nhanh 1-Click voi Google OAuth
  - Form nhap Email hoac So dien thoai kem Mat khau co nut an/hien mat khau
  - Lien ket "Quen mat khau" va hop dong y dieu khoan su dung dich vu EL-TECH
- [x] Xay dung `ProfilePageComponent` tai route `/tai-khoan` gom 2 phan layout chinh:
  - Thanh Sidebar ben trai: Thong tin nguoi dung, hang thanh vien (Pro Builder / VIP), menu quan ly (Thong tin & Bao mat, Don hang cua toi, Tra cuu nhan hang, Bao hanh & Doi tra, Dang xuat) va widget showroom gan nhat
  - Khu vuc noi dung chinh ben phai: Card don hang moi nhat dang xu ly, hien thi noi bat hop Ma OTP nhan may (vi du: `489-102`) kem huong dan xuat trinh tai quay Showroom Hub
- [x] Tich hop mini timeline 4 buoc tom tat tien do don hang truc quan ben trong Profile Card
- [x] Xay dung tab Thong tin ca nhan & Bao mat: Cap nhat ho ten, so dien thoai, email, doi mat khau va quan ly so dia chi nhan hang mac dinh
- [x] Ket noi trang thai dang nhap vao App Shell Header de hien thi ten khach hang sau khi dang nhap thanh cong

## Acceptance Criteria

- Criterion 1: Modal xac thuc hoat dong muot ma, co the mo khi bam nut Tai khoan o Header hoac khi bat buoc xac thuc o buoc checkout.
- Criterion 2: Form dang nhap va dang ky phai co co che validation hop le, thong bao loi ro rang khi sai thong tin dang nhap.
- Criterion 3: Trang Profile phai hien thi ro rang ma OTP nhan may tai quay Hub doi voi don hang chon hinh thuc Pick-up tai Showroom.
- Criterion 4: Giao dien responsive tren di dong, sidebar menu co the thu gon hoac hien thi duoi dang cac tab dieu huong de thao tac bang 1 tay.

## Verification Commands

- Command 1: npm run check:fe
