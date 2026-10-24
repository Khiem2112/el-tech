import { z } from 'zod';

export const orderStatusEnum = z.enum([
  'PENDING_PAYMENT',
  'PENDING_COD_CONFIRMATION',
  'CONFIRMED',
  'PREPARING_COMPONENTS',
  'ASSEMBLING',
  'READY_FOR_PICKUP',
  'SHIPPING',
  'DELIVERY_FAILED',
  'RETURNING',
  'RETURNED_TO_BRANCH',
  'COMPLETED',
  'ON_HOLD',
  'CANCELLED',
]);

export const fulfillmentMethodEnum = z.enum(['PICKUP', 'DELIVERY']);
export const paymentMethodEnum = z.enum(['QR', 'COD']);

export const queryOrderSchema = z.object({
  search: z.string().trim().optional(),
  status: z
    .union([
      orderStatusEnum,
      z.array(orderStatusEnum),
      z.string().transform((val) => val.split(',').map((s) => s.trim())),
    ])
    .optional(),
  tab: z.string().trim().optional(),
  branchId: z.coerce.number().int().positive().optional(),
  fulfillmentMethod: fulfillmentMethodEnum.optional(),
  paymentMethod: paymentMethodEnum.optional(),
  hasAssembly: z
    .union([
      z.boolean(),
      z.enum(['true', 'false', 'assembly', 'retail']).transform((val) => val === 'true' || val === 'assembly'),
    ])
    .optional(),
  from: z.string().trim().optional(),
  to: z.string().trim().optional(),
  sortBy: z.enum(['submittedAt', 'createdAt', 'grandTotal', 'code']).optional().default('submittedAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().nonnegative().optional().default(20),
});

export type QueryOrderInput = z.infer<typeof queryOrderSchema>;
export type OrderStatusType = z.infer<typeof orderStatusEnum>;
export type FulfillmentMethodType = z.infer<typeof fulfillmentMethodEnum>;
export type PaymentMethodType = z.infer<typeof paymentMethodEnum>;

export const updateOrderNotesSchema = z.object({
  internalNotes: z.string().trim().max(2000).optional(),
  customerNotes: z.string().trim().max(2000).optional(),
});

export type UpdateOrderNotesInput = z.infer<typeof updateOrderNotesSchema>;
