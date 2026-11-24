import { z } from 'zod';

export const ROLES = ['Founder', 'Product', 'Engineering', 'Marketing', 'Finance'] as const;

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(60, 'Name must be 60 characters or fewer'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  company: z.string().trim().max(80, 'Company must be 80 characters or fewer'),
  role: z.enum(ROLES, { errorMap: () => ({ message: 'Select a role' }) }),
  website: z
    .string()
    .trim()
    .refine((v) => v === '' || /^https?:\/\/[^\s.]+\.[^\s]{2,}$/i.test(v), {
      message: 'Enter a full URL starting with http:// or https://',
    }),
  bio: z.string().max(160, 'Bio must be 160 characters or fewer'),
  weeklyDigest: z.boolean(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
