import { z } from 'zod';

export const deliveryFeeStatusFilterEnum = z.enum(['ALL', 'ACTIVE', 'EXPIRED', 'UPCOMING']);
export type DeliveryFeeStatusFilter = z.infer<typeof deliveryFeeStatusFilterEnum>;

export const createDeliveryFeeSchema = z.object({
  fixedFee: z.coerce
    .number({ invalid_type_error: 'Mức phí giao hàng phải là số hợp lệ' })
    .int('Mức phí giao hàng phải là số nguyên VND')
    .min(0, 'Mức phí giao hàng không được nhỏ hơn 0'),
  freeShippingThreshold: z.coerce
    .number({ invalid_type_error: 'Ngưỡng miễn phí vận chuyển phải là số hợp lệ' })
    .int('Ngưỡng miễn phí vận chuyển phải là số nguyên VND')
    .min(0, 'Ngưỡng miễn phí vận chuyển không được nhỏ hơn 0'),
  effectiveFrom: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || !Number.isNaN(Date.parse(val)),
      'Thời điểm bắt đầu hiệu lực không hợp lệ',
    ),
  note: z.string().trim().max(500, 'Ghi chú tối đa 500 ký tự').optional(),
});
export type CreateDeliveryFeeInput = z.infer<typeof createDeliveryFeeSchema>;

export const queryDeliveryFeeSchema = z.object({
  status: deliveryFeeStatusFilterEnum.default('ALL'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type QueryDeliveryFeeInput = z.infer<typeof queryDeliveryFeeSchema>;
