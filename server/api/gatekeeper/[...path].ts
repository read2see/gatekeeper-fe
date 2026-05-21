const ALLOWED_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'])

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const pathParam = getRouterParam(event, 'path')
  if (!pathParam) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Missing Gatekeeper path'
    })
  }

  const method = event.method.toUpperCase() as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD'
  if (!ALLOWED_METHODS.has(method)) {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed',
      message: `Method ${method} is not supported`
    })
  }

  const gatekeeperPath = `/api/${pathParam}`
  const query = getQuery(event)
  const body = method === 'GET' || method === 'HEAD' || method === 'DELETE'
    ? undefined
    : await readBody(event)

  try {
    const result = await gatekeeperFetch<unknown>(gatekeeperPath, {
      event,
      method,
      query,
      body
    })

    return {
      data: result.data,
      message: result.message
    }
  } catch (error) {
    const fetchError = error as { statusCode?: number }

    if (fetchError.statusCode === 401) {
      await clearUserSession(event)
    }

    throw error
  }
})
