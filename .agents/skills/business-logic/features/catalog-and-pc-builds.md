# Catalog and PC builds

## Product hierarchy

- `CAT-001`: Product Category is hierarchical and defines the metadata schema for technical specifications.
- `CAT-002`: Product Template represents one manufacturer-specific commercial model, such as `ASUS Dual GeForce RTX 5060 Ti OC 16GB`.
- `CAT-003`: Product Variant represents a sellable combination of genuine variation attributes of that template. Each active variant is one SKU with its own unique SKU code and optional unique barcode.
- `CAT-004`: Manufacturer, chipset/family, model, and category are common product data used for filters and comparisons; manufacturer is not automatically a variant dimension.
- `CAT-005`: Inventory, reservation, serial assignment, order lines, and stock movements always reference the sellable Variant/SKU, never only the Template.

## Dynamic specifications

- `CAT-006`: Category defines each specification field's stable key, label, data type, unit, required flag, filterable flag, comparable flag, allowed values, and active/deprecated status.
- `CAT-007`: Product Template stores common specification values as validated JSON. Variant stores only approved variant values or overrides.
- `CAT-008`: Core relational data remains in typed columns: category, brand/manufacturer, SKU, barcode, price, lifecycle state, and foreign keys. Do not hide these inside JSON.
- `CAT-009`: A specification definition already used by products cannot be hard-deleted or changed to an incompatible type. Deprecate it and preserve historical values.
- `CAT-010`: A Template/Variant can become `ACTIVE` only when every Category-required field is valid and it has at least one active sellable SKU.

## SKU lifecycle

- `CAT-011`: Valid lifecycle is `DRAFT → ACTIVE → PAUSED → DISCONTINUED`.
- `CAT-012`: Only `ACTIVE` SKU can be newly added to cart or a PC BOM.
- `CAT-013`: `PAUSED` or `DISCONTINUED` SKU remains visible through existing orders and snapshots but cannot be newly purchased.
- `CAT-014`: Use soft deactivation; never hard-delete a SKU referenced by a transaction.

## Prebuilt PC and Custom Build

- `PCB-001`: Both a prebuilt-PC offer and a Custom Build are virtual BOM containers. Neither has independent finished-goods inventory in the MVP.
- `PCB-002`: Availability of a PC BOM at a branch is derived from every component SKU and required quantity at that branch.
- `PCB-003`: Reserving or issuing a PC order reserves or issues its component SKU lines. Never decrement an invented finished-PC balance.
- `PCB-004`: A prebuilt-PC offer has an admin-maintained BOM and presentation identity. Replacing any component creates a Custom Build snapshot and never mutates the source offer.
- `PCB-005`: At order creation, snapshot component SKU, name, quantity, unit price, discount allocation, service selection, and BOM grouping.
- `PCB-006`: The MVP does not calculate hardware compatibility, PSU capacity, BIOS support, or component cardinality. Selection warnings may be stored as advisory notes but never block checkout.
- `PCB-007`: Saved/shared builds and automated assembly/QC records are outside scope.
- `PCB-008`: `ASSEMBLING` is only an Order state manually set by Admin when assembly service was selected; it does not create a manufacturing order or finished SKU.

## Acceptance checks

- Changing a Template's specifications does not alter a PC BOM snapshot on an existing order.
- A virtual PC cannot be reserved at a branch unless every component quantity is atomically reservable there.
- Adding a discontinued component to a new PC fails even when an old build snapshot still displays it.

