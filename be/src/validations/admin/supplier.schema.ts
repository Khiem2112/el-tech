import { z } from 'zod';

export const createSupplierSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, 'Ma nha cung cap toi thieu 2 ky tu')
    .max(50, 'Ma nha cung cap toi da 50 ky tu')
    .regex(/^[A-Za-z0-9_-]+$/, 'Ma nha cung cap chi chua chu cai, so, gach ngang hoac gach duoi')
    .transform((val) => val.toUpperCase()),
  name: z
    .string()
    .trim()
    .min(2, 'Ten nha cung cap toi thieu 2 ky tu')
    .max(200, 'Ten nha cung cap toi da 200 ky tu'),
  email: z
    .string()
    .trim()
    .email('Dinh dang email khong hop le')
    .optional()
    .nullable()
    .or(z.literal('')),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+().\s-]{6,25}$/, 'So dien thoai khong dung dinh dang')
    .optional()
    .nullable()
    .or(z.literal('')),
  address: z.string().trim().max(500, 'Dia chi toi da 500 ky tu').optional().nullable(),
  contactName: z.string().trim().max(100, 'Ten nguoi lien he toi da 100 ky tu').optional().nullable(),
  isActive: z.boolean().default(true),
});

export const updateSupplierSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, 'Ma nha cung cap toi thieu 2 ky tu')
    .max(50, 'Ma nha cung cap toi da 50 ky tu')
    .regex(/^[A-Za-z0-9_-]+$/, 'Ma nha cung cap chi chua chu cai, so, gach ngang hoac gach duoi')
    .transform((val) => val.toUpperCase())
    .optional(),
  name: z
    .string()
    .trim()
    .min(2, 'Ten nha cung cap toi thieu 2 ky tu')
    .max(200, 'Ten nha cung cap toi da 200 ky tu')
    .optional(),
  email: z
    .string()
    .trim()
    .email('Dinh dang email khong hop le')
    .optional()
    .nullable()
    .or(z.literal('')),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+().\s-]{6,25}$/, 'So dien thoai khong dung dinh dang')
    .optional()
    .nullable()
    .or(z.literal('')),
  address: z.string().trim().max(500, 'Dia chi toi da 500 ky tu').optional().nullable(),
  contactName: z.string().trim().max(100, 'Ten nguoi lien he toi da 100 ky tu').optional().nullable(),
  isActive: z.boolean().optional(),
});

export const querySupplierSchema = z.object({
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

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
export type QuerySupplierInput = z.infer<typeof querySupplierSchema>;
