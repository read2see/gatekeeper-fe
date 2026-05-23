import { z } from 'zod'
import type { PostmanImportQuery } from '~/types/api-spec'

const postmanImportBaseSchema = z.object({
  default_required_scope: z
    .string()
    .trim()
    .min(1, 'Default scope is required')
    .max(255)
})

export const postmanImportSchema = z.discriminatedUnion('import_mode', [
  postmanImportBaseSchema.extend({
    import_mode: z.literal('new'),
    name: z.string().trim().min(1, 'Service name is required').max(255),
    slug: z
      .string()
      .trim()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens')
      .optional()
      .or(z.literal('')),
    base_url: z.string().trim().url('Enter a valid URL').optional().or(z.literal(''))
  }),
  postmanImportBaseSchema.extend({
    import_mode: z.literal('existing'),
    service_id: z.string().trim().min(1, 'Select a service')
  })
])

export type PostmanImportFormData = z.infer<typeof postmanImportSchema>

export function toPostmanImportQuery(data: PostmanImportFormData): PostmanImportQuery {
  const query: PostmanImportQuery = {
    defaultRequiredScope: data.default_required_scope
  }

  if (data.import_mode === 'existing') {
    query.serviceId = data.service_id
    return query
  }

  query.name = data.name

  if (data.slug) {
    query.slug = data.slug
  }

  if (data.base_url) {
    query.baseUrl = data.base_url
  }

  return query
}
