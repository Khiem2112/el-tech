# Reviews and notifications

## Verified-purchase review

- `REV-001`: The MVP has one Review entity containing rating and text. There is no separate product comment, Q&A, or nested discussion feature.
- `REV-002`: Only the Customer owning an Order Line from a `COMPLETED` Order may create its Review.
- `REV-003`: A Review references Product Template, purchased SKU, Order, and Order Line so verified-purchase status remains auditable.
- `REV-004`: Allow at most one active Review per Order Line.
- `REV-005`: Editing a Review preserves edit history. Admin may hide a Review only with a reason and audit entry.
- `REV-006`: Cancelled, pending, preparing, assembling, or shipping Orders do not grant review eligibility.

## Notifications

- `NOT-001`: Support in-app notifications plus email/SMS delivery attempts for configured events.
- `NOT-002`: MVP events include order submitted; payment/deposit succeeded, failed, under review, refund pending, or refunded; order confirmed, canceled, preparing, assembling, ready for pickup, pickup expired, shipping, delivery failed, redelivery scheduled, returning, returned to branch, and completed.
- `NOT-003`: Do not emit customer-return/RMA, lost-shipment/carrier-claim, or warranty events because those workflows are outside scope.
- `NOT-004`: Generate one logical Notification per recipient, event type, and domain-event ID. Retries must not create duplicate in-app notifications.
- `NOT-005`: Log each channel attempt, outcome, provider reference, retry count, and last error without changing the domain transaction outcome after commit.
- `NOT-006`: Trigger notifications from committed domain events or an outbox-equivalent mechanism so rolled-back orders, payments, or stock moves never notify customers.
- `NOT-007`: An accountless Customer reads in-app notifications only through the authorized OTP/magic-link guest session defined by `CUS-011` through `CUS-014`; channel retries never extend that session.

## Acceptance checks

- A Customer cannot review the same Order Line twice.
- A different Customer cannot review another Customer's purchase.
- Retrying an email/SMS failure does not duplicate the in-app notification or domain event.
- Pickup expiry sends the delivery offer once per expiry event even when an email retry occurs.

