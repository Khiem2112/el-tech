import { z } from 'zod';

export const queryDashboardSchema = z.object({
  branchId: z.coerce.number().int().positive().optional(),
});

export const queryLowStockAlertsSchema = z.object({
  branchId: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(50).optional().default(10),
});

export type QueryDashboardInput = z.infer<typeof queryDashboardSchema>;
export type QueryLowStockAlertsInput = z.infer<typeof queryLowStockAlertsSchema>;
