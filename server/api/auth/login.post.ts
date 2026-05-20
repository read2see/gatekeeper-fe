import type { LoginRequestBody } from '~/types/api-spec'

export default defineEventHandler(async (event) => {
  const body = await readBody<LoginRequestBody>(event)

  const loginResult = await gatekeeperFetch<unknown>('/api/auth/login', {
    method: 'POST',
    body,
    captureCookie: true
  })

  if (!loginResult.backendCookie) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing backend session cookie',
      message: 'Login succeeded but no session cookie was returned'
    })
  }

  const sessionPayload = await setGatekeeperUserSession(event, loginResult.backendCookie)

  return {
    data: sessionPayload.user,
    message: loginResult.message
  }
})
