import { z } from 'zod';

export const createSupplierReturnLineSchema = z.object({
  skuId: z.number().int().positive('SKU id phai la so nguyen duong'),
  quantity: z.number().int().positive('So luong xuat tra phai lon hon 0'),
  returnSource: z.enum(['quarantineDamaged', 'onHand']),
  serialNumbers: z.array(z.string().trim()).optional().default([]),
});

export const createSupplierReturnSchema = z.object({
  inboundStockMoveId: z.string().uuid('Ma phieu nhap kho goc khong hop le'),
  reason: z
    .string()
    .trim()
    .min(3, 'Ly do xuat tra phai co it nhat 3 ky tu')
    .max(500, 'Ly do xuat tra khong vuot qua 500 ky tu'),
  lines: z.array(createSupplierReturnLineSchema).min(1, 'Bat buoc phai co it nhat mot dong xuat tra'),
});

export const querySupplierReturnSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(50),
  search: z.string().trim().optional(),
  supplierId: z.coerce.number().int().positive().optional(),
  branchId: z.coerce.number().int().positive().optional(),
});

export type CreateSupplierReturnLineInput = z.infer<typeof createSupplierReturnLineSchema>;
export type CreateSupplierReturnInput = z.infer<typeof createSupplierReturnSchema>;
export type QuerySupplierReturnInput = z.infer<typeof querySupplierReturnSchema>;
