# PC Store & PC Builder — Tech Stack & Architecture

Tai lieu tong hop va quy chuan cong nghe da duoc phe duyet cho du an Web linh kien PC va Ho tro tu van lap rap PC.

---

## 1. Tong Quan Cong Nghe Da Chot

| Thanh phan | Cong nghe lua chon | Vai tro trong he thong |
| :--- | :--- | :--- |
| **Frontend Framework** | Angular (Standalone Components) | Giao dien nguoi dung, SPA, toi uu hoa hieu nang voi OnPush va Signals |
| **Styling** | Tailwind CSS + Spartan UI (`spartan/ui`) | He thong component headless primitives phong cach shadcn UI danh cho Angular |
| **Client State Management** | Angular Native Signals Service | Quan ly trang thai phan ung nhe nhang bang `signal()`, `computed()`, `effect()` |
| **Form & Validation** | Angular Reactive Forms + Zod | Xu ly form dong (dynamic controls) ket hop tham dinh schema tap trung bang Zod |
| **Authentication** | Better-Auth (Node.js + Prisma Adapter) | Quan ly xac thuc, session, dang nhap email/mat khau va OAuth, cap quyen API |
| **Backend Framework** | Node.js (Express / Fastify) | Xay dung RESTful API, xu ly business logic, engine kiem tra tuong thich phan cung |
| **Database ORM** | Prisma ORM (`@prisma/client`) | Quan ly schema, migration, type-safe query cho PostgreSQL |
| **Database** | PostgreSQL (Supabase) | Luu tru du lieu quan he, ho tro `jsonb` cho thong so ky thuat linh kien dong |

---

## 2. Kien Truc Phan Tang Tong The

```
[ Angular UI Components (fe/src/app/components/) ]
  ├── Spartan UI Primitives (Atoms: Button, Dialog, Popover, Table, Tooltip...)
  └── Feature Components (PC Builder Wizard, Product Detail, Cart, Checkout)
                        ↓ (injects / reads signals)
[ Angular Native Signals Services (fe/src/app/services/) ]
  ├── CartService (cartItems signal, totalPrice computed)
  ├── PcBuilderService (selectedComponents signal, compatibilityWarnings computed)
  └── AuthService (currentUser signal, isAuthenticated computed)
                        ↓ (validates inputs with shared Zod schemas)
[ Form Layer (fe/src/app/forms/) ]
  └── Angular Reactive Forms (FormGroup, FormControl) + Zod Validators
                        ↓ (HTTP calls via HttpClient / HttpInterceptor)
[ REST API / Node.js Backend (be/src/) ]
  ├── Controllers / Routes (be/src/controllers/)
  │     └── Better-Auth Middleware (session validation, bearer token)
  ├── Services & Business Logic (be/src/services/)
  │     ├── Compatibility Engine (CPU socket, RAM bus, PSU wattage, Case dimensions)
  │     ├── Order & Checkout Service
  │     └── Product Catalog Service
  ├── Pure Utils (be/src/utils/) (Formatting, math, slugify — khong I/O, khong DB)
  └── Prisma Client Singleton (be/src/lib/prisma.ts)
                        ↓
[ PostgreSQL Database (Supabase) ]
```

---

## 3. Trach Nhiem Chi Tiet Tung Tang

### Frontend Presentation Layer
- Su dung Standalone Components (`@Component({ standalone: true })`) voi `ChangeDetectionStrategy.OnPush`.
- Su dung toan bo cac primitives tu Spartan UI (Button, Input, Dialog, Tooltip, Dropdown, Table) ket hop voi Tailwind CSS va tien ich `hlm()` (hoac `cn()`).
- Tuyet doi khong render truc tiep the HTML tho khi da co primitive component tuong ung.

### Client State Layer
- Khong su dung Redux hay NgRx truyen thong. Su dung Angular Signals Service:
  - Cac bien trang thai duoc khai bao bang `signal<T>(initialValue)`.
  - Cac gia tri phai sinh duoc tinh toan tu dong qua `computed(() => ...)`.
  - Cac phuong thuc cap nhat trang thai viet ro rang trong Service, component chi goi ham ma khong mutate truc tiep.

### Form & Validation Layer
- Xay dung bang Angular Reactive Forms (`FormGroup`, `FormControl`, `FormArray`).
- Dinh nghia cac Zod Schema cho entity (User, Order, PcBuildConfiguration) tai thu muc dung chung.
- Su dung helper validator de wrap Zod schema vao Angular `ValidatorFn`, bao dam logic validation giong nhau giua Frontend va Backend.

### Backend & Business Logic Layer
- Controller chi lam nhiem vu nhan request, kiem tra xac thuc qua Better-Auth middleware, goi Service va tra ve ket qua chuan `{ success: true, data }` hoac `{ success: false, error }`.
- Toan bo nghiep vu dat hang, luu cau hinh, tinh toan tuong thich nam tai Service.
- Cac thao tac ghi nhieu bang du lieu phai duoc bao boc trong `prisma.$transaction`.

### Database & Persistence Layer
- Schema duoc dinh nghia tai `prisma/schema.prisma`.
- Model dat ten PascalCase so it, map sang bang `snake_case` qua `@@map("...")`.
- Cac entity deu co khoa chinh `id`, truong thoi gian `createdAt` / `created_at`, `updatedAt` / `updated_at`, va co `isActive` / `is_active` danh cho xoa mem (soft-delete).
- Tien te va gia ban su dung kieu `Decimal`.

---

## 4. Bang So Sanh Chuyen Doi Tu Du An Cu

| Khu vuc | Du an cu (ecommerce_integrate) | Du an moi (PC Store & Builder) | Ghi chu chuyen doi |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js 15+ App Router | Angular 17+ Standalone + Node.js | Tach biet FE (SPA) va BE (REST API) |
| **Data Fetching** | TanStack React Query (`useQuery`) | Angular HttpClient + Signals Service | Signals theo doi trang thai loading va du lieu |
| **Client State** | Jotai Atoms | Angular Native Signals Service | Khong can cai them thu vien ngoai |
| **UI Primitives** | Radix UI + shadcn UI | Spartan UI (`spartan/ui`) + Tailwind | Spartan UI la shadcn UI danh cho Angular |
| **Authentication** | Next-Auth (Auth.js) | Better-Auth + Prisma Adapter | Chay doc lap tren Node.js, tich hop Prisma |
| **Forms** | React Hook Form + Zod | Angular Reactive Forms + Zod | Su dung Reactive Forms goc cua Angular voi Zod |
| **ORM** | Prisma MySQL | Prisma PostgreSQL (Supabase) | Giu nguyen cu phap Prisma, chuyen driver PostgreSQL |

---

## 5. Bang Quy Chuan Ky Thuat Can Tranh

| Vi pham | Cach xu ly dung |
| :--- | :--- |
| Su dung kieu `any` | Su dung `unknown` ket hop type guards hoac Zod parsing |
| Su dung `interface` cho data transfer objects | Su dung `type` de dinh nghia props, state va payloads |
| Truc tiep goi `prisma.*` trong Controller | Di chuyen toan bo query vao Service tuong ung |
| Thuc hien nhieu thao tac DB lien quan ma khong transaction | Bao boc trong `prisma.$transaction` tai Service |
| Xu ly I/O (API, DB, doc ghi file) ben trong ham `utils/` | Utils phai la pure functions; chuyen I/O sang Service |
| Dung class CSS tuy tien (`bg-[#123456]`) | Su dung token mau ngu nghia tu Tailwind config / CSS variables |
| Dung style truc tiep (`style="..."`) tren the HTML | Su dung utility classes cua Tailwind CSS |
| Hardcode chuoi thong bao loi tren giao dien | Dong bo qua file resource/i18n hoac Zod localized messages |
| Comment danh so thu tu (`// 1. ...`, `// Buoc 1...`) | Comment mo ta truc tiep muc dich ky thuat va ly do xu ly |
