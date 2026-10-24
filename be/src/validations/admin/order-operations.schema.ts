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

export const completeOrderSchema = z.object({
  codCollectedAmount: z.coerce.number().min(0).optional(),
  actorName: z.string().trim().max(200).optional(),
  note: z.string().trim().max(1000).optional(),
  confirmedSerialNumbers: z.array(z.string().trim()).default([]),
});

export type CompleteOrderInput = z.infer<typeof completeOrderSchema>;

export const cancelOrderSchema = z.object({
  reason: z.string().trim().min(1, 'Ly do huy don khong duoc de trong').max(1000),
  note: z.string().trim().max(1000).optional(),
});

export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;

export const holdOrderSchema = z.object({
  holdReason: z.enum(['PAYMENT_REVIEW', 'PAID_BUT_OUT_OF_STOCK', 'PICKUP_EXPIRED']),
  note: z.string().trim().min(1, 'Ly do tam giu khong duoc de trong').max(1000),
});

export type HoldOrderInput = z.infer<typeof holdOrderSchema>;

export const resolveHoldSchema = z.object({
  action: z.enum(['CONFIRM_RESUME', 'CANCEL_REFUND', 'EXTEND_PICKUP']),
  reason: z.string().trim().min(1, 'Phuong an giai quyet khong duoc de trong').max(1000),
  note: z.string().trim().max(1000).optional(),
});

export type ResolveHoldInput = z.infer<typeof resolveHoldSchema>;

export const pickupToDeliverySchema = z.object({
  receiverName: z.string().trim().min(1, 'Ten nguoi nhan khong duoc de trong').max(200),
  receiverPhone: z.string().trim().min(1, 'So dien thoai khong duoc de trong').max(50),
  deliveryAddress: z.string().trim().min(1, 'Dia chi giao hang khong duoc de trong').max(500),
  shippingFee: z.coerce.number().min(0, 'Phi van chuyen phai lon hon hoac bang 0'),
  reason: z.string().trim().max(1000).optional(),
  acceptanceChannel: z.enum(['PHONE', 'EMAIL', 'IN_APP']).default('PHONE'),
  acceptedByValue: z.string().trim().max(200).optional(),
});

export type PickupToDeliveryInput = z.infer<typeof pickupToDeliverySchema>;

export const resolveQrDiscrepancySchema = z.object({
  resolutionType: z.enum(['MANUAL_MATCH', 'CANCEL_REFUND']),
  note: z.string().trim().min(1, 'Ghi chu doi soat kiem toan khong duoc de trong').max(1000),
  transactionReference: z.string().trim().max(200).optional(),
});

export type ResolveQrDiscrepancyInput = z.infer<typeof resolveQrDiscrepancySchema>;

export const manualRefundSchema = z.object({
  transactionReference: z.string().trim().min(1, 'Ma giao dich chuyen khoan khong duoc de trong').max(200),
  bankName: z.string().trim().max(200).optional(),
  transferredAt: z.string().trim().optional(),
  note: z.string().trim().max(1000).optional(),
});

export type ManualRefundInput = z.infer<typeof manualRefundSchema>;
