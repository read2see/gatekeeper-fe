export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const userId = getRouterParam(event, 'userId')
  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'User id is required'
    })
  }

  const session = await getUserSession(event)
  const backendCookie = session.secure?.backendCookie

  if (!backendCookie) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Session expired'
    })
  }

  const config = useRuntimeConfig()

  try {
    const response = await $fetch.raw(`${config.gatekeeperApiBase}/api/users/${userId}/avatar`, {
      method: 'GET',
      headers: {
        cookie: backendCookie,
        accept: 'image/*,*/*'
      },
      responseType: 'arrayBuffer'
    })

    const contentType = response.headers.get('content-type') ?? 'image/jpeg'
    setResponseHeader(event, 'content-type', contentType)
    setResponseHeader(event, 'cache-control', 'private, max-age=300')

    return response._data
  } catch (error) {
    throwGatekeeperError(error)
  }
})
