# Task: TASK-02 - Quick Cart Slide-Over Drawer va Cart Breakdown

- Feature: Cart & Quick Shopping Drawer
- Governing Spec: [docs/cart-checkout-payment/flows/v1.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/docs/cart-checkout-payment/flows/v1.md)
- Scope: frontend
- Status: Complete

## Objective

Xay dung thanh phan Slide-Over Cart Drawer tu phia ben phai theo chuan [ui-templates/store-front/cart.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/cart.html) khi nguoi dung nhan vao nut Gio hang hoac them san pham thanh cong. Ho tro hien thi rieng biet giua linh kien don le va bo PC Hoan Chinh (Custom PC Build BOM), thanh tien do Free Shipping, bo dem so luong, nut xoa linh kien, kiem tra ton kho chi nhanh va nut tien toi Checkout.

## Technical Context And Dependencies

- Pre-requisites: TASK-01 (Header shell cart button)
- Reusable Assets:
  - [fe/src/app/services/cart.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/services/cart.service.ts)
  - [fe/src/app/lib/vnd.pipe.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/lib/vnd.pipe.ts)
  - [fe/src/app/lib/product-image.pipe.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/lib/product-image.pipe.ts)
  - [fe/src/app/components/atoms](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms)
- Target Files:
  - `fe/src/app/features/cart/cart-drawer.component.ts`
  - `fe/src/app/features/cart/cart-page.component.ts`
  - `fe/src/app/services/cart.service.ts`
  - `fe/src/app/features/storefront/storefront-shell.component.html`

## Checklist

- [x] Xay dung `CartDrawerComponent` la standalone component hoat dong duoi dang slide-over tu canh phai voi backdrop lam mo (backdrop-blur-sm)
- [x] Mo rong `CartService` voi signal quan ly trang thai mo/dong drawer (`isOpen = signal(false)`, `openDrawer()`, `closeDrawer()`)
- [x] Thiet ke the hien thi danh cho Bo PC Hoan Chinh (Composite PC Build): bao gom tag "Bo PC Hoan Chinh", badge "Custom Build", danh sach so luong linh kien trong bo, badge san hang tai showroom va lien ket "Sua cau hinh" tro ve builder
- [x] Thiet ke the hien thi danh cho Linh kien ban le voi stepper tang/giam so luong, nut xoa mat hang va gia tien viet nam dong
- [x] Tich hop thanh tien trinh mien phi van chuyen (Free Shipping Progress Bar) dua tren nguong gia tri don hang (vi du: tren 2.000.000 d hoac 10.000.000 d bao hiem roi vo)
- [x] Hien thi phan tong ket gia tri: Tam tinh linh kien, Giam gia combo (neu co), Phi van chuyen uoc tinh va Tong thanh toan
- [x] Dong bo giao dien giua Slide-Over Cart Drawer va trang toan man hinh `CartPageComponent` tai route `/gio-hang`

## Acceptance Criteria

- Criterion 1: Khi bam nut Gio hang tren Header hoac khi goi phuong thuc `cartService.openDrawer()`, drawer truot muot ma tu phia ben phai vao ma khong gay re-render ca trang.
- Criterion 2: Nhap nut close, nhan ESC hoac click vao backdrop ngoai vung drawer phai dong drawer ngay lap tuc.
- Criterion 3: Cac thao tac tang/giam so luong hoac xoa mat hang phai cap nhat dong thoi tong tien va so luong tren ca Header badge va Drawer content thoi gian thuc.
- Criterion 4: Trang thai gio hang trong (empty state) phai hien thi loi keu goi tiep tuc mua sam kem nut dan toi `/san-pham` va `/pc-dung-san`.

## Verification Commands

- Command 1: npm run check:fe
