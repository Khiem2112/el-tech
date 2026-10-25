import { z } from 'zod';

export const queryReviewsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  isVisible: z.enum(['true', 'false', 'all']).optional(),
  search: z.string().trim().optional(),
});

export type QueryReviewsInput = z.infer<typeof queryReviewsSchema>;

export const updateReviewVisibilitySchema = z
  .object({
    isVisible: z.boolean(),
    hiddenReason: z.string().trim().optional(),
  })
  .refine(
    (data) => {
      if (!data.isVisible) {
        return typeof data.hiddenReason === 'string' && data.hiddenReason.length >= 3;
      }
      return true;
    },
    {
      message: 'Ly do an danh gia la bat buoc khi an danh gia (toi thieu 3 ky tu)',
      path: ['hiddenReason'],
    },
  );

export type UpdateReviewVisibilityInput = z.infer<typeof updateReviewVisibilitySchema>;
