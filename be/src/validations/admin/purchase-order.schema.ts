import { z } from 'zod';

export const purchaseOrderItemSchema = z.object({
  skuId: z.number().int().positive('Ma linh kien SKU phai hop le'),
  quantity: z.number().int().positive('So luong dat mua phai lon hon 0'),
  agreedUnitCost: z.coerce.number().nonnegative('Don gia thoa thuan khong duoc am'),
});

export const createPurchaseOrderSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, 'Ma PO toi thieu 3 ky tu')
    .max(50, 'Ma PO toi da 50 ky tu')
    .regex(/^[A-Za-z0-9_-]+$/, 'Ma PO chi chua chu cai, so, gach ngang hoac gach duoi')
    .optional(),
  supplierId: z.number().int().positive('Nha cung cap khong duoc de trong'),
  receivingBranchId: z.number().int().positive('Kho chi nhanh nhan hang khong duoc de trong'),
  note: z.string().trim().max(1000, 'Ghi chu toi da 1000 ky tu').optional().nullable(),
  lines: z
    .array(purchaseOrderItemSchema)
    .min(1, 'Don mua hang phai co it nhat mot dong linh kien'),
});

export const updatePurchaseOrderSchema = z.object({
  supplierId: z.number().int().positive('Nha cung cap khong duoc de trong').optional(),
  receivingBranchId: z.number().int().positive('Kho chi nhanh nhan hang khong duoc de trong').optional(),
  note: z.string().trim().max(1000, 'Ghi chu toi da 1000 ky tu').optional().nullable(),
  lines: z
    .array(purchaseOrderItemSchema)
    .min(1, 'Don mua hang phai co it nhat mot dong linh kien')
    .optional(),
});

export const queryPurchaseOrderSchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(['DRAFT', 'CONFIRMED', 'RECEIVED', 'CLOSED', 'CANCELLED']).optional(),
  supplierId: z.coerce.number().int().positive().optional(),
  receivingBranchId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().nonnegative().optional().default(50),
});

export const cancelPurchaseOrderSchema = z.object({
  reason: z.string().trim().min(3, 'Ly do huy toi thieu 3 ky tu').max(500, 'Ly do huy toi da 500 ky tu'),
});

export const poReceiptLineSchema = z.object({
  skuId: z.number().int().positive('Ma linh kien SKU phai hop le'),
  receivedQuantity: z.number().int().positive('So luong nhap kho phai lon hon 0'),
  serialNumbers: z.array(z.string().trim().min(1, 'So serial khong duoc de trong')).optional().default([]),
});

export const validatePoReceiptSchema = z.object({
  lines: z
    .array(poReceiptLineSchema)
    .min(1, 'Danh sach nhap kho phai co it nhat mot dong san pham'),
});

export const shortShipmentLineSchema = z.object({
  skuId: z.number().int().positive('Ma linh kien SKU phai hop le'),
  actualQuantity: z.number().int().nonnegative('So luong thuc nhan khong duoc am'),
});

export const shortShipmentSchema = z.object({
  reason: z.string().trim().max(500, 'Ghi chu giao thieu toi da 500 ky tu').optional(),
  lines: z
    .array(shortShipmentLineSchema)
    .min(1, 'Danh sach thuc nhan phai co it nhat mot dong san pham'),
});

export type PurchaseOrderItemInput = z.infer<typeof purchaseOrderItemSchema>;
export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderSchema>;
export type UpdatePurchaseOrderInput = z.infer<typeof updatePurchaseOrderSchema>;
export type QueryPurchaseOrderInput = z.infer<typeof queryPurchaseOrderSchema>;
export type CancelPurchaseOrderInput = z.infer<typeof cancelPurchaseOrderSchema>;
export type PoReceiptLineInput = z.infer<typeof poReceiptLineSchema>;
export type ValidatePoReceiptInput = z.infer<typeof validatePoReceiptSchema>;
export type ShortShipmentLineInput = z.infer<typeof shortShipmentLineSchema>;
export type ShortShipmentInput = z.infer<typeof shortShipmentSchema>;
