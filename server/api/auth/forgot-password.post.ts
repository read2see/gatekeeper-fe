import type { ForgotPasswordRequestBody } from '~/types/api-spec'

export default defineEventHandler(async (event) => {
  const body = await readBody<ForgotPasswordRequestBody>(event)

  return proxyPublicAuthRoute<unknown>('/api/auth/forgot-password', {
    method: 'POST',
    body
  })
})
