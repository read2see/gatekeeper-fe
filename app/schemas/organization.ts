import { z } from 'zod'

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(1, 'Organization name is required').max(255),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens')
    .optional()
    .or(z.literal(''))
})

export const updateOrganizationSchema = createOrganizationSchema

export function createDeleteOrganizationSchema(organizationName: string) {
  return z.object({
    confirmName: z.string().trim().min(1, 'Type the organization name to confirm deletion')
  }).refine(data => data.confirmName === organizationName, {
    message: 'Organization name does not match',
    path: ['confirmName']
  })
}

export type CreateOrganizationFormData = z.infer<typeof createOrganizationSchema>
export type UpdateOrganizationFormData = z.infer<typeof updateOrganizationSchema>
export type DeleteOrganizationFormData = z.infer<ReturnType<typeof createDeleteOrganizationSchema>>
