# Customer identity

## Invariants

- `CUS-001`: Browsing, searching, filtering, cart use, and PC configuration do not require login.
- `CUS-002`: Checkout requires verification of both email and phone before order submission.
- `CUS-003`: Email is independently unique across Customer profiles. Phone is independently unique across Customer profiles.
- `CUS-004`: If the verified email resolves to one Customer and the verified phone resolves to another, block checkout. Do not create a third Customer and do not auto-merge.
- `CUS-005`: Create or resolve the Customer in the same transaction that submits the first order, even when QR payment is still pending.
- `CUS-006`: The order stores an immutable contact snapshot. Updating the Customer later does not rewrite old orders.
- `CUS-007`: A Customer business profile may exist without a Better-Auth User. Do not require account creation for guest checkout.

## Profile changes and merge

- `CUS-008`: Changing email or phone requires verification of the old and new contact values.
- `CUS-009`: Only Admin can merge Customer profiles. A merge preserves all orders, coupon usage, reviews, and audit history.
- `CUS-010`: Every merge or identity change records actor, timestamp, old values, new values, and reason.

## Guest order access

- `CUS-011`: Accountless order lookup requires order code plus an OTP sent to the order's verified email or phone. A single-use magic link may provide the same entry point but does not replace ownership checks.
- `CUS-012`: Successful verification creates a time-limited guest session scoped to the resolved Customer and authorized Order. It must not grant access to another Customer's orders, notifications, or reviews.
- `CUS-013`: Creating a Review from a guest session still requires the Customer, completed Order, and Order Line checks in `REV-002` through `REV-004`.
- `CUS-014`: In-app notifications for an accountless Customer are visible only inside an authorized guest session. Email and SMS remain the durable notification channels outside that session.

## Order submission resolution

Resolve the verified identity in this order:

1. Neither email nor phone exists: create one Customer.
2. Both resolve to the same Customer: reuse it.
3. Exactly one exists and the other value is unused: attach the verified unused value only through the approved profile-update flow; do not silently change identity during checkout.
4. They resolve to different Customers: return `CUSTOMER_IDENTITY_CONFLICT` and require Admin support.

## Acceptance checks

- Two concurrent first orders with the same email or phone cannot create duplicate Customers.
- An unpaid submitted QR order already references a Customer and retains its contact snapshot after payment expiry.
- An identity conflict never merges records or bypasses verification.
- Knowing only an order code cannot reveal order details or grant review permission.
- A used or expired magic link cannot create another guest session.

