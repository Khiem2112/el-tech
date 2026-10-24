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

export const shipOrderSchema = z.object({
  carrier: z.string().trim().min(1, 'Don vi van chuyen khong duoc de trong').max(100),
  trackingCode: z.string().trim().min(1, 'Ma van don khong duoc de trong').max(100),
  note: z.string().trim().max(1000).optional(),
  serialAssignments: z.array(serialAssignmentSchema).default([]),
});

export type ShipOrderInput = z.infer<typeof shipOrderSchema>;

export const deliveryFailedSchema = z.object({
  reason: z.string().trim().min(1, 'Ly do giao hang that bai khong duoc de trong').max(500),
  note: z.string().trim().max(1000).optional(),
});

export type DeliveryFailedInput = z.infer<typeof deliveryFailedSchema>;

export const scheduleRedeliverySchema = z.object({
  redeliveryDate: z.string().trim().min(1, 'Ngay hen giao lai khong duoc de trong'),
  note: z.string().trim().max(1000).optional(),
});

export type ScheduleRedeliveryInput = z.infer<typeof scheduleRedeliverySchema>;

export const initiateReturnSchema = z.object({
  note: z.string().trim().max(1000).optional(),
});

export type InitiateReturnInput = z.infer<typeof initiateReturnSchema>;

export const receiveReturnSchema = z.object({
  note: z.string().trim().max(1000).optional(),
  verifiedSerialNumbers: z.array(z.string().trim()).default([]),
});

export type ReceiveReturnInput = z.infer<typeof receiveReturnSchema>;
