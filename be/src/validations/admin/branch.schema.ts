import { z } from 'zod';

export const openingHourSchema = z.union([
  z.string().trim(),
  z.record(z.unknown()),
]);

export const deliveryAreaCodesSchema = z.union([
  z.array(z.string().trim()),
  z.string().transform((val) =>
    val
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0),
  ),
]);

export const createBranchSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, 'Ma chi nhanh toi thieu 2 ky tu')
    .max(50, 'Ma chi nhanh toi da 50 ky tu')
    .regex(/^[A-Za-z0-9_-]+$/, 'Ma chi nhanh chi chua chu, so, gach noi hoac gach duoi')
    .transform((val) => val.toUpperCase()),
  name: z
    .string()
    .trim()
    .min(2, 'Ten chi nhanh toi thieu 2 ky tu')
    .max(200, 'Ten chi nhanh toi da 200 ky tu'),
  address: z
    .string()
    .trim()
    .min(5, 'Dia chi toi thieu 5 ky tu')
    .max(500, 'Dia chi toi da 500 ky tu'),
  openingHour: openingHourSchema.optional().default('08:00 - 21:30'),
  deliveryPriority: z.coerce.number().int().min(0, 'Do uu tien toi thieu bang 0').default(0),
  deliveryAreaCodes: deliveryAreaCodesSchema.default([]),
  phone: z
    .string()
    .trim()
    .regex(/^(0|\+84)[0-9]{9,10}$/, 'So dien thoai khong hop le')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .trim()
    .email('Email khong dung dinh dang')
    .optional()
    .or(z.literal('')),
  isActive: z.boolean().default(true),
});

export const updateBranchSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, 'Ma chi nhanh toi thieu 2 ky tu')
    .max(50, 'Ma chi nhanh toi da 50 ky tu')
    .regex(/^[A-Za-z0-9_-]+$/, 'Ma chi nhanh chi chua chu, so, gach noi hoac gach duoi')
    .transform((val) => val.toUpperCase())
    .optional(),
  name: z
    .string()
    .trim()
    .min(2, 'Ten chi nhanh toi thieu 2 ky tu')
    .max(200, 'Ten chi nhanh toi da 200 ky tu')
    .optional(),
  address: z
    .string()
    .trim()
    .min(5, 'Dia chi toi thieu 5 ky tu')
    .max(500, 'Dia chi toi da 500 ky tu')
    .optional(),
  openingHour: openingHourSchema.optional(),
  deliveryPriority: z.coerce.number().int().min(0, 'Do uu tien toi thieu bang 0').optional(),
  deliveryAreaCodes: deliveryAreaCodesSchema.optional(),
  phone: z
    .string()
    .trim()
    .regex(/^(0|\+84)[0-9]{9,10}$/, 'So dien thoai khong hop le')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .trim()
    .email('Email khong dung dinh dang')
    .optional()
    .or(z.literal('')),
  isActive: z.boolean().optional(),
});

export const queryBranchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
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
});

export type CreateBranchInput = z.output<typeof createBranchSchema>;
export type UpdateBranchInput = z.output<typeof updateBranchSchema>;
export type QueryBranchInput = z.output<typeof queryBranchSchema>;
