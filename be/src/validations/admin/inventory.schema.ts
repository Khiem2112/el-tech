import { z } from 'zod';

export const stockStatusEnum = z.enum(['ALL', 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK']);
export type StockStatusFilter = z.infer<typeof stockStatusEnum>;

export const queryInventoryBalancesSchema = z.object({
  search: z.string().trim().optional(),
  branchId: z.coerce.number().int().positive().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  stockStatus: stockStatusEnum.optional().default('ALL'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(200).optional().default(10),
});

export type QueryInventoryBalancesInput = z.infer<typeof queryInventoryBalancesSchema>;

export const stockLedgerEntryTypeEnum = z.enum([
  'RESERVE',
  'RELEASE_RESERVATION',
  'PURCHASE_RECEIPT',
  'ORDER_ISSUE',
  'TRANSFER_OUT',
  'TRANSFER_IN',
  'SUPPLIER_RETURN',
  'QUARANTINE',
  'RELEASE_QUARANTINE',
  'REVERSAL',
]);

export type StockLedgerEntryTypeFilter = z.infer<typeof stockLedgerEntryTypeEnum>;

export const ledgerOriginTypeEnum = z.enum(['ALL', 'ORDER', 'PURCHASE_ORDER', 'QUARANTINE']);
export type LedgerOriginTypeFilter = z.infer<typeof ledgerOriginTypeEnum>;

export const queryStockLedgerSchema = z.object({
  search: z.string().trim().optional(),
  branchId: z.coerce.number().int().positive().optional(),
  skuId: z.coerce.number().int().positive().optional(),
  entryType: stockLedgerEntryTypeEnum.optional(),
  originType: ledgerOriginTypeEnum.optional().default('ALL'),
  startDate: z.string().trim().optional(),
  endDate: z.string().trim().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(200).optional().default(10),
});

export type QueryStockLedgerInput = z.infer<typeof queryStockLedgerSchema>;

export const quarantineStockSchema = z.object({
  branchId: z.coerce.number().int().positive(),
  skuId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive(),
  serialIds: z.array(z.string().trim()).optional(),
  reason: z.string().trim().min(3),
});

export type QuarantineStockInput = z.infer<typeof quarantineStockSchema>;

export const stockMoveTypeEnum = z.enum(['ALL', 'PURCHASE_RECEIPT', 'ORDER_ISSUE']);
export type StockMoveTypeFilter = z.infer<typeof stockMoveTypeEnum>;

export const stockMoveStatusEnum = z.enum([
  'ALL',
  'DRAFT',
  'RESERVED',
  'VALIDATED',
  'CANCELLED',
]);
export type StockMoveStatusFilter = z.infer<typeof stockMoveStatusEnum>;

export const queryStockMovesSchema = z.object({
  search: z.string().trim().optional(),
  moveType: stockMoveTypeEnum.optional().default('ALL'),
  status: stockMoveStatusEnum.optional().default('ALL'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(200).optional().default(20),
});

export type QueryStockMovesInput = z.infer<typeof queryStockMovesSchema>;

