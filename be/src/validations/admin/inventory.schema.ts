import { z } from 'zod';

export const stockStatusEnum = z.enum(['ALL', 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK']);
export type StockStatusFilter = z.infer<typeof stockStatusEnum>;

export const queryInventoryBalancesSchema = z.object({
  search: z.string().trim().optional(),
  branchId: z.coerce.number().int().positive().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  stockStatus: stockStatusEnum.optional().default('ALL'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(200).optional().default(50),
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

export const queryStockLedgerSchema = z.object({
  search: z.string().trim().optional(),
  branchId: z.coerce.number().int().positive().optional(),
  skuId: z.coerce.number().int().positive().optional(),
  entryType: stockLedgerEntryTypeEnum.optional(),
  startDate: z.string().trim().optional(),
  endDate: z.string().trim().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(200).optional().default(50),
});

export type QueryStockLedgerInput = z.infer<typeof queryStockLedgerSchema>;
