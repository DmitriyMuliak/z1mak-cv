import { z } from 'zod';

export const ContactSchema = z.object({
  name: z.string().min(2, 'Name is too short'),
  email: z.string().email('Invalid email'),
  message: z.string().min(5, 'Message is too short'),
});

export type ContactSchemaType = z.infer<typeof ContactSchema>;
