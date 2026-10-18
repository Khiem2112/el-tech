# Inventory and branch transfers

## Balance model

- `INV-001`: Track balances by SKU and Branch.
- `INV-002`: Maintain `onHand`, `reserved`, and `quarantineDamaged`; calculate `available = onHand − reserved − quarantineDamaged`.
- `INV-003`: Incoming and in-transit quantities come from open stock movements and are not available for sale.
- `INV-004`: No operation may make `onHand`, `reserved`, or `available` negative.
- `INV-005`: Do not edit balances directly. Derive every change from an immutable Inventory Transaction or validated Stock Move with source, destination, reference, quantity, actor, and timestamp.

## Reservation and issue

- `INV-006`: Reserve atomically for one fulfillment branch and every SKU/component required by the Order. All lines succeed or none do.
- `INV-007`: Reservation increases `reserved` but does not reduce `onHand`.
- `INV-008`: Validating a full outbound stock issue reduces `onHand` and releases the corresponding `reserved` quantity in one transaction.
- `INV-009`: Completing delivery does not change stock again.
- `INV-010`: Release reservation once on payment expiry or eligible cancellation.
- `INV-019`: For an Order with assembly, validate the full component issue on `PREPARING_COMPONENTS → ASSEMBLING`. For a delivery without assembly, issue on entry to `SHIPPING`. For a pickup without assembly, retain the reservation through `READY_FOR_PICKUP` and issue at physical handover on `COMPLETED`.
- `INV-020`: An assembled Order routed to `READY_FOR_PICKUP` has already issued its components. Pickup handover, delivery handoff, and successful completion must not issue them again.
- `INV-021`: `PICKUP_EXPIRED` preserves the current stock position indefinitely: an unassembled pickup stays fully reserved; an assembled pickup stays issued to its Order until a later valid handover, delivery, or audited reversal.
- `INV-022`: Delivery failure alone never restores stock. Confirming `RETURNED_TO_BRANCH` must atomically validate one linked reverse movement for the full SKU/serial set physically received; replaying it cannot restore stock twice.

## Serial tracking

- `INV-011`: Category/SKU controls whether serial is required.
- `INV-012`: Serial is globally unique for active inventory history and is captured on receipt for serial-tracked SKUs.
- `INV-013`: Every transfer and outbound issue moves or assigns the exact serial and preserves its branch/location and transaction history.
- `INV-014`: A duplicate serial blocks receipt validation.

## Internal branch transfer

- `TRF-001`: Internal transfer moves SKU/serial quantities between branches; it is not a sale or purchase.
- `TRF-002`: Supported states are `REQUESTED → IN_TRANSIT → RECEIVED`, with terminal `CANCELLED` allowed only before dispatch.
- `TRF-003`: Dispatch reduces source on-hand and records in-transit quantity. Receipt reduces in-transit and increases destination on-hand.
- `TRF-004`: The MVP has no approval, partial receipt, discrepancy, or loss-resolution workflow for transfers.
- `TRF-005`: When Admin confirms `RECEIVED`, the system trusts that the entire planned quantity arrived and applies the full movement. A physical mismatch is outside the system; do not invent `PARTIALLY_RECEIVED`.
- `TRF-006`: A transfer needed for an Order must reach `RECEIVED` before the destination branch can reserve that quantity.

## Virtual PC availability

- `INV-015`: Derive the number of buildable PC bundles at a branch from the minimum whole number of each component's available quantity divided by its BOM requirement.
- `INV-016`: Reserving a PC creates component-level reservations; the virtual bundle itself has no stock balance or serial.

## Cost

- `INV-017`: Use weighted-average cost per SKU and Branch.
- `INV-018`: Supplier receipts update destination average cost. Internal transfers carry source cost into the destination average. Reversals reference the original movement.

## Acceptance checks

- Concurrent reserve attempts for the last unit have one winner and never produce negative available stock.
- Replaying issue or transfer receipt with the same idempotency key does not move stock twice.
- A transfer cannot be received before it is in transit, and a received transfer cannot be canceled.
- A non-assembled pickup no-show does not reduce on-hand, but its reservation continues to reduce available stock.
- A delivery failure and redelivery attempt do not change stock; only a validated return-to-branch reversal does.

