-- Don dep so cai lien quan den transfer, reversal va supplier return
DELETE FROM "stock_ledger_entry"
WHERE "entry_type"::text IN ('TRANSFER_IN', 'TRANSFER_OUT', 'SUPPLIER_RETURN', 'REVERSAL');

-- Don dep serial movement lien quan den in_transit va returned_to_supplier
DELETE FROM "serial_movement"
WHERE "resulting_status"::text IN ('IN_TRANSIT', 'RETURNED_TO_SUPPLIER');

-- Ngat lien ket tu tham chieu reversal tren stock_move va stock_move_line
UPDATE "stock_move" SET "reversal_of_move_id" = NULL WHERE "reversal_of_move_id" IS NOT NULL;
UPDATE "stock_move_line" SET "original_move_line_id" = NULL WHERE "original_move_line_id" IS NOT NULL;

-- Xoa cac dong stock_move_line thuoc cac phieu chuyen kho va doi tra
DELETE FROM "stock_move_line"
WHERE "stock_move_id" IN (
    SELECT "id" FROM "stock_move"
    WHERE "move_type"::text IN ('INTERNAL_TRANSFER', 'ORDER_REVERSAL', 'SUPPLIER_RETURN', 'INTERNAL_CORRECTION')
);

-- Xoa cac phieu stock_move khong con hop le
DELETE FROM "stock_move"
WHERE "move_type"::text IN ('INTERNAL_TRANSFER', 'ORDER_REVERSAL', 'SUPPLIER_RETURN', 'INTERNAL_CORRECTION');

-- Chuyen stock_ledger_entry sang ban ghi giu lai neu co sku_id bi duplicate
WITH ranked_stock AS (
    SELECT
        id,
        sku_id,
        ROW_NUMBER() OVER (PARTITION BY sku_id ORDER BY created_at ASC) AS rn
    FROM "stock_quant"
),
first_records AS (
    SELECT id, sku_id FROM ranked_stock WHERE rn = 1
),
extra_records AS (
    SELECT r.id AS old_id, f.id AS keep_id
    FROM ranked_stock r
    JOIN first_records f ON f.sku_id = r.sku_id
    WHERE r.rn > 1
)
UPDATE "stock_ledger_entry" sle
SET "stock_quant_id" = e.keep_id
FROM extra_records e
WHERE sle.stock_quant_id = e.old_id;

-- Cong don tong ton kho vao ban ghi chinh
WITH ranked_stock AS (
    SELECT
        id,
        ROW_NUMBER() OVER (PARTITION BY sku_id ORDER BY created_at ASC) AS rn,
        SUM(on_hand) OVER (PARTITION BY sku_id) AS total_on_hand,
        SUM(reserved) OVER (PARTITION BY sku_id) AS total_reserved,
        SUM(quarantine_damaged) OVER (PARTITION BY sku_id) AS total_quarantine,
        AVG(weighted_average_cost) OVER (PARTITION BY sku_id) AS avg_wac
    FROM "stock_quant"
)
UPDATE "stock_quant" sq
SET
    on_hand = r.total_on_hand,
    reserved = r.total_reserved,
    quarantine_damaged = r.total_quarantine,
    weighted_average_cost = r.avg_wac
FROM ranked_stock r
WHERE sq.id = r.id AND r.rn = 1;

-- Xoa cac ban ghi trung lap neu co
WITH ranked_stock AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY sku_id ORDER BY created_at ASC) AS rn
    FROM "stock_quant"
)
DELETE FROM "stock_quant"
WHERE id IN (SELECT id FROM ranked_stock WHERE rn > 1);

-- Xoa rang buoc va index da chi nhanh cu tren stock_quant
ALTER TABLE "stock_quant" DROP CONSTRAINT IF EXISTS "stock_quant_branch_id_fkey";
ALTER TABLE "stock_quant" DROP CONSTRAINT IF EXISTS "stock_quant_branch_id_sku_id_key";
DROP INDEX IF EXISTS "stock_quant_branch_id_is_active_idx";

-- Xoa cot branch_id khoi stock_quant
ALTER TABLE "stock_quant" DROP COLUMN IF EXISTS "branch_id";

-- Tao unique constraint cho sku_id tren stock_quant
ALTER TABLE "stock_quant" ADD CONSTRAINT "stock_quant_sku_id_key" UNIQUE ("sku_id");

-- Xoa khoa ngoai va index lien quan den chi nhanh va reversal tren stock_move
ALTER TABLE "stock_move" DROP CONSTRAINT IF EXISTS "stock_move_source_branch_id_fkey";
ALTER TABLE "stock_move" DROP CONSTRAINT IF EXISTS "stock_move_destination_branch_id_fkey";
ALTER TABLE "stock_move" DROP CONSTRAINT IF EXISTS "stock_move_reversal_of_move_id_fkey";
DROP INDEX IF EXISTS "stock_move_source_branch_id_status_idx";
DROP INDEX IF EXISTS "stock_move_destination_branch_id_status_idx";
DROP INDEX IF EXISTS "stock_move_reversal_of_move_id_idx";

-- Xoa cac cot chi nhanh va reversal tren stock_move
ALTER TABLE "stock_move" DROP COLUMN IF EXISTS "source_branch_id";
ALTER TABLE "stock_move" DROP COLUMN IF EXISTS "destination_branch_id";
ALTER TABLE "stock_move" DROP COLUMN IF EXISTS "reversal_of_move_id";

-- Xoa khoa ngoai va index reversal cua stock_move_line
ALTER TABLE "stock_move_line" DROP CONSTRAINT IF EXISTS "stock_move_line_original_move_line_id_fkey";
DROP INDEX IF EXISTS "stock_move_line_original_move_line_id_idx";

-- Xoa cot original_move_line_id tren stock_move_line
ALTER TABLE "stock_move_line" DROP COLUMN IF EXISTS "original_move_line_id";

-- Xoa khoa ngoai va index chi nhanh cua serial_unit
ALTER TABLE "serial_unit" DROP CONSTRAINT IF EXISTS "serial_unit_current_branch_id_fkey";
DROP INDEX IF EXISTS "serial_unit_current_branch_id_status_idx";

-- Xoa cot current_branch_id tren serial_unit
ALTER TABLE "serial_unit" DROP COLUMN IF EXISTS "current_branch_id";

-- Xoa cot chuyen chi nhanh tren serial_movement
ALTER TABLE "serial_movement" DROP COLUMN IF EXISTS "from_branch_id";
ALTER TABLE "serial_movement" DROP COLUMN IF EXISTS "to_branch_id";

-- Cap nhat enum StockMoveType
CREATE TYPE "StockMoveType_new" AS ENUM ('PURCHASE_RECEIPT', 'ORDER_ISSUE');
ALTER TABLE "stock_move" ALTER COLUMN "move_type" TYPE "StockMoveType_new" USING ("move_type"::text::"StockMoveType_new");
DROP TYPE "StockMoveType";
ALTER TYPE "StockMoveType_new" RENAME TO "StockMoveType";

-- Cap nhat enum StockMoveStatus
CREATE TYPE "StockMoveStatus_new" AS ENUM ('DRAFT', 'RESERVED', 'VALIDATED', 'CANCELLED');
ALTER TABLE "stock_move" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "stock_move" ALTER COLUMN "status" TYPE "StockMoveStatus_new" USING ("status"::text::"StockMoveStatus_new");
ALTER TABLE "stock_move" ALTER COLUMN "status" SET DEFAULT 'DRAFT'::"StockMoveStatus_new";
DROP TYPE "StockMoveStatus";
ALTER TYPE "StockMoveStatus_new" RENAME TO "StockMoveStatus";

-- Cap nhat enum StockLedgerEntryType
CREATE TYPE "StockLedgerEntryType_new" AS ENUM ('RESERVE', 'RELEASE_RESERVATION', 'PURCHASE_RECEIPT', 'ORDER_ISSUE', 'QUARANTINE', 'RELEASE_QUARANTINE');
ALTER TABLE "stock_ledger_entry" ALTER COLUMN "entry_type" TYPE "StockLedgerEntryType_new" USING ("entry_type"::text::"StockLedgerEntryType_new");
DROP TYPE "StockLedgerEntryType";
ALTER TYPE "StockLedgerEntryType_new" RENAME TO "StockLedgerEntryType";

-- Cap nhat enum SerialStatus
CREATE TYPE "SerialStatus_new" AS ENUM ('AVAILABLE', 'RESERVED', 'ISSUED', 'QUARANTINED');
ALTER TABLE "serial_unit" ALTER COLUMN "status" TYPE "SerialStatus_new" USING ("status"::text::"SerialStatus_new");
ALTER TABLE "serial_movement" ALTER COLUMN "resulting_status" TYPE "SerialStatus_new" USING ("resulting_status"::text::"SerialStatus_new");
DROP TYPE "SerialStatus";
ALTER TYPE "SerialStatus_new" RENAME TO "SerialStatus";

-- Cap nhat enum OrderStatus (loai bo RETURNING va RETURNED_TO_BRANCH)
CREATE TYPE "OrderStatus_new" AS ENUM ('PENDING_PAYMENT', 'PENDING_COD_CONFIRMATION', 'CONFIRMED', 'PREPARING_COMPONENTS', 'ASSEMBLING', 'READY_FOR_PICKUP', 'SHIPPING', 'DELIVERY_FAILED', 'COMPLETED', 'ON_HOLD', 'CANCELLED');
ALTER TABLE "order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TABLE "order_status_history" ALTER COLUMN "previous_status" TYPE "OrderStatus_new" USING ("previous_status"::text::"OrderStatus_new");
ALTER TABLE "order_status_history" ALTER COLUMN "next_status" TYPE "OrderStatus_new" USING ("next_status"::text::"OrderStatus_new");
DROP TYPE "OrderStatus";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
