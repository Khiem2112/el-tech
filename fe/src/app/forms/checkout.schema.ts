import { z } from 'zod';

export const checkoutSchema = z.object({
  name: z.string().trim().min(2, 'Nhập họ và tên có ít nhất 2 ký tự.'),
  phone: z.string().trim().regex(/^(0|\+84)[0-9]{9,10}$/, 'Nhập số điện thoại Việt Nam hợp lệ.'),
  email: z.string().trim().email('Nhập email hợp lệ để nhận thông báo.'),
  isVerified: z.literal(true, { errorMap: () => ({ message: 'Bạn cần xác nhận thông tin liên hệ đã được xác thực.' }) }),
  address: z.string().trim().min(10, 'Nhập địa chỉ giao hàng đầy đủ.'),
});

export type CheckoutFormValue = z.infer<typeof checkoutSchema>;
