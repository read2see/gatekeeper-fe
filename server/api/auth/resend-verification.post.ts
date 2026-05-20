import type { ResendVerificationRequestBody } from '~/types/api-spec'

export default defineEventHandler(async (event) => {
  const body = await readBody<ResendVerificationRequestBody>(event)

  return proxyPublicAuthRoute<unknown>('/api/auth/resend-verification', {
    method: 'POST',
    body
  })
})
