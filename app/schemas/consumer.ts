import { z } from 'zod'

const consumerTypes = ['INTERNAL', 'EXTERNAL', 'PARTNER'] as const

export const createConsumerSchema = z.object({
  name: z.string().trim().min(1, 'Consumer name is required').max(255),
  type: z.enum(consumerTypes, { message: 'Select a consumer type' })
})

export const updateConsumerSchema = createConsumerSchema.partial().extend({
  name: z.string().trim().min(1, 'Consumer name is required').max(255).optional()
})

export type CreateConsumerFormData = z.infer<typeof createConsumerSchema>
export type UpdateConsumerFormData = z.infer<typeof updateConsumerSchema>

export const consumerTypeOptions = [
  { label: 'Internal', value: 'INTERNAL' },
  { label: 'External', value: 'EXTERNAL' },
  { label: 'Partner', value: 'PARTNER' }
] as const
