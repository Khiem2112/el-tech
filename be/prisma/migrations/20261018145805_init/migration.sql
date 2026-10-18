-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('EMAIL', 'PHONE');

-- CreateEnum
CREATE TYPE "VerificationPurpose" AS ENUM ('CHECKOUT', 'PROFILE_CHANGE_OLD', 'PROFILE_CHANGE_NEW', 'GUEST_ORDER_ACCESS');

-- CreateEnum
CREATE TYPE "ProductLifecycle" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "SalesLineType" AS ENUM ('SKU', 'SERVICE');

-- CreateEnum
CREATE TYPE "PcBuildType" AS ENUM ('PREBUILT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('ASSEMBLY');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- CreateEnum
CREATE TYPE "CouponTargetRule" AS ENUM ('INCLUDE', 'EXCLUDE');

-- CreateEnum
CREATE TYPE "CouponRedemptionStatus" AS ENUM ('RESERVED', 'CONSUMED', 'RELEASED');

-- CreateEnum
CREATE TYPE "FulfillmentMethod" AS ENUM ('PICKUP', 'DELIVERY');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('QR', 'COD');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING_PAYMENT', 'PENDING_COD_CONFIRMATION', 'CONFIRMED', 'PREPARING_COMPONENTS', 'ASSEMBLING', 'READY_FOR_PICKUP', 'SHIPPING', 'DELIVERY_FAILED', 'RETURNING', 'RETURNED_TO_BRANCH', 'COMPLETED', 'ON_HOLD', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OrderHoldReason" AS ENUM ('PAYMENT_REVIEW', 'PAID_BUT_OUT_OF_STOCK', 'PICKUP_EXPIRED');

-- CreateEnum
CREATE TYPE "OrderAmendmentType" AS ENUM ('PICKUP_TO_DELIVERY', 'REDELIVERY');

-- CreateEnum
CREATE TYPE "OrderAmendmentStatus" AS ENUM ('PENDING_ACCEPTANCE', 'ACCEPTED', 'PAYMENT_PENDING', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('CUSTOMER', 'ADMIN', 'SYSTEM', 'PAYMENT_PROVIDER');

-- CreateEnum
CREATE TYPE "PaymentState" AS ENUM ('UNPAID', 'PENDING', 'PARTIALLY_PAID', 'PAID', 'FAILED', 'EXPIRED', 'REFUND_PENDING', 'REFUNDED');

-- CreateEnum
CREATE TYPE "DepositDisposition" AS ENUM ('HELD', 'APPLIED', 'REFUND_PENDING', 'REFUNDED', 'FORFEITED');

-- CreateEnum
CREATE TYPE "PaymentChargeType" AS ENUM ('INITIAL_ORDER', 'CUSTOM_BUILD_DEPOSIT', 'AMENDMENT');

-- CreateEnum
CREATE TYPE "PaymentChargeStatus" AS ENUM ('PENDING', 'PAID', 'REVIEW', 'FAILED', 'EXPIRED', 'REFUND_PENDING', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentTransactionResult" AS ENUM ('EXACT_MATCH', 'UNDERPAID', 'OVERPAID', 'AMBIGUOUS_REFERENCE', 'LATE_EXACT', 'LATE_INVALID', 'DUPLICATE');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED');

-- CreateEnum
CREATE TYPE "StockMoveType" AS ENUM ('PURCHASE_RECEIPT', 'ORDER_ISSUE', 'ORDER_REVERSAL', 'INTERNAL_TRANSFER', 'SUPPLIER_RETURN', 'INTERNAL_CORRECTION');

-- CreateEnum
CREATE TYPE "StockMoveStatus" AS ENUM ('DRAFT', 'RESERVED', 'IN_TRANSIT', 'VALIDATED', 'REVERSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StockLedgerEntryType" AS ENUM ('RESERVE', 'RELEASE_RESERVATION', 'PURCHASE_RECEIPT', 'ORDER_ISSUE', 'TRANSFER_OUT', 'TRANSFER_IN', 'SUPPLIER_RETURN', 'QUARANTINE', 'RELEASE_QUARANTINE', 'REVERSAL');

-- CreateEnum
CREATE TYPE "SerialStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'ISSUED', 'IN_TRANSIT', 'QUARANTINED', 'RETURNED_TO_SUPPLIER');

-- CreateEnum
CREATE TYPE "PurchaseOrderStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'RECEIVED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'SMS');

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "access_token_expires_at" TIMESTAMPTZ(3),
    "refresh_token_expires_at" TIMESTAMPTZ(3),
    "scope" TEXT,
    "id_token" TEXT,
    "password" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" UUID NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "customer_id" UUID,
    "order_id" UUID,
    "purpose" "VerificationPurpose",
    "contact_type" "ContactType",
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "consumed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "merged_into_customer_id" UUID,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email_verified_at" TIMESTAMPTZ(3) NOT NULL,
    "phone_verified_at" TIMESTAMPTZ(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category" (
    "id" SERIAL NOT NULL,
    "parent_id" INTEGER,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "specification_schema" JSONB NOT NULL DEFAULT '[]',
    "specification_schema_version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brand" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_template" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "brand_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "chipset_family" TEXT,
    "description" TEXT,
    "common_spec" JSONB NOT NULL DEFAULT '{}',
    "media" JSONB NOT NULL DEFAULT '[]',
    "lifecycle_state" "ProductLifecycle" NOT NULL DEFAULT 'DRAFT',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "product_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variant" (
    "id" SERIAL NOT NULL,
    "product_template_id" INTEGER NOT NULL,
    "sku" TEXT NOT NULL,
    "barcode" TEXT,
    "variation_label" TEXT,
    "variant_spec" JSONB NOT NULL DEFAULT '{}',
    "serial_required" BOOLEAN NOT NULL DEFAULT false,
    "selling_price" DECIMAL(12,2) NOT NULL,
    "lifecycle_state" "ProductLifecycle" NOT NULL DEFAULT 'DRAFT',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "product_variant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pc_bundle" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "lifecycle_state" "ProductLifecycle" NOT NULL DEFAULT 'DRAFT',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "pc_bundle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pc_bundle_item" (
    "id" UUID NOT NULL,
    "pc_bundle_id" INTEGER NOT NULL,
    "sku_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "pc_bundle_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart" (
    "id" UUID NOT NULL,
    "customer_id" UUID,
    "opaque_token" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_item" (
    "id" UUID NOT NULL,
    "cart_id" UUID NOT NULL,
    "sku_id" INTEGER,
    "source_pc_bundle_id" INTEGER,
    "line_type" "SalesLineType" NOT NULL DEFAULT 'SKU',
    "service_type" "ServiceType",
    "pc_build_key" UUID,
    "pc_build_name" TEXT,
    "pc_build_type" "PcBuildType",
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "advisory_notes" JSONB NOT NULL DEFAULT '[]',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "cart_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branch" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "opening_hour" JSONB NOT NULL DEFAULT '{}',
    "delivery_priority" INTEGER NOT NULL DEFAULT 0,
    "delivery_area_codes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_promotion" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "discount_type" "DiscountType" NOT NULL,
    "discount_value" DECIMAL(12,2) NOT NULL,
    "is_exclusive" BOOLEAN NOT NULL DEFAULT false,
    "effective_from" TIMESTAMPTZ(3) NOT NULL,
    "effective_to" TIMESTAMPTZ(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "product_promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion_sku" (
    "id" UUID NOT NULL,
    "promotion_id" UUID NOT NULL,
    "sku_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promotion_sku_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion_category" (
    "id" UUID NOT NULL,
    "promotion_id" UUID NOT NULL,
    "category_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promotion_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon" (
    "id" UUID NOT NULL,
    "branch_id" INTEGER,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "discount_type" "DiscountType" NOT NULL,
    "discount_value" DECIMAL(12,2) NOT NULL,
    "minimum_subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "maximum_discount" DECIMAL(12,2),
    "required_payment_method" "PaymentMethod",
    "global_quota" INTEGER,
    "per_customer_quota" INTEGER,
    "effective_from" TIMESTAMPTZ(3) NOT NULL,
    "effective_to" TIMESTAMPTZ(3) NOT NULL,
    "customer_eligibility" JSONB NOT NULL DEFAULT '{}',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon_sku_rule" (
    "id" UUID NOT NULL,
    "coupon_id" UUID NOT NULL,
    "sku_id" INTEGER NOT NULL,
    "rule" "CouponTargetRule" NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupon_sku_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon_category_rule" (
    "id" UUID NOT NULL,
    "coupon_id" UUID NOT NULL,
    "category_id" INTEGER NOT NULL,
    "rule" "CouponTargetRule" NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupon_category_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_fee_config" (
    "id" UUID NOT NULL,
    "fixed_fee" DECIMAL(12,2) NOT NULL,
    "free_shipping_threshold" DECIMAL(12,2) NOT NULL,
    "effective_from" TIMESTAMPTZ(3) NOT NULL,
    "effective_to" TIMESTAMPTZ(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "delivery_fee_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "customer_id" UUID NOT NULL,
    "fulfillment_branch_id" INTEGER NOT NULL,
    "delivery_fee_config_id" UUID,
    "fulfillment_method" "FulfillmentMethod" NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "hold_reason" "OrderHoldReason",
    "cancellation_reason" TEXT,
    "redelivery_attempt_count" INTEGER NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "product_discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "coupon_discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "shipping_fee" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "rounding_adjustment" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "grand_total" DECIMAL(12,2) NOT NULL,
    "receiver_name" TEXT NOT NULL,
    "receiver_email" TEXT NOT NULL,
    "receiver_phone" TEXT NOT NULL,
    "receiver_email_verified_at" TIMESTAMPTZ(3) NOT NULL,
    "receiver_phone_verified_at" TIMESTAMPTZ(3) NOT NULL,
    "delivery_address_snapshot" JSONB,
    "branch_snapshot" JSONB NOT NULL,
    "pricing_snapshot" JSONB NOT NULL,
    "submitted_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmed_at" TIMESTAMPTZ(3),
    "completed_at" TIMESTAMPTZ(3),
    "cancelled_at" TIMESTAMPTZ(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_line" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "sku_id" INTEGER,
    "source_pc_bundle_id" INTEGER,
    "line_type" "SalesLineType" NOT NULL DEFAULT 'SKU',
    "service_type" "ServiceType",
    "pc_build_key" UUID,
    "pc_build_name_snapshot" TEXT,
    "pc_build_type_snapshot" "PcBuildType",
    "sku_snapshot" TEXT,
    "name_snapshot" TEXT NOT NULL,
    "spec_snapshot" JSONB NOT NULL DEFAULT '{}',
    "tax_snapshot" JSONB NOT NULL DEFAULT '{}',
    "promotion_snapshots" JSONB NOT NULL DEFAULT '[]',
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "product_discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "coupon_discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "net_amount" DECIMAL(12,2) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon_redemption" (
    "id" UUID NOT NULL,
    "coupon_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "status" "CouponRedemptionStatus" NOT NULL,
    "reserved_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consumed_at" TIMESTAMPTZ(3),
    "released_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "coupon_redemption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_amendment" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "delivery_fee_config_id" UUID NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "type" "OrderAmendmentType" NOT NULL,
    "status" "OrderAmendmentStatus" NOT NULL,
    "fee" DECIMAL(12,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "address_snapshot" JSONB,
    "rule_snapshot" JSONB NOT NULL,
    "acceptance_channel" "ContactType",
    "accepted_by_value" TEXT,
    "accepted_at" TIMESTAMPTZ(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "order_amendment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_status_history" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "previous_status" "OrderStatus" NOT NULL,
    "next_status" "OrderStatus" NOT NULL,
    "reason" TEXT,
    "actor_type" "ActorType" NOT NULL,
    "actor_id" TEXT,
    "idempotency_key" TEXT NOT NULL,
    "occurred_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "state" "PaymentState" NOT NULL DEFAULT 'UNPAID',
    "method" "PaymentMethod" NOT NULL,
    "deposit_disposition" "DepositDisposition",
    "deposit_required" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_received" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "cod_remaining" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_charge" (
    "id" UUID NOT NULL,
    "payment_id" UUID NOT NULL,
    "order_amendment_id" UUID,
    "idempotency_key" TEXT NOT NULL,
    "charge_type" "PaymentChargeType" NOT NULL,
    "provider_reference" TEXT NOT NULL,
    "expected_amount" DECIMAL(12,2) NOT NULL,
    "status" "PaymentChargeStatus" NOT NULL DEFAULT 'PENDING',
    "expires_at" TIMESTAMPTZ(3),
    "review_deadline_at" TIMESTAMPTZ(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "payment_charge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_transaction" (
    "id" UUID NOT NULL,
    "payment_charge_id" UUID NOT NULL,
    "provider_transaction_id" TEXT NOT NULL,
    "received_amount" DECIMAL(12,2) NOT NULL,
    "normalized_result" "PaymentTransactionResult" NOT NULL,
    "occurred_at" TIMESTAMPTZ(3) NOT NULL,
    "raw_payload" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refund" (
    "id" UUID NOT NULL,
    "payment_id" UUID NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "transaction_reference" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "RefundStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT NOT NULL,
    "occurred_at" TIMESTAMPTZ(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "refund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cod_collection" (
    "id" UUID NOT NULL,
    "payment_id" UUID NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "actor_id" TEXT NOT NULL,
    "occurred_at" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cod_collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_quant" (
    "id" UUID NOT NULL,
    "branch_id" INTEGER NOT NULL,
    "sku_id" INTEGER NOT NULL,
    "on_hand" INTEGER NOT NULL DEFAULT 0,
    "reserved" INTEGER NOT NULL DEFAULT 0,
    "quarantine_damaged" INTEGER NOT NULL DEFAULT 0,
    "weighted_average_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "stock_quant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_move" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "source_branch_id" INTEGER,
    "destination_branch_id" INTEGER,
    "order_id" UUID,
    "purchase_order_id" UUID,
    "reversal_of_move_id" UUID,
    "idempotency_key" TEXT NOT NULL,
    "move_type" "StockMoveType" NOT NULL,
    "status" "StockMoveStatus" NOT NULL DEFAULT 'DRAFT',
    "reason" TEXT,
    "expires_at" TIMESTAMPTZ(3),
    "reserved_at" TIMESTAMPTZ(3),
    "dispatched_at" TIMESTAMPTZ(3),
    "validated_at" TIMESTAMPTZ(3),
    "cancelled_at" TIMESTAMPTZ(3),
    "dispatched_by_id" UUID,
    "validated_by_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "stock_move_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_move_line" (
    "id" UUID NOT NULL,
    "stock_move_id" UUID NOT NULL,
    "sku_id" INTEGER NOT NULL,
    "original_move_line_id" UUID,
    "quantity" INTEGER NOT NULL,
    "unit_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_move_line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_ledger_entry" (
    "id" UUID NOT NULL,
    "stock_quant_id" UUID NOT NULL,
    "stock_move_line_id" UUID NOT NULL,
    "entry_type" "StockLedgerEntryType" NOT NULL,
    "delta_on_hand" INTEGER NOT NULL DEFAULT 0,
    "delta_reserved" INTEGER NOT NULL DEFAULT 0,
    "delta_quarantine" INTEGER NOT NULL DEFAULT 0,
    "on_hand_after" INTEGER NOT NULL,
    "reserved_after" INTEGER NOT NULL,
    "quarantine_after" INTEGER NOT NULL,
    "actor_type" "ActorType" NOT NULL,
    "actor_id" TEXT,
    "occurred_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_ledger_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "serial_unit" (
    "id" UUID NOT NULL,
    "sku_id" INTEGER NOT NULL,
    "current_branch_id" INTEGER,
    "origin_stock_move_line_id" UUID NOT NULL,
    "serial_number" TEXT NOT NULL,
    "status" "SerialStatus" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "serial_unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "serial_movement" (
    "id" UUID NOT NULL,
    "serial_unit_id" UUID NOT NULL,
    "stock_move_line_id" UUID NOT NULL,
    "from_branch_id" INTEGER,
    "to_branch_id" INTEGER,
    "resulting_status" "SerialStatus" NOT NULL,
    "occurred_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "serial_movement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "contact_name" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "supplier_id" INTEGER NOT NULL,
    "receiving_branch_id" INTEGER NOT NULL,
    "supersedes_purchase_order_id" UUID,
    "status" "PurchaseOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "cancellation_reason" TEXT,
    "note" TEXT,
    "confirmed_at" TIMESTAMPTZ(3),
    "received_at" TIMESTAMPTZ(3),
    "closed_at" TIMESTAMPTZ(3),
    "cancelled_at" TIMESTAMPTZ(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "purchase_order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order_line" (
    "id" UUID NOT NULL,
    "purchase_order_id" UUID NOT NULL,
    "sku_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "agreed_unit_cost" DECIMAL(12,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "purchase_order_line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review" (
    "id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "product_template_id" INTEGER NOT NULL,
    "sku_id" INTEGER NOT NULL,
    "order_id" UUID NOT NULL,
    "order_line_id" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "hidden_reason" TEXT,
    "revision_history" JSONB NOT NULL DEFAULT '[]',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "order_id" UUID,
    "deduplication_key" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "channels" "NotificationChannel"[] DEFAULT ARRAY['IN_APP']::"NotificationChannel"[],
    "payload" JSONB NOT NULL DEFAULT '{}',
    "delivery_attempts" JSONB NOT NULL DEFAULT '[]',
    "published_at" TIMESTAMPTZ(3),
    "last_delivery_at" TIMESTAMPTZ(3),
    "last_delivery_error" TEXT,
    "read_at" TIMESTAMPTZ(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_user_id_idx" ON "session"("user_id");

-- CreateIndex
CREATE INDEX "account_user_id_idx" ON "account"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "account_provider_id_account_id_key" ON "account"("provider_id", "account_id");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE INDEX "verification_customer_id_idx" ON "verification"("customer_id");

-- CreateIndex
CREATE INDEX "verification_order_id_idx" ON "verification"("order_id");

-- CreateIndex
CREATE INDEX "verification_purpose_contact_type_expires_at_idx" ON "verification"("purpose", "contact_type", "expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "customer_user_id_key" ON "customer"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "customer_email_key" ON "customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "customer_phone_key" ON "customer"("phone");

-- CreateIndex
CREATE INDEX "customer_merged_into_customer_id_idx" ON "customer"("merged_into_customer_id");

-- CreateIndex
CREATE INDEX "customer_is_active_idx" ON "customer"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "category_slug_key" ON "category"("slug");

-- CreateIndex
CREATE INDEX "category_parent_id_idx" ON "category"("parent_id");

-- CreateIndex
CREATE INDEX "category_is_active_idx" ON "category"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "brand_name_key" ON "brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "brand_slug_key" ON "brand"("slug");

-- CreateIndex
CREATE INDEX "brand_is_active_idx" ON "brand"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "product_template_slug_key" ON "product_template"("slug");

-- CreateIndex
CREATE INDEX "product_template_category_id_lifecycle_state_is_active_idx" ON "product_template"("category_id", "lifecycle_state", "is_active");

-- CreateIndex
CREATE INDEX "product_template_brand_id_idx" ON "product_template"("brand_id");

-- CreateIndex
CREATE INDEX "product_template_chipset_family_idx" ON "product_template"("chipset_family");

-- CreateIndex
CREATE UNIQUE INDEX "product_variant_sku_key" ON "product_variant"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "product_variant_barcode_key" ON "product_variant"("barcode");

-- CreateIndex
CREATE INDEX "product_variant_product_template_id_lifecycle_state_is_acti_idx" ON "product_variant"("product_template_id", "lifecycle_state", "is_active");

-- CreateIndex
CREATE INDEX "product_variant_sku_idx" ON "product_variant"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "pc_bundle_slug_key" ON "pc_bundle"("slug");

-- CreateIndex
CREATE INDEX "pc_bundle_lifecycle_state_is_active_idx" ON "pc_bundle"("lifecycle_state", "is_active");

-- CreateIndex
CREATE INDEX "pc_bundle_item_sku_id_idx" ON "pc_bundle_item"("sku_id");

-- CreateIndex
CREATE UNIQUE INDEX "pc_bundle_item_pc_bundle_id_sku_id_key" ON "pc_bundle_item"("pc_bundle_id", "sku_id");

-- CreateIndex
CREATE UNIQUE INDEX "cart_opaque_token_key" ON "cart"("opaque_token");

-- CreateIndex
CREATE INDEX "cart_customer_id_is_active_idx" ON "cart"("customer_id", "is_active");

-- CreateIndex
CREATE INDEX "cart_expires_at_idx" ON "cart"("expires_at");

-- CreateIndex
CREATE INDEX "cart_item_cart_id_pc_build_key_sort_order_idx" ON "cart_item"("cart_id", "pc_build_key", "sort_order");

-- CreateIndex
CREATE INDEX "cart_item_sku_id_idx" ON "cart_item"("sku_id");

-- CreateIndex
CREATE INDEX "cart_item_source_pc_bundle_id_idx" ON "cart_item"("source_pc_bundle_id");

-- CreateIndex
CREATE UNIQUE INDEX "branch_code_key" ON "branch"("code");

-- CreateIndex
CREATE INDEX "branch_delivery_priority_is_active_idx" ON "branch"("delivery_priority", "is_active");

-- CreateIndex
CREATE INDEX "product_promotion_effective_from_effective_to_is_active_idx" ON "product_promotion"("effective_from", "effective_to", "is_active");

-- CreateIndex
CREATE INDEX "promotion_sku_sku_id_idx" ON "promotion_sku"("sku_id");

-- CreateIndex
CREATE UNIQUE INDEX "promotion_sku_promotion_id_sku_id_key" ON "promotion_sku"("promotion_id", "sku_id");

-- CreateIndex
CREATE INDEX "promotion_category_category_id_idx" ON "promotion_category"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "promotion_category_promotion_id_category_id_key" ON "promotion_category"("promotion_id", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "coupon_code_key" ON "coupon"("code");

-- CreateIndex
CREATE INDEX "coupon_branch_id_idx" ON "coupon"("branch_id");

-- CreateIndex
CREATE INDEX "coupon_effective_from_effective_to_is_active_idx" ON "coupon"("effective_from", "effective_to", "is_active");

-- CreateIndex
CREATE INDEX "coupon_sku_rule_sku_id_idx" ON "coupon_sku_rule"("sku_id");

-- CreateIndex
CREATE UNIQUE INDEX "coupon_sku_rule_coupon_id_sku_id_rule_key" ON "coupon_sku_rule"("coupon_id", "sku_id", "rule");

-- CreateIndex
CREATE INDEX "coupon_category_rule_category_id_idx" ON "coupon_category_rule"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "coupon_category_rule_coupon_id_category_id_rule_key" ON "coupon_category_rule"("coupon_id", "category_id", "rule");

-- CreateIndex
CREATE INDEX "delivery_fee_config_effective_from_effective_to_is_active_idx" ON "delivery_fee_config"("effective_from", "effective_to", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "order_code_key" ON "order"("code");

-- CreateIndex
CREATE UNIQUE INDEX "order_idempotency_key_key" ON "order"("idempotency_key");

-- CreateIndex
CREATE INDEX "order_customer_id_created_at_idx" ON "order"("customer_id", "created_at");

-- CreateIndex
CREATE INDEX "order_fulfillment_branch_id_status_idx" ON "order"("fulfillment_branch_id", "status");

-- CreateIndex
CREATE INDEX "order_status_submitted_at_idx" ON "order"("status", "submitted_at");

-- CreateIndex
CREATE INDEX "order_delivery_fee_config_id_idx" ON "order"("delivery_fee_config_id");

-- CreateIndex
CREATE INDEX "order_line_order_id_pc_build_key_sort_order_idx" ON "order_line"("order_id", "pc_build_key", "sort_order");

-- CreateIndex
CREATE INDEX "order_line_sku_id_idx" ON "order_line"("sku_id");

-- CreateIndex
CREATE INDEX "order_line_source_pc_bundle_id_idx" ON "order_line"("source_pc_bundle_id");

-- CreateIndex
CREATE UNIQUE INDEX "coupon_redemption_order_id_key" ON "coupon_redemption"("order_id");

-- CreateIndex
CREATE INDEX "coupon_redemption_coupon_id_status_idx" ON "coupon_redemption"("coupon_id", "status");

-- CreateIndex
CREATE INDEX "coupon_redemption_coupon_id_customer_id_status_idx" ON "coupon_redemption"("coupon_id", "customer_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "order_amendment_idempotency_key_key" ON "order_amendment"("idempotency_key");

-- CreateIndex
CREATE INDEX "order_amendment_order_id_status_idx" ON "order_amendment"("order_id", "status");

-- CreateIndex
CREATE INDEX "order_amendment_delivery_fee_config_id_idx" ON "order_amendment"("delivery_fee_config_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_status_history_idempotency_key_key" ON "order_status_history"("idempotency_key");

-- CreateIndex
CREATE INDEX "order_status_history_order_id_occurred_at_idx" ON "order_status_history"("order_id", "occurred_at");

-- CreateIndex
CREATE UNIQUE INDEX "payment_order_id_key" ON "payment"("order_id");

-- CreateIndex
CREATE INDEX "payment_state_idx" ON "payment"("state");

-- CreateIndex
CREATE UNIQUE INDEX "payment_charge_order_amendment_id_key" ON "payment_charge"("order_amendment_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_charge_idempotency_key_key" ON "payment_charge"("idempotency_key");

-- CreateIndex
CREATE UNIQUE INDEX "payment_charge_provider_reference_key" ON "payment_charge"("provider_reference");

-- CreateIndex
CREATE INDEX "payment_charge_payment_id_status_idx" ON "payment_charge"("payment_id", "status");

-- CreateIndex
CREATE INDEX "payment_charge_status_expires_at_idx" ON "payment_charge"("status", "expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transaction_provider_transaction_id_key" ON "payment_transaction"("provider_transaction_id");

-- CreateIndex
CREATE INDEX "payment_transaction_payment_charge_id_occurred_at_idx" ON "payment_transaction"("payment_charge_id", "occurred_at");

-- CreateIndex
CREATE UNIQUE INDEX "refund_idempotency_key_key" ON "refund"("idempotency_key");

-- CreateIndex
CREATE UNIQUE INDEX "refund_transaction_reference_key" ON "refund"("transaction_reference");

-- CreateIndex
CREATE INDEX "refund_payment_id_status_idx" ON "refund"("payment_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "cod_collection_idempotency_key_key" ON "cod_collection"("idempotency_key");

-- CreateIndex
CREATE INDEX "cod_collection_payment_id_occurred_at_idx" ON "cod_collection"("payment_id", "occurred_at");

-- CreateIndex
CREATE INDEX "stock_quant_sku_id_idx" ON "stock_quant"("sku_id");

-- CreateIndex
CREATE INDEX "stock_quant_branch_id_is_active_idx" ON "stock_quant"("branch_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "stock_quant_branch_id_sku_id_key" ON "stock_quant"("branch_id", "sku_id");

-- CreateIndex
CREATE UNIQUE INDEX "stock_move_code_key" ON "stock_move"("code");

-- CreateIndex
CREATE UNIQUE INDEX "stock_move_purchase_order_id_key" ON "stock_move"("purchase_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "stock_move_idempotency_key_key" ON "stock_move"("idempotency_key");

-- CreateIndex
CREATE INDEX "stock_move_source_branch_id_status_idx" ON "stock_move"("source_branch_id", "status");

-- CreateIndex
CREATE INDEX "stock_move_destination_branch_id_status_idx" ON "stock_move"("destination_branch_id", "status");

-- CreateIndex
CREATE INDEX "stock_move_order_id_move_type_idx" ON "stock_move"("order_id", "move_type");

-- CreateIndex
CREATE INDEX "stock_move_reversal_of_move_id_idx" ON "stock_move"("reversal_of_move_id");

-- CreateIndex
CREATE INDEX "stock_move_move_type_status_idx" ON "stock_move"("move_type", "status");

-- CreateIndex
CREATE INDEX "stock_move_status_expires_at_idx" ON "stock_move"("status", "expires_at");

-- CreateIndex
CREATE INDEX "stock_move_line_sku_id_idx" ON "stock_move_line"("sku_id");

-- CreateIndex
CREATE INDEX "stock_move_line_original_move_line_id_idx" ON "stock_move_line"("original_move_line_id");

-- CreateIndex
CREATE UNIQUE INDEX "stock_move_line_stock_move_id_sku_id_key" ON "stock_move_line"("stock_move_id", "sku_id");

-- CreateIndex
CREATE INDEX "stock_ledger_entry_stock_quant_id_occurred_at_idx" ON "stock_ledger_entry"("stock_quant_id", "occurred_at");

-- CreateIndex
CREATE INDEX "stock_ledger_entry_stock_move_line_id_idx" ON "stock_ledger_entry"("stock_move_line_id");

-- CreateIndex
CREATE UNIQUE INDEX "serial_unit_serial_number_key" ON "serial_unit"("serial_number");

-- CreateIndex
CREATE INDEX "serial_unit_sku_id_status_idx" ON "serial_unit"("sku_id", "status");

-- CreateIndex
CREATE INDEX "serial_unit_current_branch_id_status_idx" ON "serial_unit"("current_branch_id", "status");

-- CreateIndex
CREATE INDEX "serial_unit_origin_stock_move_line_id_idx" ON "serial_unit"("origin_stock_move_line_id");

-- CreateIndex
CREATE INDEX "serial_movement_stock_move_line_id_idx" ON "serial_movement"("stock_move_line_id");

-- CreateIndex
CREATE UNIQUE INDEX "serial_movement_serial_unit_id_stock_move_line_id_key" ON "serial_movement"("serial_unit_id", "stock_move_line_id");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_code_key" ON "supplier"("code");

-- CreateIndex
CREATE INDEX "supplier_is_active_idx" ON "supplier"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_order_code_key" ON "purchase_order"("code");

-- CreateIndex
CREATE INDEX "purchase_order_supplier_id_status_idx" ON "purchase_order"("supplier_id", "status");

-- CreateIndex
CREATE INDEX "purchase_order_receiving_branch_id_status_idx" ON "purchase_order"("receiving_branch_id", "status");

-- CreateIndex
CREATE INDEX "purchase_order_supersedes_purchase_order_id_idx" ON "purchase_order"("supersedes_purchase_order_id");

-- CreateIndex
CREATE INDEX "purchase_order_line_sku_id_idx" ON "purchase_order_line"("sku_id");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_order_line_purchase_order_id_sku_id_key" ON "purchase_order_line"("purchase_order_id", "sku_id");

-- CreateIndex
CREATE UNIQUE INDEX "review_order_line_id_key" ON "review"("order_line_id");

-- CreateIndex
CREATE INDEX "review_customer_id_idx" ON "review"("customer_id");

-- CreateIndex
CREATE INDEX "review_product_template_id_is_visible_is_active_idx" ON "review"("product_template_id", "is_visible", "is_active");

-- CreateIndex
CREATE INDEX "review_sku_id_idx" ON "review"("sku_id");

-- CreateIndex
CREATE INDEX "review_order_id_idx" ON "review"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "notification_deduplication_key_key" ON "notification"("deduplication_key");

-- CreateIndex
CREATE INDEX "notification_customer_id_read_at_created_at_idx" ON "notification"("customer_id", "read_at", "created_at");

-- CreateIndex
CREATE INDEX "notification_order_id_created_at_idx" ON "notification"("order_id", "created_at");

-- CreateIndex
CREATE INDEX "notification_published_at_created_at_idx" ON "notification"("published_at", "created_at");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification" ADD CONSTRAINT "verification_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification" ADD CONSTRAINT "verification_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer" ADD CONSTRAINT "customer_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer" ADD CONSTRAINT "customer_merged_into_customer_id_fkey" FOREIGN KEY ("merged_into_customer_id") REFERENCES "customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_template" ADD CONSTRAINT "product_template_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_template" ADD CONSTRAINT "product_template_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_product_template_id_fkey" FOREIGN KEY ("product_template_id") REFERENCES "product_template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pc_bundle_item" ADD CONSTRAINT "pc_bundle_item_pc_bundle_id_fkey" FOREIGN KEY ("pc_bundle_id") REFERENCES "pc_bundle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pc_bundle_item" ADD CONSTRAINT "pc_bundle_item_sku_id_fkey" FOREIGN KEY ("sku_id") REFERENCES "product_variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart" ADD CONSTRAINT "cart_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_sku_id_fkey" FOREIGN KEY ("sku_id") REFERENCES "product_variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_source_pc_bundle_id_fkey" FOREIGN KEY ("source_pc_bundle_id") REFERENCES "pc_bundle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_sku" ADD CONSTRAINT "promotion_sku_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "product_promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_sku" ADD CONSTRAINT "promotion_sku_sku_id_fkey" FOREIGN KEY ("sku_id") REFERENCES "product_variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_category" ADD CONSTRAINT "promotion_category_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "product_promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_category" ADD CONSTRAINT "promotion_category_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon" ADD CONSTRAINT "coupon_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_sku_rule" ADD CONSTRAINT "coupon_sku_rule_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_sku_rule" ADD CONSTRAINT "coupon_sku_rule_sku_id_fkey" FOREIGN KEY ("sku_id") REFERENCES "product_variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_category_rule" ADD CONSTRAINT "coupon_category_rule_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_category_rule" ADD CONSTRAINT "coupon_category_rule_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_fulfillment_branch_id_fkey" FOREIGN KEY ("fulfillment_branch_id") REFERENCES "branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_delivery_fee_config_id_fkey" FOREIGN KEY ("delivery_fee_config_id") REFERENCES "delivery_fee_config"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_line" ADD CONSTRAINT "order_line_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_line" ADD CONSTRAINT "order_line_sku_id_fkey" FOREIGN KEY ("sku_id") REFERENCES "product_variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_line" ADD CONSTRAINT "order_line_source_pc_bundle_id_fkey" FOREIGN KEY ("source_pc_bundle_id") REFERENCES "pc_bundle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_redemption" ADD CONSTRAINT "coupon_redemption_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_redemption" ADD CONSTRAINT "coupon_redemption_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_redemption" ADD CONSTRAINT "coupon_redemption_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_amendment" ADD CONSTRAINT "order_amendment_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_amendment" ADD CONSTRAINT "order_amendment_delivery_fee_config_id_fkey" FOREIGN KEY ("delivery_fee_config_id") REFERENCES "delivery_fee_config"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_charge" ADD CONSTRAINT "payment_charge_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_charge" ADD CONSTRAINT "payment_charge_order_amendment_id_fkey" FOREIGN KEY ("order_amendment_id") REFERENCES "order_amendment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transaction" ADD CONSTRAINT "payment_transaction_payment_charge_id_fkey" FOREIGN KEY ("payment_charge_id") REFERENCES "payment_charge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refund" ADD CONSTRAINT "refund_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cod_collection" ADD CONSTRAINT "cod_collection_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_quant" ADD CONSTRAINT "stock_quant_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_quant" ADD CONSTRAINT "stock_quant_sku_id_fkey" FOREIGN KEY ("sku_id") REFERENCES "product_variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_move" ADD CONSTRAINT "stock_move_source_branch_id_fkey" FOREIGN KEY ("source_branch_id") REFERENCES "branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_move" ADD CONSTRAINT "stock_move_destination_branch_id_fkey" FOREIGN KEY ("destination_branch_id") REFERENCES "branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_move" ADD CONSTRAINT "stock_move_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_move" ADD CONSTRAINT "stock_move_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_move" ADD CONSTRAINT "stock_move_reversal_of_move_id_fkey" FOREIGN KEY ("reversal_of_move_id") REFERENCES "stock_move"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_move_line" ADD CONSTRAINT "stock_move_line_stock_move_id_fkey" FOREIGN KEY ("stock_move_id") REFERENCES "stock_move"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_move_line" ADD CONSTRAINT "stock_move_line_sku_id_fkey" FOREIGN KEY ("sku_id") REFERENCES "product_variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_move_line" ADD CONSTRAINT "stock_move_line_original_move_line_id_fkey" FOREIGN KEY ("original_move_line_id") REFERENCES "stock_move_line"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_ledger_entry" ADD CONSTRAINT "stock_ledger_entry_stock_quant_id_fkey" FOREIGN KEY ("stock_quant_id") REFERENCES "stock_quant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_ledger_entry" ADD CONSTRAINT "stock_ledger_entry_stock_move_line_id_fkey" FOREIGN KEY ("stock_move_line_id") REFERENCES "stock_move_line"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "serial_unit" ADD CONSTRAINT "serial_unit_sku_id_fkey" FOREIGN KEY ("sku_id") REFERENCES "product_variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "serial_unit" ADD CONSTRAINT "serial_unit_current_branch_id_fkey" FOREIGN KEY ("current_branch_id") REFERENCES "branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "serial_unit" ADD CONSTRAINT "serial_unit_origin_stock_move_line_id_fkey" FOREIGN KEY ("origin_stock_move_line_id") REFERENCES "stock_move_line"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "serial_movement" ADD CONSTRAINT "serial_movement_serial_unit_id_fkey" FOREIGN KEY ("serial_unit_id") REFERENCES "serial_unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "serial_movement" ADD CONSTRAINT "serial_movement_stock_move_line_id_fkey" FOREIGN KEY ("stock_move_line_id") REFERENCES "stock_move_line"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order" ADD CONSTRAINT "purchase_order_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order" ADD CONSTRAINT "purchase_order_receiving_branch_id_fkey" FOREIGN KEY ("receiving_branch_id") REFERENCES "branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order" ADD CONSTRAINT "purchase_order_supersedes_purchase_order_id_fkey" FOREIGN KEY ("supersedes_purchase_order_id") REFERENCES "purchase_order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_line" ADD CONSTRAINT "purchase_order_line_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_line" ADD CONSTRAINT "purchase_order_line_sku_id_fkey" FOREIGN KEY ("sku_id") REFERENCES "product_variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_product_template_id_fkey" FOREIGN KEY ("product_template_id") REFERENCES "product_template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_sku_id_fkey" FOREIGN KEY ("sku_id") REFERENCES "product_variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_order_line_id_fkey" FOREIGN KEY ("order_line_id") REFERENCES "order_line"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
