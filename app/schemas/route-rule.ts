import { z } from 'zod'

const httpMethods = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
  'ANY'
] as const

export const createRouteRuleSchema = z.object({
  method: z.enum(httpMethods, { message: 'Select an HTTP method' }),
  path_pattern: z.string().trim().min(1, 'Path pattern is required').max(512),
  required_scope: z.string().trim().min(1, 'Required scope is required').max(255)
})

export const updateRouteRuleSchema = createRouteRuleSchema.partial()

export type CreateRouteRuleFormData = z.infer<typeof createRouteRuleSchema>
export type UpdateRouteRuleFormData = z.infer<typeof updateRouteRuleSchema>

export const httpMethodOptions = httpMethods.map(method => ({
  label: method,
  value: method
}))
