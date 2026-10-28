import { z } from 'zod';

export const queryTransferSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(20),
  search: z.string().trim().optional(),
  status: z
    .enum(['ALL', 'DRAFT', 'REQUESTED', 'IN_TRANSIT', 'VALIDATED', 'RECEIVED', 'CANCELLED'])
    .optional(),
  sourceBranchId: z.coerce.number().int().positive().optional(),
  destinationBranchId: z.coerce.number().int().positive().optional(),
  dateFrom: z.string().trim().optional(),
  dateTo: z.string().trim().optional(),
});

export const createTransferLineSchema = z.object({
  skuId: z.number().int().positive('SKU id phai la so nguyen duong'),
  quantity: z.number().int().positive('So luong dieu chuyen phai lon hon 0'),
});

export const createTransferSchema = z
  .object({
    sourceBranchId: z.number().int().positive('Vui long chon chi nhanh xuat'),
    destinationBranchId: z.number().int().positive('Vui long chon chi nhanh nhan'),
    reason: z
      .string()
      .trim()
      .max(500, 'Ghi chu hoac ly do dieu chuyen khong duoc vuot qua 500 ky tu')
      .optional(),
    lines: z
      .array(createTransferLineSchema)
      .min(1, 'Bat buoc phai co it nhat mot linh kien can dieu chuyen'),
  })
  .refine((data) => data.sourceBranchId !== data.destinationBranchId, {
    message: 'Chi nhanh xuat va chi nhanh nhan phai khac nhau',
    path: ['destinationBranchId'],
  });

export const dispatchTransferLineSchema = z.object({
  skuId: z.number().int().positive('SKU id phai la so nguyen duong'),
  serialNumbers: z.array(z.string().trim()).optional().default([]),
});

export const dispatchTransferSchema = z.object({
  lines: z.array(dispatchTransferLineSchema).optional().default([]),
});

export const receiveTransferSchema = z.object({
  note: z.string().trim().max(500, 'Ghi chu khong duoc vuot qua 500 ky tu').optional(),
});

export const cancelTransferSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, 'Ly do huy phieu phai co it nhat 3 ky tu')
    .max(500, 'Ly do huy phieu khong duoc vuot qua 500 ky tu'),
});

export type QueryTransferInput = z.infer<typeof queryTransferSchema>;
export type CreateTransferLineInput = z.infer<typeof createTransferLineSchema>;
export type CreateTransferInput = z.infer<typeof createTransferSchema>;
export type DispatchTransferLineInput = z.infer<typeof dispatchTransferLineSchema>;
export type DispatchTransferInput = z.infer<typeof dispatchTransferSchema>;
export type ReceiveTransferInput = z.infer<typeof receiveTransferSchema>;
export type CancelTransferInput = z.infer<typeof cancelTransferSchema>;
