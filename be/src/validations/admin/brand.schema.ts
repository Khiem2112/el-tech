import { z } from 'zod';

export const createBrandSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Ten thuong hieu toi thieu 2 ky tu')
    .max(100, 'Ten thuong hieu toi da 100 ky tu'),
  slug: z
    .string()
    .trim()
    .min(2, 'Slug toi thieu 2 ky tu')
    .max(100, 'Slug toi da 100 ky tu')
    .regex(/^[a-z0-9-]+$/, 'Slug chi chua chu thuong khong dau, so va gach noi')
    .transform((val) => val.toLowerCase()),
  description: z.string().trim().max(1000, 'Mo ta toi da 1000 ky tu').optional().nullable(),
  logoUrl: z.string().trim().url('URL logo khong hop le').optional().nullable().or(z.literal('')),
  website: z.string().trim().url('URL website khong hop le').optional().nullable().or(z.literal('')),
  isActive: z.boolean().default(true),
});

export const updateBrandSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Ten thuong hieu toi thieu 2 ky tu')
    .max(100, 'Ten thuong hieu toi da 100 ky tu')
    .optional(),
  slug: z
    .string()
    .trim()
    .min(2, 'Slug toi thieu 2 ky tu')
    .max(100, 'Slug toi da 100 ky tu')
    .regex(/^[a-z0-9-]+$/, 'Slug chi chua chu thuong khong dau, so va gach noi')
    .transform((val) => val.toLowerCase())
    .optional(),
  description: z.string().trim().max(1000, 'Mo ta toi da 1000 ky tu').optional().nullable(),
  logoUrl: z.string().trim().url('URL logo khong hop le').optional().nullable().or(z.literal('')),
  website: z.string().trim().url('URL website khong hop le').optional().nullable().or(z.literal('')),
  isActive: z.boolean().optional(),
});

export const queryBrandSchema = z.object({
  search: z.string().trim().optional(),
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

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
export type QueryBrandInput = z.infer<typeof queryBrandSchema>;
