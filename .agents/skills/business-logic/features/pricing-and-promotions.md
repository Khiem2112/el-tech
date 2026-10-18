# Pricing and promotions

## Price source and snapshots

- `PRC-001`: The MVP has one online selling price per SKU for the whole system, with an effective period. There is no branch-specific selling price.
- `PRC-002`: Cart totals are estimates. Reprice all lines on checkout validation.
- `PRC-003`: Creating an order freezes the accepted unit prices, tax treatment, promotion results, coupon allocation, original fees, and original total. Later price changes do not affect the order. An approved fulfillment-method amendment adds a separately auditable charge and never rewrites the original snapshot.
- `PRC-004`: Use Decimal for every intermediate monetary value. VND outcomes have no fractional đồng.
- `PRC-005`: Displayed prices include VAT. Preserve a breakdown sufficient to reproduce the order total.

## Fulfillment fees and amendments

- `PRC-006`: Branch pickup has zero shipping fee. Delivery uses one Admin-configured fixed fee and an Admin-configured free-shipping threshold. The MVP has no additional COD surcharge.
- `PRC-007`: A delivery-fee configuration has an effective period and non-negative whole-VND values. Checkout must snapshot the rule and fee used for the Order.
- `PRC-008`: Changing pickup to delivery, or accepting a redelivery fee, requires an `OrderAmendment` accepted by the Customer through verified contact. Calculate the fee from the configuration effective at acceptance and the original eligible subtotal; snapshot the new address when applicable, fee, reason, rule reference, acceptance actor, and acceptance time.
- `PRC-009`: An amendment charge does not reprice product lines, service lines, product promotions, coupon allocation, VAT treatment, or the original Order total. Current amount due equals the original outstanding amount plus accepted unpaid amendment charges.

## Promotion pipeline

- `PRO-001`: A product promotion is automatic and can target SKU or Category for an effective period. It does not require a code.
- `PRO-002`: A buyer can apply at most one order coupon to an order.
- `PRO-003`: Calculate in this order: base line price, product promotion, eligible subtotal, order-coupon allocation, shipping/COD fee, then tax/rounding reconciliation.
- `PRO-004`: Product promotion and order coupon can stack unless the product promotion is explicitly exclusive.
- `PRO-005`: Total discount on an eligible amount cannot exceed that amount. No line or order total may become negative.

## Coupon eligibility and quota

- `PRO-006`: Coupon rules may use effective time, minimum subtotal, maximum discount, included/excluded SKU or Category, payment method, branch, Customer eligibility, global quota, and per-Customer quota.
- `PRO-007`: Validate eligibility and reserve quota atomically when the order is created.
- `PRO-008`: Concurrent attempts beyond quota fail with `COUPON_QUOTA_EXHAUSTED`; do not silently create an order at an unexpected higher total.
- `PRO-009`: Release reserved quota when a pending-payment order expires or an eligible order is canceled before consumption becomes final.

## Allocation and rounding

- `PRO-010`: Allocate an order coupon proportionally across eligible lines using each line's value after product promotion.
- `PRO-011`: Round line allocations to whole VND. Assign any residual đồng deterministically to eligible lines in stable order so the allocation sum exactly equals the order discount.
- `PRO-012`: Persist the allocated discount per order line even though customer partial returns are outside scope.

## PC pricing

- `PRO-013`: A virtual PC price equals the accepted component-line totals plus selected service fees minus bundle promotion, then participates in the normal coupon pipeline.
- `PRO-014`: The order stores component-level price and discount snapshots; do not store only one opaque bundle total.

## Acceptance checks

- The server rejects checkout when the client total is stale and returns the newly calculated breakdown for reconfirmation.
- Repeating coupon application for the same idempotent order submission consumes quota once.
- Sum of line net amounts, fees, and tax reconciliation equals the order grand total exactly.
- An accepted pickup-to-delivery amendment changes only the supplemental delivery charge and address snapshot; the original commercial snapshot remains reproducible.

