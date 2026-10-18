import { z } from 'zod';

const environmentSchema = z.object({ PORT: z.coerce.number().int().positive().default(3000), CORS_ORIGIN: z.string().default('http://localhost:4200') });
export const environment = environmentSchema.parse(process.env);
