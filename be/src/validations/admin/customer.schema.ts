import { z } from 'zod';

export const queryCustomerSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
  type: z.enum(['ALL', 'USER', 'GUEST']).default('ALL'),
  status: z.enum(['ALL', 'ACTIVE', 'MERGED', 'INACTIVE']).default('ALL'),
});

export type QueryCustomerInput = z.infer<typeof queryCustomerSchema>;

export const updateCustomerSchema = z.object({
  name: z.string().trim().min(1, 'Ten khong duoc de trong').max(150).optional(),
  phone: z.string().trim().min(8, 'So dien thoai khong hop le').max(20).optional(),
  email: z.string().trim().email('Email khong hop le').optional(),
  isActive: z.boolean().optional(),
});

export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;

export const mergeCustomerSchema = z.object({
  sourceCustomerId: z.string().uuid('ID ho so phu khong hop le'),
  reason: z.string().trim().min(3, 'Ly do gop ho so bat buoc va toi thieu 3 ky tu').max(500),
});

export type MergeCustomerInput = z.infer<typeof mergeCustomerSchema>;
