import { z } from 'zod';

export const checkoutCustomerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Họ và tên người nhận không được để trống.')
    .min(2, 'Họ và tên phải có ít nhất 2 ký tự.')
    .max(120, 'Họ và tên không được vượt quá 120 ký tự.'),
  phone: z
    .string()
    .trim()
    .min(1, 'Số điện thoại liên hệ không được để trống.')
    .regex(/^(0|\+84)[0-9]{9,10}$/, 'Số điện thoại không đúng định dạng (ví dụ: 0988234567 hoặc 0391234567).'),
  email: z
    .string()
    .trim()
    .min(1, 'Email nhận thông báo không được để trống.')
    .email('Email không đúng định dạng (ví dụ: hoangnam.tech@gmail.com).'),
  fulfillmentMethod: z.enum(['PICKUP', 'DELIVERY']),
  province: z.string().trim().optional(),
  district: z.string().trim().optional(),
  streetAddress: z.string().trim().optional(),
  paymentMethod: z.enum(['QR', 'COD']),
}).superRefine((data, ctx) => {
  if (data.fulfillmentMethod === 'DELIVERY') {
    if (!data.province || !data.province.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Tỉnh / Thành phố không được để trống khi giao hàng tận nơi.',
        path: ['province'],
      });
    }
    if (!data.district || !data.district.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Quận / Huyện không được để trống khi giao hàng tận nơi.',
        path: ['district'],
      });
    }
    if (!data.streetAddress || !data.streetAddress.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Địa chỉ cụ thể không được để trống khi giao hàng tận nơi.',
        path: ['streetAddress'],
      });
    } else if (data.streetAddress.trim().length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Địa chỉ cụ thể phải chi tiết (ít nhất 5 ký tự: số nhà, tên đường, phường/xã).',
        path: ['streetAddress'],
      });
    }
  }
});

export type CheckoutCustomerFormValue = z.infer<typeof checkoutCustomerSchema>;

export const checkoutSchema = checkoutCustomerSchema;
export type CheckoutFormValue = CheckoutCustomerFormValue;
