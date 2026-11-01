# Kiem Tra Hien Trang Dinh Danh Nguoi Dung Va Luong Tra Cuu Don Hang

Tai lieu nay danh gia chi tiet he thong backend va frontend hien tai ve: thoi diem tao User, xu ly trung lap thong tin tai khoan, va co che tra cuu / gan don hang cho khach vang lai.

---

## 1. Khi Nao Thi Tao User Moi? Chi Khi Dang Ky Hay Ca Khi Tao Don Hang?

### Cau truc mo hinh du lieu (Prisma Schema)
He thong tach biet hai thuc the hoan toan khac nhau tai [schema.prisma](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/prisma/schema.prisma):
- **Model `User` (bang `user`)**: Dai dien cho thuc the xac thuc / dang nhap (Authentication). Luu tru `email`, `role`, lien ket voi `Session` va `Account` (chua password hash hoac provider OAuth).
- **Model `Customer` (bang `customer`)**: Dai dien cho thuc the nghiep vu mua hang (Business Profile). Luu tru `name`, `email`, `phone`, `emailVerifiedAt`, `phoneVerifiedAt`, va khoa ngoai nullable `userId` tro sang bang `user`. Don hang (`Order`) luon lien ket truc tiep voi `Customer` thong qua truong `customerId`.

### Ket qua kiem tra code
**User chi duoc tao moi khi dang ky tai khoan hoac dang nhap OAuth lan dau, HOAN TOAN KHONG duoc tao khi dat don hang:**

1. **Khi dang ky tai khoan thong thuong**:
   - Ham [`authService.register`](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/auth.service.ts#L102-L133) thuc hien tao moi mot ban ghi `User`, tao ban ghi `Account` de luu mat khau, va tao mot ban ghi `Customer` lien ket voi `user.id`.

2. **Khi dang nhap bang Google lan dau**:
   - Ham [`authService.loginWithGoogle`](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/auth.service.ts#L298-L365) kiem tra neu email Google chua ton tai trong bang `user`, se tao moi `User`, lien ket `Account` Google, va tao mot ban ghi `Customer` lien ket voi `user.id`.

3. **Khi tao don hang (Checkout submit)**:
   - Ham [`orderService.submit`](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/order.service.ts#L99-L113) tai backend chi lam viec voi bang `Customer`.
   - Neu nguoi mua chua tung co thong tin trong he thong, backend se tao mot ban ghi `Customer` moi voi `userId = null` (khach vang lai).
   - Neu da co ban ghi `Customer` khop ca email va so dien thoai, backend tai su dung `customerId` do.
   - **Tuyet doi khong co dong lenh nao tao `User` trong toan bo qua trinh dat hang.**

---

## 2. Neu Da Co Tai Khoan Voi SDT + Email Thi Khi Tao Tai Khoan Moi Co Dung Lai User Do Khong Hay Tao Mot User Moi?

Qua trinh xu ly duoc phan tach theo cac truong hop thuc te dua tren ma nguon cua [`authService.register`](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/auth.service.ts#L85-L135):

### Truong hop A: Email da ton tai trong bang `User`
- Code kiem tra tai dong 85-94 cua file `auth.service.ts`:
  ```typescript
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new DomainError('EMAIL_ALREADY_EXISTS', {
      messageKey: 'error.emailAlreadyExists',
      status: 409,
    });
  }
  ```
- **Ket luan**: He thong **KHONG** dung lai `User` do va cung **KHONG** cho tao `User` moi. Tien trinh dang ky bi chan ngay lap tuc voi loi `EMAIL_ALREADY_EXISTS` (HTTP 409 Conflict). Nguoi dung phai chuyen sang luong Dang nhap hoac Quen mat khau.

### Truong hop B: Email chua co trong bang `User`, nhung SDT hoac Email da co trong bang `Customer` (do tung mua hang vang lai truoc do)
- Khi nguoi dung gui yeu cau dang ky voi email nay, he thong kiem tra bang `User` thay trong.
- Do do, he thong **TAO MOT BAN GHI `User` MOI TINH**, dong thoi **TAO THEM MOT BAN GHI `Customer` MOI** voi `userId = user.id`.
- He thong **KHONG** dung lai ban ghi `Customer` cu cua khach vang lai, cung khong lien ket `User` moi vao ban ghi `Customer` cu.
- **Hau qua nghiem trong trong code hien tai (Xung dot dinh danh)**:
  - Bang `Customer` khong dat unique constraint tren `email` hay `phone`. Vi vay sau khi dang ky, trong database se ton tai song song 2 ban ghi `Customer` co cung email va so dien thoai:
    - Ban ghi 1: Khach vang lai cu (`userId = null`), nam giu cac don hang cu.
    - Ban ghi 2: Khach hang thanh vien moi (`userId = <uuid>`), chua co don hang nao.
  - Khi nguoi dung nay tiep tuc dat don hang moi bang email va SDT do, ham [`orderService.submit`](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/order.service.ts#L107-L112) se tim kiem va nhan ve ca 2 ban ghi:
    ```typescript
    const exactMatches = existingCustomers.filter(
      (entry) => entry.email.toLowerCase() === normalizedEmail && entry.phone === normalizedPhone
    );
    if (exactMatches.length === 1 && exactMatches[0]) {
      customerId = exactMatches[0].id;
    } else {
      throw new DomainError('CUSTOMER_IDENTITY_AMBIGUOUS', {
        ruleId: 'CUS-004',
        messageKey: 'error.customerIdentityAmbiguous',
        status: 409,
      });
    }
    ```
    Vi `exactMatches.length` luc nay bang 2, he thong se nem loi `CUSTOMER_IDENTITY_AMBIGUOUS` (HTTP 409) va **chan khong cho khach dat hang tiep**.

### Truong hop C: Dang nhap bang Google OAuth
- Neu email Google da co trong bang `User`, he thong **DUNG LAI** chinh `User` do va tao session dang nhap moi ([`authService.loginWithGoogle`](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/auth.service.ts#L293-L352)).
- Neu `User` do chua co `Customer`, he thong moi tao them mot `Customer`.

---

## 3. O Luong Tra Cuu Don Hang

### Y 1: Khach vang lai tra la chi tra theo don cua khach vang lai khac thoi dung khong, hay tra duoc ca don cua khach da co tai khoan?

Trong he thong hien tai co hai co che tra cuu cong khai:

1. **Tra cuu danh sach don bang So dien thoai hoac Email (Thong qua ma OTP)**:
   - File xu ly: [`order-lookup.service.ts`](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/order-lookup.service.ts#L156-L165) va [#L203-L217](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/order-lookup.service.ts#L203-L217).
   - Cau query co bo loc chat che:
     ```typescript
     const guestOrders = await prisma.order.findMany({
       where: {
         isActive: true,
         customer: { userId: null }, // CHI LAY DON CUA KHACH VANG LAI
         ...(isEmail
           ? { receiverEmail: verification.identifier.toLowerCase() }
           : { receiverPhone: verification.identifier }),
       },
       // ...
     });
     ```
   - **Ket luan**: Hoan toan dung nhu nhan dinh cua ban. Luong tra cuu qua OTP SDT/Email **CHI TRA VE CAC DON HANG CUA KHACH VANG LAI** (`customer.userId === null`).
   - Cac don hang thuoc ve tai khoan thanh vien (`customer.userId !== null`) bi he thong loai bo khoi ket qua tra cuu cong khai nay (dua theo quy tac nghiep vu `CUS-012` de tranh viec nguoi khac chi can nhan OTP la xem duoc toan bo lich su mua sam cua tai khoan thanh vien).
   - Neu tat ca cac don cua SDT/Email do deu thuoc ve mot tai khoan thanh vien, he thong se bao loi `ORDER_NOT_FOUND` (404) va giao dien nguoi dung se goi y dang nhap vao cong thong tin tai khoan (`/tai-khoan?tab=orders`).

2. **Tra cuu truc tiep bang Ma don hang (`orderCode`)**:
   - File xu ly: [`order-lookup.service.ts`](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/order-lookup.service.ts#L140-L151).
   - Cau query:
     ```typescript
     const order = await prisma.order.findFirst({
       where: { code, isActive: true },
       // ...
     });
     ```
   - **Ket luan**: Khi biet chinh xac ma don hang (vi du `ELT-ABCD1234EF`), he thong khong loc `userId: null`. Bat ky ai co ma don hang hop le deu xem duoc tien do xu ly cua don hang do (ke ca don do cua khach vang lai hay khach da dang ky tai khoan).

---

### Y 2: Khi tao moi mot khach ma trung SDT + email voi don dat hang thi co tu gan cac don cho khach do khong?

- Trong code hien tai: **HOAN TOAN KHONG TU GAN**.
- **Nguyen nhan trong ma nguon**:
  - Khi dang ky tai khoan moi qua [`authService.register`](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/auth.service.ts#L102-L133), he thong chi don thuan thuc hien `tx.user.create(...)` va `tx.customer.create(...)`.
  - Khong he co bat ky dong code nao chay lenh update (`prisma.order.updateMany`) de chuyen `customerId` cua cac don hang vang lai truoc do sang `Customer` moi.
  - Cac don hang cu van mai mai gan voi ban ghi `Customer` vang lai cu (`userId = null`).
- **Nguon goc quy tac nay trong tai lieu thiet ke cu**:
  - Tai [customer-identity.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/.agents/skills/business-logic/features/customer-identity.md#L12), quy tac `CUS-015` quy dinh cu:
    > "After a User finishes account verification, create a new Customer profile linked to that User. Never automatically link, merge, or transfer a pre-existing guest Customer, even when verified contacts are identical."
    va `CUS-009`:
    > "Only Admin can merge Customer profiles."
  - Muc dich ban dau cua quy tac nay la phong ngua rui ro bao mat (tranh truong hop ai do biet email cua nguoi khac roi dang ky tai khoan nham chiem quyen xem lich su mua hang cua ho).

---

## 4. Tong Ket Cac Diem Nghen Nghiep Vu Hien Tai

Nhung bat cap can duoc giai quyet khi ban de xuat luong moi:

1. **Phan manh ho so khach hang**: Khach hang mua hang vang lai truoc do (tao Customer A), sau do dang ky tai khoan (tao Customer B). Hai ho so cung so dien thoai va email nhung khong duoc hop nhat.
2. **Chan luong Checkout tiep theo (`CUSTOMER_IDENTITY_AMBIGUOUS`)**: Sau khi tao tai khoan, neu khach dat don hang tiep theo voi cung email va SDT do, ham checkout submit tim ra 2 Customer giong nhau va nem loi 409, khien khach hang khong the mua hang tiep.
3. **Trai nghiem nguoi dung bi dut doan**: Khach hang vang lai sau khi mua hang muon tao tai khoan de theo doi don, nhung khi dang nhap vao thi trang "Don hang cua toi" lai hoan toan trong khong, gay hoang mang cho nguoi mua.
4. **Phan biet giua User va Customer**: Hien tai luong checkout submit hoan toan khong nhan thong tin `userId` hay xac thuc tu request header ma chi tu dong nhan dien dua vao email va SDT nguoi nhan.



---

## 5. Quy Tac Xu Ly Va Luong Moi Da Trien Khai

Dua tren chi dao nghiep vu moi, he thong da duoc cap nhat toan dien voi cac quy tac sau:

### 5.1. Luong Tao Don Hang (Checkout Submit)
- **Cho phep trung Email va So dien thoai giua cac Customer**: Bang `Customer` trong he thong von chi danh index tren `email` va `phone` (khong unique), hoan toan dap ung nhieu khach hang co cung thong tin lien he.
- **Nguoi dung da dang nhap (`input.userId` ton tai)**:
  - He thong tu dong lien ket don hang truc tiep voi `customerId` thuoc tai khoan `User` hien tai.
  - Neu tai khoan chua co ho so `Customer`, he thong se tao moi ho so `Customer` gan voi `userId` do.
  - Van luu tru day du thong tin nguoi nhan (`receiverName`, `receiverEmail`, `receiverPhone`, dia chi) theo form dat hang.
  - **Khong kiem tra trung lap** thong tin voi bat ky `Customer` nao khac. Khong con gay loi `CUSTOMER_IDENTITY_AMBIGUOUS`.
- **Khach vang lai (`input.userId` khong ton tai)**:
  - He thong tao mot ban ghi `Customer` moi voi `userId = null` cho don hang do.
  - **Khong kiem tra trung lap**, luon tao don binh thuong va thanh cong.
- **Tu dong truyen phien dang nhap tu Frontend**:
  - Da bo sung [`authInterceptor`](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/core/api/auth.interceptor.ts) tai Frontend de tu dong truyen header `Authorization: Bearer <token>` neu nguoi dung da dang nhap.
  - Backend API [`/checkout/submit`](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/routes/order.routes.ts) tu dong doc token de xac dinh danh tinh nguoi dung.

### 5.2. Luong Tra Cuu Don Hang Bang Ma Truc Tiep (`orderCode`)
- Ap dung nguyen tac phan quyen nghiem ngat: **Chi tra duoc don cua khach vang lai hoac don cua chinh minh**.
- Khi nguoi dung tra cuu bang ma don hang truc tiep tai [`orderLookupService.lookupByOrderCode`](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/order-lookup.service.ts) hoac [`orderLookupService.getOrderDetailForCustomer`](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/order-lookup.service.ts):
  - **Neu don hang thuoc ve tai khoan thanh vien (`order.customer.userId !== null`)**:
    - Chi cho phep xem neu nguoi yeu cau da dang nhap va la chinh chu so huu don (`requesterUserId === order.customer.userId`).
    - Neu chua dang nhap hoac dang nhap tai khoan khac: He thong chan quyen truy cap voi ma loi `ORDER_ACCESS_DENIED` (`error.orderBelongsToAccount`, HTTP 403) kem thong diep: *"Don hang nay thuoc ve tai khoan thanh vien. Vui long dang nhap dung tai khoan de tra cuu."*
  - **Neu don hang thuoc ve khach vang lai (`order.customer.userId === null`)**:
    - Cho phep bat ky ai co ma don hang hop le deu co the tra cuu binh thuong.
