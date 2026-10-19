# Task: TASK-05 - PC Builder Diagnostics, Wattage Bar va Component Swap Modal

- Feature: PC Builder & Hardware Compatibility Engine
- Governing Spec: [docs/storefront-and-pc-selection/flows/v1.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/docs/storefront-and-pc-selection/flows/v1.md)
- Scope: frontend
- Status: Complete

## Objective

Nang cap toan dien trinh lap rap va cau hinh PC tai [fe/src/app/features/pc-build/custom-build-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/pc-build/custom-build-page.component.ts) va [pc-build-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/pc-build/pc-build-page.component.ts) theo chuan thiet ke tu [ui-templates/store-front/pc-build.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/pc-build.html) va [change-component.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/change-component.html). Tich hop bang kiem tra tuong thich phan cung thoi gian thuc, thanh uoc tinh cong suat tieu thu (Wattage Bar PCB-006), danh sach linh kien BOM day du, goi dich vu ky thuat mien phi kem theo va modal thay doi/chon linh kien tuong thich co so sanh gia chenh lech (+/-).

## Technical Context And Dependencies

- Pre-requisites: TASK-02 (CartService support for Composite PC Build items)
- Reusable Assets:
  - [fe/src/app/features/catalog/catalog.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/catalog/catalog.service.ts)
  - [fe/src/app/services/cart.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/services/cart.service.ts)
  - [fe/src/app/components/atoms](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms)
  - [fe/src/app/lib/vnd.pipe.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/lib/vnd.pipe.ts)
- Target Files:
  - `fe/src/app/features/pc-build/custom-build-page.component.ts`
  - `fe/src/app/features/pc-build/component-swap-modal.component.ts`
  - `fe/src/app/features/pc-build/pc-build-page.component.ts`

## Checklist

- [x] Xay dung bang chan doan tuong thich phan cung (Hardware Compatibility Panel): Kiem tra Socket CPU va Bo mach chu (LGA1700, AM5), kieu bo nho RAM (DDR4 / DDR5), chieu dai VGA so voi khoang Case, va kich thuoc Radiator tan nhiet nuoc
- [x] Tich hop thanh uoc tinh dien nang Wattage Bar (PCB-006): Tinh toan cong suat Idle, TDP khi Full Load, cong suat PSU toi thieu khuyen nghi va ty le an toan (Margin %) cua bo nguon da chon
- [x] Thiet ke danh sach cac slot linh kien BOM (8-10 muc): CPU, Mainboard, RAM, SSD, VGA, Nguon PSU, Tan nhiet Cooling, Vo Case, Man hinh va Phu kien. Moi slot the hien hinh anh, ten, thong so tom tat, don gia, nut "Doi" linh kien va nut "Xoa"
- [x] Tich hop danh muc dich vu ky thuat mien phi: Lap rap va di day tham my Pro (0 d), Cai dat he dieu hanh va Stress Test FurMark/Cinebench 24h (0 d)
- [x] Xay dung `ComponentSwapModalComponent` doc lap theo template `change-component.html`:
  - Dai chan doan tuong thich thoi gian thuc cua danh muc dang chon
  - The tham chieu linh kien hien tai dang co trong cau hinh
  - Bo loc nhanh theo dong chip (RTX 5080, RTX 4080 Super...) hoac theo thuong hieu
  - Danh sach linh kien thay the kha dung voi gia chenh lech tu dong tinh toan (vi du: "+2.400.000 d" hoac "-1.200.000 d")
  - Nut "Chon linh kien nay" thuc hien swap ngay lap tuc va dong modal
- [x] Thiet ke thanh tong ket Sticky Summary Bar ben phai: Hien thi tong tri gia dan may, thong tin VAT, nut in bao gia/BOM, nut chia se link cau hinh va nut "Them tron bo vao gio hang" tao thanh phan Composite PC Build trong `CartService`

## Acceptance Criteria

- Criterion 1: Khi nguoi dung thay doi linh kien (vi du tu RTX 4070 sang RTX 5080), he thong phai tu dong tinh lai ngay lap tuc cong suat Wattage tieu thu, canh bao neu bo nguon khong du cong suat va tinh lai tong gia tien.
- Criterion 2: Modal thay doi linh kien chi hien thi nhung linh kien thuc su tuong thich voi Socket va cac thanh phan da chon trong cau hinh hien tai.
- Criterion 3: Nhap nut "Them tron bo vao gio hang" phai dong goi toan bo BOM thanh mot don vi san pham dong nhat co ten cau hinh, kem danh sach chi tiet linh kien ben trong.
- Criterion 4: Giao dien phai ho tro responsive day du, cot Sticky Summary chuyen xuong phia duoi tren man hinh di dong.

## Verification Commands

- Command 1: npm run check:fe
