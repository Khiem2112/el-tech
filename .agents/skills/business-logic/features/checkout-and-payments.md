# Checkout and payments

## Cart and checkout

- `CHK-001`: A guest cart is identified by an opaque token and does not reserve inventory.
- `CHK-002`: When a guest becomes an identified Customer, merge duplicate SKU/build entries, then reprice and revalidate lifecycle, promotion, and stock.
- `CHK-003`: A cart may contain component SKUs, prebuilt-PC virtual BOMs, and Custom Builds.
- `CHK-004`: Order submission requires verified email and phone, receiver name/contact, a delivery or pickup choice, valid pricing, coupon eligibility, and an allocatable branch. Delivery requires a validated delivery address. Pickup requires a selected branch and must not require or validate a delivery address.
- `CHK-005`: Pickup uses the branch selected by the buyer. Delivery filters branches that can fulfill every component/SKU by configured service area, then selects deterministically by Admin-configured priority. Map distance is not used in the MVP.
- `CHK-006`: Each order has exactly one fulfillment branch. Multiple branches may hold stock, but an order never ships from several branches in the MVP.
- `CHK-007`: There is no automatic backorder. SKU replacement requires buyer approval through verified contact, a fresh price calculation, a new stock check, and an audit entry.
- `CHK-012`: If no single branch can fulfill the whole cart, reject Order submission and keep the Cart. Do not reserve stock or coupon quota and do not collect payment. Admin may perform an independent transfer; the buyer must checkout again only after the destination transfer is `RECEIVED`.

## Inventory reservation at checkout

- `CHK-008`: A normal QR order reserves all required branch stock atomically when the order is created.
- `CHK-009`: The QR reservation expires after 30 minutes. Expiry releases inventory and coupon quota, sets Payment to `EXPIRED`, and cancels the Order with reason `PAYMENT_TIMEOUT`.
- `CHK-010`: A normal COD order reserves stock only when Admin confirms it.
- `CHK-011`: A COD Custom Build reserves stock after the required deposit succeeds and the Order becomes `CONFIRMED`.

## Dynamic QR

- `PAY-001`: Generate one fixed dynamic QR attempt for each required charge, with immutable reference and expected amount. The UI must not allow editing them. An initial Order/deposit underpayment never receives a top-up QR; an accepted fulfillment amendment is a separate charge under `PAY-019`.
- `PAY-002`: Store a provider transaction ID with a uniqueness constraint. A repeated callback returns the prior result without creating another Payment or transition.
- `PAY-003`: A callback with wrong amount or ambiguous reference enters manual review and must not auto-fulfill. Once a positive transaction is uniquely matched to an unexpired Order, atomically move the Order to `ON_HOLD` with reason `PAYMENT_REVIEW`, stop the 30-minute expiry, and retain its reservation for a maximum 24-hour review window.
- `PAY-004`: For a late valid payment, atomically try to reserve stock again. If successful, restore the Order to the eligible confirmed path. If not, set Order `ON_HOLD` with reason `PAID_BUT_OUT_OF_STOCK`; Admin must refund or obtain buyer approval for replacement.

## Payment states

- `PAY-005`: Payment state is separate from Order state.
- `PAY-006`: Supported states are `UNPAID`, `PENDING`, `PARTIALLY_PAID`, `PAID`, `FAILED`, `EXPIRED`, `REFUND_PENDING`, and `REFUNDED`.
- `PAY-007`: State changes caused by providers are idempotent and store raw provider reference, received amount, occurred-at time, and normalized result.
- `PAY-008`: The MVP refunds the full amount actually received for every eligible canceled prepaid payment transaction. It has no partial line-return refund workflow. A forfeited Custom Build deposit is explicitly ineligible for refund.

## COD and Custom Build deposit

- `PAY-009`: Component-only orders and prebuilt-PC offers may use normal COD.
- `PAY-010`: A Custom Build using COD must first pay a QR deposit.
- `PAY-011`: Calculate deposit as `min(grandTotal, max(roundVnd(grandTotal × 10%), 500000))`, using the grand total after discounts.
- `PAY-012`: After the deposit succeeds, Payment is `PARTIALLY_PAID`, deposit disposition is `HELD`, and COD remaining equals `grandTotal − depositPaid`. Successful Order completion changes the disposition to `APPLIED` without moving money again.
- `PAY-013`: Fully refund the deposit when cancellation is accepted before `PREPARING_COMPONENTS`: set disposition to `REFUND_PENDING`, then `REFUNDED` only after the manual refund is confirmed.
- `PAY-014`: From `PREPARING_COMPONENTS` onward the buyer cannot self-cancel. If Admin cancels the Order for any reason at or after that state, the COD Custom Build deposit is retained and its disposition becomes `FORFEITED`.
- `PAY-015`: Deposit disposition is separate from Payment state and supports `HELD`, `APPLIED`, `REFUND_PENDING`, `REFUNDED`, and `FORFEITED`. A canceled Order with a retained deposit keeps Payment `PARTIALLY_PAID` and sets disposition `FORFEITED`.

## Review, refund, and supplemental charges

- `PAY-016`: The MVP performs refunds manually. Creating a refund moves Payment to `REFUND_PENDING`; only Admin confirmation with refund transaction reference and occurred-at time moves it to `REFUNDED`. Both commands are idempotent and audited.
- `PAY-017`: There is no underpayment top-up. If an invalid or unresolved payment review reaches 24 hours, cancel the Order with reason `PAYMENT_REVIEW_TIMEOUT`, release reservation and coupon quota, and create a full refund for all received money in `REFUND_PENDING`.
- `PAY-018`: An exact payment received after expiry follows `PAY-004`. An invalid late payment stays in manual review and never auto-restores the Order.
- `PAY-019`: For an accepted pickup-to-delivery or redelivery amendment, a prepaid Order requires a supplemental QR charge before entering `SHIPPING`; a COD Order adds the accepted charge to the remaining COD amount. The amendment never changes product-line or coupon snapshots.
- `PAY-020`: A COD Order may become `COMPLETED` only when Admin records collection of the entire remaining COD amount plus accepted amendment charges, with actor and occurred-at time. In the same transaction, Payment becomes `PAID`; a Custom Build deposit disposition becomes `APPLIED`. This collection command is idempotent.

## Acceptance checks

- Duplicate QR callbacks produce one Payment transaction and one Order transition.
- An unpaid QR Order with no positive matched transaction releases all reservations exactly once after 30 minutes. A positive matched exception follows the 24-hour review rules instead.
- Two concurrent submissions for the final stock unit cannot both reserve it.
- The deposit plus COD remaining always equals the frozen grand total.
- A non-exact QR payment can never reach fulfillment and cannot be topped up.
- Completing the same manual refund command twice records one refund result.
- A race between the 30-minute expiry and the first positive callback has one atomic winner: the Order is either expired and the transaction is late, or it enters payment review; it is never both.
- A COD Order cannot be completed with an unpaid or partially paid outstanding balance.

