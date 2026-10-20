import { z } from 'zod';
export const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email().max(254),
  message: z.string().trim().min(10).max(5000),
  website: z.string().max(0).optional(),
});
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(256),
});
export const bilingualSchema = z.object({ es: z.string().max(15000), en: z.string().max(15000) });
export const projectSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9-]+$/),
    title: bilingualSchema,
    summary: bilingualSchema,
    description: bilingualSchema,
    role: bilingualSchema,
    decisions: bilingualSchema,
    result: bilingualSchema,
    year: z.number().int().min(1990).max(2100),
    published: z.boolean(),
    featured: z.boolean(),
  })
  .passthrough();
