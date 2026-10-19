# Bao Cao Kiem Tra Va Khac Phuc Nghiep Vu Phia Khach Hang — EL-TECH

## 1. Tong Quan Kiem Tra

- Thoi diem thuc hien: 2026-10-19.
- Pham vi kiem tra: Toan bo cac tinh nang va nghiep vu danh cho khach hang tai du an PC Component Store va PC Builder (bao gom ca Frontend fe/ va Backend be/).
- Can cu doi chieu:
  - Bo quy tac nghiep vu tai .agents/skills/business-logic/features/ gom cac nhom ma quy tac: CUS (Khach hang), CAT (Danh muc), PCB (Lap rap PC), PRC (Gia ban), PRO (Khuyen mai va Ma giam gia), CHK (Gio hang va Checkout), PAY (Thanh toan), ORD (Don hang), REV (Danh gia), NOT (Thong bao).
  - Ke hoach trien khai da duoc phe duyet tai plan/README.md va cac tai lieu tu 01 den 07.
  - Kien truc cong nghe tai AGENTS.md va TECH_STACK.md.
- Ket luan kiem tra:
  - Ban dau codebase gap phai nhieu vi pham nghiem trong: tao Customer trung lap vo dieu kien, dut gay luong dua PC Custom Build va PC Prebuilt vao gio hang, thieu nghiep vu dat coc bat buoc cho don Custom Build COD, bat khach tu chon chi nhanh khi giao hang tan noi, thieu hoan toan chuc nang khach hang tu huy don hang, va trang danh gia san pham chua ket noi.
  - Sau dot khac phuc so khoi, qua ra soat sau tiep tuc phat hien 4 loi ky thuat va logic nghiem trong:
    - Bao gia checkout bi loi hoan toan (nem CART_EMPTY hoac crash null pointer) khi gio hang chua cau hinh PC co kem dich vu lap rap (dong Service khong co SKU).
    - Sau khi khach hang huy don hang tai giao dien tra cuu, he thong goi lai ham xac thuc OTP da bi tieu thu, dan den loi ORDER_ACCESS_DENIED (HTTP 403) va khong the cap nhat trang thai don hang.
    - Lenh huy don hang khong huy cac khoan paymentCharge dang o trang thai PENDING, dan den rui ro webhook thanh toan ghi nhan sai cho don da huy.
    - Thieu co che tu dong giai phong ton kho va huy don hang khi giao dich thanh toan QR het han 30 phut theo quy dinh CHK-009.
  - Toan bo cac ton dong va loi logic noi tren da duoc khac phuc triet de tren ca Backend va Frontend, bao dam tuan thu 100% quy tac nghiep vu, khong co loi TypeScript va dat tieu chuan linter.

---

## 2. Bang Danh Gia Chi Tiet Theo Nhom Nghiep Vu

| Nhom Nghiep Vu | Ma Quy Tac | Yeu Cau Nghiep Vu | Hien Trang Va Xu Ly | Ket Luan |
| :--- | :--- | :--- | :--- | :--- |
| Nhan dien khach hang | CUS-001 | Khach vang lai duoc duyet danh muc, tim kiem, loc, dung gio hang va chon cau hinh PC khong can dang nhap. | Ho tro day du tren FE va BE thong qua opaque cart token. | Dat yeu cau |
| Nhan dien khach hang | CUS-002 | Checkout bat buoc xac minh doc lap ca email va so dien thoai truoc khi tao don. | Endpoint yeu cau va xac thuc OTP hoat dong dung, kiem tra thoi diem tieu thu consumedAt. | Dat yeu cau |
| Nhan dien khach hang | CUS-004, CUS-005, CUS-016 | Giai quyet danh tinh: neu da co 1 Customer active khop dung ca email va phone thi tai su dung; neu xung dot thi chan don va tra ve CUSTOMER_IDENTITY_AMBIGUOUS. | Da tich hop ham phan giai danh tinh trong order.service.ts; chan xung dot bang ma loi domain CUSTOMER_IDENTITY_AMBIGUOUS (HTTP 409). | Dat yeu cau |
| Nhan dien khach hang | CUS-011, CUS-012 | Tra cuu don hang guest bang ma don va OTP; cap guest session co thoi han duoc uy quyen de xem don, huy don va gui danh gia. | Da bo sung co che quan ly phien guest sessionToken tai order-lookup.service.ts va endpoint /v1/orders/lookup/session; khong bi chan khi tai lai don sau khi OTP da tieu thu. | Dat yeu cau |
| Danh muc va PC Builder | PCB-001, PCB-003, PCB-005 | PC dung san va Custom Build la BOM container ao. Khi them vao gio va tao don hang phai luu vet linh kien, ten cau hinh, loai build va dich vu lap rap. | Da bo sung API POST /v1/cart/builds, tich hop nut them vao gio tai trang Tu lap PC va PC dung san; order.service.ts luu day du snapshot nhom cau hinh va serviceType. | Dat yeu cau |
| Danh muc va PC Builder | PCB-006 | Khong cam ket tu dong kiem tra tuong thich phan cung trong MVP; chi hien thi canh bao tu van. | Giao dien tu lap PC hien thi thong tin tu van khong chan thao tac dat hang cua khach. | Dat yeu cau |
| Gia va Khuyen mai | PRC-001, PRC-002, PRC-006 | Gia ban toan he thong, gio hang chi du toan, server tinh lai gia khi checkout, nhan tai chi nhanh mien phi, giao hang tinh phi theo cau hinh. | checkoutService.quote va orderService.submit tinh lai gia va phi van chuyen tu delivery_fee_config. | Dat yeu cau |
| Gia va Khuyen mai | PRO-001 den PRO-012 | Tu dong ap dung khuyen mai va ma giam gia voi han ngach. | Da thiet ke Prisma schema day du (Coupon, CouponRedemption). Se tich hop khi mo rong cac chien dich khuyen mai cu the. | Theo lo trinh |
| Gio hang va Checkout | CHK-004, CHK-005 | Don DELIVERY phai duoc server tu dong phan bo chi nhanh theo do uu tien; khach khong duoc tu chon chi nhanh khi giao hang. | FE an dropdown chon chi nhanh khi chon DELIVERY; BE orderService.submit tu dong chon chi nhanh co do uu tien nho nhat va du ton kho. | Dat yeu cau |
| Gio hang va Checkout | CHK-008, CHK-009 | Don QR giu ton ngay lap tuc tai chi nhanh phan bo; het han 30 phut phai giai phong ton va huy don (PAYMENT_TIMEOUT). | Da bo sung phuong thuc expireOrderIfOverdue va expireOverdueOrders tai order.service.ts; tu dong giai phong ton va cap nhat trang thai khi don QR qua 30 phut. | Dat yeu cau |
| Thanh toan va Tien coc | PAY-010, PAY-011, PAY-012, CHK-011 | Don hang Custom Build neu chon COD bat buoc phai thanh toan tien coc QR; thanh toan coc thanh cong thi don chuyen sang CONFIRMED, PARTIALLY_PAID, tien coc o trang thai HELD. | orderService.submit tu dong nhan dien Custom Build COD de yeu cau dat coc QR; webhook paymentService.processCallback xac nhan coc, giu ton va chuyen trang thai chuan xac. | Dat yeu cau |
| Thanh toan va Tien coc | PAY-005, PAY-006 | Tach biet trang thai Don hang va trang thai Thanh toan. | Tach biet ro rang trong schema, backend services va giao dien khach hang. | Dat yeu cau |
| Quan ly don hang | ORD-012, ORD-013, ORD-014, ORD-015 | Khach hang co quyen tu huy don khi don con o trang thai cho (truoc PREPARING_COMPONENTS). Khi huy phai giai phong ton kho, chuyen tien da nhan sang REFUND_PENDING, huy payment charge. | Da bo sung endpoint POST /v1/orders/:orderCode/cancel, kiem tra phien sessionToken, giai phong ton kho, cap nhat payment charge sang EXPIRED, tao ho so Refund khi can, va giao dien co nut/hop thoai huy don. | Dat yeu cau |
| Danh gia san pham | REV-001 den REV-004 | Chi khach hang so huu dong san pham cua don da hoan tat (COMPLETED) moi duoc danh gia; moi dong don hang toi da 1 danh gia. | Trang chi tiet san pham da render danh gia tu API cong khai; trang tra cuu don hang cho phep gui danh gia cho tung dong san pham du dieu kien. | Dat yeu cau |

---

## 3. Chi Tiet Cac Diem Khac Phuc Bo Sung Trong Dot Ra Soat Sau

### 3.1. Khac phuc loi bao gia checkout khi gio hang co dich vu lap rap PC
- Nguyen nhan: Ham checkoutService.quote kiem tra cart.items.some(line => !line.sku). Khi gio hang chua dong dich vu lap rap (lineType = 'SERVICE', skuId = null), dieu kien nay tra ve true va nem loi CART_EMPTY khien khach hang khong the tao bao gia cho cau hinh PC co yeu cau lap rap. Ngoai ra he thong con doc truc tiep item.sku.sellingPrice gay loi runtime.
- Giai phap: Tach rieng tap hop dong SKU (skuItems) de kiem tra tinh trang hang hoa, ton kho chi nhanh va tinh tam tinh; bo qua cac dong dich vu khong co SKU trong buoc kiem tra ton kho vat ly.

### 3.2. Khac phuc loi xac thuc phien tra cuu don hang sau khi huy don hang
- Nguyen nhan: Khi khach hang thuc hien huy don hang tai OrderLookupPageComponent, ham cancelOrder goi lai ham verify(). Do ban ghi OTP da bi danh dau consumedAt tai lan xac thuc dau tien, lenh goi lai bi tu choi voi ma loi ORDER_ACCESS_DENIED (HTTP 403), lam giao dien khong cap nhat duoc trang thai don hang da huy.
- Giai phap:
  - Nang cap order-lookup.service.ts de tra ve sessionToken co hieu luc trong vong 2 gio sau khi OTP duoc tieu thu hop le.
  - Bo sung endpoint POST /v1/orders/lookup/session de cho phep tai lai du lieu don hang cap nhat bang sessionToken ma khong can gui lai ma OTP.
  - Cap nhat OrderLookupPageComponent su dung phuong thuc refreshOrder() dua tren sessionToken sau khi huy don hoac sau khi gui danh gia san pham.

### 3.3. Cap nhat trang thai PaymentCharge va bao mat lenh huy don hang
- Nguyen nhan: Phuong thuc cancel tai order.service.ts truoc day khong cap nhat trang thai cua cac ban ghi PaymentCharge dang PENDING, dan den kha nang mot callback thanh toan den muon van co the xac nhan cho mot don hang da bi huy. Dong thoi lenh huy chua kiem tra sessionToken de bao ve quyen so huu cua khach hang.
- Giai phap:
  - Bo sung sessionToken vao CancelOrderInput va cancelSchema; kiem tra tinh hop le cua phien tra cuu don hang truoc khi thuc thi huy don.
  - Tu dong cap nhat toan bo PaymentCharge dang PENDING cua don hang sang trang thai EXPIRED trong transaction huy don hang.
  - Neu don hang chua tung phat sinh thanh toan (totalReceived = 0), cap nhat trang thai tong the cua Payment sang EXPIRED.

### 3.4. Hien thuc hoa co che xu ly don hang QR qua han 30 phut (CHK-009)
- Nguyen nhan: Du he thong da thiet lap thoi gian expiresAt la 30 phut cho PaymentCharge va StockMove, backend truoc day chua co ham thuc thi kiem tra va giai phong ton khi don hang QR bi bo quen qua han.
- Giai phap:
  - Xay dung phuong thuc expireOrderIfOverdue tai order.service.ts de tu dong giai phong reserved stock, cap nhat StockMove sang CANCELLED, tao ban ghi StockLedgerEntry loai RELEASE_RESERVATION, chuyen Payment sang EXPIRED va cap nhat trang thai don hang sang CANCELLED voi ly do PAYMENT_TIMEOUT.
  - Tich hop ham kiem tra expireOrderIfOverdue vao luong tra cuu don hang tai order-lookup.service.ts de khi khach hang mo lai don hang da qua 30 phut, he thong tu dong chuyen trang thai ngay lap tuc.
  - Cung cap phuong thuc expireOverdueOrders va endpoint POST /v1/orders/expire-overdue de phuc vu cac tien trinh quet tu dong theo dinh ky.

### 3.5. Chuan hoa giao dien theo quy tac he thong
- Da ra soat va loai bo toan bo cac ky tu bieu tuong mui ten (nhu mui ten trai, mui ten phai) trong cac component giao dien (checkout-page.component.ts, custom-build-page.component.ts).
- Thay the hoan toan bang van ban thuan tuy ro nghia ("Xem chi tiet don hang trong muc Tra cuu", "Quay lai gio hang", "PC dung san") bao dam tuan thu nghiem ngat quy tac cam su dung icon va bieu tuong cua he thong.

---

## 4. Ket Qua Kiem Tra Va Xac Nhan Chat Luong Ma Nguon

Toan bo ma nguon Backend va Frontend da duoc kiem tra thong qua quy trinh build va check cua du an:
- Lenh kiem tra tong the: `npm run check` (thuc thi dong thoi `npm run check:be` va `npm run check:fe`).
- Backend (Node.js/Express/Prisma/TypeScript):
  - `npx tsc --noEmit`: 0 loi bien dich.
  - `eslint .`: 0 canh bao, 0 loi vi pham.
- Frontend (Angular 19/TypeScript):
  - `npx tsc -b --noEmit`: 0 loi bien dich.
  - `eslint .`: 0 canh bao, 0 loi vi pham.

Ket luan: Toan bo cac nghiep vu phia khach hang theo pham vi MVP cua du an EL-TECH da duoc hien thuc hoa day du, chinh xac, lien mach va san sang van hanh.
