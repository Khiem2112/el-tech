# Core scope and precedence

## Product outcome

EL-TECH helps a buyer discover trustworthy PC components, see complete technical information, assemble a purchasable PC configuration, and track the order without needing deep hardware knowledge. It also gives the operator one reliable view of the next action, the responsible branch, and the stock affected by that action.

## Actors

- `Guest Buyer`: can browse, search, filter, use a cart, configure a PC, and submit checkout after verifying contact information.
- `Customer`: a business profile created when an order is submitted. It is not the same thing as a Better-Auth login and must not make login mandatory.
- `Admin`: the only administrative role in the MVP. Admin has system-wide access to catalog, price, promotion, order, payment review, supplier, and every branch's inventory.
- External bank/payment provider: reports QR transactions through idempotent callbacks.

Do not introduce Staff or branch-scoped RBAC in the MVP without a new approved decision.

## MVP capabilities

- Online storefront, branch pickup, and delivery; no POS.
- Category, Product Template, Product Variant/SKU, search, faceted filters, and lifecycle management.
- Virtual prebuilt-PC bundles and Custom Builds made from component SKUs.
- Guest cart, checkout, one order coupon, automatic product promotions, dynamic QR, COD, and Custom Build deposits.
- Multiple branches with inventory per SKU and branch; one fulfillment branch per order.
- Immutable stock ledger, reservation, stock issue, serial tracking, and internal branch transfer.
- Supplier, simple purchase order, one exact receipt, weighted-average cost, and supplier return.
- Manual order progress, branch-pickup readiness, manual failed-delivery/redelivery/return-to-branch recovery, verified-purchase review, and email/SMS/in-app notifications.

## Explicit non-goals

The following are outside the MVP: POS, accounting and receivables, loyalty, marketplace integrations, dropshipping, multi-currency, mobile apps, carrier integration, route optimization, lost-shipment/carrier-claim resolution, automated hardware compatibility, PSU calculation, saved/shared builds, assembly work orders and QC, customer return/RMA/warranty, advanced reporting, stock counting, partial purchase receipt, and partial customer fulfillment.

Branch maps and nearest-shop map UI are later work. The MVP may store branch address and opening hours.

The technical architecture's mention of a compatibility engine is aspirational and does not override this approved MVP boundary.

## Precedence rules

- `CORE-001`: Follow-up answers FQ01–FQ36 override conflicting original QA answers, edge-case answers, and earlier follow-up decisions.
- `CORE-002`: These feature files are the normalized rules derived from the QA approved again after FQ36 on 2026-10-18.
- `CORE-003`: A later user request can change a rule only after its affected flow is returned to Draft and approved again.
- `CORE-004`: An out-of-scope event must produce an explicit unsupported outcome; never silently simulate a workflow that the system does not own.

## Universal acceptance checks

- Repeating the same consequential command does not duplicate a payment, reservation, stock movement, coupon use, notification, or transition history entry.
- A failure halfway through a multi-record operation leaves no partial money or stock side effects.
- Historical orders still render their original contact, product, price, discount, BOM, and branch snapshots after catalog edits.
- Concurrent attempts to consume the last stock unit or coupon quota have at most one winner.

