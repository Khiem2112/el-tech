# Task: TASK-117 - Luu Tru Database Cho Tinh Nang Dang Nhap/Dang Ky Khach Hang Va Bat Buoc SDT + Email

- Feature: Customer Authentication & Registration
- Governing Spec: docs/customer-identity-and-order-access/flows/v1.md & .agents/skills/business-logic/features/customer-identity.md
- Scope: fullstack
- Status: Complete

## Objective

Chuyen doi tinh nang dang nhap va dang ky tai khoan khach hang tu co che mock data / ghi de localStorage sang luu tru thuc te trong co so du lieu PostgreSQL (Prisma). Dong thoi, nang cap giao dien hop thoai dang ky: bat buoc nhap day du ca Email va So dien thoai, danh dau sao do tai tat ca cac truong bat buoc (Ho ten, Email, So dien thoai, Mat khau), ho tro thong bao loi ro rang khi sai thong tin hoac email da ton tai.

## Technical Context And Dependencies

- Pre-requisites: Prisma schema da co san cac model `User`, `Account`, `Session`, `Customer`.
- Reusable Assets:
  - `be/src/lib/prisma.ts`
  - `be/src/contracts/api.ts`
  - `be/src/contracts/domain-error.ts`
  - `fe/src/app/core/api/api-client.service.ts`
  - `fe/src/app/components/atoms`
- Target Files:
  - `be/src/services/auth.service.ts`
  - `be/src/routes/auth.routes.ts`
  - `be/src/index.ts`
  - `fe/src/app/core/auth/auth.service.ts`
  - `fe/src/app/features/auth/auth-modal.component.ts`
  - `fe/src/app/features/profile/profile-page.component.ts`

## Checklist

- [x] Xay dung `auth.service.ts` tren backend xu ly logic dang ky, dang nhap, lay thong tin phien (me), dang xuat va cap nhat ho so:
  - Dang ky: Validate email va so dien thoai, kiem tra trung lap email, bam mat khau bang Node crypto scrypt, tao ban ghi `User`, `Account` (credential), `Customer` va `Session` trong mot Prisma transaction.
  - Dang nhap: Cho phep dang nhap bang Email hoac So dien thoai, xac thuc mat khau qua `Account`, tao ban ghi `Session` luu token trong DB.
  - Google Auth: Khoi tao hoac dong bo `User`, `Customer` va `Account` voi provider `google`, tao `Session` luu trong DB.
  - Me & Logout: Xac thuc phien qua `Bearer` token trong bang `Session`, thu hoi phien khi dang xuat.
  - Cap nhat ho so: Cap nhat thong tin `Customer` (ho ten, so dien thoai, dia chi) tuong ung voi user trong DB.
- [x] Xay dung `auth.routes.ts` va dang ky router `/v1/auth` vao `be/src/index.ts`.
- [x] Cap nhat `fe/src/app/core/auth/auth.service.ts` de goi API backend thuc te thay vi dung du lieu gia lap `DEFAULT_USER`:
  - Luu giu token va user profile sau khi dang nhap/dang ky thanh cong.
  - Khoi tao kiem tra phien tu token luu trong localStorage qua `/v1/auth/me`.
  - Ham cap nhat ho so goi API `/v1/auth/profile` va dong bo state.
- [x] Nang cap `fe/src/app/features/auth/auth-modal.component.ts`:
  - Che do dang ky: Tach rieng truong Email va truong So dien thoai (bat buoc nhap ca hai).
  - Danh dau dau sao do tai tat ca cac truong bat buoc o ca tab Dang nhap va Dang ky.
  - Kiem tra hop le du lieu: validate email va dinh dang so dien thoai truoc khi submit.
  - Hien thi thong bao loi chi tiet khi backend tra ve loi.
- [x] Cap nhat `profile-page.component.ts` dong bo luu ho so thuc te qua `auth.updateProfile`.
- [x] Chay toan bo cac lenh kiem tra pre-commit gate (`npm run check:be` va `npm run check:fe`) dam bao exit code 0.

## Acceptance Criteria

- Criterion 1: Khi dang ky tai khoan moi, nguoi dung phai nhap day du Ho ten, Email, So dien thoai va Mat khau. Tat ca cac truong bat buoc deu co danh dau sao do.
- Criterion 2: Dang ky thanh cong se tao moi cac ban ghi `User`, `Account`, `Customer` va `Session` trong database PostgreSQL.
- Criterion 3: Dang nhap bang email hoac so dien thoai da dang ky se xac thuc mat khau thuc te tu DB, tao session moi va luu token.
- Criterion 4: Neu email da ton tai khi dang ky hoac thong tin xac thuc khong dung khi dang nhap, he thong phai hien thi thong bao loi ro rang tren giao dien modal.
- Criterion 5: Dang nhap 1-click Google se tao/dong bo nguoi dung trong DB va luu token phien hop le.
- Criterion 6: Ca hai lenh `npm run check:fe` va `npm run check:be` deu vuot qua voi exit code 0.

## Verification Commands

- Command 1: npm run check:be
- Command 2: npm run check:fe
