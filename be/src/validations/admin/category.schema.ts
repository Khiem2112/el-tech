import { z } from 'zod';

export const specAttributeTypeSchema = z.enum(['text', 'number', 'boolean', 'select']);

export const rawSpecAttributeTypeSchema = z.preprocess((val) => {
  if (typeof val === 'string') {
    const lower = val.toLowerCase().trim();
    if (lower === 'string') {
      return 'text';
    }
    if (lower === 'enum') {
      return 'select';
    }
    return lower;
  }
  return val;
}, specAttributeTypeSchema);

export const specAttributeSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1, 'Khoa thuoc tinh khong duoc de trong')
    .max(60, 'Khoa thuoc tinh toi da 60 ky tu')
    .regex(/^[a-z0-9_]+$/, 'Khoa thuoc tinh chi chua chu thuong khong dau, so va gach duoi'),
  label: z
    .string()
    .trim()
    .min(1, 'Nhan thuoc tinh khong duoc de trong')
    .max(100, 'Nhan thuoc tinh toi da 100 ky tu'),
  type: rawSpecAttributeTypeSchema,
  unit: z.string().trim().max(30).optional().nullable(),
  required: z.boolean().default(false),
  filterable: z.boolean().default(false),
  comparable: z.boolean().default(false),
  options: z.array(z.string().trim()).default([]),
  isDeprecated: z.boolean().default(false),
});

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Ten danh muc toi thieu 2 ky tu')
    .max(150, 'Ten danh muc toi da 150 ky tu'),
  slug: z
    .string()
    .trim()
    .min(2, 'Slug toi thieu 2 ky tu')
    .max(150, 'Slug toi da 150 ky tu')
    .regex(/^[a-z0-9-]+$/, 'Slug chi chua chu thuong khong dau, so va gach noi')
    .transform((val) => val.toLowerCase()),
  parentId: z.coerce.number().int().positive('Danh muc cha khong hop le').optional().nullable(),
  description: z.string().trim().max(1000, 'Mo ta toi da 1000 ky tu').optional().nullable(),
  specificationSchema: z.array(specAttributeSchema).optional().default([]),
  isActive: z.boolean().default(true),
});

export const updateCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Ten danh muc toi thieu 2 ky tu')
    .max(150, 'Ten danh muc toi da 150 ky tu')
    .optional(),
  slug: z
    .string()
    .trim()
    .min(2, 'Slug toi thieu 2 ky tu')
    .max(150, 'Slug toi da 150 ky tu')
    .regex(/^[a-z0-9-]+$/, 'Slug chi chua chu thuong khong dau, so va gach noi')
    .transform((val) => val.toLowerCase())
    .optional(),
  parentId: z.coerce.number().int().positive('Danh muc cha khong hop le').optional().nullable(),
  description: z.string().trim().max(1000, 'Mo ta toi da 1000 ky tu').optional().nullable(),
  isActive: z.boolean().optional(),
});

export const updateSpecSchemaPayloadSchema = z.object({
  specificationSchema: z.array(specAttributeSchema),
});

export const queryCategorySchema = z.object({
  search: z.string().trim().optional(),
  parentId: z.coerce.number().int().optional(),
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
  tree: z
    .union([
      z.boolean(),
      z.enum(['true', 'false']).transform((val) => val === 'true'),
    ])
    .optional()
    .default(false),
});

export type SpecAttribute = z.infer<typeof specAttributeSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type UpdateSpecSchemaPayload = z.infer<typeof updateSpecSchemaPayloadSchema>;
export type QueryCategoryInput = z.infer<typeof queryCategorySchema>;
