import { z } from 'zod';

export const serialStatusEnum = z.enum([
  'AVAILABLE',
  'RESERVED',
  'ISSUED',
  'IN_TRANSIT',
  'QUARANTINED',
  'RETURNED_TO_SUPPLIER',
]);

export type SerialStatusType = z.infer<typeof serialStatusEnum>;

export const querySerialsSchema = z.object({
  search: z.string().trim().optional(),
  status: z.union([serialStatusEnum, z.literal('ALL')]).optional().default('ALL'),
  branchId: z.coerce.number().int().positive().optional(),
  skuId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(200).optional().default(20),
});

export type QuerySerialsInput = z.infer<typeof querySerialsSchema>;

export const updateSerialStatusSchema = z.object({
  status: serialStatusEnum,
  branchId: z.coerce.number().int().positive().optional(),
  reason: z.string().trim().max(500).optional(),
});

export type UpdateSerialStatusInput = z.infer<typeof updateSerialStatusSchema>;
