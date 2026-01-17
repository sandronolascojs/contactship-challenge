import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().min(1).default(1),
  take: z.coerce.number().int().positive().min(1).max(100).default(10),
});

export type PaginationDto = z.infer<typeof paginationSchema>;
