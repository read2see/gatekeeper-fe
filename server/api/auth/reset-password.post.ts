import type { ResetPasswordRequestBody } from '~/types/api-spec'

export default defineEventHandler(async (event) => {
  const body = await readBody<ResetPasswordRequestBody>(event)

  return proxyPublicAuthRoute<unknown>('/api/auth/reset-password', {
    method: 'POST',
    body
  })
})
