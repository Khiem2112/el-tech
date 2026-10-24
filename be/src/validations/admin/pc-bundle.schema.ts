import { z } from 'zod';

export const pcBundleItemInputSchema = z.object({
  skuId: z.coerce.number().int().positive({ message: 'Mã SKU linh kiện không hợp lệ' }),
  quantity: z.coerce.number().int().min(1, { message: 'Số lượng linh kiện tối thiểu là 1' }).max(99, { message: 'Số lượng linh kiện tối đa là 99' }),
  sortOrder: z.coerce.number().int().min(0).optional().default(0),
});

export const createPcBundleSchema = z.object({
  name: z.string().trim().min(3, { message: 'Tên bộ máy tính tối thiểu 3 ký tự' }).max(200, { message: 'Tên bộ máy tính tối đa 200 ký tự' }),
  slug: z
    .string()
    .trim()
    .min(3, { message: 'Đường dẫn slug tối thiểu 3 ký tự' })
    .max(120, { message: 'Đường dẫn slug tối đa 120 ký tự' })
    .regex(/^[a-z0-9-]+$/, { message: 'Đường dẫn slug chỉ được chứa chữ thường, số và dấu gạch ngang' }),
  description: z.string().trim().max(2000, { message: 'Mô tả tối đa 2000 ký tự' }).optional().nullable(),
  lifecycleState: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'DISCONTINUED']).optional().default('DRAFT'),
  isActive: z.boolean().optional().default(true),
  discount: z.coerce.number().min(0, { message: 'Mức giảm giá không được âm' }).optional().default(0),
  items: z.array(pcBundleItemInputSchema).min(1, { message: 'Định mức linh kiện BOM phải có ít nhất 1 linh kiện' }),
});

export const updatePcBundleSchema = z.object({
  name: z.string().trim().min(3, { message: 'Tên bộ máy tính tối thiểu 3 ký tự' }).max(200, { message: 'Tên bộ máy tính tối đa 200 ký tự' }).optional(),
  slug: z
    .string()
    .trim()
    .min(3, { message: 'Đường dẫn slug tối thiểu 3 ký tự' })
    .max(120, { message: 'Đường dẫn slug tối đa 120 ký tự' })
    .regex(/^[a-z0-9-]+$/, { message: 'Đường dẫn slug chỉ được chứa chữ thường, số và dấu gạch ngang' })
    .optional(),
  description: z.string().trim().max(2000, { message: 'Mô tả tối đa 2000 ký tự' }).optional().nullable(),
  lifecycleState: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'DISCONTINUED']).optional(),
  isActive: z.boolean().optional(),
  discount: z.coerce.number().min(0, { message: 'Mức giảm giá không được âm' }).optional(),
  items: z.array(pcBundleItemInputSchema).min(1, { message: 'Định mức linh kiện BOM phải có ít nhất 1 linh kiện' }).optional(),
});

export const queryPcBundleSchema = z.object({
  search: z.string().trim().optional(),
  lifecycleState: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'DISCONTINUED']).optional(),
  isActive: z
    .union([
      z.boolean(),
      z.enum(['true', 'false', 'all']).transform((val) => {
        if (val === 'all') return undefined;
        return val === 'true';
      }),
    ])
    .optional(),
  branchId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  sortBy: z.enum(['name', 'slug', 'createdAt', 'updatedAt']).optional().default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type CreatePcBundleInput = z.infer<typeof createPcBundleSchema>;
export type UpdatePcBundleInput = z.infer<typeof updatePcBundleSchema>;
export type QueryPcBundleInput = z.infer<typeof queryPcBundleSchema>;
export type PcBundleItemInput = z.infer<typeof pcBundleItemInputSchema>;
