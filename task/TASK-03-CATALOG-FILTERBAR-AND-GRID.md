# Task: TASK-03 - Catalog Faceted Filterbar va Hardware Listing Grid

- Feature: Hardware Product Catalog
- Governing Spec: [docs/storefront-and-pc-selection/flows/v1.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/docs/storefront-and-pc-selection/flows/v1.md)
- Scope: frontend
- Status: Complete

## Objective

Nang cap toan dien trang danh muc linh kien [fe/src/app/features/catalog/catalog-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/catalog/catalog-page.component.ts) theo chuan thiet ke tu [ui-templates/store-front/product-list.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/product-list.html), [components/filterbar.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/components/filterbar.html) va [components/catalog-filter.js](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/components/catalog-filter.js). Cung cap bo loc da chieu (facet filtering) theo danh muc, thuong hieu, socket, khoang gia, tinh trang san hang tai tung chi nhanh, thanh filterbar phia tren grid voi nut sap xep va chuyen doi che do xem Grid / List.

## Technical Context And Dependencies

- Pre-requisites: TASK-01 (Shell integration)
- Reusable Assets:
  - [fe/src/app/features/catalog/catalog.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/catalog/catalog.service.ts)
  - [fe/src/app/services/cart.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/services/cart.service.ts)
  - [fe/src/app/components/atoms](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms)
  - [fe/src/app/lib/vnd.pipe.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/lib/vnd.pipe.ts)
  - [fe/src/app/lib/product-image.pipe.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/lib/product-image.pipe.ts)
- Target Files:
  - `fe/src/app/features/catalog/catalog-page.component.ts`
  - `fe/src/app/features/catalog/catalog.service.ts`

## Checklist

- [x] Cai dat khung bo loc da chieu o cot ben trai (Sticky Faceted Sidebar): Loc theo Danh muc linh kien, Hang san xuat (ASUS ROG, MSI, GIGABYTE, Intel, AMD...), Khoang gia tuy bien (tu - den VND) va Diem ton kho (HN 45 Thai Ha, HCM 280 3/2, DN 112 Ham Nghi)
- [x] Thiet ke thanh dieu khien phia tren (Top Filterbar): Bao gom chip thong ke tong so linh kien, cac chip loc dang ap dung co nut xoa nhanh (X), dropdown lua chon kieu sap xep (Gia tang dan, Gia giam dan, Moi nhat, Ban chay) va bo chuyen doi view Grid / List
- [x] Cai thien the card linh kien: Hien thi hinh anh sac net, badge tinh trang ton kho ("SAN HANG" hoac "ORDER"), ten dong linh kien, thong so ky thuat tom tat (Socket, VRAM, TDP...), gia niem yet va gia khuyen mai, nut them nhanh vao gio hang tich hop Cart Drawer
- [x] Xay dung ngan keo bo loc responsive cho man hinh mobile va tablet (Filter Mobile Drawer) cho phep mo bang nut "Bo loc" va ap dung ket qua muot ma
- [x] Tich hop co che dong bo URL query params (category, brand, minPrice, maxPrice, sort, branch) de nguoi dung co the reload trang hoac chia se lien ket tim kiem ma khong mat trang thai loc
- [x] Xu ly trang thai khong co ket qua tim kiem (Empty state) voi thong bao ro rang va nut "Xoa bo loc de xem tat ca"

## Acceptance Criteria

- Criterion 1: Khi thay doi bat ky tieu chi loc nao (danh muc, hang, muc gia, chi nhanh), danh sach san pham phai loc ngay lap tuc ma khong gay nhap nhay toan bo giao dien.
- Criterion 2: Query parameters tren thanh URL phai phan anh chinh xac tat ca bo loc dang duoc ap dung.
- Criterion 3: Nhap nut them vao gio tren card san pham phai them dung SKU vao CartService va kich hoat hien thi thong bao hoac mo slide-over cart drawer.
- Criterion 4: Giao dien phai ho tro day du ca che do xem dang luoi (Grid 3-4 cot tren Desktop) va dang danh sach (List view 1 cot voi thong so chi tiet).

## Verification Commands

- Command 1: npm run check:fe
