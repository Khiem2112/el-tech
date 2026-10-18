# Orders and fulfillment

## State ownership

- `ORD-001`: Payment owns payment outcome. Order owns customer-visible preparation and delivery progress. There is no separate Fulfillment or Assembly state machine in the MVP.
- `ORD-002`: Only Admin can perform manual Order transitions.
- `ORD-003`: Every transition is server-validated, idempotent, and audited. Never permit arbitrary status assignment.

## Order states

Supported durable states are:

- `PENDING_PAYMENT`: waiting for full QR payment or the required Custom Build deposit.
- `PENDING_COD_CONFIRMATION`: normal COD order awaiting Admin confirmation.
- `CONFIRMED`: payment/COD condition satisfied and stock reserved.
- `PREPARING_COMPONENTS`: Admin has started fulfillment preparation.
- `ASSEMBLING`: optional, only when assembly service was selected.
- `READY_FOR_PICKUP`: the full Order is staged at the selected branch and the Customer has been notified.
- `SHIPPING`: the full order has been stock-issued and handed to delivery handling.
- `DELIVERY_FAILED`: a delivery attempt failed; Admin must choose an approved redelivery or return-to-branch path.
- `RETURNING`: the failed shipment is physically returning to its fulfillment branch.
- `RETURNED_TO_BRANCH`: the branch confirmed physical receipt and the linked reverse stock move.
- `COMPLETED`: Admin records successful delivery or pickup.
- `ON_HOLD`: a resolvable exception such as paid-but-out-of-stock, payment review, or pickup expiry.
- `CANCELLED`: terminal cancellation with a reason.

## Allowed transitions

- `ORD-004`: QR full payment success moves `PENDING_PAYMENT → CONFIRMED` after stock reservation remains valid.
- `ORD-005`: Custom Build deposit success moves `PENDING_PAYMENT → CONFIRMED` after full component reservation.
- `ORD-006`: Admin confirmation moves `PENDING_COD_CONFIRMATION → CONFIRMED` only after full reservation succeeds.
- `ORD-007`: Admin moves `CONFIRMED → PREPARING_COMPONENTS`.
- `ORD-008`: With assembly service, `PREPARING_COMPONENTS → ASSEMBLING` atomically validates the full component stock issue. Without assembly, delivery validates the full stock issue on `PREPARING_COMPONENTS → SHIPPING`; pickup moves `PREPARING_COMPONENTS → READY_FOR_PICKUP` while retaining the full reservation.
- `ORD-009`: After assembly, route to `SHIPPING` for delivery or `READY_FOR_PICKUP` for pickup. The components were already issued on entry to `ASSEMBLING`; never issue them again.
- `ORD-010`: Admin moves `SHIPPING → COMPLETED` after successful delivery. Pickup moves `READY_FOR_PICKUP → COMPLETED` at physical handover; a non-assembled pickup validates its full stock issue in that same transaction, while an assembled pickup makes no second stock movement. Every COD completion must atomically satisfy `PAY-020`.
- `ORD-011`: Resolve `ON_HOLD` by reason. Payment exceptions may return to `CONFIRMED` or cancel. `PICKUP_EXPIRED` may return to `READY_FOR_PICKUP` or follow an accepted pickup-to-delivery amendment into `SHIPPING` after every payment and stock prerequisite succeeds.

## Cancellation

- `ORD-012`: A buyer may cancel while the Order is `PENDING_PAYMENT`, `PENDING_COD_CONFIRMATION`, or `CONFIRMED` and has not entered `PREPARING_COMPONENTS`.
- `ORD-013`: Cancellation releases reservations and coupon quota exactly once.
- `ORD-014`: If eligible prepaid money exists, cancellation creates a full manual refund in `REFUND_PENDING`; Payment becomes `REFUNDED` only after Admin records the completed refund transaction.
- `ORD-015`: From `PREPARING_COMPONENTS` onward, buyer self-cancellation is rejected.
- `ORD-016`: The MVP does not support partial fulfillment. Validate stock issue only when the whole order is ready.
- `ORD-017`: If stock was already issued, direct cancellation is forbidden. Admin must first validate a linked reverse stock move; this is an internal correction, not a customer-return feature.
- `ORD-021`: Admin may cancel from `PREPARING_COMPONENTS` or later only as an audited exception with a reason and only after satisfying `ORD-017`. A COD Custom Build deposit is forfeited on every such cancellation regardless of cause.

## Pickup, assembly, and delivery recovery

- `ORD-018`: `ASSEMBLING` is informational and manually controlled. No technician assignment, QC checklist, component-failure workflow, or manufacturing inventory is created.
- `ORD-019`: Shipping tracking and delivery recovery are updated manually by Admin. There is no carrier webhook, routing, lost-shipment workflow, or carrier-claim workflow in the MVP.
- `ORD-020`: Customer return, RMA, and warranty are outside the MVP. Completed orders cannot enter a return state.
- `ORD-022`: After 14 days in `READY_FOR_PICKUP`, move the Order to `ON_HOLD` with reason `PICKUP_EXPIRED` and send an email offering delivery for the configured fee. The Order remains on hold without an automatic cancellation deadline until Admin contacts the Customer.
- `ORD-023`: Changing an expired pickup to delivery requires a verified delivery address and an accepted `PICKUP_TO_DELIVERY` Order Amendment. Prepaid Orders must settle its supplemental QR charge before `SHIPPING`; COD Orders add the accepted charge to COD remaining.
- `ORD-024`: Admin moves `SHIPPING → DELIVERY_FAILED` after an unsuccessful attempt. Redelivery requires Customer confirmation, an accepted fee amendment when charged, and `redeliveryAttemptCount < 2` before the transition; each successful transition back to `SHIPPING` increments that count.
- `ORD-025`: If redelivery is not chosen or the limit is reached, move `DELIVERY_FAILED → RETURNING → RETURNED_TO_BRANCH`. The last transition requires physical receipt of the full SKU/serial set and a linked reverse stock move; only then may Admin cancel the Order.
- `ORD-026`: After return-to-branch cancellation, unpaid COD requires no refund; eligible prepaid money is fully refunded through `REFUND_PENDING`; a COD Custom Build deposit already past `PREPARING_COMPONENTS` remains forfeited.

## Acceptance checks

- An order without assembly service cannot enter `ASSEMBLING`.
- An Order cannot enter `SHIPPING` until every required stock line is issued and every accepted supplemental prepaid charge is paid.
- Replaying a transition command does not duplicate stock issue, refund, notification, or history.
- A buyer cannot cancel an order in `PREPARING_COMPONENTS`, `ASSEMBLING`, `SHIPPING`, or `COMPLETED`.
- Pickup checkout and `READY_FOR_PICKUP` do not require a delivery address; switching to delivery does.
- A failed delivery cannot restore on-hand until `RETURNED_TO_BRANCH` validates the linked reversal.
- A COD Order with outstanding money cannot enter `COMPLETED` for delivery or pickup.

