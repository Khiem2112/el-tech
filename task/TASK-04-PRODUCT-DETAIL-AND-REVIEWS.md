# Task: TASK-04 - Product Detail Page (PDP), Specs Matrix va Verified Review Modal

- Feature: Product Detail & Hardware Evaluation
- Governing Spec: [docs/storefront-and-pc-selection/flows/v1.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/docs/storefront-and-pc-selection/flows/v1.md)
- Scope: frontend
- Status: Complete

## Objective

Nang cap trang chi tiet linh kien [fe/src/app/features/catalog/product-detail-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/catalog/product-detail-page.component.ts) theo chuan thiet ke [ui-templates/store-front/product-detail.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/product-detail.html) va xay dung modal danh gia danh cho khach hang da mua [ui-templates/store-front/user-review-form.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/user-review-form.html). Cung cap gallery hinh anh ky thuat, bang thong so chi tiet (Technical Specs Matrix), hop kiem tra ton kho tai tung showroom, khoi cam ket dich vu va quy trinh gui danh gia san pham voi xac thuc Verified Purchase.

## Technical Context And Dependencies

- Pre-requisites: TASK-03 (Catalog routing and service)
- Reusable Assets:
  - [fe/src/app/features/catalog/catalog.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/catalog/catalog.service.ts)
  - [fe/src/app/services/cart.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/services/cart.service.ts)
  - [fe/src/app/components/atoms](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms)
  - [fe/src/app/lib/vnd.pipe.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/lib/vnd.pipe.ts)
- Target Files:
  - `fe/src/app/features/catalog/product-detail-page.component.ts`
  - `fe/src/app/features/catalog/review-modal.component.ts`

## Checklist

- [x] Hoan thien khu vuc gallery hinh anh linh kien: anh chinh do phan giai cao kem danh sach thumbnail lua chon, badge "CHINH HANG 100%" va thoi han bao hanh
- [x] Xay dung hop Buy Box ben phai: Ten san pham, ma SKU / Model, gia niem yet, gia giam, bo dem so luong, nut "Them vao gio hang" va nut "Mua ngay"
- [x] Thiet ke hop thong tin ton kho chi nhanh (Branch Stock Matrix): Hien thi trang thai san hang thoi gian thuc tai HN 45 Thai Ha, HCM 280 3/2 va DN 112 Ham Nghi kem dia chi cu the
- [x] Xay dung bang thong so ky thuat chuyen sau (Technical Specifications Matrix): Chia nhom theo Socket, Kien truc nhan/luong, Xung nhip, Bo nho dem, TDP tieu thu, Yeu cau nguon toi thieu va Kich thuoc vat ly
- [x] Bo sung khoi cam ket dich vu: Chinh sach doi moi 30 ngay, ho tro test stress furmark truoc khi giao, bao hiem roi vo khi van chuyen
- [x] Xay dung `ReviewModalComponent` doc lap theo template `user-review-form.html`:
  - Thong tin don hang va badge xac thuc Verified Purchase
  - Canh bao quy dinh danh gia duy nhat 1 lan tren moi Serial Number (REV-004)
  - He thong cham diem 5 ngoi sao tuong tac voi nhan mo ta dong (Kem, Binh thuong, Hai long, Rat hai long, Xuat sac)
  - Truong nhap diem Manh (Uu diem) va diem Yeu (Nhuoc diem)
  - Khung tai len hinh anh thuc te tem serial hoac hinh anh he thong
  - Nut gui danh gia voi xu ly loading va thong bao thanh cong

## Acceptance Criteria

- Criterion 1: Khi nhan nut "Them vao gio hang", san pham phai duoc them vao gio voi so luong da chon va tu dong mo Slide-Over Cart Drawer de khach hang xem lai.
- Criterion 2: Bang thong so ky thuat phai anh xa dung dinh dang va label tieng Viet tu truong JSON linh kien.
- Criterion 3: Modal danh gia chi cho phep submit khi nguoi dung da chon so sao va dien day du noi dung nhan xet bat buoc.
- Criterion 4: Giao dien responsive tren man hinh di dong: chuyen doi layout 2 cot sang 1 cot doc, gallery ho tro vuot cham muot ma.

## Verification Commands

- Command 1: npm run check:fe
