---
name: db-conventions
description: >
  Database schema conventions and field rules for PostgreSQL (Supabase) and Prisma ORM.
  Load this skill whenever adding, modifying, or reviewing Prisma models (schema.prisma),
  writing migrations, or generating seed data.
---

# Database Schema Conventions (PostgreSQL & Prisma)

When to load: Adding a new Prisma model, modifying fields in `prisma/schema.prisma`, reviewing database migrations, or generating seed data.

---

## 1. Mandatory Fields for Mutable Models

Every mutable Prisma model (products, categories, PC builds, orders, user profiles) must declare the `id` primary key and the audit fields at the bottom of the field list, immediately above `@@map`.

```prisma
// Audit columns at the bottom
isActive  Boolean  @default(true) @map("is_active")
createdAt DateTime @default(now()) @map("created_at")
updatedAt DateTime @updatedAt @map("updated_at")
```

And the primary key at the very top:

```prisma
// Using auto-increment integer or UUID
id Int @id @default(autoincrement())
// Or for public/distributed entities:
// id String @id @default(uuid())
```

### Rules for Mandatory Fields

| Field | Type | Default | Notes |
|---|---|---|---|
| `id` | `Int` or `String` | `@default(autoincrement())` or `@default(uuid())` | Always named exactly `id`. Never `productId`, `orderId`, `userId` as the model primary key. |
| `createdAt` | `DateTime` | `@default(now())` | Timestamp with timezone in PostgreSQL (`timestamptz`). Set once on insert. |
| `updatedAt` | `DateTime` | `@updatedAt` | Automatically updated by Prisma engine on every record write. Never manually pass `updatedAt` in mutation payloads. |
| `isActive` | `Boolean` | `@default(true)` | Soft-delete flag. Use `WHERE isActive = true` for active queries. Avoid hard deletes on transactional records. |

---

## 2. PostgreSQL Data Types & Precision Rules

- **Currency & Pricing**: Always use `Decimal @db.Decimal(12, 2)`. Never use `Float` or `Double` for prices or monetary amounts to prevent IEEE-754 precision errors.
- **Dynamic Hardware Specifications**: PC component categories have diverse specifications (socket, TDP, bus speed, dimensions). Use PostgreSQL `Json` for flexible hardware specs:
  ```prisma
  specs Json @default("{}")
  ```
- **Text & Strings**: Use `String` for regular fields. For long product descriptions or markdown notes, use `String @db.Text`.
- **Enums vs Tables**: Use PostgreSQL `enum` for fixed lifecycle states (e.g. `OrderStatus`, `ComponentCategory`).

---

## 3. Naming Conventions

- **Models**: PascalCase singular (`Product`, `Category`, `PcBuild`, `Order`).
- **Database Tables**: Mapped to plural snake_case using `@@map("...")`:
  ```prisma
  model PcBuild {
    id Int @id @default(autoincrement())
    // ...
    @@map("pc_builds")
  }
  ```
- **Fields in Code**: camelCase in TypeScript/Prisma model, mapped to snake_case column names in PostgreSQL using `@map("...")`:
  ```prisma
  categoryId Int @map("category_id")
  ```
- **Foreign Keys**: Always named `<relationName>Id` (e.g. `userId`, `categoryId`, `orderId`).

---

## 4. Indexing Strategy

- **Foreign Keys**: Always add indexes on foreign key columns used in filtering or joins:
  ```prisma
  @@index([categoryId])
  @@index([userId])
  ```
- **Lookup Filters**: Add indexes on high-frequency search and filter columns:
  ```prisma
  @@index([isActive])
  @@index([sku])
  ```
- **Composite Indexes**: When querying combinations frequently (e.g. active products by category):
  ```prisma
  @@index([categoryId, isActive])
  ```

---

## 5. Better-Auth Compatible Schema

Better-Auth manages its own authentication models via Prisma. Keep their required fields aligned:

```prisma
model User {
  id            String    @id @default(uuid())
  name          String
  email         String    @unique
  emailVerified Boolean   @default(false) @map("email_verified")
  image         String?
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  sessions      Session[]
  accounts      Account[]
  pcBuilds      PcBuild[]
  orders        Order[]

  @@map("users")
}

model Session {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  token     String   @unique
  expiresAt DateTime @map("expires_at")
  ipAddress String?  @map("ip_address")
  userAgent String?  @map("user_agent")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model Account {
  id                    String    @id @default(uuid())
  userId                String    @map("user_id")
  accountId             String    @map("account_id")
  providerId            String    @map("provider_id")
  accessToken           String?   @map("access_token")
  refreshToken          String?   @map("refresh_token")
  accessTokenExpiresAt  DateTime? @map("access_token_expires_at")
  refreshTokenExpiresAt DateTime? @map("refresh_token_expires_at")
  scope                 String?
  idToken               String?   @map("id_token")
  password              String?
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("accounts")
}

model Verification {
  id         String   @id @default(uuid())
  identifier String
  value      String
  expiresAt  DateTime @map("expires_at")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  @@map("verifications")
}
```

---

## 6. Mistakes to Avoid

- **Incorrect**: Naming the primary key `<model>Id` (e.g. `productId Int @id`). Correct is always `id Int @id`.
- **Incorrect**: Using `Float` for price or currency values. Correct is `Decimal @db.Decimal(12, 2)`.
- **Incorrect**: Passing `updatedAt` manually in Prisma `create` or `update` data arguments.
- **Incorrect**: Missing `@map("snake_case")` causing mixed casing in PostgreSQL database tables and columns.
- **Incorrect**: Hard-deleting transactional order or configuration records instead of setting `isActive = false`.
