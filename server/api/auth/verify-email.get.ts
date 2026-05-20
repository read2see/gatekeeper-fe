export default defineEventHandler(async (event) => {
  const { token } = getQuery(event)

  if (!token || typeof token !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing token',
      message: 'Verification token is required'
    })
  }

  return proxyPublicAuthRoute<unknown>('/api/auth/verify-email', {
    method: 'GET',
    query: { token }
  })
})
