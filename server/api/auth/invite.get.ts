export default defineEventHandler(async (event) => {
  const { token } = getQuery(event)

  if (!token || typeof token !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing token',
      message: 'Invite token is required'
    })
  }

  const result = await gatekeeperFetch<unknown>('/api/auth/invite', {
    method: 'GET',
    query: { token },
    event
  })

  return {
    data: result.data,
    message: result.message
  }
})
