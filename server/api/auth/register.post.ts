import type { RegisterRequestBody } from '~/types/api-spec'

export default defineEventHandler(async (event) => {
  const body = await readBody<RegisterRequestBody>(event)

  const result = await gatekeeperFetch<unknown>('/api/auth/register', {
    method: 'POST',
    body,
    captureCookie: true
  })

  if (result.backendCookie) {
    const sessionPayload = await setGatekeeperUserSession(event, result.backendCookie)

    return {
      data: sessionPayload.user,
      message: result.message
    }
  }

  return {
    data: result.data,
    message: result.message
  }
})
