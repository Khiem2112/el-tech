# Customer API contract — Phase 0

This is the source contract for the customer application. The backend owns every money, stock, identity, and lifecycle decision; the frontend only renders estimates and server eligibility.

## Transport envelope

Every successful response has this shape:

```json
{ "success": true, "data": {}, "meta": { "correlationId": "uuid" } }
```

Every expected domain failure has this shape:

```json
{
  "success": false,
  "error": {
    "code": "STABLE_CODE",
    "ruleId": "CUS-016",
    "messageKey": "error.identityAmbiguous",
    "details": {},
    "retryable": false,
    "correlationId": "uuid"
  }
}
```

Money is a whole-VND decimal string, never a floating-point JSON number. Timestamps are ISO-8601 UTC strings. Consequential commands require an `Idempotency-Key` header.

## Identity and authorization

- A guest cart is addressed only by an opaque secure token; it is never placed in a URL.
- Account registration creates a new Customer linked to the User after verification. It never links a historical guest Customer, even when contacts are identical (`CUS-003`, `CUS-015`).
- Account endpoints use the User's linked Customer only. Historical guest orders remain reachable only through an authorized guest order session.
- A guest checkout with verified contacts that match multiple Customers returns `CUSTOMER_IDENTITY_AMBIGUOUS` (`CUS-016`).

## Endpoint groups

| Group | Commands | Authority |
| --- | --- | --- |
| Catalog | `GET /v1/categories`, `/v1/products`, `/v1/products/{slug}`, `/v1/branches` | Active catalog and informational availability only |
| Builds | `GET /v1/prebuilt`, `POST /v1/builds/preview` | Preview only; no compatibility guarantee |
| Cart | `GET|POST|PATCH|DELETE /v1/cart` | Opaque-cart CRUD; no reservation |
| Auth | `POST /v1/auth/register`, `login`, `logout`, `verify`, `recovery` | Better-Auth session and new User-owned Customer |
| Checkout | `POST /v1/checkout/otp`, `verify`, `quote`, `submit` | OTP, quote, single-branch allocation and final validation |
| Payment | `GET /v1/orders/{code}/payment`, `POST /v1/payments/callback` | QR/COD state separate from order state |
| Orders | `POST /v1/orders/lookup`, `GET /v1/orders/{code}`, `POST /v1/orders/{code}/cancel` | Account or order-scoped guest authorization |
| Account | `GET|PATCH /v1/account/profile`, `GET /v1/account/orders`, `GET /v1/notifications` | User-linked Customer only |
| Reviews | `POST|PATCH /v1/reviews` | Completed owned order line only |

## Required recovery errors

| Code | Rule | UI recovery |
| --- | --- | --- |
| `CUSTOMER_IDENTITY_CONFLICT` | CUS-004 | Stop checkout and contact support |
| `CUSTOMER_IDENTITY_AMBIGUOUS` | CUS-016 | Require login or support; keep cart intact |
| `CONTACT_NOT_VERIFIED` | CUS-002 | Return to the applicable OTP action |
| `RATE_LIMITED` | CUS-002 | Display retry countdown |
| `PRICE_QUOTE_STALE` | PRC-002 | Reconfirm the server quote |
| `COUPON_QUOTA_EXHAUSTED` | PRO-008 | Show inline coupon error; do not submit at a different price |
| `SKU_NOT_SELLABLE` | CAT-012 | Mark cart line for repair |
| `NO_SINGLE_BRANCH_CAN_FULFILL` | CHK-012 | Keep cart; block submission |
| `INSUFFICIENT_STOCK` | INV-004 | Mark affected SKU/build component |
| `PAYMENT_REVIEW_REQUIRED` | PAY-003 | Display review state; no top-up UI |
| `PAYMENT_EXPIRED` | PAY-009 | Show expired outcome and order link |
| `ORDER_CANCEL_NOT_ALLOWED` | ORD-015 | Refresh order and explain its current state |
| `REVIEW_NOT_ELIGIBLE` | REV-002 | Refresh the review eligibility CTA |

## Compatibility commitments

- `orderStatus` and `paymentState` are independent fields in every order DTO (`PAY-005`, `ORD-001`).
- Order, price, promotion, contact, branch, and BOM fields are snapshots and never hydrated from mutable catalog data.
- Duplicate commands return the original outcome, not a second reservation, payment, transition, notification, or review.
