-- A newly verified account intentionally receives its own Customer profile.
-- Historical guest profiles are never automatically linked, even with matching contacts.
DROP INDEX "customer_email_key";
DROP INDEX "customer_phone_key";

CREATE INDEX "customer_email_idx" ON "customer"("email");
CREATE INDEX "customer_phone_idx" ON "customer"("phone");
