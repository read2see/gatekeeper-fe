import { z } from 'zod'

export const createServiceSchema = z.object({
  name: z.string().trim().min(1, 'Service name is required').max(255),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens')
    .optional()
    .or(z.literal('')),
  base_url: z.string().trim().url('Enter a valid URL'),
  internal_auth_header_name: z.string().trim().max(255).optional().or(z.literal('')),
  internal_secret: z.string().trim().max(512).optional().or(z.literal(''))
})

export const updateServiceSchema = createServiceSchema.partial().extend({
  name: z.string().trim().min(1, 'Service name is required').max(255).optional()
})

export type CreateServiceFormData = z.infer<typeof createServiceSchema>
export type UpdateServiceFormData = z.infer<typeof updateServiceSchema>
