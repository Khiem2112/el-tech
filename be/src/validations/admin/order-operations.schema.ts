import { z } from 'zod';

export const confirmCodOrderSchema = z.object({
  note: z.string().trim().max(1000).optional(),
});

export type ConfirmCodOrderInput = z.infer<typeof confirmCodOrderSchema>;

export const prepareOrderSchema = z.object({
  note: z.string().trim().max(1000).optional(),
});

export type PrepareOrderInput = z.infer<typeof prepareOrderSchema>;

export const serialAssignmentSchema = z.object({
  skuId: z.coerce.number().int().positive(),
  serialNumber: z.string().trim().min(1).max(100),
});

export type SerialAssignmentInput = z.infer<typeof serialAssignmentSchema>;

export const assembleOrderSchema = z.object({
  technicianName: z.string().trim().max(200).optional(),
  serialAssignments: z.array(serialAssignmentSchema).default([]),
});

export type AssembleOrderInput = z.infer<typeof assembleOrderSchema>;

export const readyForPickupSchema = z.object({
  note: z.string().trim().max(1000).optional(),
});

export type ReadyForPickupInput = z.infer<typeof readyForPickupSchema>;
