# Task: TASK-01 - Global App Shell, Telemetry Header va Footer Navigation

- Feature: Storefront App Shell
- Governing Spec: [docs/frontend-standards/surfaces.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/docs/frontend-standards/surfaces.md)
- Scope: frontend
- Status: Complete

## Objective

Nang cap toan bo Shell bao quanh ung dung theo chuan giao dien [ui-templates/store-front/components/header.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/components/header.html) va [footer.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/components/footer.html). Cung cap dai telemetry tien ich tren cung (showroom, hotline 1900.6868, gio hoat dong), thanh tim kiem nhanh co dropdown danh muc, header co dinh backdrop blur, menu dieu huong, trigger mo gio hang slide-over, trigger modal dang nhap va ngan keo mobile drawer.

## Technical Context And Dependencies

- Pre-requisites: Khong co
- Reusable Assets:
  - [fe/src/app/components/atoms/button](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms/button)
  - [fe/src/app/components/atoms/badge](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms/badge)
  - [fe/src/app/components/atoms/input](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms/input)
  - [fe/src/app/components/atoms/icon](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms/icon)
  - [fe/src/app/services/cart.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/services/cart.service.ts)
- Target Files:
  - `fe/src/app/features/storefront/storefront-shell.component.html`
  - `fe/src/app/features/storefront/storefront-shell.component.ts`
  - `fe/src/styles.css`

## Checklist

- [x] Bo sung dai telemetry tien ich phia tren header voi thong tin showroom (HN 45 Thai Ha, HCM 280 3/2, DN 112 Ham Nghi), hotline ky thuat va gio mo cua 08:30 - 21:30
- [x] Tich hop thanh tim kiem kem select danh muc linh kien nhanh (CPU, VGA, Mainboard, RAM, SSD, PSU) kem nut Submit dieu huong den `/san-pham` voi query params tuong ung
- [x] Cap nhat danh sach menu dieu huong: Trang chu, Linh kien PC, Build PC, Tra cuu don, Tien do don, Chinh sach bao hanh
- [x] Tich hop nut Gio hang hien thi badge so luong linh kien theo real-time signal tu `CartService`, kich hoat su kien mo Slide-Over Cart Drawer
- [x] Tich hop nut Tai khoan dieu huong toi trang ca nhan hoac mo modal dang nhap
- [x] Chuan hoa chan trang Footer voi day du thong tin showroom toan quoc, cac chinh sach cam ket, kenh mang xa hoi, logo cong nghe va phuong thuc thanh toan chap nhan (VietQR, Visa, Mastercard, COD)
- [x] Hoan thien mobile drawer responsive toggle muot ma, tu dong dong khi nguoi dung nhan chuyen route

## Acceptance Criteria

- Criterion 1: Header co dinh o dau trang (sticky/fixed) voi hieu ung backdrop-blur-xl va shadow ngan cach tinh te.
- Criterion 2: Badge so luong tren nut gio hang phan anh dung tong so mat hang tu `cartService.items().length` theo kien truc signal khong gay giat lag.
- Criterion 3: Tat ca cac lien ket dieu huong phai co active state ro rang (`routerLinkActive`) va ho tro day du thuoc tinh aria (`aria-expanded`, `aria-label`).
- Criterion 4: Giao dien responsive tren man hinh desktop (>= 1280px), tablet (768px - 1024px) va mobile (< 768px) khong bi tran ngang hay vo layout.

## Verification Commands

- Command 1: npm run check:fe
