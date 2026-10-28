import { z } from 'zod';

export const queryNotificationsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  channel: z.enum(['IN_APP', 'EMAIL', 'SMS', 'ALL']).optional(),
  eventType: z.string().trim().optional(),
  status: z.enum(['ALL', 'SENT', 'PENDING', 'FAILED']).optional(),
  search: z.string().trim().optional(),
});

export type QueryNotificationsInput = z.infer<typeof queryNotificationsSchema>;
