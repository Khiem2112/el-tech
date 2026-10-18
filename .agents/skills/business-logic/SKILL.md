---
name: business-logic
description: Apply the approved EL-TECH domain rules when designing, implementing, or reviewing customer identity, product catalog and PC bundles, pricing and promotions, cart and checkout, QR or COD payments, orders, branch inventory, purchasing, reviews, or notifications. Load before any change that can affect money, stock, lifecycle state, or customer ownership; do not use for visual-only changes.
---

# EL-TECH Business Logic

Use this skill as the domain source of truth for the EL-TECH MVP. It turns the approved decisions in `QA/QA-el-tech-business-logic.md` into rules suitable for services, Prisma constraints, API validation, UI eligibility, and tests.

## Authority and change control

1. Read [features/core-scope.md](features/core-scope.md) for every business-logic task.
2. Read only the feature references relevant to the requested change.
3. Treat these feature references as the normalized interpretation of the approved QA. Follow-up decisions FQ01–FQ36 override conflicting earlier answers.
4. If a request changes an actor, invariant, state, money calculation, stock side effect, cancellation rule, or MVP boundary, set the affected specification back to Draft and use `.agents/skills/implement-qa/SKILL.md`. Do not guess.
5. Do not expand an approved workflow merely because the technical stack mentions a future capability.

## Reference routing

- Customer identity, guest checkout ownership, verification, or profile merge: read [features/customer-identity.md](features/customer-identity.md).
- Category, template, variant, SKU, dynamic specifications, PC bundles, or Custom Build: read [features/catalog-and-pc-builds.md](features/catalog-and-pc-builds.md).
- Prices, product promotions, coupons, VAT, rounding, or snapshots: read [features/pricing-and-promotions.md](features/pricing-and-promotions.md).
- Cart, checkout, branch allocation, QR, COD, deposits, or payment callbacks: read [features/checkout-and-payments.md](features/checkout-and-payments.md).
- Order states, transition permissions, cancellation, stock issue, assembly status, or tracking: read [features/orders-and-fulfillment.md](features/orders-and-fulfillment.md).
- On-hand, reserved, serials, stock ledger, availability, or branch transfers: read [features/inventory-and-transfers.md](features/inventory-and-transfers.md).
- Supplier, purchase order, receipt, average cost, or supplier return: read [features/purchasing.md](features/purchasing.md).
- Product review or customer notifications: read [features/reviews-and-notifications.md](features/reviews-and-notifications.md).

Load every reference whose boundary the operation crosses. Checkout normally requires customer identity, catalog/PC build, pricing, payment, order, and inventory rules together.

## Cross-cutting invariants

- The backend service is authoritative. Client state can preview decisions but cannot finalize price, discount, payment, stock, eligibility, or lifecycle transitions.
- Use one database transaction for a consequential operation that writes multiple records. Roll back the entire operation when an invariant fails.
- Make payment callbacks, order submission, coupon consumption, inventory reservation, stock issue, receipt validation, and state-transition commands idempotent.
- Never use floating-point arithmetic for money. Follow `.agents/skills/db-conventions/SKILL.md`; store monetary values as Prisma `Decimal` and round VND to whole đồng at the business boundary.
- Never permit negative available stock. Lock or atomically condition the affected SKU-and-branch balances before reserving or issuing.
- Preserve order-line, price, promotion, contact, branch, and PC-BOM snapshots. Later catalog changes must not rewrite historical orders.
- Do not mutate or delete completed stock or payment history. Correct it through a linked reversal transaction.
- Record actor, timestamp, previous state, next state, reason, and idempotency key for consequential transitions.
- Return stable domain errors that identify the violated rule ID; do not expose raw database errors as business outcomes.

## Implementation workflow

1. Identify the affected rule IDs and references before changing code.
2. Express state eligibility and monetary/stock calculations as backend domain functions or services, not controllers or UI components.
3. Recheck every rule inside the write transaction; a prior UI check is not sufficient under concurrency.
4. Add tests for the normal path, duplicate submission, concurrent last-unit purchase, stale price or stock, invalid transition, cancellation, and retry where applicable.
5. Review the final behavior against the cited rule IDs. If behavior needs a new exception, return to QA instead of embedding an undocumented branch.

