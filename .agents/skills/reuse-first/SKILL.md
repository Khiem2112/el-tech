---
name: reuse-first
description: >
  Verifies repository reuse before adding or duplicating services, utilities,
  signals, schemas, types, models, or UI components. Load when implementation or
  review introduces a new abstraction, file, public export, or parallel code
  path in the PC Store & PC Builder project.
---

# Reuse-First Engineering

Use this skill to decide whether new code should reuse, extend, compose, or replace an existing repository capability. It avoids code duplication while preventing premature or forced abstractions across Frontend (Angular) and Backend (Node.js/Express).

---

## 1. Required Discovery Protocol

Before creating a new abstraction, component, service helper, or data model:

- Identify the capability and layer being added: UI primitive, composite component, signals service, Zod schema, type, pure utility, backend service, or Prisma model.
- Search the repository by technical role and domain term, inspecting shared directories and public barrel exports.
- Inspect the closest candidates and their existing callers. Similar naming does not guarantee matching behavior.
- Choose the smallest valid outcome:
  - Reuse the existing API unchanged.
  - Extend the existing API when responsibility and domain invariants match.
  - Compose or adapt it when only the input/output boundary differs.
  - Add new code only when the domain behavior or ownership is genuinely distinct.

Do not deep-import a private internal helper merely to claim reuse. Respect public barrel exports or promote the capability deliberately when it should become shared.

---

## 2. Layer-Specific Search Targets

This project strictly separates reuse across Frontend (Angular SPA) and Backend (Express REST API) scopes.

### Frontend Reuse Scope (`fe/`)

Before authoring any UI component, state service, reactive form, or client helper:

| Target Layer | Directory Path | Public Barrel Import | What To Inspect & Reuse |
|---|---|---|---|
| Universal Primitive Atoms | `fe/src/app/components/atoms/` | `@atoms` or `src/app/components/atoms/index.ts` | Spartan UI primitives (Button `hlmBtn`, Input `hlmInput`, Badge, Dialog, Table, Tooltip, Select, Dropdown, Sheet) |
| Feature Components | `fe/src/app/components/` | Direct component import | Domain components (`pc-builder/`, `catalog/`, `cart/`, `checkout/`, `auth/`) |
| Client State & Signals | `fe/src/app/services/` | Direct service import | Angular Signals Services (`CartService`, `PcBuilderService`, `AuthService`, `ProductService`) |
| Form Schemas & Validators | `fe/src/app/forms/` or shared schemas | `@forms` or relative path | Zod validation schemas, custom Angular Zod validator helpers |
| Pure Utilities | `fe/src/app/lib/` or `fe/src/app/utils/` | Direct helper import | `cn()`, `hlm()`, formatting currency, date helpers |

#### Frontend Violations:
- Rendering raw HTML elements (`<button>`, `<input>`, `<select>`, `<textarea>`, `<table...>`, raw status pills) when an atom or Spartan directive exists is a violation. Always inspect `fe/src/app/components/atoms/` first.
- Creating isolated component-level state for cart, authentication, or PC build configurations when a shared Signals Service already manages that entity.
- Authoring ad-hoc Zod schemas in component files instead of reusing schemas from the centralized forms directory.

---

### Backend Reuse Scope (`be/`)

Before writing domain logic, server utilities, database queries, or type definitions:

| Target Layer | Directory Path | Public Import / Path | What To Inspect & Reuse |
|---|---|---|---|
| Domain Services | `be/src/services/` | Relative service import | Business services (`productService`, `orderService`, `pcBuilderCompatibilityService`, `authService`) |
| Pure Utilities | `be/src/utils/` | Relative util import | Pure stateless utilities (currency calculations, slugify, hardware wattage math). Strictly no DB or network I/O |
| Domain & Payload Types | `be/src/types/` | Relative type import | Shared DTOs, request payloads, and Prisma-derived types (`Prisma.<Model>GetPayload<{ select: ... }>`) |
| Database Schema | `be/prisma/schema.prisma` | Prisma Client | Existing models, relations, JSON hardware specification schemas, and enums |
| Auth & Middleware | `be/src/middleware/` | Relative middleware import | Better-Auth session middleware, role-based guard, error handler |

#### Backend Violations:
- Writing raw Prisma queries directly in Express Controllers instead of reusing or extending domain functions in `be/src/services/`.
- Hand-copying Prisma model fields into parallel manual TypeScript interfaces/types instead of deriving via `Prisma.<Model>GetPayload`, `Pick`, or `Omit`.
- Putting database queries or network requests inside `be/src/utils/`. Utilities must remain pure functions.
- Duplicating hardware compatibility check logic across multiple routes instead of delegating to a central compatibility service.

---

## 3. Review Standard & Criteria

Treat duplication as a violation only when the review can cite:
- The existing capability and its import path.
- The new overlapping implementation.
- Why the existing contract satisfies the new requirement.
- The smallest reuse or extension that eliminates duplication.

If compatibility is uncertain, prefer a small, focused addition rather than forcing an unnatural abstraction.

---

## 4. Illustrative Examples

### UI Controls Reuse

Khong dung quy chuan: Tu viet the HTML tho kem inline style hoac class tuy tien trong component:
```html
<button
  style="background-color: #2563eb; color: #fff; padding: 8px 16px; border-radius: 6px;"
  (click)="addToCart()"
>
  Add to Cart
</button>
```

Chuan xac: Tai su dung Spartan UI Button directive va token ngu nghia:
```html
<button hlmBtn variant="default" (click)="addToCart()">
  Add to Cart
</button>
```

---

### Backend Service Query Reuse

Khong dung quy chuan: Controller tu y goi truc tiep Prisma client de tim san pham:
```typescript
export async function getProductDetail(req: Request, res: Response) {
  const product = await prisma.product.findUnique({
    where: { id: Number(req.params.id) },
  });
  return res.json({ success: true, data: product });
}
```

Chuan xac: Goi qua `productService` da dong goi san logic va schema projection:
```typescript
export async function getProductDetail(req: Request, res: Response) {
  const product = await productService.getById(Number(req.params.id));
  return res.json({ success: true, data: product });
}
```
