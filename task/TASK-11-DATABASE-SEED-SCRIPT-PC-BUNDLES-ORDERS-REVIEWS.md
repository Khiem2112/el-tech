# Task: TASK-11 - Xay Dung Script Seed Du Lieu Mau He Thong

- Feature: Database Seeding & Mock Elimination
- Governing Spec: [plan/03-catalog-and-pc-shopping.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/plan/03-catalog-and-pc-shopping.md), [plan/05-orders-account-reviews.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/plan/05-orders-account-reviews.md), [.agents/skills/db-conventions/SKILL.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/.agents/skills/db-conventions/SKILL.md)
- Scope: database
- Status: Complete

## Objective

Xay dung bo script seed du lieu mau toan dien va lap lai duoc (idempotent seed script) cho co so du lieu PostgreSQL (Supabase) thong qua Prisma ORM tai [be/prisma](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/prisma). Script se khoi tao du lieu day du cho cac thuc the ma hien tai he thong con thieu (0 ban ghi), bao gom: Khach hang mau (User / Customer), Bo PC dong san (PcBundle & PcBundleItem), Don hang da dang 5 giai doan pipeline Kanban kem theo timeline, payment, linh kien chi tiet, va cac danh gia san pham duoc kiem dinh (Verified Review). Loai bo hoan toan su phu thuoc vao du lieu gia lap tren ma nguon.

## Technical Context And Dependencies

- Pre-requisites: [be/prisma/schema.prisma](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/prisma/schema.prisma), 158 ProductTemplates & Variants da duoc seed san boi [be/scripts/seed_mock_data.py](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/scripts/seed_mock_data.py)
- Reusable Assets:
  - [be/src/lib/prisma.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/lib/prisma.ts)
  - [be/scripts/count_products.js](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/scripts/count_products.js)
  - [be/src/services/catalog.service.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/be/src/services/catalog.service.ts)
- Target Files:
  - `be/scripts/seed_demo_flow_data.ts` (hoac `be/prisma/seed.ts`)
  - `be/scripts/count_system_records.ts`
  - `be/package.json`

## Checklist

- [x] Thiet ke script seed bang TypeScript chay truc tiep qua `tsx` hoac Prisma Seed:
  - Dam bao script chay an toan voi co che upsert (co the chay nhieu lan ma khong bi loi duplicate unique key).
  - Ket noi truc tiep vao PrismaClient cua backend.
- [x] Seed thong tin nguoi dung va khach hang mau (User & Customer):
  - Khach hang chinh `usr-89241` / `customer-89241`: Nguyen Hoang Nam, hoangnam.tech@gmail.com, 0988 234 567, dia chi tai Quan 10, TP.HCM (khop voi thong tin dang nhap Profile).
  - Khach hang phu: Vu Hoang Nam, 0912 345 678 tai Dong Da, Ha Noi.
- [x] Seed cac bo PC dong san tieu bieu (PcBundle & PcBundleItem):
  - Bundle 1: `EL APEX · Ryzen 7 9800X3D / RTX 5070 Ti` (cau hinh Flagship Gaming AMD).
  - Bundle 2: `EL TITAN · Core i7-14700K / RTX 5080 OC` (cau hinh Workstation & Do hoa Intel).
  - Bundle 3: `EL NOVA · Core i5-14600K / RTX 4070 SUPER` (cau hinh Balanced eSports).
  - Moi bundle chua day du 8 linh kien SKU lien ket truc tiep tu cac `ProductVariant` dang co trong CSDL (CPU, Mainboard, RAM, SSD, VGA, PSU, Cooling, Case).
- [x] Seed don hang thuc te trai dai 5 giai doan cua Pipeline Kanban:
  - Don hang 1 (PENDING_PAYMENT): Don may PC Custom Build cho thanh toan VietQR (ma don ELT-91024).
  - Don hang 2 (PREPARING_COMPONENTS): Don linh kien roi dang kiem tra seal va so Serial tai kho Thai Ha (ma don ELT-89820).
  - Don hang 3 (ASSEMBLING): Don may tram Workstation dang chay stress test Furmark 24h tai Hub Q10 (ma don ELT-89552).
  - Don hang 4 (READY_FOR_PICKUP): Don PC da lap xong, san sang nhan tai quay Hub voi ma OTP `489-102` (ma don ELT-88910).
  - Don hang 5 (COMPLETED): Don da giao thanh cong, da kich hoat bao hanh dien tu 36T (ma don ELT-87621).
  - Don hang 6 (CANCELLED): Don huy truc tuyen duoc hoan tien hop le theo quy dinh.
  - Moi don hang co day du cac ban ghi quan he: `OrderLine`, `OrderStatusHistory` (Timeline), `Payment` (VietQR reference / COD), `Fulfillment`.
- [x] Seed danh gia san pham da duoc kiem dinh (Verified Reviews):
  - Lien ket toi don hang da COMPLETED va SKU tuong ung theo nghiep vu REV-002 va REV-004.
  - Noi dung danh gia ky thuat thuc te (ve nhiet do, hieu nang, do em cua fan, chat luong dong goi).
- [x] Bo sung script thong ke `count_system_records.ts` va cap nhat command chay trong `be/package.json`:
  - `npm run seed:demo`
  - `npm run seed:demo:check`

## Acceptance Criteria

- Criterion 1: Chay `npm run seed:demo` tu thu muc `be` hoan tat voi exit code 0 va khong phat sinh bat ky loi constraint hoac transaction rollback nao.
- Criterion 2: Bang `pc_bundle` co it nhat 3 bo may dong san hop le voi day du 8 linh kien SKU duoc link chinh xac; bang `order` co it nhat 5-6 don hang trai deu cac trang thai; bang `review` co cac danh gia san pham hop le.
- Criterion 3: Script hoan toan idempotent, khi chay lai lan thu 2 khong gay duplicate key hoac nhan doi du lieu.
- Criterion 4: Du lieu phu hop voi quy dinh tai `.agents/skills/db-conventions/SKILL.md`: gia tien dung kieu `Decimal`, ma UUID hop le, cac moc thoi gian ro rang.

## Verification Commands

- Command 1: npm run check:be
- Command 2: npx tsx scripts/count_system_records.ts (hoac node)
