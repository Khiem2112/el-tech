import { z } from 'zod';

export const promotionDiscountTypeEnum = z.enum(['PERCENTAGE', 'FIXED_AMOUNT']);
export type PromotionDiscountType = z.infer<typeof promotionDiscountTypeEnum>;

export const promotionScopeEnum = z.enum(['SKU', 'CATEGORY']);
export type PromotionScope = z.infer<typeof promotionScopeEnum>;

export const createPromotionSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { message: 'Tên chương trình khuyến mãi tối thiểu 2 ký tự' })
      .max(200, { message: 'Tên chương trình khuyến mãi tối đa 200 ký tự' }),
    discountType: promotionDiscountTypeEnum,
    discountValue: z.coerce.number().positive({ message: 'Giá trị giảm phải là số dương' }),
    isExclusive: z.boolean().optional().default(false),
    effectiveFrom: z.coerce.date({ message: 'Thời điểm bắt đầu không hợp lệ' }),
    effectiveTo: z.coerce.date({ message: 'Thời điểm kết thúc không hợp lệ' }),
    isActive: z.boolean().optional().default(true),
    scope: promotionScopeEnum,
    skuIds: z.array(z.coerce.number().int().positive()).optional().default([]),
    categoryIds: z.array(z.coerce.number().int().positive()).optional().default([]),
  })
  .superRefine((data, ctx) => {
    if (data.effectiveTo <= data.effectiveFrom) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['effectiveTo'],
        message: 'Thời gian kết thúc phải lớn hơn thời gian bắt đầu',
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

    if (data.scope === 'SKU' && data.skuIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['skuIds'],
        message: 'Vui lòng chọn ít nhất một biến thể SKU áp dụng khuyến mãi',
      });
    }

    if (data.scope === 'CATEGORY' && data.categoryIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['categoryIds'],
        message: 'Vui lòng chọn ít nhất một danh mục ngành hàng áp dụng khuyến mãi',
      });
    }
  });

export const updatePromotionSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { message: 'Tên chương trình khuyến mãi tối thiểu 2 ký tự' })
      .max(200, { message: 'Tên chương trình khuyến mãi tối đa 200 ký tự' })
      .optional(),
    discountType: promotionDiscountTypeEnum.optional(),
    discountValue: z.coerce.number().positive({ message: 'Giá trị giảm phải là số dương' }).optional(),
    isExclusive: z.boolean().optional(),
    effectiveFrom: z.coerce.date({ message: 'Thời điểm bắt đầu không hợp lệ' }).optional(),
    effectiveTo: z.coerce.date({ message: 'Thời điểm kết thúc không hợp lệ' }).optional(),
    isActive: z.boolean().optional(),
    scope: promotionScopeEnum.optional(),
    skuIds: z.array(z.coerce.number().int().positive()).optional(),
    categoryIds: z.array(z.coerce.number().int().positive()).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.effectiveFrom && data.effectiveTo && data.effectiveTo <= data.effectiveFrom) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['effectiveTo'],
        message: 'Thời gian kết thúc phải lớn hơn thời gian bắt đầu',
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

    if (data.scope === 'SKU' && data.skuIds !== undefined && data.skuIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['skuIds'],
        message: 'Vui lòng chọn ít nhất một biến thể SKU áp dụng khuyến mãi',
      });
    }

    if (data.scope === 'CATEGORY' && data.categoryIds !== undefined && data.categoryIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['categoryIds'],
        message: 'Vui lòng chọn ít nhất một danh mục ngành hàng áp dụng khuyến mãi',
      });
    }
  });

export const queryPromotionSchema = z.object({
  search: z.string().trim().optional(),
  discountType: promotionDiscountTypeEnum.optional(),
  status: z
    .enum(['ALL', 'ACTIVE', 'INACTIVE', 'RUNNING', 'UPCOMING', 'EXPIRED'])
    .optional()
    .default('ALL'),
  scope: z.enum(['ALL', 'SKU', 'CATEGORY']).optional().default('ALL'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  sortBy: z
    .enum(['name', 'effectiveFrom', 'effectiveTo', 'createdAt', 'discountValue'])
    .optional()
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;
export type UpdatePromotionInput = z.infer<typeof updatePromotionSchema>;
export type QueryPromotionInput = z.infer<typeof queryPromotionSchema>;
