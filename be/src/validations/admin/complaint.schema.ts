import { z } from 'zod';

export const queryComplaintsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(['RECEIVED', 'PROCESSING', 'RESOLVED', 'DISMISSED', 'ALL']).optional(),
  category: z.string().trim().optional(),
  search: z.string().trim().optional(),
});

export type QueryComplaintsInput = z.infer<typeof queryComplaintsSchema>;

export const updateComplaintStatusSchema = z
  .object({
    status: z.enum(['RECEIVED', 'PROCESSING', 'RESOLVED', 'DISMISSED']),
    resolutionNote: z.string().trim().optional(),
  })
  .refine(
    (data) => {
      if (data.status === 'RESOLVED' || data.status === 'DISMISSED') {
        return typeof data.resolutionNote === 'string' && data.resolutionNote.trim().length >= 5;
      }
      return true;
    },
    {
      message: 'Ghi chú phương án xử lý hoặc lý do từ chối là bắt buộc (tối thiểu 5 ký tự) khi hoàn tất hoặc từ chối giải quyết khiếu nại',
      path: ['resolutionNote'],
    },
  );

export type UpdateComplaintStatusInput = z.infer<typeof updateComplaintStatusSchema>;

export const createComplaintSchema = z.object({
  orderCode: z.string().trim().min(3, 'Mã đơn hàng phải có ít nhất 3 ký tự (VD: EL-20260301)').optional().or(z.literal('')),
  customerName: z
    .string()
    .trim()
    .min(2, 'Họ và tên khách hàng phải có ít nhất 2 ký tự')
    .max(100, 'Họ và tên khách hàng không được vượt quá 100 ký tự'),
  customerPhone: z
    .string()
    .trim()
    .regex(
      /^(0|\+84)[35789][0-9]{8}$/,
      'Số điện thoại không đúng định dạng di động Việt Nam (gồm 10 số, bắt đầu bằng 03, 05, 07, 08, 09)',
    ),
  customerEmail: z
    .string()
    .trim()
    .email('Địa chỉ email liên hệ không đúng định dạng (VD: example@email.com)')
    .optional()
    .or(z.literal('')),
  serialNumber: z.string().trim().optional(),
  category: z.string().trim().min(2, 'Vui lòng chọn phân loại khiếu nại'),
  title: z.string().trim().optional(),
  description: z
    .string()
    .trim()
    .min(10, 'Mô tả tình trạng kỹ thuật phải có ít nhất 10 ký tự để chuyên viên hỗ trợ chính xác'),
  attachments: z.array(z.string()).optional().default([]),
});

export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;

