import { z } from 'zod';

export const productLifecycleStateSchema = z.enum([
  'DRAFT',
  'ACTIVE',
  'PAUSED',
  'DISCONTINUED',
]);

export const createProductTemplateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Ten mau san pham toi thieu 2 ky tu')
    .max(255, 'Ten mau san pham toi da 255 ky tu'),
  slug: z
    .string()
    .trim()
    .min(2, 'Slug toi thieu 2 ky tu')
    .max(255, 'Slug toi da 255 ky tu')
    .regex(/^[a-z0-9-]+$/, 'Slug chi chua chu thuong khong dau, so va gach noi')
    .transform((val) => val.toLowerCase()),
  categoryId: z.coerce.number().int().positive('Danh muc khong hop le'),
  brandId: z.coerce.number().int().positive('Thuong hieu khong hop le'),
  model: z
    .string()
    .trim()
    .min(1, 'Model khong duoc de trong')
    .max(100, 'Model toi da 100 ky tu'),
  chipsetFamily: z.string().trim().max(100).optional().nullable(),
  description: z.string().trim().optional().nullable(),
  commonSpec: z.record(z.unknown()).default({}),
  media: z.array(z.unknown()).default([]),
  lifecycleState: productLifecycleStateSchema.optional().default('DRAFT'),
  isActive: z.boolean().default(true),
});

export const updateProductTemplateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Ten mau san pham toi thieu 2 ky tu')
    .max(255, 'Ten mau san pham toi da 255 ky tu')
    .optional(),
  slug: z
    .string()
    .trim()
    .min(2, 'Slug toi thieu 2 ky tu')
    .max(255, 'Slug toi da 255 ky tu')
    .regex(/^[a-z0-9-]+$/, 'Slug chi chua chu thuong khong dau, so va gach noi')
    .transform((val) => val.toLowerCase())
    .optional(),
  categoryId: z.coerce.number().int().positive('Danh muc khong hop le').optional(),
  brandId: z.coerce.number().int().positive('Thuong hieu khong hop le').optional(),
  model: z
    .string()
    .trim()
    .min(1, 'Model khong duoc de trong')
    .max(100, 'Model toi da 100 ky tu')
    .optional(),
  chipsetFamily: z.string().trim().max(100).optional().nullable(),
  description: z.string().trim().optional().nullable(),
  commonSpec: z.record(z.unknown()).optional(),
  media: z.array(z.unknown()).optional(),
  lifecycleState: productLifecycleStateSchema.optional(),
  isActive: z.boolean().optional(),
});

export const queryProductTemplateSchema = z.object({
  search: z.string().trim().optional(),
  categoryId: z.coerce.number().int().optional(),
  brandId: z.coerce.number().int().optional(),
  lifecycleState: productLifecycleStateSchema.optional(),
  isActive: z
    .union([
      z.boolean(),
      z.enum(['true', 'false', 'all']).transform((val) => {
        if (val === 'all') {
          return undefined;
        }
        return val === 'true';
      }),
    ])
    .optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().nonnegative().optional().default(50),
});

export const transitionLifecycleSchema = z.object({
  targetState: productLifecycleStateSchema,
  reason: z.string().trim().optional(),
});

export const createProductVariantSchema = z.object({
  productTemplateId: z.coerce.number().int().positive('Mau san pham khong hop le'),
  sku: z
    .string()
    .trim()
    .min(1, 'SKU khong duoc de trong')
    .max(100, 'SKU toi da 100 ky tu')
    .regex(/^[A-Za-z0-9-_]+$/, 'SKU chi chua chu cai, so, gach noi va gach duoi')
    .transform((val) => val.toUpperCase()),
  barcode: z
    .string()
    .trim()
    .max(100, 'Barcode toi da 100 ky tu')
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  variationLabel: z
    .string()
    .trim()
    .max(150, 'Nhan bien the toi da 150 ky tu')
    .optional()
    .nullable(),
  variantSpec: z.record(z.unknown()).default({}),
  serialRequired: z.boolean().default(false),
  sellingPrice: z.coerce
    .number()
    .int('Gia ban phai la so nguyen duong VND')
    .positive('Gia ban phai la so nguyen duong VND'),
  lifecycleState: productLifecycleStateSchema.optional().default('DRAFT'),
  isActive: z.boolean().default(true),
});

export const updateProductVariantSchema = z.object({
  productTemplateId: z.coerce.number().int().positive('Mau san pham khong hop le').optional(),
  sku: z
    .string()
    .trim()
    .min(1, 'SKU khong duoc de trong')
    .max(100, 'SKU toi da 100 ky tu')
    .regex(/^[A-Za-z0-9-_]+$/, 'SKU chi chua chu cai, so, gach noi va gach duoi')
    .transform((val) => val.toUpperCase())
    .optional(),
  barcode: z
    .string()
    .trim()
    .max(100, 'Barcode toi da 100 ky tu')
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  variationLabel: z
    .string()
    .trim()
    .max(150, 'Nhan bien the toi da 150 ky tu')
    .optional()
    .nullable(),
  variantSpec: z.record(z.unknown()).optional(),
  serialRequired: z.boolean().optional(),
  sellingPrice: z.coerce
    .number()
    .int('Gia ban phai la so nguyen duong VND')
    .positive('Gia ban phai la so nguyen duong VND')
    .optional(),
  lifecycleState: productLifecycleStateSchema.optional(),
  isActive: z.boolean().optional(),
});

export const queryProductVariantSchema = z.object({
  search: z.string().trim().optional(),
  productTemplateId: z.coerce.number().int().optional(),
  categoryId: z.coerce.number().int().optional(),
  brandId: z.coerce.number().int().optional(),
  lifecycleState: productLifecycleStateSchema.optional(),
  isActive: z
    .union([
      z.boolean(),
      z.enum(['true', 'false', 'all']).transform((val) => {
        if (val === 'all') {
          return undefined;
        }
        return val === 'true';
      }),
    ])
    .optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().nonnegative().optional().default(50),
});

export const transitionVariantLifecycleSchema = z.object({
  targetState: productLifecycleStateSchema,
  reason: z.string().trim().optional(),
});

export type ProductLifecycleState = z.infer<typeof productLifecycleStateSchema>;
export type CreateProductTemplateInput = z.infer<typeof createProductTemplateSchema>;
export type UpdateProductTemplateInput = z.infer<typeof updateProductTemplateSchema>;
export type QueryProductTemplateInput = z.infer<typeof queryProductTemplateSchema>;
export type TransitionLifecycleInput = z.infer<typeof transitionLifecycleSchema>;
export type CreateProductVariantInput = z.infer<typeof createProductVariantSchema>;
export type UpdateProductVariantInput = z.infer<typeof updateProductVariantSchema>;
export type QueryProductVariantInput = z.infer<typeof queryProductVariantSchema>;
export type TransitionVariantLifecycleInput = z.infer<typeof transitionVariantLifecycleSchema>;
