import { z } from 'zod'

export const createApiKeySchema = z.object({
  consumer_id: z.string().uuid('Select a consumer'),
  name: z.string().trim().min(1, 'Key name is required').max(255),
  scopes: z.string().trim().min(1, 'Enter at least one scope'),
  expires_at: z.string().trim().optional().or(z.literal(''))
})

export const updateApiKeyScopesSchema = z.object({
  scopes: z.string().trim().min(1, 'Enter at least one scope')
})

export type CreateApiKeyFormData = z.infer<typeof createApiKeySchema>
export type UpdateApiKeyScopesFormData = z.infer<typeof updateApiKeyScopesSchema>

export function parseScopesInput(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map(scope => scope.trim())
    .filter(Boolean)
}

export function formatScopesInput(scopes?: string[]): string {
  return scopes?.join(', ') ?? ''
}

const rateLimitWindowUnits = ['SECONDS', 'MINUTES', 'HOURS', 'DAYS'] as const

export const rateLimitPolicySchema = z.object({
  request_limit: z.coerce.number().int().min(1, 'Request limit must be at least 1'),
  window_size: z.coerce.number().int().min(1, 'Window size must be at least 1'),
  window_unit: z.enum(rateLimitWindowUnits)
})

export type RateLimitPolicyFormData = z.infer<typeof rateLimitPolicySchema>

export const rateLimitWindowUnitOptions = [
  { label: 'Seconds', value: 'SECONDS' },
  { label: 'Minutes', value: 'MINUTES' },
  { label: 'Hours', value: 'HOURS' },
  { label: 'Days', value: 'DAYS' }
] as const

const rateLimitWindowUnitLabels: Record<(typeof rateLimitWindowUnits)[number], string> = {
  SECONDS: 'second',
  MINUTES: 'minute',
  HOURS: 'hour',
  DAYS: 'day'
}

export function formatRateLimitSummary(
  requestLimit: number,
  windowSize: number,
  windowUnit: (typeof rateLimitWindowUnits)[number]
): string {
  const requestLabel = requestLimit === 1 ? 'request' : 'requests'
  const unitLabel = rateLimitWindowUnitLabels[windowUnit]
  const windowLabel = windowSize === 1 ? unitLabel : `${unitLabel}s`

  return `Allows ${requestLimit} ${requestLabel} per ${windowSize} ${windowLabel}`
}
