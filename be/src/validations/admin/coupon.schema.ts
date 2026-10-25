import { z } from 'zod';

export const couponDiscountTypeEnum = z.enum(['PERCENTAGE', 'FIXED_AMOUNT']);
export type CouponDiscountType = z.infer<typeof couponDiscountTypeEnum>;

export const couponPaymentMethodEnum = z.enum(['QR', 'COD']);
export type CouponPaymentMethod = z.infer<typeof couponPaymentMethodEnum>;

export const couponTargetRuleEnum = z.enum(['INCLUDE', 'EXCLUDE']);
export type CouponTargetRule = z.infer<typeof couponTargetRuleEnum>;

export const couponStatusFilterEnum = z.enum([
  'ALL',
  'ACTIVE',
  'INACTIVE',
  'RUNNING',
  'UPCOMING',
  'EXPIRED',
]);
export type CouponStatusFilter = z.infer<typeof couponStatusFilterEnum>;

export const couponRedemptionStatusFilterEnum = z.enum([
  'ALL',
  'RESERVED',
  'CONSUMED',
  'RELEASED',
]);
export type CouponRedemptionStatusFilter = z.infer<typeof couponRedemptionStatusFilterEnum>;

export const couponSkuRuleInputSchema = z.object({
  skuId: z.coerce.number().int().positive({ message: 'SKU ID không hợp lệ' }),
  rule: couponTargetRuleEnum.default('EXCLUDE'),
});
export type CouponSkuRuleInput = z.infer<typeof couponSkuRuleInputSchema>;

export const couponCategoryRuleInputSchema = z.object({
  categoryId: z.coerce.number().int().positive({ message: 'Danh mục ID không hợp lệ' }),
  rule: couponTargetRuleEnum.default('EXCLUDE'),
});
export type CouponCategoryRuleInput = z.infer<typeof couponCategoryRuleInputSchema>;

export const createCouponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, { message: 'Mã coupon tối thiểu 3 ký tự' })
      .max(30, { message: 'Mã coupon tối đa 30 ký tự' })
      .regex(/^[A-Za-z0-9_-]+$/, {
        message: 'Mã coupon chỉ chứa chữ cái, số, gạch ngang và gạch dưới',
      })
      .transform((val) => val.toUpperCase()),
    name: z
      .string()
      .trim()
      .min(2, { message: 'Tên chương trình tối thiểu 2 ký tự' })
      .max(200, { message: 'Tên chương trình tối đa 200 ký tự' }),
    discountType: couponDiscountTypeEnum,
    discountValue: z.coerce.number().positive({ message: 'Mức giảm phải lớn hơn 0' }),
    minimumSubtotal: z.coerce.number().min(0, { message: 'Đơn tối thiểu không thể âm' }).default(0),
    maximumDiscount: z.coerce
      .number()
      .positive({ message: 'Mức giảm tối đa phải lớn hơn 0' })
      .nullable()
      .optional(),
    requiredPaymentMethod: couponPaymentMethodEnum.nullable().optional(),
    branchId: z.coerce
      .number()
      .int()
      .positive({ message: 'Chi nhánh ID không hợp lệ' })
      .nullable()
      .optional(),
    globalQuota: z.coerce
      .number()
      .int()
      .positive({ message: 'Hạn mức toàn hệ thống phải là số nguyên dương' })
      .nullable()
      .optional(),
    perCustomerQuota: z.coerce
      .number()
      .int()
      .positive({ message: 'Hạn mức mỗi khách hàng phải là số nguyên dương' })
      .nullable()
      .optional(),
    effectiveFrom: z.coerce.date({ message: 'Thời điểm bắt đầu không hợp lệ' }),
    effectiveTo: z.coerce.date({ message: 'Thời điểm kết thúc không hợp lệ' }),
    isActive: z.boolean().optional().default(true),
    skuRules: z.array(couponSkuRuleInputSchema).optional().default([]),
    categoryRules: z.array(couponCategoryRuleInputSchema).optional().default([]),
  })
  .superRefine((data, ctx) => {
    if (data.effectiveTo <= data.effectiveFrom) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['effectiveTo'],
        message: 'Thời gian kết thúc phải sau thời gian bắt đầu',
      });
    }

    if (data.discountType === 'PERCENTAGE') {
      if (data.discountValue < 1 || data.discountValue > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['discountValue'],
          message: 'Mức giảm phần trăm phải nằm trong khoảng từ 1% đến 100%',
        });
      }
    } else if (data.discountType === 'FIXED_AMOUNT') {
      if (!Number.isInteger(data.discountValue) || data.discountValue < 1000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['discountValue'],
          message: 'Mức giảm số tiền phải là số nguyên dương tối thiểu 1.000 VNĐ',
        });
      }
    }
  });

export type CreateCouponInput = z.infer<typeof createCouponSchema>;

export const updateCouponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, { message: 'Mã coupon tối thiểu 3 ký tự' })
      .max(30, { message: 'Mã coupon tối đa 30 ký tự' })
      .regex(/^[A-Za-z0-9_-]+$/, {
        message: 'Mã coupon chỉ chứa chữ cái, số, gạch ngang và gạch dưới',
      })
      .transform((val) => val.toUpperCase())
      .optional(),
    name: z
      .string()
      .trim()
      .min(2, { message: 'Tên chương trình tối thiểu 2 ký tự' })
      .max(200, { message: 'Tên chương trình tối đa 200 ký tự' })
      .optional(),
    discountType: couponDiscountTypeEnum.optional(),
    discountValue: z.coerce.number().positive({ message: 'Mức giảm phải lớn hơn 0' }).optional(),
    minimumSubtotal: z.coerce.number().min(0, { message: 'Đơn tối thiểu không thể âm' }).optional(),
    maximumDiscount: z.coerce
      .number()
      .positive({ message: 'Mức giảm tối đa phải lớn hơn 0' })
      .nullable()
      .optional(),
    requiredPaymentMethod: couponPaymentMethodEnum.nullable().optional(),
    branchId: z.coerce
      .number()
      .int()
      .positive({ message: 'Chi nhánh ID không hợp lệ' })
      .nullable()
      .optional(),
    globalQuota: z.coerce
      .number()
      .int()
      .positive({ message: 'Hạn mức toàn hệ thống phải là số nguyên dương' })
      .nullable()
      .optional(),
    perCustomerQuota: z.coerce
      .number()
      .int()
      .positive({ message: 'Hạn mức mỗi khách hàng phải là số nguyên dương' })
      .nullable()
      .optional(),
    effectiveFrom: z.coerce.date({ message: 'Thời điểm bắt đầu không hợp lệ' }).optional(),
    effectiveTo: z.coerce.date({ message: 'Thời điểm kết thúc không hợp lệ' }).optional(),
    isActive: z.boolean().optional(),
    skuRules: z.array(couponSkuRuleInputSchema).optional(),
    categoryRules: z.array(couponCategoryRuleInputSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.effectiveFrom && data.effectiveTo && data.effectiveTo <= data.effectiveFrom) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['effectiveTo'],
        message: 'Thời gian kết thúc phải sau thời gian bắt đầu',
      });
    }

    if (data.discountType === 'PERCENTAGE' && data.discountValue !== undefined) {
      if (data.discountValue < 1 || data.discountValue > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['discountValue'],
          message: 'Mức giảm phần trăm phải nằm trong khoảng từ 1% đến 100%',
        });
      }
    } else if (data.discountType === 'FIXED_AMOUNT' && data.discountValue !== undefined) {
      if (!Number.isInteger(data.discountValue) || data.discountValue < 1000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['discountValue'],
          message: 'Mức giảm số tiền phải là số nguyên dương tối thiểu 1.000 VNĐ',
        });
      }
    }
  });

export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;

export const queryCouponSchema = z.object({
  search: z.string().trim().optional(),
  status: couponStatusFilterEnum.optional().default('ALL'),
  discountType: z.enum(['ALL', 'PERCENTAGE', 'FIXED_AMOUNT']).optional().default('ALL'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type QueryCouponInput = z.infer<typeof queryCouponSchema>;

export const queryRedemptionSchema = z.object({
  status: couponRedemptionStatusFilterEnum.optional().default('ALL'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type QueryRedemptionInput = z.infer<typeof queryRedemptionSchema>;
