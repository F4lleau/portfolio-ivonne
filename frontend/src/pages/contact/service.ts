import { api } from '@/lib/api';
import type { Locale } from '@/types';
import type { z } from 'zod';
import { contactSchema } from '@/lib/schemas';
export const sendContact = (data: z.infer<typeof contactSchema> & { locale: Locale }) =>
  api<{ saved: boolean }>('/contact/', { method: 'POST', body: JSON.stringify(data) });
