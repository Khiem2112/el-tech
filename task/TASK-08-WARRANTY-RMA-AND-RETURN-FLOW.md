# Task: TASK-08 - Warranty Policy Hub va Interactive RMA Ticket Submission

- Feature: After-Sales Warranty & RMA Operations
- Governing Spec: [docs/order-tracking-and-aftercare/flows/v1.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/docs/order-tracking-and-aftercare/flows/v1.md)
- Scope: frontend
- Status: Complete

## Objective

Xay dung trang Chinh sach bao hanh & Tiep nhan doi tra RMA `RefundPageComponent` tai route `/chinh-sach` theo chuan thiet ke [ui-templates/store-front/refund.html](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/ui-templates/store-front/refund.html). Cung cap cac khoi thong tin chinh sach bao hanh 30 ngay doi moi, quy dinh coc dan may Custom Build, form tao ticket ho tro ky thuat truc tuyen kem tai len media chung tu, va ban do danh sach trung tam ky thuat showroom toan quoc.

## Technical Context And Dependencies

- Pre-requisites: TASK-01 (Header navigation link `/chinh-sach`)
- Reusable Assets:
  - [fe/src/app/core/api/api-client.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/core/api/api-client.service.ts)
  - [fe/src/app/components/atoms](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/components/atoms)
- Target Files:
  - `fe/src/app/features/refund/refund-page.component.ts`
  - `fe/src/app/features/storefront/storefront.routes.ts`

## Checklist

- [x] Xay dung cac the chinh sach minh bach (Policy Cards):
  - Chinh sach doi moi 1-doi-1 trong 30 ngay cho linh kien loi nha san xuat
  - Chinh sach huy don va hoan tien 100% trong 24h lam viec
  - Quy dinh dat coc va giai thich tinh chat bop seal linh kien doi voi dan PC Custom Build
- [x] Thiet ke form tao Ticket ho tro ky thuat truc tuyen (Interactive RMA Ticket Form):
  - Truong nhap Ma don hang va So dien thoai lien he
  - Truong nhap Ma Serial Number (S/N) linh kien can bao hanh
  - Truong nhap mo ta chi tiet hien tuong ky thuat gap phai
  - Khung tai len hinh anh/video tem bao hanh va hien trang loi
  - Nut "Tao Ticket Ho Tro Ky Thuat" co loading indicator
- [x] Tich hop thong bao tiep nhan thanh cong voi Ma ticket (vi du: `#TK-8492`), cam ket SLA phan hoi trong 120 phut lam viec
- [x] Thiet ke danh sach mang luoi Trung tam Bao hanh Showroom truc tiep (Flagship Ha Noi, TP.HCM va Da Nang):
  - Dia chi chi tiet, hinh anh khu vuc testbench ky thuat
  - So hotline ky thuat truc tiep tai tung chi nhanh
  - Gio mo cua: 08:30 - 21:30 tat ca cac ngay trong tuan
- [x] Tich hop widget lien he khan cap danh cho he thong Workstation & Server qua tong dai 1900.6868

## Acceptance Criteria

- Criterion 1: Form tao ticket phai yeu cau bat buoc cac thong tin: Ma don hang, Mo ta loi ky thuat va it nhat mot hinh anh tem hoac chung tu.
- Criterion 2: Khi tao ticket thanh cong, he thong hien thi thong bao ro rang voi ma ticket de khach hang luu lai doi chieu.
- Criterion 3: Cac thong tin hotline va dia chi chi nhanh phai co the nhap vao de goi hoac mo ban do truc tiep tren thiet bi di dong.
- Criterion 4: Giao dien phai toi uu responsive tot, noi dung chinh sach de doc, ro rang tren moi loai kich thuoc man hinh.

## Verification Commands

- Command 1: npm run check:fe
