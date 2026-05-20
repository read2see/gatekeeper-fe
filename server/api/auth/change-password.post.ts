import type { ChangePasswordRequestBody } from '~/types/api-spec'

export default defineEventHandler(async (event) => {
  const body = await readBody<ChangePasswordRequestBody>(event)

  return proxyAuthenticatedAuthRoute<unknown>(event, '/api/auth/change-password', {
    method: 'POST',
    body
  })
})
