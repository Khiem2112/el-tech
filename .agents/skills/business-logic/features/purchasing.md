# Purchasing and supplier returns

## Supplier and purchase order

- `PUR-001`: A Purchase Order belongs to one Supplier and exactly one receiving Branch.
- `PUR-002`: Supported PO states are `DRAFT → CONFIRMED → RECEIVED → CLOSED`, with terminal `CANCELLED` before receipt.
- `PUR-003`: The MVP has no PO approval workflow. Admin can create and confirm.
- `PUR-004`: A PO supports exactly one receipt. Partial receipt and backorder are outside scope.
- `PUR-005`: A PO can be edited only while `DRAFT`; confirmation freezes supplier, branch, lines, quantities, and agreed unit costs used by the receipt.

## Receipt validation

- `PUR-006`: Receipt validation must match every confirmed PO line and quantity exactly.
- `PUR-007`: Missing, excess, or wrong SKU blocks validation. Admin must correct a Draft PO before confirmation or reject the physical receipt; the system does not silently rewrite a confirmed PO.
- `PUR-008`: Every serial-required unit must have a unique serial. A missing or duplicate serial blocks the whole receipt.
- `PUR-009`: Successful validation atomically records the inbound stock move, increases branch on-hand, records serials, updates weighted-average cost, and moves PO to `RECEIVED`.
- `PUR-010`: Closing a received PO is administrative and does not move stock again.

## Supplier return

- `PUR-011`: Supplier Return can be created only from a validated receipt and must reference the original inbound movement.
- `PUR-012`: Select SKU, quantity, and required serials no greater than the remaining returnable quantity.
- `PUR-013`: Validating Supplier Return creates a reverse stock move and decreases on-hand or quarantine for the selected Branch. Never edit the original receipt.
- `PUR-014`: The MVP does not manage supplier credit notes, payables, replacement promises, or accounting consequences.

## Confirmed PO shortage

- `PUR-015`: If a Supplier delivers fewer units than a confirmed PO, do not edit the confirmed lines and do not partially receive them. Cancel the unreceived PO with reason `SUPPLIER_SHORT_SHIPMENT` and clone the actual accepted quantities into a new PO linked by `supersedesPurchaseOrderId`.
- `PUR-016`: Confirm and validate the replacement PO through the normal exact-receipt rules. Any later delivery of the missing quantity requires another PO; it never reopens the canceled PO.

## Acceptance checks

- A receipt mismatch changes no PO state, inventory, serial, or average cost.
- Replaying receipt validation cannot create another inbound movement.
- The sum of supplier-return quantities cannot exceed the received quantity net of prior returns.
- A supplier shortage preserves the canceled confirmed PO and its replacement link; no historical quantity or agreed unit cost is overwritten.

